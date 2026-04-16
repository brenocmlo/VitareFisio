import { z } from "zod";

export const createAgendamentoSchema = z.object({
    paciente_id: z.number({
        error: (issue) =>
            issue.input === undefined
                ? "O ID do paciente é obrigatório."
                : "O ID do paciente deve ser um número.",
    }),
    fisioterapeuta_id: z.number({
        error: (issue) =>
            issue.input === undefined
                ? "O ID do fisioterapeuta é obrigatório."
                : "O ID do fisioterapeuta deve ser um número.",
    }),
    data_hora: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "A data e hora do agendamento são obrigatórias."
                : "A data e hora do agendamento devem ser um texto válido.",
    }).datetime({ message: "Formato de data inválido. Use o padrão ISO (Ex: 2026-04-16T15:30:00Z)" }),
    observacoes: z.string().optional(),
});
