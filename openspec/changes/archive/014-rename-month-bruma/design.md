# Diseño · 014

## Glosario (textos y specs)
| Antes | Ahora |
| --- | --- |
| Día 1/12 · día (de 12) | Mes 1/12 · mes (de 12) |
| Fin del día · Terminar el día · termina el día | Fin del mes · Terminar el mes · termina el mes |
| Amanece el día 3. | Empieza el mes 3. |
| al amanecer · cada amanecer | al empezar el mes · al empezar cada mes |
| al amanecer siguiente | al empezar el mes siguiente |
| hasta el amanecer | hasta el mes siguiente |
| ya trabajó hoy · trabajaron hoy | ya trabajó este mes · trabajaron este mes |
| trabaja desde mañana · cada mañana | trabaja desde el mes siguiente · cada mes |
| una vez por día · el mismo día | una vez por mes · el mismo mes |
| días | meses |
| Maestra Bruna | Maestra Bruma |

No cambian: "claro del día" (día del calendario, 015), "mediodía" y la tabla de luz por estación de `docs/art-direction.md` (mañana, mediodía, atardecer, anochecer: es la hora de la luz, no la unidad de juego). La frase de la Gliophorus "Cambia de color con los días" pasa a "con los meses".

La transformación se hace con un script de reemplazos ordenados (de lo más específico a lo general) y se revisa a mano; los deltas de este cambio salen de aplicarlo a las specs vivas.

## Código
| Antes | Ahora |
| --- | --- |
| `GameState.day`, `wonDay` | `month`, `wonMonth` |
| `endDay()` (reglas), acción `endDay` (store), consejo `endDay` | `endMonth` |
| `DAYS`, `DAYS_PER_SEASON` | `MONTHS`, `MONTHS_PER_SEASON` |
| `MAP_GEN.minDay`, `maxDay` | `minMonth`, `maxMonth` |
| `nextDay`, `randomDay` (bots), `days` | `nextMonth`, `randomMonth`, `months` |
| `seasonIndex(day)`, `season(day)` | mismo nombre, parámetro `month` |
| claves de `es.ts`: `hud.day`, `dock.endDay`, `story.stats.day`, `results.dawn`… | `hud.month`, `dock.endMonth`, `story.stats.month`, `results.newMonth`… |
| CSS `hud__day`, `hud__day-value`, `hud__day-caption` | `hud__month`, `hud__month-value`, `hud__month-caption` |
| `?debugState=lastDay`, `mageTomorrow` | `lastMonth`, `mageNextMonth` |
| `CHARACTER_DIR.mago = 'maestra-bruna'`, `es.mageName` | `'maestra-bruma'`, "Maestra Bruma" |

Las pruebas se renombran igual. Como es mecánico, la verificación es que las 117 pruebas, la suite de humo y `balance.test.ts` sigan pasando sin tocar números.

## Assets y docs
- `public/assets/characters/maestra-bruna/` → `maestra-bruma/`; `assets/sprites/webp/characters/maestra-bruna/` → `maestra-bruma/`.
- `docs/personajes/bruna.md` → `bruma.md` (con una nota "antes Maestra Bruna, y antes Maese Bruma"). `assets/blender/mago-bruma.blend` ya tiene el nombre correcto.
- `CLAUDE.md`, `docs/art-direction.md`, `docs/gdd-fase-0.md`, `docs/prompts.md`, `docs/personajes/*.md` y `openspec/project.md`.

## Riesgo
`localStorage` no guarda nada que dependa de estos nombres (`gremio.seenSpecies` usa las claves de especie, que no cambian), así que no hay migración.
