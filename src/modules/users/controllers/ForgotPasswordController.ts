import { Request, Response } from "express";
import { SendForgotPasswordEmailService } from "../services/SendForgotPasswordEmailService";
import { ResetPasswordService } from "../services/ResetPasswordService";

export class ForgotPasswordController {
    async send(req: Request, res: Response) {
        try {
            const { email } = req.body;
            const service = new SendForgotPasswordEmailService();
            await service.execute(email);
            return res.status(200).json({ message: "E-mail de recuperação enviado." });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async reset(req: Request, res: Response) {
        try {
            const { token, senha } = req.body;
            const service = new ResetPasswordService();
            await service.execute(token, senha);
            return res.status(200).json({ message: "Senha redefinida com sucesso." });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}
