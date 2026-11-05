# 031 · Árbol Padre de Ancestral: 4 árboles y 12 nutrientes

## Por qué
Mario revisó el 030 y pidió el 5 de noviembre de 2026 que en Ancestral despertar al Árbol Padre cueste 12 nutrientes y pida 4 árboles revividos.

## Qué cambia (solo Ancestral)
- **Árbol Padre: 4 árboles revividos y 12 nutrientes.** Brote y Bosque siguen en 3 y 10.
- `LEVELS` gana `motherTrees`; las reglas, la pista (los bots la usan en Ancestral) y los textos usan los del nivel.
- **Textos:** la meta y la etiqueta del Árbol Padre dicen lo del nivel; la Libreta, la ficha de Rubí y «Cómo jugar» dicen «3 árboles revividos y 10 nutrientes (4 y 12 en Ancestral)». La línea de Ancestral en «Elige tu dificultad» menciona «un Árbol Padre más exigente».
- **Claros:** `level-seeds.ts` se regenera. El certificador acepta 85 de los 100 primeros claros de Ancestral (905 de 1000; antes 95 y 970). El juego solo sirve los certificados; el piso de `balance.test.ts` baja de 90 a 80 en Ancestral. Las pistas ganan el 21 % (rango 20–35 %).
- **Claro de respaldo:** el clásico ya no se gana en Ancestral. Si ningún intento sirve para una semilla, Bosque y Ancestral usan su primer claro certificado; `?map=clasico` sigue mostrando el clásico. Fuera de la tabla (`?seed=` mayor que 1000) se prueban hasta 10 intentos en vez de 20 (máximo 122 ms en Node).
- **Puntaje:** `SCORE_VERSION` pasa a 6.

## Medido antes de decidir (100 primeros claros, reglas del 030, con un filtro más rápido que el certificador)
| Árbol Padre de Ancestral | Certificados | Pistas ganan |
| --- | --- | --- |
| 3 árboles, 10 nutrientes (030) | 95 | 28 % |
| 4 árboles, 10 nutrientes | 90 | 32 % |
| 4 árboles, 11 nutrientes | 80 | 30 % |
| **4 árboles, 12 nutrientes** | **63** | **25 %** |

## Fuera de alcance
La plaga de Ancestral y el cambio 022.

## Impacto
- **Specs:** `game-rules` › Tablero inicial (MODIFIED), Despertar al Árbol Padre (REMOVED) → Victoria (ADDED), Niveles de dificultad (MODIFIED); `player-guidance` › Pista y camino sugerido, Avisos de la presión (MODIFIED).
- **Código:** `src/rules/config.ts`, `state.ts`, `actions.ts`, `advice.ts`, `mapgen.ts`; `src/store.ts`; `src/ui/sheet.ts`, `howto-art.ts`; `src/copy/es.ts`; `src/rules/level-seeds.ts`.
