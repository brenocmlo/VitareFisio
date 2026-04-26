import { z } from "zod";

export const createPagamentoSchema = z.object({
    paciente_id: z.number({ message: "O ID do paciente deve ser um número." }),
    agendamento_id: z.any().optional(),
    valor: z.number({ message: "O valor deve ser um número." }).positive("O valor deve ser maior que zero."),
    forma_pagamento: z.string().optional(),
    metodo_pagamento: z.string().optional(),
    status: z.string().optional(),
    is_pacote: z.any().optional(),
    quantidade_sessoes: z.any().optional(),
    observacoes: z.string().optional()
});