import { AppDataSource } from "../../../data-source";
import { Evolucao } from "../entities/Evolucao";
import { Paciente } from "../../patients/entities/Paciente"; // Importante para pegar o valor_sessao
import { CreatePagamentoService } from "../../finance/services/CreatePagamentoService";

interface IRequest {
    agendamento_id: number;
    paciente_id: number;
    descricao: string;
    procedimentos?: string;
    cid_10?: string;
    diagnostico_fisioterapeutico?: string;
    objetivos_tratamento?: string;
}

export class CreateEvolucaoService {
    async execute(dados: IRequest) {
        const evolucaoRepository = AppDataSource.getRepository(Evolucao);
        const pacienteRepository = AppDataSource.getRepository(Paciente);

        // 1. Criar e salvar a evolução clínica
        const evolucao = evolucaoRepository.create(dados);
        await evolucaoRepository.save(evolucao);

        // --- INÍCIO DA AUTOMAÇÃO FINANCEIRA ---
        
        // 2. Buscar o valor da sessão configurado no cadastro do paciente
        const paciente = await pacienteRepository.findOneBy({ id: dados.paciente_id });

        // 3. Chamar o serviço de pagamento para gerar a cobrança pendente
        const createPagamento = new CreatePagamentoService();
        await createPagamento.execute({
            paciente_id: dados.paciente_id,
            agendamento_id: dados.agendamento_id,
            valor: paciente?.valor_sessao || 0, // Se não tiver valor, gera como 0 para ajuste manual
            data_vencimento: new Date() // Vence no dia do atendimento
        });

        // --- FIM DA AUTOMAÇÃO FINANCEIRA ---

        return evolucao;
    }
}