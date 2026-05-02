import nodemailer, { Transporter } from 'nodemailer';

export default class MailProvider {
  private client: Transporter;

  constructor() {
    this.setup();
  }

  private async setup() {
    if (process.env.RESEND_API_KEY) {
      // Usando Resend SMTP em produção
      this.client = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY,
        },
      });
      return;
    }

    // Fallback para conta de teste local (Ethereal)
    const account = await nodemailer.createTestAccount();

    this.client = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
  }

  public async sendMail(to: string, body: string) {
    if (!this.client) await this.setup();

    const sender = process.env.RESEND_API_KEY 
      ? (process.env.EMAIL_FROM || 'onboarding@resend.dev')
      : 'Equipe SomosFisio <equipe@vitarefisio.com.br>';

    const message = await this.client.sendMail({
      from: sender,
      to,
      subject: 'Recuperação de Senha - SomosFisio',
      html: body,
    });

    console.log('✉️ E-mail enviado para: %s', to);
    if (!process.env.RESEND_API_KEY) {
      console.log('🔗 Link de visualização (Teste Local): %s', nodemailer.getTestMessageUrl(message));
    }
  }
}
