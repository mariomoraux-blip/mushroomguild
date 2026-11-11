# 041 · Cuatro reclutas, variedad que crece y más rocas

## Por qué
Mario (11 de noviembre de 2026):
- Con 4 especies reclutables y solo 3 cupos, el gremio se llena antes de tenerlas todas. Quiere poder reclutar las 4.
- La variedad debe premiar tener más especies reclutadas.
- Con los hongos nuevos (039) y Pompón en los dos sentidos (040), el juego quedó más fácil: hay que subir la dificultad con más rocas.

## Qué cambia
- **Cuatro reclutas:** `MAX_GUILD` sube a 7 y los costos pasan a 3, 4, 6 y 7 esporas (`RECRUIT_COSTS`). Se puede tener una de cada especie.
- **Variedad que crece:**
  - Sigue pidiendo que todas las especies del gremio hayan actuado.
  - Vale según cuántas especies reclutables hay en el gremio al ganar: 150 con 0 o 1, 250 con 2, 350 con 3 y 450 con 4 (Mario eligió +100 por especie: cada recluta resta 60 de gremio eficiente, así que reclutar una más suma neto +40).
  - La fila del desglose cambia de texto según el escalón: «Todo el gremio actuó», «2 especies reclutadas», «3 especies reclutadas» y «Las 4 especies reclutadas».
- **Gremio eficiente:** sigue siendo 60 × (`MAX_GUILD` − miembros reclutables), ahora con 7.
- **Más difícil:** las pistas vuelven a los rangos de antes de 039, Bosque 55–70 % y Ancestral 10–25 %. Las rocas solas no alcanzaban (ver diseño), así que Mario eligió:
  - Bosque: 9 rocas y Árbol Padre de 11 nutrientes.
  - Ancestral: 11 rocas y Árbol Padre de 13 nutrientes. Se certifican menos claros, así que el piso de certificados baja de 80 a 75.
  - Brote no cambia: con cuatro reclutas sigue en 100 % con mes medio 8.9 y 10.4 % al azar.
- `SCORE_VERSION` sube a 11 y empieza la Temporada 11. Se regenera `level-seeds.ts`.
- **Arreglo:** al tocar «Jugar de nuevo» el dock dejaba las tarjetas de los reclutas de la partida anterior (Mario lo vio en el teléfono). Ahora se quitan las tarjetas de quien ya no está en el gremio.

## Riesgos
- Un cuarto recluta más barato facilita el juego. Las rocas lo compensan, y además se mide.
- Más rocas pueden bajar la cantidad de claros certificados (Bosque ≥ 90, Ancestral ≥ 80 de los 100 primeros).

## Impacto
- **Specs:**
  - `game-rules` › Reclutar, Dificultad medida y Niveles de dificultad (las rocas, después de medir).
  - `scoring` › Puntaje.
- **Código:**
  - `src/rules/config.ts`, `scoring.ts`, `advice.ts` y `autoplay.ts` (orden de reclutas y bots).
  - `level-seeds.ts`.
  - `src/copy/es.ts` (desglose y ayuda de reclutar).
  - `tests/balance.test.ts` (rangos).
  - Smoke tests (dock con 8 tarjetas).
