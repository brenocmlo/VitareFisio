import { Request, Response } from "express";
import { google } from "googleapis";
import { AppDataSource } from "../../../data-source";
import { Usuario } from "../../users/entities/Usuario";

export class GoogleCalendarController {
  private getOAuth2Client = () => {
    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;
    const redirect_uri = process.env.GOOGLE_REDIRECT_URL;

    if (!client_id) throw new Error("Faltando GOOGLE_CLIENT_ID no servidor.");
    if (!client_secret) throw new Error("Faltando GOOGLE_CLIENT_SECRET no servidor.");
    if (!redirect_uri) throw new Error("Faltando GOOGLE_REDIRECT_URL no servidor.");

    return new google.auth.OAuth2(client_id, client_secret, redirect_uri);
  }

  public getAuthUrl = async (req: Request, res: Response): Promise<void> => {
    try {
        const oauth2Client = this.getOAuth2Client();
        const scopes = [
          'https://www.googleapis.com/auth/calendar.events',
          'https://www.googleapis.com/auth/calendar.readonly'
        ];

        const url = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: scopes,
          prompt: 'consent'
        });

        res.json({ url });
    } catch (error: any) {
        console.error("Erro no getAuthUrl:", error);
        res.status(500).json({ error: error.message });
    }
  }

  public handleCallback = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.query;
    const userId = req.user.id;

    if (!code) {
      res.status(400).json({ error: "Code não fornecido" });
      return;
    }

    try {
      const oauth2Client = this.getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code as string);
      
      if (!tokens.refresh_token) {
        console.warn("Refresh token não retornado pelo Google.");
      } else {
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        
        await usuarioRepository.update(userId, {
          google_refresh_token: tokens.refresh_token
        });
      }

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${frontendUrl}/agenda?google_sync=success`);
    } catch (error) {
      console.error("Erro no callback do Google Calendar:", error);
      res.status(500).json({ error: "Falha na sincronização com Google" });
    }
  }
}