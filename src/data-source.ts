import "reflect-metadata";
import * as dotenv from 'dotenv';
import path from 'path';

// O arquivo .env está uma pasta acima de 'src', na raiz do projeto
dotenv.config({ path: path.resolve(__dirname, '..', '.env') }); 

import { DataSource } from "typeorm";

console.log("Conectando na URL:", process.env.DATABASE_URL); // Agora deve imprimir a URL real no terminal

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    synchronize: false,
    entities: ["src/modules/**/entities/*.ts"],
    migrations: ["src/shared/migrations/*.ts"],
});