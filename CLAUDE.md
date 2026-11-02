# El Gremio de los Hongos — instrucciones para el agente

Juego cozy de colocación de trabajadores para navegador. Vertical slice de 5–10 minutos.
Concept doc y GDD: documento "El Gremio de los Hongos · Fase 0" (Claude Docs), con copia en `docs/gdd-fase-0.md`. Este repo contiene la versión ejecutable de esas decisiones; si el GDD y una spec no coinciden, manda la spec hasta que un cambio de OpenSpec las alinee.

## Cómo trabajamos (SDD con OpenSpec)
- Todo trabajo nace de un cambio en `openspec/changes/<id>/`. Si no hay cambio, no hay código.
- Una sesión = un cambio. Lee `proposal.md`, `design.md`, `tasks.md` y los `specs/` del cambio antes de escribir código.
- Empieza con un plan corto y espera aprobación si el cambio toca más de lo que dicen sus tareas.
- Marca cada tarea en `tasks.md` al terminarla. Al cerrar el cambio, fusiona sus deltas en `openspec/specs/` y mueve el cambio a `openspec/changes/archive/`.
- Si una regla del juego no está en una spec, no la inventes: pregunta.

## Stack
- TypeScript estricto + Vite + Phaser (versión estable fijada en `package.json`).
- Vitest para pruebas. Playwright solo para capturas de humo.
- Sin backend. Se despliega como sitio estático.

## Arquitectura (no negociable)
- `src/rules/` es lógica pura: sin Phaser, sin DOM, sin `Math.random` sin semilla. Todo el estado del juego vive aquí.
- `src/scenes/` solo dibuja el estado y traduce input en llamadas a `rules`. Nunca cambia el estado directamente.
- Los textos visibles viven en `src/copy/es.ts`. Español neutro, tono cozy, frases cortas.
- Assets publicados en `public/assets/` (WebP): `backgrounds/`, `board/` (terrain, trees, logs, rocks, mycelium, father-tree), `characters/<personaje>/` (portrait; Chispa también frame-<estación>), `ui/` (panels, buttons, hud, icons, frames) y `atlas/` (generados). Nombres en inglés y minúscula con guiones. Fuente en `assets/` (Blender, renders, hojas originales). Presupuesto de `public/assets/` ≤ 4 MB; portada, intro y victoria (y sus fondos) se cargan solo cuando se muestran.

## Móvil primero
- El objetivo principal es un navegador de teléfono en vertical (360–430 px). El escritorio es una variante, no al revés.
- Tablero vertical de 5×8 (un claro aleatorio por partida), casillas ≥ 64 px a 390 × 844, ≥ 56 px a 390 × 664 y nunca < 48 en vertical (≥ 44 en horizontal); dock del gremio abajo, HUD arriba.
- Áreas táctiles ≥ 44 px, nada depende de hover, sin zoom por doble toque, la página no hace scroll durante la partida.
- 60 fps en Android de gama media; `resolution` limitado a 2×; pausar al ocultar la pestaña.

## Arte
- Lee `docs/art-direction.md` antes de tocar cualquier cosa visual. Las imágenes de `docs/references/` son de terceros: inspiración, nunca assets.
- Colores, tipografías y gradaciones por estación viven en `src/theme.ts`; nada de colores sueltos en escenas.

## Definición de terminado (cada cambio)
- `npm run test` pasa, incluido `balance.test.ts`.
- `npm run build` sin errores ni warnings de TypeScript.
- Funciona a 390 × 844 en vertical (captura incluida), a 844 × 390 en horizontal y con teclado en escritorio (Tab, Enter, Esc).
- Respeta `prefers-reduced-motion`.
- El pull request incluye una captura y una línea de qué probar en el playtest.

## Prompts
`docs/prompts.md` tiene los prompts de cada cambio (planear, implementar, revisar, cerrar) y los transversales.

## Referencia
`poc/` contiene la prueba de concepto (HTML + SVG + JS). Fue la fuente del port de `src/rules/` (cambio 001); desde el 006 las reglas se separaron (costos, Mensajera, claros aleatorios) y la fuente de verdad son las specs de `openspec/specs/`. No edites `poc/`.

## URL de la app
- Sin parámetros: portada, y tras "Nueva partida", intro de 3 cartas y claro aleatorio. `?seed=N`: repite un claro. `?map=clasico`: mapa del Capítulo 1 (lo usan las pruebas de humo). Con `?seed`, `?map` o `?debugState` se entra directo al tablero (sin portada ni intro).
- Solo en desarrollo, `?debugState=`: `fullGuild` (gremio completo con Maestra Bruma), `fatherAwake`, `autumn`, `winter`, `mageNextMonth` (llega la maga al terminar el mes), `nearWin` (Rubí puede despertar al Árbol Padre) y `lastMonth` (mes 12).
