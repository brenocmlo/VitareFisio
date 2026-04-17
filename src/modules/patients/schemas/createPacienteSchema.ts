import { z } from "zod";

export const createPacienteSchema = z.object({
    clinica_id: z.number({
        error: (issue) =>
            issue.input === undefined
                ? "O ID da clínica é obrigatório."
                : "O ID da clínica deve ser um número.",
    }),
    nome: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "O nome do paciente é obrigatório."
                : "O nome do paciente deve ser um texto válido.",
    }).min(3, "O nome deve ter pelo menos 3 letras."),
    cpf: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "O CPF é obrigatório."
                : "O CPF deve ser um texto válido.",
    })
    .length(11, "O CPF deve conter exatamente 11 números, sem traços ou pontos.")
    .regex(/^\d+$/, "O CPF deve conter apenas números."),
    data_nascimento: z.string().optional(),
    contato_whatsapp: z.string().optional(),
    endereco_completo: z.string().optional(),
    convenio_nome: z.string().optional(),
    valor_sessao: z.number().optional() // Essencial para o cálculo de saldo
});