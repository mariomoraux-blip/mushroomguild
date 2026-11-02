# El Gremio de los Hongos

Juego cozy de colocación de trabajadores para navegador, mobile-first.

## Cómo está organizado
- [`CLAUDE.md`](CLAUDE.md): instrucciones para el agente (stack, arquitectura, definición de terminado).
- [`openspec/`](openspec/): especificaciones con OpenSpec. Empieza por [`openspec/project.md`](openspec/project.md); cada cambio vive en `openspec/changes/<id>/`.
- [`docs/gdd-fase-0.md`](docs/gdd-fase-0.md): concept doc y GDD de la Fase 0.
- [`docs/art-direction.md`](docs/art-direction.md): dirección de arte.
- [`poc/`](poc/): prueba de concepto (referencia, no se edita).

## Preview en Vercel
El juego es un sitio estático: `npm run build` genera `dist/` y Vercel lo publica (configuración en `vercel.json`).

Para conectar la cuenta (una sola vez):
1. Entra a [vercel.com/new](https://vercel.com/new) con tu cuenta de GitHub.
2. Importa el repositorio `mariomoraux-blip/mushroomguild` (si no aparece, dale acceso a la app de Vercel en GitHub).
3. Confirma el preset **Vite**: build `npm run build`, salida `dist`. No hacen falta variables de entorno.
4. Pulsa **Deploy**. Desde entonces:
   - cada push a `main` actualiza la versión de producción;
   - cada pull request recibe su propio link de preview (lo comenta el bot de Vercel en el PR) para el playtest en el teléfono.

## Desarrollo
```bash
npm install
npm run dev        # servidor local
npm run test       # reglas, store y balance (Vitest)
npm run build      # build de producción en dist/
npm run smoke      # prueba de humo con Playwright (capturas en docs/screenshots/)
```
