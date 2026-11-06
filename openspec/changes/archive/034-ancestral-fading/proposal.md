# 034 · Ancestral: un árbol se apaga cada dos meses

## Por qué
Mario pidió el 6 de noviembre de 2026 subir más la dificultad. Medimos varias palancas en los claros certificados y eligió, para Ancestral, que se apague un árbol en los meses 3, 5, 7, 9 y 11. Bosque queda igual.

## Qué cambia (solo Ancestral)
- **Árboles que se apagan:** al terminar los meses 3, 5, 7, 9 y 11 (antes 3, 6 y 9). Brote y Bosque no cambian.
- **Textos:** la línea de Ancestral en «Elige tu dificultad» dice «cinco árboles que se apagan».
- **Claros:** `level-seeds.ts` se regenera con `npm run certify`.
- **Balance:** la política de las pistas pasa de ganar el 22 % al 17 %; se certifican 861 de 1000 claros (86 de los 100 primeros, igual que antes). El rango de Ancestral en `balance.test.ts` y en la spec «Dificultad medida» baja de 20–35 % a 10–25 %.
- **Puntaje:** `SCORE_VERSION` pasa a 8.

## Medido antes de decidir (86 claros certificados de los 100 primeros, reglas del 033)
| Meses en que se apaga un árbol | Pistas | Experto rápido | Siguen ganables |
| --- | --- | --- | --- |
| 3, 6 y 9 (033) | 22 % | 37 % | 86 |
| 7, 9 y 12 | 47 % | 65 % | 78 |
| 3, 6, 7 y 9 | 20 % | 31 % | 73 |
| **3, 5, 7, 9 y 11** | **16 %** | **26 %** | **65** |

En el mes 12 marcar un árbol no cambia nada: la partida termina antes de que se apague.

## Fuera de alcance
Bosque, la plaga y el cambio 022.

## Impacto
- **Specs:** `game-rules` › Dificultad medida, Niveles de dificultad, Árboles que se apagan (REMOVED) → Árboles marcados (ADDED).
- **Código:** `src/rules/config.ts`, `src/rules/level-seeds.ts`, `src/copy/es.ts`.
- **Pruebas:** `levels.test.ts`, `balance.test.ts`.
