import { google } from "googleapis";
import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";
import { Usuario } from "../../users/entities/Usuario";

export class SyncAgendamentoGoogleService {
  public async execute(agendamento_id: number): Promise<void> {
    const agendamentoRepository = AppDataSource.getRepository(Agendamento);
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    const agendamento = await agendamentoRepository.findOne({
      where: { id: agendamento_id },
      relations: ["paciente"]
    });

    if (!agendamento) return;

    const fisioterapeuta = await usuarioRepository.findOneBy({ id: agendamento.fisioterapeuta_id });

    // Só sincroniza se o fisioterapeuta tiver o token do Google
    if (!fisioterapeuta || !fisioterapeuta.google_refresh_token) {
      return;
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: fisioterapeuta.google_refresh_token
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    try {
      const event = {
        summary: `Atendimento: ${agendamento.paciente.nome}`,
        description: agendamento.observacoes || "Atendimento fisioterapêutico agendado via VitareFisio.",
        start: {
          dateTime: new Date(agendamento.data_hora).toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        end: {
          dateTime: new Date(agendamento.data_hora_fim).toISOString(),
          timeZone: "America/Sao_Paulo",
        },
      };

      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      if (response.data.id) {
        await agendamentoRepository.update(agendamento.id, {
          google_event_id: response.data.id
        });
        console.log(`✅ Agendamento ${agendamento.id} sincronizado com Google Calendar.`);
      }
    } catch (error) {
      console.error("❌ Erro ao sincronizar com Google Calendar:", error);
    }
  }

  public async delete(agendamento_id: number): Promise<void> {
    const agendamentoRepository = AppDataSource.getRepository(Agendamento);
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    const agendamento = await agendamentoRepository.findOneBy({ id: agendamento_id });

    if (!agendamento || !agendamento.google_event_id) return;

    const fisioterapeuta = await usuarioRepository.findOneBy({ id: agendamento.fisioterapeuta_id });

    if (!fisioterapeuta || !fisioterapeuta.google_refresh_token) return;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: fisioterapeuta.google_refresh_token
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    try {
      await calendar.events.delete({
        calendarId: "primary",
        eventId: agendamento.google_event_id,
      });
      console.log(`🗑️ Evento Google ${agendamento.google_event_id} removido.`);
    } catch (error) {
      console.error("❌ Erro ao deletar do Google Calendar:", error);
    }
  }

  public async update(agendamento_id: number): Promise<void> {
    const agendamentoRepository = AppDataSource.getRepository(Agendamento);
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    const agendamento = await agendamentoRepository.findOne({
      where: { id: agendamento_id },
      relations: ["paciente"]
    });

    if (!agendamento || !agendamento.google_event_id) return;

    const fisioterapeuta = await usuarioRepository.findOneBy({ id: agendamento.fisioterapeuta_id });

    if (!fisioterapeuta || !fisioterapeuta.google_refresh_token) return;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: fisioterapeuta.google_refresh_token
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    try {
      await calendar.events.patch({
        calendarId: "primary",
        eventId: agendamento.google_event_id,
        requestBody: {
          summary: `Atendimento: ${agendamento.paciente.nome}`,
          description: agendamento.observacoes || "Atendimento fisioterapêutico agendado via VitareFisio.",
          start: {
            dateTime: new Date(agendamento.data_hora).toISOString(),
            timeZone: "America/Sao_Paulo",
          },
          end: {
            dateTime: new Date(agendamento.data_hora_fim).toISOString(),
            timeZone: "America/Sao_Paulo",
          },
        },
      });
      console.log(`🔄 Evento Google ${agendamento.google_event_id} atualizado.`);
    } catch (error) {
      console.error("❌ Erro ao atualizar no Google Calendar:", error);
    }
  }
}
