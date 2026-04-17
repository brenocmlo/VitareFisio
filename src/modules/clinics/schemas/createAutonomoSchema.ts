import { z } from "zod";

export const createAutonomoSchema = z.object({
    nome: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "O nome é obrigatório."
                : "O nome deve ser um texto válido."
    }),
    email: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "O e-mail é obrigatório."
                : "O e-mail deve ser um texto válido."
    }).email({ message: "E-mail inválido." }),
    password: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "A senha é obrigatória."
                : "A senha deve ser um texto válido."
    }).min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
    cpf: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "O CPF é obrigatório."
                : "O CPF deve ser um texto válido."
    }).length(11, { message: "O CPF deve ter exatamente 11 dígitos." }),
    crefito: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "O CREFITO é obrigatório."
                : "O CREFITO deve ser um texto válido."
    }),
    telefone: z.string({
        error: (issue) => "O telefone deve ser um texto válido."
    }).optional(),
});