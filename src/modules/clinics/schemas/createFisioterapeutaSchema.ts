import { z } from "zod";

export const createFisioterapeutaSchema = z.object({
    clinica_id: z.number({ message: "O ID da clínica é obrigatório." }),
    nome: z.string({ message: "O nome é obrigatório." }),
    crefito: z.string({ message: "O CREFITO é obrigatório." }),
    especialidade: z.string().optional(),
    email: z.string().email("E-mail inválido.").optional()
});