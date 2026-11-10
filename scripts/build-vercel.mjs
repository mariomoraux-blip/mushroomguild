// Salida para Vercel (Build Output API v3) tras `vite build` (036). El sitio sigue siendo estático (`dist/` →
// `static/`); la API del ranking es una función de Node empaquetada con Vite, una por ruta, con el mismo código.
// Se empaqueta aquí (y no en `api/`) porque las reglas importan sin extensión y Node ESM no las resolvería.
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { build } from 'vite';

const OUT = '.vercel/output';
const ROUTES = ['player', 'scores', 'leaderboard'];
const bundleDir = `${OUT}/.api-bundle`;

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await cp('dist', `${OUT}/static`, { recursive: true });

await build({
  configFile: false,
  logLevel: 'warn',
  publicDir: false,
  build: {
    ssr: 'server/vercel.ts',
    outDir: bundleDir,
    emptyOutDir: true,
    target: 'node22',
    minify: false,
    rolldownOptions: { output: { entryFileNames: 'index.mjs', format: 'es' } },
  },
  ssr: { noExternal: true, target: 'node' },
});

const vcConfig = { runtime: 'nodejs22.x', handler: 'index.mjs', launcherType: 'Nodejs', shouldAddHelpers: false, supportsResponseStreaming: false };
for (const route of ROUTES) {
  const dir = `${OUT}/functions/api/${route}.func`;
  await cp(bundleDir, dir, { recursive: true });
  await writeFile(`${dir}/.vc-config.json`, JSON.stringify(vcConfig, null, 2));
}
await rm(bundleDir, { recursive: true, force: true });
await writeFile(`${OUT}/config.json`, JSON.stringify({ version: 3 }, null, 2));
console.log(`Vercel: ${OUT} con static/ y ${ROUTES.length} funciones (${ROUTES.map((r) => `/api/${r}`).join(', ')}).`);
