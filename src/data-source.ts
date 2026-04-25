import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";

const isProduction = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
  type: "postgres", // Confirme se está postgres
  url: process.env.DATABASE_URL,
  synchronize: false, // Nunca use true em produção
  logging: !isProduction,
  // O SEGREDO ESTÁ AQUI:
  entities: [
    isProduction 
      ? "dist/modules/**/entities/*.js" 
      : "src/modules/**/entities/*.ts"
  ],
  migrations: [
    isProduction 
      ? "dist/shared/infra/typeorm/migrations/*.js" 
      : "src/shared/infra/typeorm/migrations/*.ts"
  ],
  subscribers: [],
});