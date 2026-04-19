import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { AppDataSource } from "../../../data-source";
import { Usuario } from "../entities/Usuario";

export class AuthenticateUserService {
    async execute({ email, senha }: any) {
        const usuarioRepository = AppDataSource.getRepository(Usuario);

        // Busca o utilizador e pede explicitamente a senha (que está oculta por padrão na entidade)
        const usuario = await usuarioRepository.findOne({
            where: { email },
            select: ["id", "nome", "email", "senha", "clinica_id"]
        });

        if (!usuario) {
            throw new Error("E-mail ou senha incorretos.");
        }

        // Compara a senha enviada com o hash guardado no banco
        const passwordMatched = await compare(senha, usuario.senha);

        if (!passwordMatched) {
            throw new Error("E-mail ou senha incorretos.");
        }

        // Gera o Token JWT com o clinica_id para autenticação posterior
        const token = sign({ clinica_id: usuario.clinica_id }, "segredo-vitarefisio-2026", {
            subject: String(usuario.id),
            expiresIn: "1d",
        });

        return {
            user: { // MUDADO DE 'usuario' PARA 'user' para bater com o Frontend
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            clinica_id: usuario.clinica_id
            },
            token,
        };
    }
}