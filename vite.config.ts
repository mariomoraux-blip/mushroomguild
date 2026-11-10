/// <reference types="vitest/config" />
/// <reference types="node" />
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Plugin } from 'vite';

type NodeHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

/**
 * Ranking (036): en `npm run dev`, la API de `/api` con el almacén en memoria (o Upstash, si el entorno lo trae).
 * El handler se carga con `ssrLoadModule` para que esta configuración no arrastre las reglas.
 */
function leaderboardApi(): Plugin {
  return {
    name: 'gremio-leaderboard-api',
    apply: 'serve',
    configureServer(server) {
      let handler: Promise<NodeHandler> | null = null;
      const load = async (): Promise<NodeHandler> => {
        const mod = (await server.ssrLoadModule('/server/node.ts')) as typeof import('./server/node');
        return mod.nodeHandler(mod.depsFromEnv(process.env, 'memory'));
      };
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();
        (handler ??= load()).then((h) => h(req, res)).catch(next);
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [leaderboardApi()],
  build: { target: 'es2022', chunkSizeWarningLimit: 2000 },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
