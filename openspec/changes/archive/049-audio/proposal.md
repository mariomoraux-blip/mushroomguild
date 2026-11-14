# 049 · Audio P0

## Por qué
El juego no tiene sonido. La dirección de sonido (`docs/sound-design.md`, «El claro que despierta») ya define qué suena, cuándo y cómo se mezcla, y las tomas de los 16 sonidos P0 ya están generadas con ElevenLabs en `assets/audio/source/`. Falta la parte ejecutable: un módulo que escuche al store y suene sin cambiar nada del juego, controles para apagarlo y los archivos publicados dentro del presupuesto.

## Decisiones de Mario
- Entra solo **P0** (16 sonidos): ambiente base, sprite con las acciones del tablero y la interfaz, y las cortinas de victoria y derrota. Cabe en el presupuesto actual (≈ 0,45 MB; `public/assets` pesa 3,0 de 4 MB).
- **Ambiente:** toma `amb-clearing-4`.
- **Licencia:** las tomas salen del plan gratis de ElevenLabs (uso no comercial, con atribución). Se publican con atribución visible porque el juego es gratis y no tiene anuncios ni pagos. Si algún día se monetiza, hay que regenerarlas con un plan pago (queda anotado en `design.md`).
- **Dónde va la atribución** (Mario, 13 de noviembre de 2026): «en una modal enlazada desde la zona inferior de BY Mario Mora for Berry Lab». Un enlace «Atribuciones» junto a la firma de la portada abre una modal con el crédito.
- **Sin música:** `mus-title` no existe (la API de música no funciona en el plan gratis). No se inventa música.

## Qué cambia
- `src/audio-cues.ts` (nuevo, puro): traduce cada cambio del store (acción, `diffEffects`, hoja, carta, pantalla) en una lista de sonidos.
- `src/audio.ts` (nuevo): motor de Web Audio fuera de `src/rules/`. Se suscribe al store, nunca cambia el estado. `AudioContext` creado o reanudado con el primer gesto, modo silencio de iOS (`navigator.audioSession.type = 'ambient'`), pausa con `visibilitychange`, cuatro buses, ducking, variación, límite de voces y carga diferida.
- `src/store.ts`: el suscriptor recibe también la acción despachada (tercer argumento, opcional para los que ya existen).
- Controles **«Sonido»** y **«Música»** en la portada y en la Libreta de campo, guardados en `localStorage` (`gremio.audio`), con áreas táctiles de 44 px o más.
- Enlace «Atribuciones» junto a la firma de la portada («By Mario Mora for BerryLab»): abre una modal accesible (foco atrapado, Esc cierra, áreas táctiles ≥ 44 px) con «Efectos de sonido generados con ElevenLabs (elevenlabs.io)». Es una hoja nueva del store (`sheet.kind = 'credits'`).
- `public/assets/audio/`: `sfx.m4a` + `sfx.json` (sprite), `ambience/amb-clearing.m4a` y `stingers/stg-victory.m4a`, `stingers/stg-defeat.m4a`.
- `scripts/build-audio.py` (nuevo): recorta, aplica el paso alto a 80 Hz, los fundidos y la normalización, cierra el loop y codifica con `afconvert`. Lee las tomas elegidas de `assets/audio/takes.json`, así que cambiar una toma no toca código.

## Fuera de alcance
- Todo lo P1 y P2 del catálogo (capas por estación, voces de especie, eventos del mes, cartas de Maga y frío, `mus-title`).
- Cambiar reglas del juego.

## Impacto
- **Specs:** `audio` (nueva), `visual-feedback` (Peso de la página), `title-screens` (Portada, Atribuciones), `player-guidance` (Libreta de campo).
- **Código:** `src/audio.ts`, `src/audio-cues.ts`, `src/ui/audio-toggles.ts`, `src/store.ts` (hoja `credits`), `src/main.ts`, `src/ui/screens.ts`, `src/ui/sheet.ts`, `src/copy/es.ts`, `src/styles.css`.
- **Assets:** `public/assets/audio/` (≈ 0,45 MB), fuentes en `assets/audio/source/` y `docs/sound-design.md`.
- **Pruebas:** `tests/audio-cues.test.ts`, `tests/audio.test.ts`, `tests/budget.test.ts`; humo de los controles.
