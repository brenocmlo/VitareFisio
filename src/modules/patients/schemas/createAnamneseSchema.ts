import { z } from "zod";

export const createAnamneseSchema = z.object({
    queixa_principal: z.string().optional(),
    historico_doenca_atual: z.string().optional(),
    historico_patologico_pregresso: z.string().optional(),
    medicamentos_em_uso: z.string().optional(),
    exames_complementares: z.string().optional(),
    observacoes: z.string().optional(),
});
