# 022 · Movimiento y microinteracciones

## Por qué
La auditoría del 2 de noviembre (Playwright, 390 × 664 táctil, video de una partida hasta que llega Maestra Bruma, ver `design.md` › Auditoría) mostró que el juego responde bien sobre el tablero, pero en casi todo lo demás corta en seco:
- **El tablero sí se mueve.** Tejer, descomponer, revivir y despertar tienen su animación del 004. Las esporas vuelan al contador al empezar el mes y la luz de la red cambia en 600 ms.
- **Todo lo demás aparece y desaparece de golpe.** Eso incluye la portada, «Elige tu dificultad», la intro, las hojas, las fichas, las cartas, el dock, los contadores de nutrientes y árboles, el cambio de estación del claro y la llegada de Maestra Bruma.
- **Hay momentos donde el jugador no entiende qué pasó:**
  - Pasar la voz (Chispa) no muestra nada en el tablero.
  - Un toque inválido solo cambia una línea de la bitácora, lejos del dedo.
  - El costo de tejer o revivir (−1, −3) no se ve en el HUD.
  - Al ganar, la carta tapa el anillo de luz del Árbol Padre en el mismo cuadro, así que nadie ve despertar al árbol.
- **Los 4 problemas reportados, verificados:**
  1. **Esc no cierra la ficha.** En escritorio sí la cierra. Pero en el teléfono no hay Esc: el gesto «atrás» saca de la partida. Y con Maestra Bruma el primer Esc solo cambia la ficha por la hoja de hechizos.
  2. **Tocar el avatar abre la ficha en vez de seleccionar.** Es la regla «ficha la primera vez» de `player-guidance`. Selecciona, pero la hoja tapa el 86 % del tablero (de y = 93 a 664; el tablero va de 70 a 526), así que se percibe como «abrió la ficha».
  3. **Tocar una casilla con la ficha abierta solo la cierra.** Reproducido. La selección queda, así que hace falta un segundo toque. Las casillas de abajo quedan bajo el panel y ni siquiera cierran.
  4. **La etiqueta accesible dice «Árbol Padre».** El tablero se llama «Tablero del claro» y la casilla meta, «Árbol Padre, columna 3, fila 1, la meta». Todas las specs y el GDD dicen Árbol Padre; cambiarlo es una decisión de nombre (pregunta abierta 1).

## Qué cambia
- **Principios de movimiento y tokens** (`design.md`):
  - Cozy, suave y elástico; el movimiento explica causa y efecto.
  - Ninguna animación bloquea la siguiente acción.
  - 4 duraciones y 4 curvas con nombre en `src/theme.ts` (y como variables CSS).
- **Movimiento reducido más fino:**
  - Se conservan los cambios de color y opacidad (≤ 180 ms).
  - Se quitan desplazamiento, escala, vuelos y partículas.
- **P0, que el jugador entienda:**
  - Arreglar los 4 problemas.
  - Rechazo visible en la casilla o tarjeta tocada.
  - Pasar la voz visible.
  - Cambios de los contadores del HUD con «+2» o «−1».
- **P1, sensación:**
  - Una firma de movimiento por especie al llegar a la casilla.
  - Selección y casillas válidas que aparecen.
  - Hojas, fichas y cartas que entran y salen.
  - Fin del mes con hojarasca al contador y el gremio que despierta.
  - Cambio de estación con fundido del claro.
  - Llegada de Maestra Bruma.
  - Victoria que deja ver el despertar.
- **P2, deleite:**
  - Entrada de la portada.
  - Vibración opcional (10–20 ms) en jugadas válidas.

## Fuera de alcance
- Reglas del juego, balance, puntaje y arte nuevo: todo sale de piezas y texturas que ya existen.
- Sonido.
- Animaciones nuevas en bucle (ambiente): el fondo vivo, las motas, el halo y la escarcha se quedan como están.

## Impacto
- **Specs:**
  - `visual-feedback` (MODIFIED y ADDED).
  - `player-guidance` › Ficha al seleccionar un hongo (MODIFIED, problemas 2 y 3).
  - `board-interaction` › Cerrar capas (ADDED, problemas 1 y 3).
- **Código, cuando se apruebe:**
  - `src/theme.ts` (tokens), `src/styles.css` (variables y movimiento reducido selectivo).
  - `src/effects.ts` (efecto `call`), `src/scenes/fx.ts` y `src/scenes/GameScene.ts` (sprites, fundido de estación).
  - `src/ui/` (hud, dock, sheet, story, screens, flyers), `src/store.ts` (ficha, atrás, retraso de la carta final).
  - Pruebas y humo.
- **Docs:** `docs/art-direction.md` › Movimiento se reemplaza por los principios de `design.md`.
- **Rendimiento:** el tope de 40 partículas se mantiene y es compartido por todo; las esporas y hojas en vuelo, como máximo 12.

## Preguntas abiertas (necesitan decisión antes de implementar)
1. ~~¿Árbol Padre o Árbol Madre?~~ **Decidido:** se queda «Árbol Padre». El problema 4 se cierra sin cambio.
2. **Ficha la primera vez.** Recomendado (B): no se abre sola; el botón «Ficha» lleva un punto «nuevo» y late una vez, y la bitácora lo menciona. Alternativa (A): se sigue abriendo sola, pero tocar una casilla visible la cierra y actúa. La delta de `player-guidance` está escrita con B.
3. **¿Dónde va el interruptor de vibración?** No hay pantalla de ajustes. Propuesta: en «Cómo jugar», junto a la Libreta.
4. **Esc en la primera ficha de Maestra Bruma.** Hoy pasa a la hoja de hechizos (según la spec). Propuesta: «Entendido» pide el hechizo; Esc o atrás cierran todo y la deseleccionan.
