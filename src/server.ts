import "reflect-metadata";
import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import { routes } from "./routes"; // <-- IMPORTAÇÃO AQUI

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes); // <-- USO DAS ROTAS AQUI

// Inicialização do Banco de Dados e do Servidor
AppDataSource.initialize()
    .then(() => {
        console.log("✅ Conexão com o MySQL (VitareFisio) estabelecida com sucesso!");
        
        const PORT = process.env.PORT || 3333;
        app.listen(PORT, () => {
            console.log(`🚀 VitareFisio API rodando em http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ Erro ao conectar no MySQL:", error);
    });