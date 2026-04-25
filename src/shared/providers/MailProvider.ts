import nodemailer, { Transporter } from 'nodemailer';

export default class MailProvider {
  private client: Transporter;

  constructor() {
    this.setup();
  }

  private async setup() {
    const account = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });

    this.client = transporter;
  }

  public async sendMail(to: string, body: string) {
    if (!this.client) await this.setup();

    const message = await this.client.sendMail({
      from: 'Equipe VitareFisio <equipe@vitarefisio.com.br>',
      to,
      subject: 'Recuperação de Senha - VitareFisio',
      html: body,
    });

    console.log('✉️ E-mail enviado: %s', message.messageId);
    console.log('🔗 Link de visualização: %s', nodemailer.getTestMessageUrl(message));
  }
}
