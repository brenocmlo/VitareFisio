import { AppDataSource } from "../../../data-source";
import { Usuario } from "../entities/Usuario";
import { UserToken } from "../entities/UserToken";
import { v4 as uuidv4 } from "uuid";
import MailProvider from "../../../shared/providers/MailProvider";

export class SendForgotPasswordEmailService {
    async execute(email: string) {
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        const userTokenRepository = AppDataSource.getRepository(UserToken);
        const mailProvider = new MailProvider();

        const user = await usuarioRepository.findOneBy({ email });

        if (!user) {
            throw new Error("Usuário não encontrado.");
        }

        // Gera o token único
        const token = uuidv4();

        // Salva o token no banco
        const userToken = userTokenRepository.create({
            token,
            user_id: user.id
        });
        await userTokenRepository.save(userToken);

        // Envia o e-mail (O link apontará para o seu frontend)
        const resetPasswordUrl = `http://localhost:5173/reset-password?token=${token}`;

        await mailProvider.sendMail(
            email,
            `
            <div style="font-family: sans-serif; color: #333;">
                <h2>Recuperação de Senha</h2>
                <p>Olá, ${user.nome}!</p>
                <p>Recebemos uma solicitação para redefinir sua senha no sistema VitareFisio.</p>
                <p>Clique no link abaixo para escolher uma nova senha:</p>
                <a href="${resetPasswordUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0ea5e9; color: #fff; text-decoration: none; border-radius: 8px;">Redefinir Minha Senha</a>
                <p>Se você não solicitou essa alteração, basta ignorar este e-mail.</p>
                <br/>
                <p>Atenciosamente,<br/>Equipe VitareFisio</p>
            </div>
            `
        );

        return { message: "E-mail de recuperação enviado." };
    }
}
