import { z } from "zod";
export const createEvolucaoSchema = z.object({
    agendamento_id: z.number(),
    paciente_id: z.number(),
    descricao: z.string().min(10, "A descrição deve ser detalhada."),
    procedimentos: z.string().optional()
});