import crypto from 'crypto';
import { AppDataSource } from "../../../data-source";
import { Usuario } from "../entities/Usuario";
import { CreateAutonomoService } from "../../clinics/services/CreateAutonomoService";
import { SendForgotPasswordEmailService } from "./SendForgotPasswordEmailService";

export class HandleAbacatePayWebhookService {
  async execute(data: any) {
    const customer = data.customer;

    if (!customer) {
        console.warn("Webhook recebido sem dados de cliente. Ignorando.");
        return;
    }

    const userRepository = AppDataSource.getRepository(Usuario);

    // Verificar se o usuário já existe pelo e-mail ou CPF
    // AbacatePay retorna taxId como o CPF/CNPJ do cliente
    const cpfLimpo = customer.taxId ? customer.taxId.replace(/\D/g, '') : '';
    
    const whereConditions: any[] = [{ email: customer.email }];
    if (cpfLimpo) {
        whereConditions.push({ cpf: cpfLimpo });
    }

    const userExists = await userRepository.findOne({
      where: whereConditions
    });

    if (userExists) {
      console.log(`Usuário ${customer.email} já existe. Acesso garantido.`);
      return { message: "Usuário já existe, acesso mantido." };
    }

    // Se não existe, criamos a conta completa (Clínica + Usuário + Perfil)
    const createAutonomo = new CreateAutonomoService();
    
    // Gerar uma senha aleatória temporária
    const tempPassword = crypto.randomBytes(8).toString('hex');

    await createAutonomo.execute({
      nome: customer.name,
      email: customer.email,
      cpf: cpfLimpo || '00000000000', // Preenchimento obrigatório no banco
      password: tempPassword,
      crefito: "Pendente", // Será preenchido pelo usuário no primeiro acesso
      telefone: customer.cellphone || customer.phone || ''
    });

    console.log(`Conta criada com sucesso para ${customer.email} via AbacatePay.`);

    // Disparar fluxo de "Primeiro Acesso / Redefinir Senha" para o e-mail
    const sendForgotPasswordEmail = new SendForgotPasswordEmailService();
    await sendForgotPasswordEmail.execute(customer.email);

    return { message: "Conta criada e e-mail de ativação enviado." };
  }
}
