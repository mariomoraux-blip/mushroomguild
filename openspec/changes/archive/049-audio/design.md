# 049 · Diseño

Fuente: `docs/sound-design.md` (secciones «Arquitectura propuesta», «Formato y peso», «Mezcla» y lo P0 del «Catálogo»). Aquí solo va lo que la implementación decide encima de eso.

## Módulos

```
store ──(state, prev, action)──▶ audio-cues.ts (puro) ──Cue[]──▶ audio.ts (Web Audio)
                                      ▲                              │
                              diffEffects (effects.ts)       buses: ambient · music · game · ui
                                                                     ▼
                                                              AudioContext.destination
clicks en <button> ─────────────────────────────────────────▶ ui-tap / ui-tap-primary (si nada más sonó)
```

- **`src/audio-cues.ts`** es lógica pura (sin DOM ni Web Audio): `cuesFor(prev, next, action)` devuelve `Cue[]` (`{ id, delay?, step? }`). Se prueba sin navegador.
- **`src/audio.ts`** recibe todo lo del navegador inyectado (`makeContext`, `fetch`, `document`, `storage`, `reducedMotion`, `random`), así las pruebas usan un `AudioContext` falso. `main.ts` lo monta con los de verdad.
- **`src/store.ts`**: `Listener` pasa a `(state, prev, action)`. Los suscriptores que ya existen ignoran el tercer argumento.
- **`src/ui/audio-toggles.ts`**: los dos interruptores (portada y Libreta) y su sincronía con la preferencia guardada.
- **Atribuciones:** enlace «Atribuciones» (botón con aspecto de enlace, ≥ 44 px de alto) en la firma de la portada. Abre `openSheet({ kind: 'credits' })`: la misma hoja inferior de siempre, con `role="dialog"`, `aria-modal`, título y botón de cerrar. Mientras hay una hoja abierta sobre una pantalla, la pantalla y la partida quedan `inert`, así que Tab no sale de la modal; Esc y «atrás» la cierran (`cancel`) y el foco vuelve a «Atribuciones». La firma y el enlace van juntos y centrados (requisito «Crédito del autor» modificado); la pastilla sigue a unos 10 px del borde dentro de la fila de 44 px.

## Disparos P0

| Id | Cuándo (en `cuesFor`) | Bus |
| --- | --- | --- |
| `sfx-weave` | cada efecto `weave`; sube un grado de re mayor pentatónica (0, 2, 4, 7, 9, 12 semitonos) por cada tejido del mismo mes y vuelve a la nota base al cambiar de mes | game |
| `sfx-decompose` | efecto `decompose` | game |
| `sfx-revive` | efecto `revive` | game |
| `sfx-awaken` | efecto `awaken` | game |
| `sfx-spores` | efecto `spores` (uno por puñado, no por espora); tras `endMonth` sale 450 ms después, cuando vuelan | game |
| `sfx-recruit` | acción `recruit` aceptada | game |
| `sfx-month-end` | acción `endMonth` aceptada | game |
| `sfx-invalid` | `tapTile` con selección que las reglas rechazan, `recruit` rechazado y `select` de un miembro cansado | game |
| `ui-select` | `select` que deja un miembro elegido; `tapTile` sin selección (ayuda de la casilla); jugada aceptada sin sonido P0 propio (rocas, hilos, Chispa) | ui |
| `ui-sheet-open` / `ui-sheet-close` | `ui.sheet` pasa de nada a algo / de algo a nada | ui |
| `ui-tap` / `ui-tap-primary` | clic en un `<button>` que no produjo otro sonido; primario = `.menu-btn--primary`, `.btn--primary`, `.story__btn--primary` | ui |
| `stg-victory` | `ui.story` pasa a `won`, 900 ms después del `awaken` | music |
| `stg-defeat` | `ui.story` pasa a `lost` | music |
| `amb-clearing` | loop siempre que «Sonido» está encendido y el contexto corre; a −6 dB en portada y «Elige tu dificultad» | ambient |

Una sola cue de interfaz por acción: si hay sonido de juego, la de interfaz no suena; `ui-select` gana sobre la hoja que se abre en la misma acción (Maestra Bruma). El tutorial (046) no cambia nada: una acción que el guion no espera no cambia el estado y no suena.

## Motor

