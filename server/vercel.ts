/// <reference types="node" />
// Función de Vercel del ranking (036). `scripts/build-vercel.mjs` la empaqueta en `.vercel/output/functions/api.func`.
// Sin las variables de Upstash, responde 503 y el juego lo trata como «sin conexión».
import { depsFromEnv, nodeHandler } from './node';

export default nodeHandler(depsFromEnv(process.env, 'none'));
