import crypto from 'crypto';
import { AppDataSource } from "../../../data-source";
import { Usuario } from "../entities/Usuario";
import { CreateAutonomoService } from "../../clinics/services/CreateAutonomoService";
import { SendForgotPasswordEmailService } from "./SendForgotPasswordEmailService";

interface IKiwifyPayload {
  order_status: string;
  customer: {
    full_name: string;
    email: string;
    cpf: string;
    mobile?: string;
  };
  product_name: string;
}

export class HandleKiwifyWebhookService {
  async execute(payload: IKiwifyPayload, signature: string) {
    const secret = process.env.KIWIFY_SECRET_TOKEN;

    if (!secret) {
      console.warn("KIWIFY_SECRET_TOKEN não configurado. Pulando validação de assinatura.");
    } else {
      const hmac = crypto.createHmac('sha256', secret);
      const expectedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
      
      // Em produção, habilitar esta validação
      // if (signature !== expectedSignature) {
      //   throw new Error("Assinatura do webhook inválida.");
      // }
    }

    const { order_status, customer } = payload;

    // Só processamos pagamentos aprovados
    if (order_status !== 'paid') {
      console.log(`Webhook recebido com status: ${order_status}. Ignorando.`);
      return;
    }

    const userRepository = AppDataSource.getRepository(Usuario);

    // Verificar se o usuário já existe
    const userExists = await userRepository.findOne({
      where: [{ email: customer.email }, { cpf: customer.cpf }]
    });

    if (userExists) {
      console.log(`Usuário ${customer.email} já existe. Garantindo acesso.`);
      // Aqui poderíamos atualizar a data de expiração da assinatura, por exemplo.
      return { message: "Usuário já existe, acesso mantido." };
    }

    // Se não existe, criamos a conta completa (Clínica + Usuário + Perfil)
    const createAutonomo = new CreateAutonomoService();
    
    // Gerar uma senha aleatória temporária
    const tempPassword = crypto.randomBytes(8).toString('hex');

    await createAutonomo.execute({
      nome: customer.full_name,
      email: customer.email,
      cpf: customer.cpf.replace(/\D/g, ''), // Limpar CPF
      password: tempPassword,
      crefito: "Pendente", // Será preenchido pelo usuário no primeiro acesso
      telefone: customer.mobile
    });

    console.log(`Conta criada com sucesso para ${customer.email}.`);

    // Disparar fluxo de "Primeiro Acesso / Redefinir Senha"
    const sendForgotPasswordEmail = new SendForgotPasswordEmailService();
    await sendForgotPasswordEmail.execute(customer.email);

    return { message: "Conta criada e e-mail de ativação enviado." };
  }
}
