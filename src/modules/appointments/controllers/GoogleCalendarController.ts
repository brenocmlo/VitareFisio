import { Request, Response } from "express";
import { google } from "googleapis";
import { AppDataSource } from "../../../data-source";
import { Usuario } from "../../users/entities/Usuario";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

export class GoogleCalendarController {
  public async getAuthUrl(req: Request, res: Response): Promise<void> {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // Garante que o refresh_token seja retornado
    });

    res.json({ url });
  }

  public async handleCallback(req: Request, res: Response): Promise<void> {
    const { code } = req.query;
    const userId = req.user.id;

    if (!code) {
      res.status(400).json({ error: "Code não fornecido" });
      return;
    }

    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      
      if (!tokens.refresh_token) {
        // Se não vier refresh_token, pode ser que o usuário já tenha autorizado antes.
        // Em um cenário real, poderíamos tratar isso pedindo 'prompt: consent' novamente.
        console.warn("Refresh token não retornado pelo Google.");
      } else {
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        
        await usuarioRepository.update(userId, {
          google_refresh_token: tokens.refresh_token
        });
      }

      // Redireciona de volta para o frontend (ajuste a rota conforme necessário)
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${frontendUrl}/agenda?google_sync=success`);
    } catch (error) {
      console.error("Erro no callback do Google Calendar:", error);
      res.status(500).json({ error: "Falha na sincronização com Google" });
    }
  }
}