import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { AppDataSource } from "../../../data-source";
import { PacienteAnexo } from "../entities/PacienteAnexo";
import uploadConfig from "../../../config/upload";
import { ListAnexosByPacienteService } from "../services/ListAnexosByPacienteService";

export class AnexoController {
    // POST /pacientes/:paciente_id/anexos
    async create(req: Request, res: Response) {
        try {
            const { paciente_id } = req.params;
            const { titulo, tipo } = req.body;
            const { clinica_id } = (req.user as any) || {};

            if (!req.file) {
                return res.status(400).json({ error: "Arquivo não enviado." });
            }

            const repo = AppDataSource.getRepository(PacienteAnexo);
            const anexo = repo.create({
                paciente_id: Number(paciente_id),
                clinica_id: clinica_id ? Number(clinica_id) : undefined,
                titulo: titulo || req.file.originalname,
                nome_arquivo: req.file.filename,
                tipo: tipo || "outro",
                tipo_mime: req.file.mimetype,
                tamanho_bytes: req.file.size
            });

            await repo.save(anexo);
            return res.status(201).json(anexo);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    // GET /pacientes/:paciente_id/anexos
    async index(req: Request, res: Response) {
        try {
            const { paciente_id } = req.params;
            const { clinica_id } = (req.user as any) || {};

            const service = new ListAnexosByPacienteService();
            const anexos = await service.execute(
                Number(paciente_id),
                clinica_id ? Number(clinica_id) : undefined
            );

            return res.json(anexos);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    // GET /anexos/:id — servir o ficheiro (preview ou download)
    async show(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const repo = AppDataSource.getRepository(PacienteAnexo);

            const anexo = await repo.findOneBy({ id: Number(id) });
            if (!anexo) {
                return res.status(404).json({ error: "Anexo não encontrado." });
            }

            const filePath = path.join(uploadConfig.directory, anexo.nome_arquivo);
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: "Arquivo físico não encontrado no servidor." });
            }

            // Envia o MIME type correcto para o browser abrir inline quando possível
            if (anexo.tipo_mime) {
                res.setHeader("Content-Type", anexo.tipo_mime);
            }
            return res.sendFile(filePath);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    // DELETE /anexos/:id
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { clinica_id } = (req.user as any) || {};

            const repo = AppDataSource.getRepository(PacienteAnexo);
            const anexo = await repo.findOneBy({ id: Number(id) });

            if (!anexo) {
                return res.status(404).json({ error: "Anexo não encontrado." });
            }

            // Bloqueia remoção de anexos de outras clínicas
            if (clinica_id && anexo.clinica_id && anexo.clinica_id !== Number(clinica_id)) {
                return res.status(403).json({ error: "Sem permissão para remover este anexo." });
            }

            // Remove o ficheiro físico (não falha se já tiver sido removido)
            const filePath = path.join(uploadConfig.directory, anexo.nome_arquivo);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            await repo.remove(anexo);
            return res.status(204).send();
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}
