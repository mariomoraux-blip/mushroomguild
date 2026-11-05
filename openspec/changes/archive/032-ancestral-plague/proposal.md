# 032 · Plaga de Ancestral

## Por qué
Mario pidió el 5 de noviembre de 2026 una plaga que se extiende en Ancestral desde el otoño: cada estación, una casilla de la red se marchita si no hay un hongo cerca. Es la variante que más tensión daría, con aviso, arte, textos y certificación de claros.

## Qué cambia (solo Ancestral)
- **La plaga marca.** Al empezar el otoño y el invierno (meses 7 y 10) se marca una casilla tejida, al azar entre las más cercanas al Árbol Padre (fijo por claro y mes).
- **Se marchita o se frena.** Al terminar ese mes, si ningún hongo trabajó a 2 casillas o menos, la casilla sale de la red y vuelve a ser tierra; se puede tejer otra vez. Si alguno trabajó cerca, se salva.
- **Avisos:** la bitácora avisa al marcar y al terminar el mes; tocar la casilla lo explica; su etiqueta dice «con plaga». La carta «Llega el frío» de Ancestral suma la regla. La Libreta y «Elige tu dificultad» la mencionan.
- **Arte:** la casilla marcada se pinta en la capa de casillas marcadas (como la escarcha) con un velo violeta (`theme.ts › blight`), contorno punteado y tres manchas. Si Mario manda un WebP propio, puede reemplazarlo.
- **Invariante:** «Nada se pierde» cambia: los árboles vivos nunca se pierden; la red puede perder a lo más la casilla con plaga.
- `level-seeds.ts` se regenera; `SCORE_VERSION` pasa a 7.

## Decisiones de Mario (5 de noviembre de 2026)
Se marca y avisa · salva un hongo a 2 casillas o menos · al azar entre las más cercanas al Árbol Padre · vuelve a ser tierra.

## Medido antes de certificar (100 primeros claros, tabla del 031)
Las pistas ganan el 22 % con plaga (21 % sin ella), y el experto sigue ganando todos los claros certificados. Con alcance 1 o 0 las pistas ganan el 20 %. La plaga da tensión, pero casi no cambia el balance: marca a lo más dos casillas por partida y tejerlas otra vez cuesta 1 o 2 nutrientes.

## Medido tras certificar
Ancestral certifica 907 de 1000 claros (86 de los 100 primeros) y las pistas ganan el 22 % (rango 20–35 %); el bot al azar, el 2,4 %. Bosque no cambia (63 %).

## Fuera de alcance
Arte pintado de la plaga (si llega, en un cambio de arte) y el cambio 022.

## Impacto
- **Specs:** `game-rules` › Plaga (ADDED), Niveles de dificultad (MODIFIED); `story-presentation` › Llega el frío (MODIFIED); `player-guidance` › Avisos de la presión (MODIFIED).
- **Código:** `src/rules/config.ts`, `types.ts`, `rng.ts`, `state.ts`, `actions.ts`; `src/store.ts`; `src/ui/board.ts`, `story.ts`; `src/scenes/paint.ts`, `GameScene.ts`; `src/theme.ts`; `src/copy/es.ts`; `src/rules/level-seeds.ts`.
