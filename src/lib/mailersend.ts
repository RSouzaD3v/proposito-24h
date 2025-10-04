import 'dotenv/config';
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const apiKey = process.env.MAILERSEND_API_KEY!;
const fromEmail = process.env.MAIL_FROM!;
const fromName  = process.env.MAIL_FROM_NAME || "DevotionalApp";
const replyTo   = process.env.MAIL_REPLY_TO || fromEmail;

if (!apiKey) throw new Error("Faltou MAILERSEND_API_KEY");
if (!fromEmail) throw new Error("Faltou MAIL_FROM");

const mailerSend = new MailerSend({ apiKey });
const sentFrom = new Sender(fromEmail, fromName);

interface SendEmailParams {
  text: string;
  subject: string;
  contentHtml: string;
  emailClient: string;
  nameClient?: string;
}

export const sendEmail = async ({
  text, subject, contentHtml, emailClient, nameClient
}: SendEmailParams) => {
  const recipients = [new Recipient(emailClient, nameClient)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(new Sender(replyTo))
    .setSubject(subject || "(sem assunto)")
    .setHtml(contentHtml || "")
    .setText(text || "");

  try {
    const res = await mailerSend.email.send(emailParams);
    const id = res?.headers?.get?.("x-message-id");
    console.log("E-mail enviado. x-message-id:", id || "(sem header)");
    return { ok: true, id };
  } catch (err: any) {
    const status = err?.response?.status || err?.statusCode;
    const body   = err?.response?.body || err?.body || err?.message || err;
    console.error("MailerSend error:", status, body);
    // Se vier MS42212 aqui, é a restrição de recipients verificados.
    return { ok: false, status, error: body };
  }
};
