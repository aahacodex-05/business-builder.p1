import nodemailer from 'nodemailer';

const transport = process.env.SMTP_URL ? nodemailer.createTransport(process.env.SMTP_URL) : null;

export async function sendMail({ to, subject, text }) {
  if (!transport) {
    console.log(`[mail] SMTP_URL not set. Would send to ${to}: ${subject}`);
    return;
  }
  await transport.sendMail({ from: process.env.MAIL_FROM, to, subject, text });
}
