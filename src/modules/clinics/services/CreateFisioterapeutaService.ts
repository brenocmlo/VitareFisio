import { AppDataSource } from "../../../data-source";
import { Fisioterapeuta } from "../entities/Fisioterapeuta";
import { Clinica } from "../entities/Clinica";
import { Usuario } from "../../users/entities/Usuario";
import { hash } from "bcryptjs";

interface IRequest {
    clinica_id: number;
    nome: string;
    crefito: string;
    especialidade?: string;
    email?: string;
    is_autonomo?: boolean;
    cpf: string;
    senha?: string;
}

export class CreateFisioterapeutaService {
    async execute(dados: IRequest) {
        const fisioterapeutaRepository = AppDataSource.getRepository(Fisioterapeuta);
        const clinicaRepository = AppDataSource.getRepository(Clinica);

        // Validar se a clínica existe
        const clinica = await clinicaRepository.findOneBy({ id: dados.clinica_id });
        if (!clinica) throw new Error("Clínica não encontrada.");

        // Validar CREFITO único
        const crefitoExistente = await fisioterapeutaRepository.findOneBy({ crefito: dados.crefito });
        if (crefitoExistente) throw new Error("Já existe um profissional com este CREFITO.");

        const fisioterapeuta = fisioterapeutaRepository.create(dados);
        await fisioterapeutaRepository.save(fisioterapeuta);

        // --- NOVO: Criar o usuário de login automaticamente ---
        if (dados.email && dados.cpf) {
            const usuarioRepository = AppDataSource.getRepository(Usuario);
            
            // Verifica se o usuário já existe para evitar erro
            const userExists = await usuarioRepository.findOneBy({ email: dados.email });
            
            if (!userExists) {
                const hashedPassword = await hash(dados.senha || "mudar123", 8);
                
                const user = usuarioRepository.create({
                    nome: dados.nome,
                    email: dados.email,
                    cpf: dados.cpf,
                    senha: hashedPassword,
                    clinica_id: dados.clinica_id,
                    tipo: "fisioterapeuta",
                    is_autonomo: !!dados.is_autonomo
                });
                
                await usuarioRepository.save(user);
            }
        }

        return fisioterapeuta;
    }
}