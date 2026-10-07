import "server-only";
import { Resend } from "resend";

export async function sendEmail(to: string, subject: string, text: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: process.env.EMAIL_FROM!, to, subject, text });
  if (error) throw new Error(`Email to ${to} failed: ${error.message}`);
}
