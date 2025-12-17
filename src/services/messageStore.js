import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../utils/logger.js';

const DEFAULT_STORE_PATH = fileURLToPath(new URL('../../data/messages.json', import.meta.url));
const FALLBACK_STORE_PATH = path.join(os.tmpdir(), 'ceoverse-messages.json');

const resolveStorePath = () => {
  if (process.env.MESSAGE_STORE_PATH) {
    return path.resolve(process.env.MESSAGE_STORE_PATH);
  }
  if (process.env.VERCEL) {
    return FALLBACK_STORE_PATH;
  }
  return DEFAULT_STORE_PATH;
};

const dataFilePath = resolveStorePath();

if (process.env.VERCEL) {
  logger.warn('Stockage des messages sur un volume temporaire', { path: dataFilePath });
}

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
