import { Request, Response } from "express";
import { AuthenticateUserService } from "../services/AuthenticateUserService";

export class SessionsController {
    async create(req: Request, res: Response) {
        try {
            const { email, senha } = req.body;

            const authenticateUserService = new AuthenticateUserService();

            // O service valida as credenciais e gera o Token
            const { user, token } = await authenticateUserService.execute({
                email,
                senha,
            });

            // Retornamos os dados do utilizador (sem a senha) e o token
            return res.json({ user, token });
        } catch (error: any) {
            // Se o e-mail ou senha estiverem errados, retorna 401 (Não autorizado)
            return res.status(401).json({ error: error.message });
        }
    }
}