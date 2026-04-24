import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

interface TokenPayload {
    sub: string;
    clinica_id: number;
    tipo: string;
    iat: number;
    exp: number;
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
        const jwtSecret = process.env.JWT_SECRET || "segredo-vitarefisio-2026";
        const decoded = verify(token, jwtSecret) as TokenPayload;

        const { sub, tipo, clinica_id } = decoded;

        req.user = {
            id: sub,
            tipo: tipo,
            clinica_id: Number(clinica_id),
        };

        return next();
    } catch {
        return res.status(401).json({ error: "Token inválido" });
    }

}