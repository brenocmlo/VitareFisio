import { z } from "zod";

export const createFisioterapeutaSchema = z.object({
    clinica_id: z.number({ message: "O ID da clínica é obrigatório." }),
    nome: z.string({ message: "O nome é obrigatório." }),
    crefito: z.string({ message: "O CREFITO é obrigatório." }),
    cpf: z.string({ message: "O CPF é obrigatório." }).length(11, "CPF inválido."),
    especialidade: z.string().optional(),
    email: z.string().email("E-mail inválido.").optional(),
    is_autonomo: z.boolean().optional(),
    senha: z.string().optional()
});