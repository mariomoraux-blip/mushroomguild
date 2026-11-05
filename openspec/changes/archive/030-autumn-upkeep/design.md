# Diseño · 030

Las reglas del 028 ya dependen de `LEVELS`: `isCold` lee `upkeep` (estaciones en que come el gremio), `isSporeless` lee `sporeless` y `motherCost` lee `mother`. El cambio es de datos:

| | Bosque | Ancestral |
| --- | --- | --- |
| `upkeep` | `[3]` → `[2, 3]` | `[3]` → `[2, 3]` |
| `sporeless` | `[3]` | `[3]` |
| `mother` | 12 → 10 | 12 → 10 |

- `storyFor` muestra la carta del frío cuando empieza la primera estación de `upkeep`: ahora el mes 7. La carta habla de las dos estaciones porque solo sale una vez.
- `motherNutrients` en `es.ts` deja de decir «(12 en Bosque y Ancestral)» si todos los niveles piden lo mismo.
- `npm run certify` regenera `level-seeds.ts`: el certificador ya usa las reglas del nivel.
- `SCORE_VERSION = 5`: los `actionLog` guardados de Bosque y Ancestral ya no se reproducen igual.
