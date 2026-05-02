import { addDays, addMonths, addYears, isAfter } from "date-fns";
import crypto from "crypto";
import { AppDataSource } from "../../../data-source";
import { Usuario } from "../entities/Usuario";
import { CreateAutonomoService } from "../../clinics/services/CreateAutonomoService";
import { UserSubscription } from "../entities/UserSubscription";
import { WebhookEvent } from "../entities/WebhookEvent";
import {
  AbacatePayPlanCycle,
  IAbacatePayWebhook,
  IAbacatePayCustomer,
} from "../dtos/IAbacatePayWebhook";

type CreateAutonomousWorkspaceInput = {
  email: string;
  name: string;
  expirationDate: Date;
};

type RenewUserAccessInput = {
  email: string;
  newExpirationDate: Date;
};

export class ProcessAbacatePayWebhookService {
  async execute(payload: IAbacatePayWebhook): Promise<void> {
    const webhookEventRepo = AppDataSource.getRepository(WebhookEvent);

    const eventId = payload?.id;
    const eventName = payload?.event;

    if (eventId) {
      const alreadyProcessed = await webhookEventRepo.findOne({
        where: { event_id: eventId },
        select: ["id", "status", "processed_at"] as any,
      });

      if (alreadyProcessed?.processed_at || alreadyProcessed?.status === "processed") {
        return;
      }

      try {
        await webhookEventRepo.save(
          webhookEventRepo.create({
            event_id: eventId,
            event_name: String(eventName || ""),
            status: "processing",
            payload: payload as any,
          })
        );
      } catch {
        // Unique constraint (ou outra corrida) -> não reprocessa
        return;
      }
    }

    try {
      const data = (payload as any)?.data;
      const customer: IAbacatePayCustomer | null | undefined = data?.customer;

      if (!eventName || !data) {
        throw new Error("Payload inválido (sem event/data).");
      }

      if (!customer?.email) {
        throw new Error("Payload inválido (customer.email ausente).");
      }

      const planCycle = this.resolvePlanCycle(payload);
      if (!planCycle) {
        throw new Error("Não foi possível determinar o ciclo do plano.");
      }

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
          name: customer.name || customer.email,
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

  private resolvePlanCycle(payload: IAbacatePayWebhook): AbacatePayPlanCycle | null {
    const data: any = (payload as any).data;

    const metaCycle =
      data?.metadata?.planCycle ??
      data?.metadata?.cycle ??
      data?.checkout?.externalId?.planCycle;

    const normalizedMeta = this.normalizePlanCycle(metaCycle);
    if (normalizedMeta) return normalizedMeta;

    const subFrequency = data?.subscription?.frequency;
    const normalizedSub = this.normalizePlanCycle(subFrequency);
    if (normalizedSub) return normalizedSub;

    const productCycle = Array.isArray(data?.products) ? data.products?.[0]?.cycle : null;
    const normalizedProduct = this.normalizePlanCycle(productCycle);
    if (normalizedProduct) return normalizedProduct;

    return null;
  }

  private normalizePlanCycle(value: unknown): AbacatePayPlanCycle | null {
    if (!value) return null;

    const raw = String(value).trim().toUpperCase();

    if (raw === "MONTHLY" || raw === "MENSAL") return "MONTHLY";
    if (raw === "SEMIANNUALLY" || raw === "SEMESTRAL") return "SEMIANNUALLY";
    if (raw === "ANNUALLY" || raw === "ANUAL" || raw === "YEARLY") return "ANNUALLY";

    return null;
  }

  private calculateNewExpirationDate(base: Date, planCycle: AbacatePayPlanCycle): Date {
    if (planCycle === "MONTHLY") return addDays(base, 30);
    if (planCycle === "SEMIANNUALLY") return addMonths(base, 6);
    return addYears(base, 1);
  }

  private async checkIfUserExists(email: string): Promise<boolean> {
    const userRepository = AppDataSource.getRepository(Usuario);
    const user = await userRepository.findOne({ where: { email }, select: ["id"] as any });
    return !!user;
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

    console.log("[ABACATEPAY] createAutonomousWorkspace", { email, expirationDate });

    const createdUserId = Number((created as any)?.user?.id);
    if (!createdUserId) {
      throw new Error("Falha ao obter user.id após criação do autônomo.");
    }

    return createdUserId;
  }

  private extractProviderIds(payload: IAbacatePayWebhook): {
    abacateCustomerId?: string;
    abacateSubscriptionId?: string;
    checkoutId?: string;
    paymentId?: string;
    metadata?: Record<string, unknown>;
  } {
    const data: any = (payload as any).data || {};

    const abacateCustomerId = data?.customer?.id ? String(data.customer.id) : undefined;
    const abacateSubscriptionId = data?.subscription?.id ? String(data.subscription.id) : undefined;
    const checkoutId = data?.checkout?.id ? String(data.checkout.id) : undefined;
    const paymentId = data?.payment?.id ? String(data.payment.id) : undefined;
    const metadata = data?.metadata && typeof data.metadata === "object" ? data.metadata : undefined;

    return { abacateCustomerId, abacateSubscriptionId, checkoutId, paymentId, metadata };
  }

  private async upsertSubscription({
    usuarioId,
    payload,
    planCycle,
    newExpirationDate,
  }: {
    usuarioId: number;
    payload: IAbacatePayWebhook;
    planCycle: AbacatePayPlanCycle;
    newExpirationDate: Date;
  }): Promise<void> {
    const subRepo = AppDataSource.getRepository(UserSubscription);
    const existing = await subRepo.findOne({ where: { usuario_id: usuarioId } });

    const ids = this.extractProviderIds(payload);
    const now = new Date();

    const fields: Partial<UserSubscription> = {
      usuario_id: usuarioId,
      abacate_customer_id: ids.abacateCustomerId ?? existing?.abacate_customer_id ?? undefined,
      abacate_subscription_id:
        ids.abacateSubscriptionId ?? existing?.abacate_subscription_id ?? undefined,
      last_checkout_id: ids.checkoutId ?? existing?.last_checkout_id ?? undefined,
      last_payment_id: ids.paymentId ?? existing?.last_payment_id ?? undefined,
      plan_cycle: planCycle,
      status: "ACTIVE",
      current_period_end: newExpirationDate,
      last_event_id: payload.id ? String(payload.id) : existing?.last_event_id ?? undefined,
      last_event_name: payload.event ? String(payload.event) : existing?.last_event_name ?? undefined,
      last_event_at: now,
      metadata: ids.metadata ?? existing?.metadata ?? undefined,
    };

    const next = existing ? subRepo.merge(existing, fields) : subRepo.create(fields);

    await subRepo.save(next);
    console.log("[ABACATEPAY] renewUserAccess", { usuarioId, newExpirationDate, planCycle });
  }
}

