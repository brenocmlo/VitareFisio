import { addDays, addMonths, addYears, isAfter } from "date-fns";
import crypto from "crypto";
import { AppDataSource } from "../../../data-source";
import { Usuario } from "../entities/Usuario";
import { CreateAutonomoService } from "../../clinics/services/CreateAutonomoService";
import { SendForgotPasswordEmailService } from "./SendForgotPasswordEmailService";
import { UserSubscription } from "../entities/UserSubscription";
import { WebhookEvent } from "../entities/WebhookEvent";
import { IKiwifyWebhook } from "../dtos/IKiwifyWebhook";

type CreateAutonomousWorkspaceInput = {
  email: string;
  name: string;
  expirationDate: Date;
};

type PlanCycle = "MONTHLY" | "SEMIANNUALLY" | "ANNUALLY";

export class ProcessKiwifyWebhookService {
  async execute(payload: IKiwifyWebhook): Promise<void> {
    const webhookEventRepo = AppDataSource.getRepository(WebhookEvent);

    const eventId = payload.order_id || Date.now().toString();
    const eventName = payload.order_status || "unknown";

    if (eventId) {
      const alreadyProcessed = await webhookEventRepo.findOne({
        where: { event_id: eventId, event_name: eventName },
        select: ["id", "status", "processed_at"] as any,
      });

      if (alreadyProcessed?.processed_at || alreadyProcessed?.status === "processed") {
        return; // Evento já processado
      }

      try {
        await webhookEventRepo.save(
          webhookEventRepo.create({
            event_id: eventId,
            event_name: String(eventName),
            status: "processing",
            payload: payload as any,
          })
        );
      } catch {
        return;
      }
    }

    try {
      const customer = payload.Customer;
      if (!customer?.email) {
        throw new Error("Payload inválido (Customer.email ausente).");
      }

      const eventType = payload.webhook_event_type || payload.order_status;

      // Se for reembolso ou chargeback, suspendemos a conta (ou ajustamos expiracao)
      if (eventType === "refunded" || eventType === "chargeback" || eventType === "order_refunded" || eventType === "order_chargeback") {
        await this.suspendSubscription(customer.email);
      } 
      // Se for cancelamento de assinatura (desligou a renovação automática)
      else if (eventType === "subscription_canceled" || eventType === "canceled") {
        await this.cancelSubscription(customer.email);
      }
      // Se for pago ou aprovado, renovamos/criamos a conta
      else if (eventType === "paid" || eventType === "approved" || eventType === "order_approved" || eventType === "subscription_renewed" as any) {
        const planCycle = this.resolvePlanCycle(payload) || "MONTHLY"; // default

        const now = new Date();
        const existingExpirationDate = await this.getExistingExpirationDate(customer.email);
        const baseDate =
          existingExpirationDate && isAfter(existingExpirationDate, now)
            ? existingExpirationDate
            : now;

        const newExpirationDate = this.calculateNewExpirationDate(baseDate, planCycle);
        const user = await this.getUserByEmail(customer.email);

        if (!user) {
          const createdUserId = await this.createAutonomousWorkspace({
            email: customer.email,
            name: customer.full_name || customer.email,
            expirationDate: newExpirationDate,
          });
          await this.upsertSubscription({
            usuarioId: createdUserId,
            payload,
            planCycle,
            newExpirationDate,
          });
        } else {
          await this.upsertSubscription({
            usuarioId: user.id,
            payload,
            planCycle,
            newExpirationDate,
          });
        }
      }

      if (eventId) {
        await webhookEventRepo.update(
          { event_id: eventId },
          { status: "processed", processed_at: new Date(), error: null as any }
        );
      }
    } catch (err: any) {
      if (eventId) {
        await webhookEventRepo.update(
          { event_id: eventId },
          { status: "failed", error: String(err?.message || err), processed_at: new Date() }
        );
      }
      throw err;
    }
  }

  private resolvePlanCycle(payload: IKiwifyWebhook): PlanCycle | null {
    const frequency = payload.Subscription?.plan?.frequency?.toLowerCase();
    
    if (frequency === "monthly" || frequency === "mensal") return "MONTHLY";
    if (frequency === "semiannually" || frequency === "semestral") return "SEMIANNUALLY";
    if (frequency === "yearly" || frequency === "annually" || frequency === "anual") return "ANNUALLY";
    
    return null;
  }

