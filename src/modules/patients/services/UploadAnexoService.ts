import { supabase } from "../../../shared/services/supabaseClient";
import { AppDataSource } from "../../../data-source";
import { PacienteAnexo } from "../entities/PacienteAnexo";

interface IRequest {
  paciente_id: number;
  clinica_id: number;
  titulo: string;
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  };
}

export class UploadAnexoService {
  async execute({ paciente_id, clinica_id, titulo, file }: IRequest) {
    const anexoRepository = AppDataSource.getRepository(PacienteAnexo);

    // 1. Gerar um nome único para o arquivo dentro da pasta do paciente
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${paciente_id}/${Date.now()}.${fileExt}`;

    // 2. Enviar para o Bucket 'anexos' no Supabase
    const { error } = await supabase.storage
      .from('anexos') // Nome do bucket que você criou no painel
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) throw new Error(`Erro no Supabase Storage: ${error.message}`);

    // 3. Salvar os dados do arquivo no Banco de Dados (Postgres)
    const anexo = anexoRepository.create({
      paciente_id,
      clinica_id,
      titulo,
      nome_arquivo: fileName, // Guardamos o caminho para recuperar depois
      tipo_mime: file.mimetype,
      tamanho_bytes: file.size,
      data_criacao: new Date()
    });

    await anexoRepository.save(anexo);

    return anexo;
  }
}