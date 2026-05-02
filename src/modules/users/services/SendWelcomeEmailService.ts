import { AppDataSource } from "../../../data-source";
import { Usuario } from "../entities/Usuario";
import { UserToken } from "../entities/UserToken";
import { v4 as uuidv4 } from "uuid";
import MailProvider from "../../../shared/providers/MailProvider";

export class SendWelcomeEmailService {
    async execute(email: string) {
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        const userTokenRepository = AppDataSource.getRepository(UserToken);
        const mailProvider = new MailProvider();

        const user = await usuarioRepository.findOneBy({ email });

        if (!user) {
            throw new Error("Usuário não encontrado.");
        }

        // Gera o token único para o primeiro acesso
        const token = uuidv4();

        const userToken = userTokenRepository.create({
            token,
            user_id: user.id
        });
        await userTokenRepository.save(userToken);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const activationUrl = `${frontendUrl}/reset-password?token=${token}`;

        await mailProvider.sendMail(
            email,
            `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px;">
                <div style="background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    
                    <div style="text-align: center; margin-bottom: 32px;">
                        <div style="background: linear-gradient(135deg, #0ea5e9, #6366f1); width: 64px; height: 64px; border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 28px;">🩺</span>
                        </div>
                        <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 0;">Bem-vindo ao SomosFisio!</h1>
                        <p style="color: #64748b; margin-top: 8px; font-size: 15px;">Sua assinatura foi confirmada com sucesso.</p>
                    </div>

                    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Olá, <strong>${user.nome}</strong>!</p>
                    
                    <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                        Estamos muito felizes em ter você no SomosFisio. Seu ambiente já foi criado e está pronto para uso.
                        O próximo passo é definir sua senha de acesso para poder entrar no sistema.
                    </p>

                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${activationUrl}" 
                           style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px;">
                            ✅ Ativar Minha Conta
                        </a>
                    </div>

                    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                        <p style="color: #475569; font-size: 13px; margin: 0; text-align: center;">
                            ⚠️ Este link expira em <strong>24 horas</strong>. Se ele expirar, acesse o sistema e use a opção "Esqueci minha senha".
                        </p>
                    </div>

                    <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 0;">
                        Se você não realizou esta compra, entre em contato conosco imediatamente.<br/>
                        <strong>Equipe SomosFisio</strong>
                    </p>
                </div>
            </div>
            `
        );

        return { message: "E-mail de boas-vindas enviado." };
    }
}
