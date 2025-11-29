import { randomUUID } from 'node:crypto';
import validator from 'validator';
import { messageStore } from './messageStore.js';
import { sendContactNotification } from './mail.service.js';
import { HttpError } from '../utils/httpError.js';
import { logger } from '../utils/logger.js';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_NAME_LENGTH = 120;

const toSafeString = (value) => (typeof value === 'string' ? value : '');

const sanitize = (value) => validator.trim(toSafeString(value));

const validatePayload = (payload = {}) => {
  const errors = {};

  const name = sanitize(payload.name);
  if (!name) {
    errors.name = 'Le nom est requis.';
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Le nom doit faire moins de ${MAX_NAME_LENGTH} caractères.`;
  }

  const email = sanitize(payload.email).toLowerCase();
  if (!email) {
    errors.email = 'L\'email est requis.';
  } else if (!validator.isEmail(email)) {
    errors.email = 'Le format de l\'email est invalide.';
  }

  const message = sanitize(payload.message);
  if (!message) {
    errors.message = 'Le message est requis.';
  } else if (message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Le message doit faire moins de ${MAX_MESSAGE_LENGTH} caractères.`;
  }

  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, 'Payload invalide.', errors);
  }

  return { name, email, message };
};

export const contactService = {
  validate: validatePayload,
  async handle(payload, requesterIp, userAgent) {
    const sanitized = validatePayload(payload);
    const record = {
      id: randomUUID(),
      ...sanitized,
      userAgent: sanitize(userAgent || ''),
      requesterIp,
      receivedAt: new Date().toISOString(),
    };

    await messageStore.save(record);

    try {
      await sendContactNotification(record);
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la notification email', {
        error: error.message,
      });
      throw new HttpError(500, 'Impossible d\'envoyer la notification de contact.');
    }

    return record;
  },
  async list() {
    return messageStore.list();
  },
};
