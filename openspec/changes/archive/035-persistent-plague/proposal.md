# 035 · La plaga de Ancestral se queda

## Por qué
Mario pidió el 10 de noviembre de 2026 que, para mantener la dificultad, las casillas con plaga se mantengan en Ancestral. Eligió que la marca dure hasta que un hongo la frene: mientras siga, la casilla no es red y no se puede tejer; al frenarla vuelve a ser tierra y se puede tejer otra vez.

## Qué cambia (solo Ancestral)
- **La plaga se queda:** al terminar un mes sin hongos a 2 casillas o menos, la casilla marcada se marchita (sale de la red) y **sigue con plaga**. El Lactarius no puede tejerla. Cada mes que termina con un hongo a 2 casillas o menos la limpia: vuelve a ser tierra que se puede tejer. Frenarla el primer mes la deja en la red, como antes.
- **Dos plagas:** la del otoño puede seguir cuando el invierno marca otra casilla (elegida entre las tejidas sin plaga).
- **Textos:** nuevo rechazo al tejer, avisos «se marchitó… no se puede tejer» y «Los hongos limpiaron la plaga», ayuda y etiqueta «con plaga marchita», y la carta del frío y «Cómo jugar» dicen que la plaga se queda.
- **Arte:** la casilla marchita con plaga se ve con la red muerta (`board/plague/withered`, ya en el repo) y el contorno punteado. Al marchitarse, la plaga viva se funde sobre ella. La hoja podrida del HUD sigue mientras haya plaga.
- **Claros:** `level-seeds.ts` se regenera con `npm run certify`: 862 de 1000 claros de Ancestral (antes 861), 86 de los 100 primeros. Las pistas ganan el 16 %.

## Medido antes de decidir (86 claros certificados de los 100 primeros, reglas del 034)
| Plaga | Pistas | Experto rápido | Siguen ganables |
| --- | --- | --- | --- |
| Se resuelve al terminar el mes (034) | 17 % | 30 % | 86 |
| **Se queda hasta limpiarla** | **16 %** | **30 %** | **86** |

La dificultad se mantiene: el rango de Ancestral (10–25 %) no cambia. `SCORE_VERSION` no cambia, porque la puntuación es la misma y las partidas siguen siendo comparables.

## Fuera de alcance
Bosque, el alcance de la plaga y el cambio 022.

## Impacto
- **Specs:** `game-rules` › Plaga; `player-guidance` › Avisos de la presión; `board-interaction` › Estado visible; `visual-feedback` › La plaga marchita; `story-presentation` › Llega el frío (todas MODIFIED).
- **Código:** `src/rules/actions.ts`, `state.ts`, `level-seeds.ts`; `src/copy/es.ts`; `src/store.ts`; `src/ui/board.ts`; `src/scenes/paint.ts`, `fx.ts`.
