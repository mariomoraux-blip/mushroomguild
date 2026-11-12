# 043 · La plaga crece y corta la red

## Por qué
Mario (11 y 12 de noviembre de 2026) quiere subir la dificultad con la plaga. Hoy casi no pesa: perder una casilla de la red no tiene consecuencias (los árboles producen aunque la red se corte, y el Árbol Padre solo pide una casilla tejida a su lado). Se midieron la plaga que crece, la plaga en un árbol, la plaga cerca del Hogar, la plaga que come nutrientes y la red unida al Hogar (ver diseño). Mario eligió la **red unida al Hogar**.

## Qué cambia
- **La plaga crece (Bosque y Ancestral):** marca casillas cada mes de sus estaciones, 1 el primero, 2 el segundo y 3 el tercero, entre las casillas tejidas más cercanas al **Hogar** (antes, una por estación, cerca del Árbol Padre).
- **Red unida al Hogar (Bosque y Ancestral):** un árbol vivo solo produce si un camino de red lo une al Hogar. Si la plaga corta ese camino, o el Ganoderma cura un árbol a distancia, el árbol queda suelto hasta que la red lo vuelva a unir. Sigue vivo y cuenta para el Árbol Padre.
- **Pistas y bot experto:** frenan la plaga (el Ganoderma la limpia o un miembro trabaja a 2 casillas o menos) antes de tejer hacia la meta, y tejen hacia los árboles sueltos para volver a unirlos.
- **Tablero:** el árbol suelto pierde el color y lleva una raíz cortada; el HUD dice en cuántas casillas hay plaga. Sin arte nuevo.
- **Textos:** bitácora (la plaga crece, árboles sueltos, Ganoderma que cura un árbol suelto), etiqueta y explicación del árbol suelto, «Cómo jugar», líneas de nivel y carta «Llega el frío».
- **Arreglo:** con la plaga cerca del Hogar, el claro de la tabla se certifica con su nombre real (ya en el 042).
- **Generación:** fuera de la tabla se prueban 7 acomodos de rocas en vez de 10, para seguir bajo el límite de tiempo.
- **Puntaje:** cambian las partidas de Bosque y Ancestral, así que `SCORE_VERSION` pasa a 13.
- **Descartado:** la plaga en un árbol (5) y la plaga que come no cambiaban casi nada o bajaban mucho los certificados.

## Riesgos
- Menos claros certificados en Ancestral (unos 40 de cada 100 en la medición).
- Dos reglas nuevas que entender a la vez; el árbol suelto tiene que leerse a primera vista.

## Impacto
- **Specs:** `game-rules` › Cambio de mes, Niveles de dificultad, Plaga, Dificultad medida y Red unida al Hogar (nueva); `player-guidance` › Pista y camino sugerido y Avisos de la presión; `board-interaction` › Estado visible y Árbol suelto (nueva); `story-presentation` › Llega el frío.
- **Código:** `src/rules/` (`config.ts`, `state.ts`, `actions.ts`, `advice.ts`), `level-seeds.ts`, `src/copy/es.ts`, `src/scenes/paint.ts`, `src/ui/board.ts`, `src/ui/hud.ts`, `src/store.ts`, `src/styles.css`.
- **Pruebas:** `plague.test.ts`, `cold.test.ts`, `levels.test.ts`, `effects.test.ts`, `balance.test.ts`, humo.
