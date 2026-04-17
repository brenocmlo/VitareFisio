import { z } from "zod";

export const createClinicaSchema = z.object({
    nome_fantasia: z.string({ message: "O nome fantasia é obrigatório." }),
    razao_social: z.string().optional(),
    cnpj: z.string().optional(),
    telefone: z.string().optional(),
    endereco: z.string().optional()
});