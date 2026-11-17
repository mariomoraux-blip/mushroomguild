# 052 · Sin música

## Por qué
La «Música» del 051 es el ambiente del claro (`amb-clearing`). Mario la escuchó y la descarta: el ambiente es un «shhh» sostenido, no música. Se probaron las otras tomas (5, 6 y 7) y versiones limpias con una puerta espectral; Mario decidió (16 de noviembre de 2026): «nos vamos sin música (porque no es música, es ruido)».

## Qué cambia
- `src/audio.ts` y `src/audio-cues.ts`: sin ambiente, sin loop, sin ducking y sin volumen por pantalla. Buses `stinger`, `game` y `ui`, todos con «Sonido». `AudioPrefs` solo tiene `sound`.
- `Configuración`: un solo interruptor, «Sonido». Se quita «Música» (texto e ícono).
- Se borra `public/assets/audio/ambience/amb-clearing.m4a` (−179 KB); `scripts/build-audio.py` y `takes.json` ya no lo generan. Las tomas fuente quedan en `assets/audio/source/`.
- Lo guardado en `gremio.audio` antes del 052 se lee igual; solo cuenta `sound`.

## Fuera de alcance
- Música nueva o ambientes por eventos sueltos (grillos, aves) sobre silencio: idea para más adelante.
- Cambiar reglas del juego.

## Impacto
- **Specs:** `audio` (fuera «Música»; El sonido acompaña, Primer gesto, Interruptores, Silencio fuera del tablero), `title-screens` (Configuración).
- **Código:** `src/audio.ts`, `src/audio-cues.ts`, `src/ui/audio-toggles.ts`, `src/ui/sheet.ts`, `src/copy/es.ts`, `src/styles.css`, `scripts/build-audio.py`.
- **Pruebas:** `tests/audio.test.ts`, `tests/audio-cues.test.ts`, `tests/budget.test.ts`, humo de «Configuración».
