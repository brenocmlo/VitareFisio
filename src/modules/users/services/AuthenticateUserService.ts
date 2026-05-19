import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { AppDataSource } from "../../../data-source";
import { Usuario } from "../entities/Usuario";
import { UserSubscription } from "../entities/UserSubscription";
import { Fisioterapeuta } from "../../clinics/entities/Fisioterapeuta";

export class AuthenticateUserService {
    async execute({ email, senha }: any) {
        const usuarioRepository = AppDataSource.getRepository(Usuario);

        // ADICIONADO: "tipo" no select
        const usuario = await usuarioRepository.findOne({
            where: { email },
            select: ["id", "nome", "email", "senha", "clinica_id", "tipo", "is_autonomo"] 
        });

        if (!usuario) {
            throw new Error("E-mail ou senha incorretos.");
        }

        const passwordMatched = await compare(senha, usuario.senha);

        if (!passwordMatched) {
            throw new Error("E-mail ou senha incorretos.");
        }

        // Busca a assinatura do usuário (Kiwify)
        const subscriptionRepo = AppDataSource.getRepository(UserSubscription);
        const subscription = await subscriptionRepo.findOne({
            where: { usuario_id: usuario.id }
        });

        // Busca o crefito do usuário
        const fisioRepo = AppDataSource.getRepository(Fisioterapeuta);
        const fisio = await fisioRepo.findOne({
            where: { email: usuario.email }
        });

        // ADICIONADO: "tipo" e "is_autonomo" no payload do token
        const token = sign({ 
            clinica_id: usuario.clinica_id,
            tipo: usuario.tipo,
            is_autonomo: usuario.is_autonomo
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
                tipo: usuario.tipo,
                is_autonomo: usuario.is_autonomo,
                subscription_status: subscription?.status || 'PENDING',
                subscription_end: subscription?.current_period_end || null,
                crefito: fisio?.crefito || null,
            },
            token,
        };
    }
}