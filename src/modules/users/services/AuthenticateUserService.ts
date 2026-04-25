import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { AppDataSource } from "../../../data-source";
import { Usuario } from "../entities/Usuario";

export class AuthenticateUserService {
    async execute({ email, senha }: any) {
        const usuarioRepository = AppDataSource.getRepository(Usuario);

        // ADICIONADO: "tipo" no select
        const usuario = await usuarioRepository.findOne({
            where: { email },
            select: ["id", "nome", "email", "senha", "clinica_id", "tipo"] 
        });

        if (!usuario) {
            throw new Error("E-mail ou senha incorretos.");
        }

        const passwordMatched = await compare(senha, usuario.senha);

        if (!passwordMatched) {
            throw new Error("E-mail ou senha incorretos.");
        }

        // ADICIONADO: "tipo" no payload do token
        const token = sign({ 
            clinica_id: usuario.clinica_id,
            tipo: usuario.tipo
        }, process.env.JWT_SECRET || "segredo-vitarefisio-2026", {
            subject: String(usuario.id),
            expiresIn: "1d",
        });

        return {
            user: { 
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                clinica_id: usuario.clinica_id,
                tipo: usuario.tipo // <-- ADICIONADO para o Frontend usar
            },
            token,
        };
    }
}