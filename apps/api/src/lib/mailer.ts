import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  } else {
    // No SMTP configured (local dev): log emails instead of sending them.
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }

  return transporter;
}

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  const client = getTransporter();
  const info = await client.sendMail({ from: env.SMTP_FROM, to, subject, html });

  if (!env.SMTP_HOST) {
    logger.info(
      { to, subject, message: JSON.parse(info.message as string) },
      '📧 dev email (not sent)',
    );
  }
}

export function passwordResetEmail(resetUrl: string): string {
  return `
    <p>Someone requested a password reset for your Felix account.</p>
    <p><a href="${resetUrl}">Click here to reset your password</a>. This link expires in 1 hour.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
  `;
}

export function verifyEmailEmail(verifyUrl: string): string {
  return `
    <p>Welcome to Felix! Please confirm your email address.</p>
    <p><a href="${verifyUrl}">Click here to verify your email</a>. This link expires in 24 hours.</p>
  `;
}

export function teamInvitationEmail(teamName: string, acceptUrl: string): string {
  return `
    <p>You've been invited to join <strong>${teamName}</strong> on Felix.</p>
    <p><a href="${acceptUrl}">Click here to accept the invitation</a>. This link expires in 7 days.</p>
  `;
}
