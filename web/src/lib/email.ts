import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = Number(process.env.SMTP_PORT) || 587;
const user = process.env.SMTP_USER || 'nyeowsz@gmail.com';
const pass = process.env.SMTP_PASS || 'txmvytjicogojsmo';
const from = process.env.SMTP_FROM || 'nyeowsz@gmail.com';

export const emailTransporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // true for 465, false for 587
  auth: {
    user,
    pass,
  },
});

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email via Google SMTP
 */
export async function sendEmail({ to, subject, html, text }: SendEmailPayload) {
  try {
    const info = await emailTransporter.sendMail({
      from: `"ParcelHub CTU Danao" <${from}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Failed to send email via Google SMTP:', error);
    return { success: false, error: error.message };
  }
}
