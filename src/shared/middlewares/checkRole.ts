import { Request, Response, NextFunction } from "express";

export function checkRole(allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        // Garantia de segurança caso o dev esqueça de usar o ensureAuthenticated antes
        if (!req.user || !req.user.tipo) {
            return res.status(403).json({ 
                error: "Acesso negado: Perfil de usuário não identificado." 
            });
        }

        // Verifica se o tipo do usuário está na lista de permitidos
        if (!allowedRoles.includes(req.user.tipo)) {
            return res.status(403).json({ 
                error: "Acesso negado: Você não tem permissão para realizar esta ação." 
            });
        }

        return next();
    };
}