/// <reference types="node" />
// Adaptador de Node (req, res) → handler web. Lo usan la función de Vercel y el plugin de Vite en desarrollo.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handle, type Deps } from './handler';
import { memoryStore, upstashStore } from './store';

export async function toRequest(req: IncomingMessage): Promise<Request> {
  const host = req.headers.host ?? 'localhost';
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
  else if (Array.isArray(v)) headers.set(k, v.join(', '));
  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    body = Buffer.concat(chunks).toString('utf8');
  }
  return new Request(`http://${host}${req.url ?? '/'}`, { method: req.method ?? 'GET', headers, ...(body !== undefined ? { body } : {}) });
}

export async function sendResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((v, k) => res.setHeader(k, v));
  res.end(await response.text());
}

/** Dependencias a partir del entorno: Upstash si hay URL y token (nombres de la integración de Vercel). */
export function depsFromEnv(env: Record<string, string | undefined>, fallback: 'memory' | 'none'): Deps {
  const url = env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN;
  const store = url && token ? upstashStore(url, token) : fallback === 'memory' ? memoryStore() : null;
  return { store, salt: env.LEADERBOARD_SALT ?? token ?? 'dev', now: Date.now };
}

export const nodeHandler = (deps: Deps) => async (req: IncomingMessage, res: ServerResponse) => sendResponse(res, await handle(await toRequest(req), deps));