- **Desbloqueo:** nada se crea antes del primer `pointerdown` o `keydown` (captura, en `document`). Ahí se crea el `AudioContext` (o se reanuda), se pone `navigator.audioSession.type = 'ambient'` si existe y empieza la descarga.
- **Carga diferida, en orden:** `sfx.json` + `sfx.m4a`, después `ambience/amb-clearing.m4a`, después los dos stingers. Si «Sonido» y «Música» están apagados, no se descarga nada hasta que se enciendan. Una cue que llega antes de que su archivo esté listo se descarta (no se encola).
- **Pestaña oculta:** `visibilitychange` → `ctx.suspend()`; al volver, `ctx.resume()` (solo si ya se desbloqueó).
- **Buses:** `ambient` (1,0), `music` (1,0, stingers), `game` (1,0), `ui` (0,7) sobre un maestro. Mientras suena un stinger, el ambiente baja 6 dB (rampa de 200 ms) y vuelve al terminar.
- **Variación:** altura ±3 % y volumen ±1,5 dB por reproducción (`random` inyectado).
- **Voces:** máximo 3 del mismo id a la vez; la más vieja se corta con un fundido de 30 ms.
- **`prefers-reduced-motion`:** las animaciones del tablero quedan en fundidos cortos, así que los sonidos del bus `game` duran como mucho `MOTION.ms.standard` (280 ms) con un fundido de 80 ms. Los stingers y la interfaz no cambian.
- **Interruptores:** «Sonido» = buses `ambient`, `game` y `ui`; «Música» = bus `music` (hoy, las cortinas de victoria y derrota; mañana, `mus-title`). Guardados en `localStorage['gremio.audio']` como `{"sound":true,"music":true}`; si el almacenamiento falla, los dos encendidos y nada se guarda. Apagar «Sonido» detiene el ambiente con un fundido de 200 ms.

## Archivos publicados

| Archivo | Contenido | Formato |
| --- | --- | --- |
| `audio/sfx.m4a` + `audio/sfx.json` | los 13 efectos de juego e interfaz, 250 ms de silencio entre uno y otro; el JSON da `{ length, sounds: { id: [[inicio, duración], …] } }` en segundos (una entrada por variante) | AAC mono 44,1 kHz, 64 kbps |
| `audio/ambience/amb-clearing.m4a` | loop de la toma 4 (30 s, con cruce de 1 s) | AAC mono 44,1 kHz, 48 kbps |
| `audio/stingers/stg-victory.m4a`, `stg-defeat.m4a` | cortinas | AAC estéreo 44,1 kHz, 96 kbps |

Las rutas siguen el pedido del cambio (`audio/sfx.m4a` en la raíz de `audio/`) y las carpetas `ambience/` y `stingers/` de la dirección de sonido.

## Proceso (`scripts/build-audio.py`)

Sin ffmpeg ni sox: `afconvert` decodifica el MP3 a WAV y codifica el AAC; el resto es Python sin dependencias.

1. `afconvert` MP3 → WAV PCM de 16 bits.
2. Paso alto Butterworth de 2.º orden a 80 Hz.
3. Recorte: desde el primer instante sobre −40 dB del pico (menos 5 ms) hasta el largo del catálogo (los de interfaz se pidieron a 0,5 s y se recortan a 80–250 ms).
4. Fundido de 10 ms al inicio y al final.
5. Normalización: efectos y stingers a −18 LUFS (máximo momentáneo, ventana de 400 ms, ponderación K de BS.1770); ambiente a −30 LUFS (integrado). El pico queda en −1 dBFS o menos: si no alcanza, el sonido queda más bajo, nunca recortado.
6. Ambiente: cruce de 1 s entre el final y el inicio, con el corte en un cruce por cero.
7. `afconvert` → AAC en `.m4a` y `sfx.json` con los tiempos.

**Tomas:** `assets/audio/takes.json` dice qué toma va en cada sonido (`"ui-tap": [2]`; con varias, `[1, 3]` son variantes que se alternan). Cambiar una toma es editar ese archivo y correr `python3 scripts/build-audio.py`.

## Licencia

Las tomas son del plan gratis de ElevenLabs: uso no comercial, con atribución. Mario decidió publicarlas así porque el juego es gratis y no tiene anuncios ni pagos. La modal «Atribuciones» (enlazada desde la firma de la portada, decisión de Mario del 13 de noviembre) dice «Efectos de sonido generados con ElevenLabs (elevenlabs.io)». **Si algún día el juego se monetiza (anuncios, pagos, patrocinio), hay que regenerar los sonidos con un plan pago de ElevenLabs o con una herramienta de licencia comercial antes de publicar esa versión.**

## Decisiones tomadas en el plan (/autoplan, un solo revisor)

1. Las cues salen de una función pura aparte (`audio-cues.ts`) para probarlas sin navegador.
2. El suscriptor del store recibe la acción: sin ella no se distingue un toque rechazado de otro cambio de la bitácora.
3. Los stingers van en el bus de «Música», así ese interruptor ya hace algo sin `mus-title` (alternativa: dejar «Música» visible pero sin efecto).
4. Una cue que llega antes de que cargue su archivo se descarta: sonar tarde es peor que no sonar (principio 6: todo lo que suena ya se ve).
5. `ui-tap` sale de un escucha de clics único en `document`, no de cada botón.
6. Ambiente de 30 s (la toma 4 dura 30 s, no los 40 del catálogo).
7. El AAC de `afconvert` lleva su relleno inicial marcado: Chrome lo recorta al decodificar (medido: el sprite decodificado dura lo mismo que el WAV y cada sonido empieza a ≤ 4 ms de su marca, salvo `ui-tap`, que arranca suave). No hace falta corregir el desfase en el código.
8. La firma y «Atribuciones» van juntas y centradas: «Crédito del autor» cambia de «la firma centrada» a «la firma y el enlace centrados».
