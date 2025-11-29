import { contactService } from '../services/contact.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

const getRequesterIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip;
};

const create = asyncHandler(async (req, res) => {
  const requesterIp = getRequesterIp(req);
  logger.info('Réception formulaire de contact', {
    ip: requesterIp,
    userAgent: req.get('user-agent'),
  });

  const record = await contactService.handle(
    req.body,
    requesterIp,
    req.get('user-agent')
  );

  logger.info('Message de contact traité', { id: record.id });

  res.status(200).json({ ok: true });
});

const list = asyncHandler(async (req, res) => {
  const messages = await contactService.list();
  res.status(200).json({ ok: true, data: messages });
});

export const contactController = { create, list };
