import { Request, Response } from "express";
import MailProvider from "../../../shared/providers/MailProvider";

export class LeadsController {
    async qualify(req: Request, res: Response) {
        try {
            const { nome, email, senha, telefone, conselho, profissionais } = req.body;
            
            if (!nome || !email || !senha || !telefone || !conselho || !profissionais) {
                return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
            }

            const mailProvider = new MailProvider();
            
            // Envia para o email comercial da SomosFisio
            const recipient = process.env.EMAIL_TO || 'somosfisioappp@gmail.com';
            
            const emailBody = `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #2563eb; margin-top: 0;">Novo Lead Qualificado! 🚀</h2>
                    <p>Um novo usuário preencheu o formulário de qualificação em seu site.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; width: 180px; color: #475569;">Nome Completo:</td>
                            <td style="padding: 8px 0; color: #0f172a;">${nome}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #475569;">E-mail:</td>
                            <td style="padding: 8px 0; color: #0f172a;">${email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #475569;">Senha Criada:</td>
                            <td style="padding: 8px 0; color: #0f172a;">${senha}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #475569;">WhatsApp / Tel:</td>
                            <td style="padding: 8px 0; color: #0f172a;">${telefone}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #475569;">Conselho:</td>
                            <td style="padding: 8px 0; color: #0f172a; text-transform: uppercase;">${conselho}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #475569;">Qtd Profissionais:</td>
                            <td style="padding: 8px 0; color: #0f172a;">${profissionais}</td>
                        </tr>
                    </table>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
                    <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">Este e-mail foi gerado automaticamente pelo formulário de qualificação da plataforma SomosFisio.</p>
                </div>
            `;

            // Envia o e-mail em segundo plano para não travar a resposta HTTP
            mailProvider.sendMail(
                recipient,
                emailBody,
                `Novo Lead Qualificado: ${nome}`
            ).catch(err => {
                console.error("❌ Erro ao enviar e-mail de lead em segundo plano:", err);
            });

            return res.status(200).json({ message: "Qualificação registrada com sucesso." });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
