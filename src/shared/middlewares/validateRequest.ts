import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateRequest = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            next(); // Passa para o Controller
        } catch (error: any) { // <-- MÁGICA 1: Avisamos que o erro pode ser qualquer coisa
            if (error instanceof ZodError) {
                // MÁGICA 2: Avisamos que o 'err' interno também não precisa de inspeção
                const formatErrors = error.issues.map((err: any) => ({
                    campo: err.path.join('.'),
                    mensagem: err.message
                }));
                
                res.status(400).json({ erros_de_validacao: formatErrors });
                return; // Encerra a requisição aqui
            }
            
            res.status(400).json({ erro: "Erro interno de validação" });
            return;
        }
    };
};