  private calculateNewExpirationDate(base: Date, planCycle: PlanCycle): Date {
    if (planCycle === "MONTHLY") return addDays(base, 30);
    if (planCycle === "SEMIANNUALLY") return addMonths(base, 6);
    return addYears(base, 1);
  }

  private async getUserByEmail(email: string): Promise<Usuario | null> {
    const userRepository = AppDataSource.getRepository(Usuario);
    return await userRepository.findOne({ where: { email }, select: ["id", "email"] as any });
  }

  private async getExistingExpirationDate(email: string): Promise<Date | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const subRepo = AppDataSource.getRepository(UserSubscription);
    const sub = await subRepo.findOne({
      where: { usuario_id: user.id },
      select: ["current_period_end"] as any,
    });

    return sub?.current_period_end ?? null;
  }

  private async createAutonomousWorkspace({
    email,
    name,
    expirationDate,
  }: CreateAutonomousWorkspaceInput): Promise<number> {
    const createAutonomo = new CreateAutonomoService();
    const tempPassword = crypto.randomBytes(8).toString("hex");

    const created = await createAutonomo.execute({
      nome: name,
      email,
      cpf: "00000000000",
      password: tempPassword,
      crefito: "Pendente",
      telefone: "",
    });

    const createdUserId = Number((created as any)?.user?.id);
    if (!createdUserId) {
      throw new Error("Falha ao obter user.id após criação do autônomo.");
    }

    // Envia o email de primeiro acesso ("esqueci a senha")
    try {
      const sendEmail = new SendForgotPasswordEmailService();
      await sendEmail.execute(email);
      console.log(`[Kiwify] Email de primeiro acesso enviado para ${email}`);
    } catch (err) {
      console.error(`[Kiwify] Erro ao enviar email de primeiro acesso para ${email}:`, err);
    }

    return createdUserId;
  }

  private async suspendSubscription(email: string): Promise<void> {
    const user = await this.getUserByEmail(email);
    if (!user) return;

    const subRepo = AppDataSource.getRepository(UserSubscription);
    const sub = await subRepo.findOne({ where: { usuario_id: user.id } });
    
    if (sub) {
      sub.status = "SUSPENDED";
      // Expirar o plano hoje para perder acesso
      sub.current_period_end = new Date();
      await subRepo.save(sub);
      console.log(`[Kiwify] Assinatura suspensa para ${email}`);
    }
  }

  private async cancelSubscription(email: string): Promise<void> {
    const user = await this.getUserByEmail(email);
    if (!user) return;

    const subRepo = AppDataSource.getRepository(UserSubscription);
    const sub = await subRepo.findOne({ where: { usuario_id: user.id } });
    
    if (sub && sub.status !== "CANCELED") {
      sub.status = "CANCELED";
      // NOTA: Não alteramos o current_period_end para que ele tenha acesso até o fim do período que pagou.
      await subRepo.save(sub);
      console.log(`[Kiwify] Assinatura marcada como cancelada para ${email}`);
    }
  }

  private async upsertSubscription({
    usuarioId,
    payload,
    planCycle,
    newExpirationDate,
  }: {
    usuarioId: number;
    payload: IKiwifyWebhook;
    planCycle: PlanCycle;
    newExpirationDate: Date;
  }): Promise<void> {
    const subRepo = AppDataSource.getRepository(UserSubscription);
    const existing = await subRepo.findOne({ where: { usuario_id: usuarioId } });

    const now = new Date();

    const fields: Partial<UserSubscription> = {
      usuario_id: usuarioId,
      last_checkout_id: payload.order_id,
      last_payment_id: payload.order_id,
      plan_cycle: planCycle as any,
      status: "ACTIVE",
      current_period_end: newExpirationDate,
      last_event_id: payload.order_id,
      last_event_name: payload.order_status,
      last_event_at: now,
      metadata: { kiwify: true } as any,
    };

    const next = existing ? subRepo.merge(existing, fields) : subRepo.create(fields);

    await subRepo.save(next);
    console.log("[Kiwify] Acesso renovado/criado para usuário", { usuarioId, newExpirationDate, planCycle });
  }
}
