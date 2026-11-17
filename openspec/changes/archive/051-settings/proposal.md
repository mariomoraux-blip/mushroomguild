# 051 · Configuración y música

## Por qué
Tras el 050 (sin ambiente, portada en silencio), Mario quiere la música de vuelta como opción y ordenar los controles: un solo lugar para el sonido y los créditos, en vez de interruptores en la portada y en la Libreta y un enlace «Atribuciones» junto a la firma.

## Decisiones de Mario (16 de noviembre de 2026)
- **Música** = el ambiente del claro (`amb-clearing-4`), que vuelve. Lo controla «Música» y **empieza apagada**. Las cortinas de victoria y derrota pasan a «Sonido», así suenan aunque la música esté apagada.
- Con la música encendida, **suena también en la portada, más bajita** (−6 dB). Los efectos siguen callados fuera del tablero (050).
- **Configuración**: una sola hoja con las secciones «Sonido» (interruptores «Sonido» y «Música») y «Créditos». Se abre desde el menú de la portada y desde un engranaje en el HUD, junto a "?".
- **Créditos** (antes «Atribuciones»): firma del autor y crédito de ElevenLabs. El enlace deja la zona de la firma.

## Qué cambia
- `src/audio.ts` y `src/audio-cues.ts`: vuelve el ambiente (bus `ambient`, loop, ducking y volumen por pantalla) con «Música»; las cortinas van a un bus `stinger` con «Sonido». Preferencias con `v: 2`: un `music` guardado en el 049 no enciende el ambiente.
- `public/assets/audio/ambience/amb-clearing.m4a` vuelve (179 KB), igual que el del 049; `scripts/build-audio.py` y `takes.json` lo vuelven a generar.
- Hoja `settings` (reemplaza `credits`), botón «Configuración» en la portada y engranaje (`ui/icons/gear`) en el HUD. Fuera los interruptores de la portada y de la Libreta, y el enlace «Atribuciones» del pie.
- HUD: una columna más de 44 px; la pastilla del mes pasa a un mínimo de 78 px y las etiquetas de las pastillas se achican bajo 375 px.

## Fuera de alcance
- Música nueva (`mus-title`), capas de ambiente por estación, cambiar reglas del juego.

## Impacto
- **Specs:** `audio` (nuevo «Música»; El sonido acompaña, Primer gesto, Interruptores, Silencio fuera del tablero, Atribución), `title-screens` (nuevo «Configuración», fuera «Atribuciones», Portada, Crédito del autor), `player-guidance` (Libreta de campo).
- **Código:** `src/audio.ts`, `src/audio-cues.ts`, `src/store.ts`, `src/ui/{screens,sheet,hud}.ts`, `src/main.ts`, `src/copy/es.ts`, `src/theme.ts`, `src/styles.css`.
- **Pruebas:** `tests/audio.test.ts`, `tests/audio-cues.test.ts`, `tests/budget.test.ts`, humo de «Configuración» y del crédito.
