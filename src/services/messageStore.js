import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../utils/logger.js';

const dataFilePath = fileURLToPath(new URL('../../data/messages.json', import.meta.url));

const ensureStore = async () => {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, '[]', 'utf-8');
  }
};

const readMessages = async () => {
  await ensureStore();
  const content = await fs.readFile(dataFilePath, 'utf-8');
  if (!content.trim()) {
    return [];
  }
  try {
    return JSON.parse(content);
  } catch (error) {
    logger.error('Impossible de parser data/messages.json', { error: error.message });
    return [];
  }
};

export const messageStore = {
  async save(message) {
    const messages = await readMessages();
    messages.push(message);
    await fs.writeFile(dataFilePath, JSON.stringify(messages, null, 2), 'utf-8');
    logger.info('Message enregistré dans le store', { id: message.id });
    return message;
  },
  async list() {
    return readMessages();
  },
};
