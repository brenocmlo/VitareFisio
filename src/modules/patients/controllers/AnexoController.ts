import { Request, Response } from "express";
import { AppDataSource } from "../../../data-source";
import { PacienteAnexo } from "../entities/PacienteAnexo";
import { ListAnexosByPacienteService } from "../services/ListAnexosByPacienteService";
import { supabase } from "../../../shared/services/supabaseClient";

export class AnexoController {
  async create(req: Request, res: Response) {
    try {
      const { paciente_id } = req.params;
      const { titulo, tipo } = req.body;
      const { clinica_id } = (req.user as any) || {};

      if (!req.file) {
        return res.status(400).json({ error: "Arquivo não enviado." });
      }

      const fileExt = req.file.originalname.split(".").pop();
      const fileName = `${paciente_id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("anexos") // <--- Certifique-se de que é 'anexos' e não 'Anexos' ou 'anexo'
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        // Log importante para debug no servidor
        console.error("Erro Supabase Storage:", uploadError.message);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      const repo = AppDataSource.getRepository(PacienteAnexo);
      const anexo = repo.create({
        paciente_id: Number(paciente_id),
        clinica_id: clinica_id ? Number(clinica_id) : undefined,
        titulo: titulo || req.file.originalname,
        nome_arquivo: fileName,
        tipo: tipo || "outro",
        tipo_mime: req.file.mimetype,
        tamanho_bytes: req.file.size,
      });

      await repo.save(anexo);
      return res.status(201).json(anexo);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async index(req: Request, res: Response) {
    try {
      const { paciente_id } = req.params;
      const { clinica_id } = (req.user as any) || {};

      const service = new ListAnexosByPacienteService();
      // Garantimos que ambos os IDs sejam Numbers para o Postgres
      const anexos = await service.execute(
        Number(paciente_id),
        clinica_id ? Number(clinica_id) : undefined,
      );

      return res.json(anexos);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async show(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(PacienteAnexo);

      const anexo = await repo.findOneBy({ id: Number(id) });
      if (!anexo) {
        return res.status(404).json({ error: "Anexo não encontrado." });
      }

      const { data, error } = await supabase.storage
        .from("anexos")
        .createSignedUrl(anexo.nome_arquivo, 60);

      if (error) throw new Error(`Erro ao gerar link: ${error.message}`);

      return res.json({ url: data.signedUrl });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { clinica_id } = (req.user as any) || {};

      const repo = AppDataSource.getRepository(PacienteAnexo);
      const anexo = await repo.findOneBy({ id: Number(id) });

      if (!anexo) {
        return res.status(404).json({ error: "Anexo não encontrado." });
      }

      if (
        clinica_id &&
        anexo.clinica_id &&
        anexo.clinica_id !== Number(clinica_id)
      ) {
        return res.status(403).json({ error: "Sem permissão." });
      }

      await supabase.storage.from("anexos").remove([anexo.nome_arquivo]);

      await repo.remove(anexo);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
