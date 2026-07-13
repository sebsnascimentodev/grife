import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from 'redis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.join(__dirname, 'data', 'db.json');
const REDIS_KEY = 'grife:db';

const redis = createClient({ url: process.env.REDIS_URL });
redis.on('error', (err) => console.error('Redis error:', err.message));

let connectPromise = null;
function ensureConnected() {
  if (!connectPromise) {
    connectPromise = redis.connect();
  }
  return connectPromise;
}

let cache = null;
let loading = null;
let saving = Promise.resolve();

export async function readDb() {
  if (cache) return cache;
  if (!loading) {
    loading = (async () => {
      await ensureConnected();
      const raw = await redis.get(REDIS_KEY);
      if (raw) {
        cache = JSON.parse(raw);
      } else {
        cache = JSON.parse(await readFile(SEED_PATH, 'utf-8'));
        await redis.set(REDIS_KEY, JSON.stringify(cache));
      }
      // Migração leve: bancos criados antes do sistema de contas não têm este campo.
      if (!cache.usuarios) cache.usuarios = [];
      return cache;
    })();
  }
  return loading;
}

export async function writeDb(next) {
  cache = next;
  await ensureConnected();
  saving = saving.then(() => redis.set(REDIS_KEY, JSON.stringify(next)));
  return saving;
}
