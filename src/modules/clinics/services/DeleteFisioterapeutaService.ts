import { AppDataSource } from "../../../data-source";
import { Usuario } from "../../users/entities/Usuario";
import { Fisioterapeuta } from "../entities/Fisioterapeuta"; 

export class DeleteFisioterapeutaService {
    async execute(id: number, requesting_user_id: number): Promise<void> {
        const fisioRepository = AppDataSource.getRepository(Fisioterapeuta);
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        
        // Verifica se quem está pedindo para deletar é o dono do sistema (is_autonomo)
        const requestingUser = await usuarioRepository.findOne({ where: { id: requesting_user_id } });
        if (!requestingUser || !requestingUser.is_autonomo) {
            throw new Error("Apenas o administrador principal (dono do sistema) pode remover membros da equipe.");
        }

        // 1. Busca o perfil do fisioterapeuta pelo ID que veio do clique na lixeira
        const fisioterapeuta = await fisioRepository.findOne({
            where: { id }
        });

        if (!fisioterapeuta) {
            throw new Error("Profissional não encontrado na lista de fisioterapeutas.");
        }

        // 2. Usa o EMAIL do fisioterapeuta como ponte para achar o acesso de login dele
        // (Como o email é único no seu sistema, é a forma mais segura de interligar as tabelas)
        const usuario = await usuarioRepository.findOne({
            where: { email: fisioterapeuta.email } 
        });

        // 3. Se encontrar o usuário de login, faz as validações e revoga o acesso
        if (usuario) {
            // Deleta o login do sistema
            await usuarioRepository.remove(usuario);
        }

        // 4. Por fim, remove o cartão do profissional da sua equipe
        await fisioRepository.remove(fisioterapeuta);
    }
}