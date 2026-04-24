declare namespace Express {
    export interface Request {
        user: {
            id: string;
            tipo: string;
            clinica_id: number;
        };
    }
}