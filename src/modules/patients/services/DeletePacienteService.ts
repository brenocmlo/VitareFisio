import { AppDataSource } from "../../../data-source";
import { Paciente } from "../entities/Paciente";
import { Agendamento } from "../../appointments/entities/Agendamento";
import { Evolucao } from "../../appointments/entities/Evolucao";
import { PacienteAnexo } from "../entities/PacienteAnexo";
import { PacotePaciente } from "../entities/PacotePaciente";
import { Anamnese } from "../entities/Anamnese";
import { Pagamento } from "../../finance/entities/Pagamento";

interface DeletePacienteRequest {
    id: number;
    clinica_id: number;
    usuario_id: number; // 🔒 RLS
}

export class DeletePacienteService {
    async execute({ id, clinica_id, usuario_id }: DeletePacienteRequest): Promise<void> {
        const pacienteRepository = AppDataSource.getRepository(Paciente);

        // Verificar se o paciente existe e pertence ao usuário (RLS)
        const paciente = await pacienteRepository.findOneBy({
            id,
            clinica_id,
            usuario_id
        });

        if (!paciente) {
            throw new Error("Paciente não encontrado.");
        }

        // Deletar em cascata (ordem importa para respeitar foreign keys)
        
        // 1. Deletar evoluções (dependem de agendamentos)
        const evolucaoRepository = AppDataSource.getRepository(Evolucao);
        await evolucaoRepository.delete({ paciente_id: id });

        // 2. Deletar agendamentos (dependem de pacientes)
        const agendamentoRepository = AppDataSource.getRepository(Agendamento);
        await agendamentoRepository.delete({ paciente_id: id });

        // 3. Deletar pagamentos (dependem de pacientes)
        const pagamentoRepository = AppDataSource.getRepository(Pagamento);
        await pagamentoRepository.delete({ paciente_id: id });

        // 4. Deletar anexos (dependem de pacientes)
        const anexoRepository = AppDataSource.getRepository(PacienteAnexo);
        await anexoRepository.delete({ paciente_id: id });

        // 5. Deletar pacotes (dependem de pacientes)
        const pacoteRepository = AppDataSource.getRepository(PacotePaciente);
        await pacoteRepository.delete({ paciente_id: id });

        // 6. Deletar anamnese (depende de pacientes)
        const anamneseRepository = AppDataSource.getRepository(Anamnese);
        await anamneseRepository.delete({ paciente_id: id });

        // 7. Finalmente, deletar o paciente
        await pacienteRepository.remove(paciente);
    }
}
