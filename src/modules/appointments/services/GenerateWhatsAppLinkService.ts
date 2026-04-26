import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";
import { Paciente } from "../../patients/entities/Paciente";
import { Usuario } from "../../users/entities/Usuario";
import {
    formatAppointmentDate,
    formatAppointmentTime,
} from "../utils/appointmentDateTime";

export class GenerateWhatsAppLinkService {
    async execute(agendamento_id: number) {
        const agendamentoRepo = AppDataSource.getRepository(Agendamento);
        const pacienteRepo = AppDataSource.getRepository(Paciente);

        // 1. Procura o agendamento no banco
        const agendamento = await agendamentoRepo.findOneBy({ id: agendamento_id });
        if (!agendamento) {
            throw new Error("Agendamento não encontrado.");
        }

        // 2. Procura o paciente associado a este agendamento
        const paciente = await pacienteRepo.findOneBy({ id: agendamento.paciente_id });
        if (!paciente) {
            throw new Error("Paciente não encontrado.");
        }

        if (!paciente.contato_whatsapp) {
            throw new Error("Este paciente não possui um número de WhatsApp cadastrado.");
        }

        // 3. Procura o fisioterapeuta para pegar o nome
        const usuarioRepo = AppDataSource.getRepository(Usuario);
        const fisioterapeuta = await usuarioRepo.findOneBy({ id: agendamento.fisioterapeuta_id });
        const nomeFisio = fisioterapeuta ? fisioterapeuta.nome : "da VitareFisio";

        // 4. Formata a Data e Hora para o padrão brasileiro/português
        const dataFormatada = formatAppointmentDate(agendamento.data_hora);
        const horaFormatada = formatAppointmentTime(agendamento.data_hora);

        // 5. Montagem da mensagem personalizada solicitada pelo usuário
        const mensagem = `Olá, ${paciente.nome}! Aqui é ${nomeFisio}. Passando para lembrar da sua sessão de fisioterapia agendada para o dia *${dataFormatada}* às *${horaFormatada}*. Por favor, responda 'SIM' para confirmar ou 'NÃO' caso precise reagendar.`;

        // 6. Transforma o texto para o formato de URL (substitui espaços por %20, etc)
        const textoCodificado = encodeURIComponent(mensagem);

        // 6. Limpa o número do WhatsApp (remove parênteses, traços e espaços)
        let numeroLimpo = paciente.contato_whatsapp.replace(/\D/g, '');
        
        // Adiciona o indicativo do Brasil (55) se não existir
        if (!numeroLimpo.startsWith("55")) {
            numeroLimpo = `55${numeroLimpo}`;
        }

        // Link oficial da API do WhatsApp
        const whatsappLink = `https://wa.me/${numeroLimpo}?text=${textoCodificado}`;

        return {
            paciente: paciente.nome,
            telefone: numeroLimpo,
            data_sessao: dataFormatada,
            hora_sessao: horaFormatada,
            mensagem_preview: mensagem,
            link_whatsapp: whatsappLink
        };
    }
}
