import { google } from "googleapis";
import { AppDataSource } from "../../../data-source";
import { Usuario } from "../../users/entities/Usuario";
import { Agendamento } from "../entities/Agendamento";

export class SyncGoogleCalendarService {
  private getOAuth2Client() {
    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;
    const redirect_uri = process.env.GOOGLE_REDIRECT_URI;

    if (!client_id || !client_secret || !redirect_uri) {
      throw new Error("Configurações do Google Calendar incompletas.");
    }

    return new google.auth.OAuth2(client_id, client_secret, redirect_uri);
  }

  public async execute(agendamentoId: number): Promise<void> {
    const agendamentoRepository = AppDataSource.getRepository(Agendamento);
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    const agendamento = await agendamentoRepository.findOne({
      where: { id: agendamentoId },
      relations: ["paciente"]
    });

    if (!agendamento) return;

    const fisioterapeuta = await usuarioRepository.findOneBy({ id: agendamento.fisioterapeuta_id });

    if (!fisioterapeuta || !fisioterapeuta.google_refresh_token) {
      return;
    }

    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: fisioterapeuta.google_refresh_token });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: `Atendimento: ${agendamento.paciente.nome}`,
          description: agendamento.observacoes || "Atendimento agendado via VitareFisio.",
          start: {
            dateTime: new Date(agendamento.data_hora).toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
          end: {
            dateTime: new Date(agendamento.data_hora_fim).toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
        },
      });

      if (response.data.id) {
        await agendamentoRepository.update(agendamento.id, {
          google_event_id: response.data.id
        });
      }
    } catch (error) {
      console.error("❌ Erro ao inserir no Google Calendar:", error);
    }
  }

  public async update(agendamentoId: number): Promise<void> {
    const agendamentoRepository = AppDataSource.getRepository(Agendamento);
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    const agendamento = await agendamentoRepository.findOne({
      where: { id: agendamentoId },
      relations: ["paciente"]
    });

    if (!agendamento || !agendamento.google_event_id) return;

    const fisioterapeuta = await usuarioRepository.findOneBy({ id: agendamento.fisioterapeuta_id });

    if (!fisioterapeuta || !fisioterapeuta.google_refresh_token) return;

    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: fisioterapeuta.google_refresh_token });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
      await calendar.events.patch({
        calendarId: 'primary',
        eventId: agendamento.google_event_id,
        requestBody: {
          summary: `Atendimento: ${agendamento.paciente.nome}`,
          description: agendamento.observacoes || "Atendimento agendado via VitareFisio.",
          start: {
            dateTime: new Date(agendamento.data_hora).toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
          end: {
            dateTime: new Date(agendamento.data_hora_fim).toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
        },
      });
    } catch (error) {
      console.error("❌ Erro ao atualizar no Google Calendar:", error);
    }
  }

  public async delete(agendamentoId: number): Promise<void> {
    const agendamentoRepository = AppDataSource.getRepository(Agendamento);
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    const agendamento = await agendamentoRepository.findOneBy({ id: agendamentoId });

    if (!agendamento || !agendamento.google_event_id) return;

    const fisioterapeuta = await usuarioRepository.findOneBy({ id: agendamento.fisioterapeuta_id });

    if (!fisioterapeuta || !fisioterapeuta.google_refresh_token) return;

    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: fisioterapeuta.google_refresh_token });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: agendamento.google_event_id,
      });
    } catch (error) {
      console.error("❌ Erro ao deletar do Google Calendar:", error);
    }
  }
}
