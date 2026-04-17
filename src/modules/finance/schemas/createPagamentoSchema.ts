import { z } from "zod";

export const createPagamentoSchema = z.object({
    paciente_id: z.number({ message: "O ID do paciente deve ser um número." }),
    agendamento_id: z.number().optional(),
    valor: z.number({ message: "O valor deve ser um número." }).positive("O valor deve ser maior que zero."),
    forma_pagamento: z.enum(['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'convenio'], {
        message: "Selecione uma forma de pagamento válida."
    }),
    observacoes: z.string().optional()
});