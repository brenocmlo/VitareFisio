import { z } from "zod";

export const createEvolucaoSchema = z.object({
    agendamento_id: z.number({
        error: (issue) => issue.input === undefined ? "O ID do agendamento é obrigatório." : "ID inválido."
    }),
    paciente_id: z.number({
        error: (issue) => issue.input === undefined ? "O ID do paciente é obrigatório." : "ID inválido."
    }),
    descricao: z.string({
        error: (issue) => issue.input === undefined ? "A descrição da evolução é obrigatória." : "Texto inválido."
    }).min(10, "Descreva melhor o estado do paciente (mínimo 10 letras)."),
    
    procedimentos: z.string().optional(),
    cid_10: z.string().max(10, "O CID-10 é um código curto.").optional(),
    diagnostico_fisioterapeutico: z.string().optional(),
    objetivos_tratamento: z.string().optional()
});