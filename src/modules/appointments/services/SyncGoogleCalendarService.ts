import { google } from "googleapis";
import { AppDataSource } from "../../../data-source";
import { Usuario } from "../../users/entities/Usuario";
import { Agendamento } from "../entities/Agendamento";
import { format, addMinutes } from "date-fns";

export class SyncGoogleCalendarService {
  public async execute(agendamentoId: number): Promise<string | null> {
    const agendamentoRepository = AppDataSource.getRepository(Agendamento);
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    // 1. Recupera o agendamento com os dados do paciente
    const agendamento = await agendamentoRepository.findOne({
      where: { id: agendamentoId },
      relations: ["paciente"]
    });

    if (!agendamento) {
      throw new Error("Agendamento não encontrado.");
    }

    // 2. Recupera o refresh_token do fisioterapeuta
    const fisioterapeuta = await usuarioRepository.findOne({
      where: { id: agendamento.fisioterapeuta_id },
      select: ["id", "google_refresh_token"] // google_refresh_token é select: false por padrão
    });

    if (!fisioterapeuta || !fisioterapeuta.google_refresh_token) {
      console.warn(`Fisioterapeuta ${agendamento.fisioterapeuta_id} não possui integração com Google Calendar.`);
      return null;
    }

    // 3. Configura o cliente OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL
    );

    oauth2Client.setCredentials({
      refresh_token: fisioterapeuta.google_refresh_token
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 4. Prepara os dados do evento
    // Nota: data_hora e data_hora_fim já vêm formatadas via transformer da entidade
    const event = {
      summary: `Atendimento: ${agendamento.paciente.nome}`,
      description: `Paciente: ${agendamento.paciente.nome}\nObservações: ${agendamento.observacoes || 'Nenhuma'}`,
      start: {
        dateTime: new Date(agendamento.data_hora).toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: new Date(agendamento.data_hora_fim).toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      return response.data.htmlLink || null;
    } catch (error) {
      console.error("Erro ao inserir evento no Google Calendar:", error);
      throw new Error("Falha na sincronização com Google Calendar.");
    }
  }
}
