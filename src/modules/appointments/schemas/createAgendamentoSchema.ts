import { z } from "zod";
import { normalizeAppointmentDateTime } from "../utils/appointmentDateTime";

const numberField = (requiredMessage: string, invalidMessage: string) =>
    z.preprocess(
        (value) => (value === "" || value === null ? undefined : value),
        z.coerce.number({
            error: (issue) =>
                issue.input === undefined ? requiredMessage : invalidMessage,
        })
    );

export const createAgendamentoSchema = z.object({
    paciente_id: numberField(
        "O ID do paciente é obrigatório.",
        "O ID do paciente deve ser um número."
    ),
    clinica_id: numberField(
        "O ID da clínica é obrigatório.",
        "O ID da clínica deve ser um número."
    ),
    fisioterapeuta_id: numberField(
        "O ID do fisioterapeuta é obrigatório.",
        "O ID do fisioterapeuta deve ser um número."
    ),
    data_hora: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "A data e hora do agendamento são obrigatórias."
                : "A data e hora do agendamento devem ser um texto válido.",
    })
    .trim()
    .refine((value) => {
        try {
            normalizeAppointmentDateTime(value);
            return true;
        } catch {
            return false;
        }
    }, {
        message:
            "Formato de data inválido. Use `2026-04-16T15:30`, `2026-04-16T15:30:00` ou ISO com fuso.",
    }),
    observacoes: z.string().optional(),
});
