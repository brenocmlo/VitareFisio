import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

interface TokenPayload {
    sub: string;
    clinica_id: number;
    tipo: string; // <-- ADICIONADO
    iat: number;
    exp: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                clinica_id: number;
                tipo: string; // <-- ADICIONADO
            };
        }
    }
}

export function ensureAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Token não fornecido." });
    }

    const [, token] = authHeader.split(" ");

    if (!token) {
        return res.status(401).json({ error: "Token inválido." });
    }

    try {
        const decoded = verify(token, "segredo-vitarefisio-2026") as TokenPayload;

        req.user = {
            id: decoded.sub,
            clinica_id: decoded.clinica_id,
            tipo: decoded.tipo, // <-- ADICIONADO: Repassa para todas as rotas
        };

        return next();
    } catch (error: any) {
        return res.status(401).json({ error: "Token inválido." });
    }
}