# Diseño · 027

## Regla
```
recruitedCount(s) = max(0, recruitableCount(s) − STARTING_GUILD.length)   // la maga no cuenta
recruitCost(s)    = recruitableCount(s) ≥ MAX_GUILD ? null : RECRUIT_COSTS[recruitedCount(s)]
canRecruit(s)     = recruitCost(s) !== null && s.spores ≥ recruitCost(s)
```
- `RECRUIT_COSTS = [3, 5, 7]` vive en `config.ts` junto a las demás palancas. Tiene un valor por cupo: una prueba fija `RECRUIT_COSTS.length === MAX_GUILD − STARTING_GUILD.length`.
- `null` significa «gremio completo»: ningún llamador puede leer un costo que no existe.
- Ningún miembro sale del gremio, así que «el n-ésimo recluta» es siempre `reclutables − 3`.
- `recruit()` rechaza con «Reclutar cuesta N esporas.» usando el costo del próximo, no el del primero.

## Quién lo usa
- `advise` (pista ★ y bots) usa `canRecruit`; por eso `playAdvised`, el generador de claros, `certify` y las estrellas (`thresholds`) se ajustan solos.
- UI: el dock atenúa el medallón con `!canRecruit`; la hoja habilita los botones con `canRecruit` y dice el costo del próximo; el HUD lo dice en el aria-label del chip de esporas.
- `tests/bots.ts` (bot al azar) usa `canRecruit` en lugar de repetir la condición.

## Textos (`es.ts`)
- Hoja: «El próximo recluta cuesta 3 esporas; cada uno cuesta más (3, 5 y 7). Hasta 6 miembros; trabaja desde el mes siguiente.» Con el gremio lleno: «El gremio está completo: 6 miembros.»
- «Cómo jugar» paso 4 y Libreta: «… Con esporas reclutas otro hongo: cuesta 3, luego 5 y luego 7.»
- Dock (aria): «Reclutar: 3 esporas» / «Reclutar: gremio completo». HUD (aria): «Esporas: 2. El próximo recluta cuesta 3. Abrir reclutar.» / «Esporas: 2. Gremio completo. Abrir reclutar.»
- Todos los números salen de `RECRUIT_COSTS`.

El costo no se repite en el botón de cada fila de la hoja: es el mismo para las cuatro especies y el botón ya es estrecho a 360 px.

## Puntaje y semillas
`SCORE_VERSION` 2 → 3: un `actionLog` de la v2 con reclutas no se reproduce con los costos nuevos. La tabla `level-seeds.ts` se regenera con `npm run certify`; las tasas de victoria antes y después quedan en `tasks.md`.
