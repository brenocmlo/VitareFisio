import { AppDataSource } from "../../../data-source";
import { Usuario } from "../../users/entities/Usuario";
import { Fisioterapeuta } from "../entities/Fisioterapeuta"; 

export class DeleteFisioterapeutaService {
    async execute(id: number): Promise<void> {
        const fisioRepository = AppDataSource.getRepository(Fisioterapeuta);
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        
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
            if (usuario.tipo === 'admin') {
                throw new Error("Não é possível revogar o acesso de um perfil Administrador.");
            }
            // Deleta o login do sistema
            await usuarioRepository.remove(usuario);
        }

        // 4. Por fim, remove o cartão do profissional da sua equipe
        await fisioRepository.remove(fisioterapeuta);
    }
}