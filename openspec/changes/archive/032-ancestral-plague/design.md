# Diseño · 032

- **Datos:** `LevelRules.plague` (estaciones; Ancestral `[2, 3]`) y `PLAGUE_REACH = 2`. `Tile.blighted?` es opcional, como `Member.hungry`, para no cambiar la forma de las partidas guardadas.
- **Cuándo:** `plagueStarts(s, month)`: primer mes de una estación de `plague` (7 y 10).
- **Cuál:** `plagueTarget(s)`: casillas con `net` y `kind === 'soil'` (lo tejido y lo que brotó con Maestra Bruma; nunca Hogar, árboles ni Árbol Padre), las de menor distancia en cruz al Árbol Padre, y entre ellas una con `mulberry32(hashString(mapId) ^ month)`. Sin `Math.random`: la misma partida marca siempre la misma, y `actionLog` se reproduce igual.
- **Resolución en `endMonth`:** antes de reiniciar `members[].at`, `guarded(s, t)` mira si algún miembro trabajó a `PLAGUE_REACH` pasos o menos. Si no, `net = false` (la casilla ya era tierra). Después del cambio de mes se marca la siguiente si toca.
- **Arte:** `paintMarked` pinta también la plaga en la misma capa que late (`FROST_PULSE`), con `blightVeil`, `dashedFrame` y `blightSpots` (manchas de corteza con contorno de tinta, para no depender del color). La clave de repintado de `GameScene.drawMarked` incluye las casillas con plaga.
- **Pistas:** Ancestral no tiene pistas; los bots no protegen la casilla a propósito. El certificador busca con las reglas reales.
