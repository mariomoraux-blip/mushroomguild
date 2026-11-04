# 028 · Invierno duro: el gremio come, los árboles no dan esporas y el Árbol Padre pide 12

## Por qué
Bosque y Ancestral se ganan con pistas el 84 % y el 48 %, y la economía se relaja en la segunda mitad del año. Mario eligió el 4 de noviembre de 2026 tres ajustes de las ideas propuestas (mantenimiento en temporadas frías, invierno pobre y Árbol Padre más exigente) para ver cómo cambia la partida. La plaga queda para un cambio aparte, solo de Ancestral, con arte propio.

## Qué cambia (solo Bosque y Ancestral; Brote queda igual)
- **El gremio come en invierno.** Al terminar cada mes de invierno, el gremio come 1 nutriente en total, después de lo que dan los árboles. Si no hay, el primero en llegar al gremio (nunca Maestra Bruma) se queda con hambre y descansa el mes siguiente (Zz, «Con hambre»); los nutrientes no bajan de 0. Pasar la voz no lo despierta: la Mensajera solo llama a quien trabajó en una casilla.
- **Carta «Llega el frío».** Al empezar el invierno (mes 10) aparece una carta como la de Maestra Bruma con las reglas del invierno. Si llega la maga ese mismo mes, primero su carta y después esta. Sale también en Ancestral: es un aviso, no una pista.
- **Invierno sin esporas.** Lo que dan los árboles al empezar un mes de invierno (10, 11 y 12) son solo nutrientes. La Lluvia de esporas de Maestra Bruma sigue dando esporas.
- **Árbol Padre: 3 árboles y 12 nutrientes.** En Brote siguen siendo 10.
- **Bitácora:** al terminar un mes de invierno dice lo que comió el gremio o quién se quedó con hambre; al empezar el invierno, que los árboles ya no dan esporas.
- **Textos:** la meta, la ficha de Rubí, la etiqueta del Árbol Padre y la Libreta dicen el costo del nivel; la Libreta explica el invierno de Bosque y Ancestral.
- **Balance:** los rangos de `balance.test.ts` bajan a 55–70 % (Bosque) y 20–35 % (Ancestral) para la política de las pistas.
- **Puntaje:** los `actionLog` guardados ya no se reproducen igual en Bosque y Ancestral: `SCORE_VERSION` pasa a 4.

## Decisiones de Mario (4 de noviembre de 2026)
Niveles: Bosque y Ancestral. Sin nutrientes: el que no come descansa. Lluvia de esporas: sigue dando esporas en invierno.

La primera versión (cada hongo come 1 nutriente en otoño e invierno) se midió el mismo día: las pistas ganaban el 1 % en Bosque y el 4 % en Ancestral, y solo 6 de cada 100 claros se podían ganar. Medidas las variantes, Mario eligió que el gremio coma 1 nutriente en total por mes, solo en invierno (pistas 62 % en Bosque y 27 % en Ancestral sobre los claros de antes).

## Fuera de alcance
La plaga de Ancestral (necesita arte nuevo), otros costos y el cambio 022 (abierto).

## Impacto
- **Specs:** `game-rules` › Cambio de mes, Victoria, Niveles de dificultad y Dificultad medida (MODIFIED), Invierno duro (ADDED); `story-presentation` › Llega el frío (ADDED); `player-guidance` › Avisos de la presión (MODIFIED).
- **Código:** `src/rules/config.ts`, `types.ts`, `state.ts`, `actions.ts`; `src/store.ts`; `src/ui/story.ts`, `dock.ts`, `sheet.ts`; `src/copy/es.ts`; `src/rules/level-seeds.ts` (regenerada).
- **Balance:** `level-seeds.ts` se regenera con `npm run certify`; cambian los claros certificados de Bosque y Ancestral.
