import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

// Carrega as variáveis do arquivo .env
dotenv.config();

// Exporta exatamente com o nome que o server.ts está procurando
export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "1206", // <-- Coloque sua senha do MySQL se o .env falhar
    database: process.env.DB_NAME || "vitarefisio_db",
    synchronize: false,
    logging: true,
    entities: ["src/modules/**/entities/*.ts"],
    migrations: ["src/shared/infra/typeorm/migrations/*.ts"],
    subscribers: [],
});