import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { AppDataSource } from "../../../data-source";
import { PacienteAnexo } from "../entities/PacienteAnexo";
import uploadConfig from "../../../config/upload";

export class AnexoController {
    async create(req: Request, res: Response) {
        const { paciente_id } = req.params;
        const { titulo } = req.body;
        const filename = req.file?.filename;

        if (!filename) {
            return res.status(400).json({ error: "Arquivo não enviado." });
        }

        const repo = AppDataSource.getRepository(PacienteAnexo);
        const anexo = repo.create({
            paciente_id: Number(paciente_id),
            titulo,
            nome_arquivo: filename
        });

        await repo.save(anexo);

        return res.json(anexo);   
    }
async show(req: Request, res: Response) {
        const { id } = req.params;
        const repo = AppDataSource.getRepository(PacienteAnexo);

        const anexo = await repo.findOneBy({ id: Number(id) });

        if (!anexo) {
            return res.status(404).json({ error: "Anexo não encontrado." });
        }

        const filePath = path.join(uploadConfig.directory, anexo.nome_arquivo);

        // Verificamos se o arquivo físico ainda existe na pasta tmp
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "Arquivo físico não encontrado no servidor." });
        }

        // O sendFile faz o navegador tentar abrir (se for PDF/Imagem) ou baixar
        return res.sendFile(filePath);
    }
}