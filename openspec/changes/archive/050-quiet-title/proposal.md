# 050 · Sin ambiente y portada en silencio

## Por qué
Después del 049, Mario prefiere que el claro no tenga un ambiente sonando de fondo y que la portada no suene. El sonido queda como respuesta a lo que pasa en la partida.

## Decisiones de Mario
- **Quitar el ambiente** (`amb-clearing`) en todo el juego (13 de noviembre de 2026).
- **Portada en silencio:** en la portada, en «Elige tu dificultad», en «El gremio» y en el ranking no suena nada, ni siquiera los botones ni la modal «Atribuciones». El sonido empieza en el tablero.

## Qué cambia
- `src/audio.ts`: sin bus `ambient`, sin loop y sin ducking bajo las cortinas. No suena nada mientras haya una pantalla fuera del tablero (`ui.screen`).
- `src/audio-cues.ts`: `ambientLevel` se reemplaza por `silentScreen(state)`.
- `scripts/build-audio.py` y `assets/audio/takes.json`: sin ambiente. Se borra `public/assets/audio/ambience/amb-clearing.m4a` (−179 KB). Las tomas fuente siguen en `assets/audio/source/`.
- Los interruptores no cambian: «Sonido» enciende efectos e interfaz; «Música», las cortinas.

## Fuera de alcance
- Cambiar reglas del juego, los efectos o las cortinas.

## Impacto
- **Specs:** `audio` (El sonido acompaña, Primer gesto, Pausa, Interruptores; nuevo Silencio fuera del tablero), `player-guidance` (Libreta de campo).
- **Código:** `src/audio.ts`, `src/audio-cues.ts`, `scripts/build-audio.py`.
- **Pruebas:** `tests/audio.test.ts`, `tests/audio-cues.test.ts`, `tests/budget.test.ts`.
