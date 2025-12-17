import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const hasSmtpCredentials = Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

const transporter = hasSmtpCredentials
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    })
  : nodemailer.createTransport({ jsonTransport: true });

export const sendContactNotification = async ({ name, email, message, id }) => {
  if (!env.contactInbox) {
    logger.warn('CONTACT_INBOX manquant, envoi email ignoré');
    return { skipped: true };
  }

  const mailOptions = {
    from: env.smtp.user || env.contactInbox,
    to: env.contactInbox,
    subject: `Nouveau message Ceoverse de ${name}`,
    text: `Vous avez reçu un message de ${name} (${email}).\n\n${message}`,
    html: `<p>Vous avez reçu un message de <strong>${name}</strong> (${email}).</p><p>${message}</p>`
      + `<p><small>Message ID: ${id}</small></p>`,
  };

  const response = await transporter.sendMail(mailOptions);
  logger.info('Notification de contact envoyée', {
    messageId: response.messageId,
    simulated: !hasSmtpCredentials,
  });

  return response;
};
