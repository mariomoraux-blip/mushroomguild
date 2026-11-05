# 030 · El gremio come desde el otoño; el Árbol Padre vuelve a 10

## Por qué
Con el 028, el gremio come solo en invierno, y en esos tres meses la partida suele estar decidida. Mario pidió el 5 de noviembre de 2026 que el costo de nutrientes del gremio empiece en otoño, para que la presión se sienta en la segunda mitad del año.

## Qué cambia (solo Bosque y Ancestral; Brote queda igual)
- **El gremio come en otoño e invierno.** Al terminar cada mes de otoño e invierno (7 a 11), el gremio come 1 nutriente en total, igual que en el 028. Si no hay, el primero en llegar al gremio se queda con hambre y descansa el mes siguiente.
- **Invierno sin esporas, sin cambios.** Solo en invierno los árboles dan nutrientes y no esporas.
- **Carta «Llega el frío» al empezar el otoño** (mes 7), con las reglas del otoño y del invierno. Si llega la maga ese mismo mes, primero su carta.
- **Árbol Padre: 10 nutrientes en todos los niveles** (era 12 en Bosque y Ancestral), para compensar.
- **Bitácora y textos:** «al terminar un mes de otoño o invierno»; la Libreta lo explica; la meta y la ficha de Rubí dicen 10.
- **Puntaje:** `SCORE_VERSION` pasa a 5.

## Decisión de Mario (5 de noviembre de 2026)
«1 en total, Árbol Padre 10». Medido sobre los claros del 028: las pistas ganan el 60 % en Bosque y el 23 % en Ancestral (con 12 nutrientes bajaban al 47 % y al 12 %).

## Fuera de alcance
La plaga de Ancestral y el cambio 022.

## Impacto
- **Specs:** `game-rules` › Niveles de dificultad (MODIFIED), Victoria e Invierno duro (REMOVED), Despertar al Árbol Padre y Temporadas frías (ADDED); `story-presentation` › Llega el frío (MODIFIED); `player-guidance` › Avisos de la presión (MODIFIED).
- **Código:** `src/rules/config.ts` (`LEVELS › upkeep` y `mother`, `SCORE_VERSION`), `src/copy/es.ts`, `src/rules/level-seeds.ts` (regenerada).
