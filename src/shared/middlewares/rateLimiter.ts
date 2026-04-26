import rateLimit from "express-rate-limit";

// Limite Global: 100 requisições a cada 15 minutos por IP
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: "Muitas requisições vindas deste IP, tente novamente em 15 minutos."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limite Rigoroso: 5 tentativas de login/esqueci senha a cada 15 minutos
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: "Muitas tentativas de acesso. Por segurança, sua conta está temporariamente bloqueada para novas tentativas por 15 minutos."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
