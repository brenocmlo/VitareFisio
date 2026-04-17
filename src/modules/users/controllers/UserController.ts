import { Request, Response } from "express";
import { CreateUserService } from "../services/CreateUserService";

export class UserController {
    async create(req: Request, res: Response) {
        try {
        const { nome, email, cpf, senha, clinica_id, tipo } = req.body;
        const createUserService = new CreateUserService();

        const usuario = await createUserService.execute({
            nome, email, cpf, senha, clinica_id, tipo
        });
         return res.status(201).json(usuario);
        } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}
}