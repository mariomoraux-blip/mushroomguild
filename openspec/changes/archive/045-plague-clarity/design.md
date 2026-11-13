# Diseño · 045

## Dónde cae la plaga (medido)
Mismo proceso que el 043: `levelAttempt` + `certify` en las semillas 1–100; «pistas» es la política que frena la plaga.

| Variante | Bosque (cert. · pistas) | Ancestral (cert. · pistas) |
| --- | --- | --- |
| Antes: la más cercana al Hogar | 85 · 45 % | 42 · 17 % |
| La más cercana a 2 pasos o más del Hogar | 85 · 46 % | 38 · 21 % |
| Al azar a 2 pasos o más del Hogar | 87 · 44 % | 47 · 19 % |
| **Junto a un árbol vivo (a 2 pasos o más del Hogar)** | **87 · 44 %** | **48 · 17 %** |
| La que suelta menos árboles (al menos uno) | 87 · 39 % | 36 · 19 % |

«A 2 pasos o más» sola sigue cortando el tronco si la red es una línea. Junto a un árbol, la plaga suelta en general un árbol a la vez, la dificultad queda igual y se certifican más claros. Mario la eligió.

## Resumen del mes
- `endMonth` devuelve además `report: { month, lines }`, con el tipo de cada línea (`MonthLineKind`). `message` sigue siendo el texto completo (bots, pruebas).
- `monthHeadline` (store) elige la frase por prioridad: plaga marcada (con cuántos árboles amenaza) > árbol que se apagará > hambre > escarcha > mes vacío > árboles sueltos > plaga marchita > lo que dieron los árboles.
- `UiState.month` guarda el reporte; el botón «Ver el mes» comparte el lugar de «Ficha» (se ve sin miembro seleccionado) y abre la hoja `month`.

## Red cortada y escudos
- `cutNet(s)`: casillas de la red sin plaga fuera de `rootedNet`. `paint.ts` las desatura y oscurece (como el árbol del 043, sin tocar los árboles) y `paintMyceliumGlow` les quita la luz, también al anillo del árbol suelto. La clave de la luz en `GameScene` incluye la plaga, para repintar al marchitarse.
- `guardsPlague(s, t)`: casilla a `PLAGUE_REACH` o menos de una plaga que nadie frenó este mes. Escudo de hoja vectorial (token `leaf`, contorno `ink`) en la esquina superior izquierda de la casilla válida.
