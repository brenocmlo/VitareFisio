import { AppDataSource } from "../../../data-source";
import { Usuario } from "../entities/Usuario";
import { UserToken } from "../entities/UserToken";
import { hash } from "bcryptjs";
import { isAfter, addHours } from "date-fns";

export class ResetPasswordService {
    async execute(token: string, senha: string) {
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        const userTokenRepository = AppDataSource.getRepository(UserToken);

        // Busca o token no banco
        const userToken = await userTokenRepository.findOneBy({ token });

        if (!userToken) {
            throw new Error("Token de recuperação inválido.");
        }

        // Verifica se o token expirou (limite de 2 horas)
        const tokenCreatedAt = userToken.created_at;
        const expiryDate = addHours(tokenCreatedAt, 2);

        if (isAfter(new Date(), expiryDate)) {
            throw new Error("O token de recuperação expirou.");
        }

        // Busca o usuário
        const user = await usuarioRepository.findOneBy({ id: userToken.user_id });

        if (!user) {
            throw new Error("Usuário não encontrado.");
        }

        // Atualiza a senha
        user.senha = await hash(senha, 8);
        await usuarioRepository.save(user);

        // Deleta o token para que não possa ser usado de novo
        await userTokenRepository.delete(userToken.id);

        return { message: "Senha atualizada com sucesso." };
    }
}
