import { z } from "zod";

export const createUserSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    email: z.string().email("E-mail inválido."),
    cpf: z.string().length(11, "O CPF deve ter 11 dígitos."), // ADICIONADO
    senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    clinica_id: z.number().optional(),
    tipo: z.enum(["admin", "fisioterapeuta", "recepcao"])
});
