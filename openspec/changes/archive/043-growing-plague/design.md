# Diseño · 043

## Medición
Con el mismo proceso de la regeneración (`levelAttempt` + `certify` en las semillas 1–100). «Pistas» juega sin frenar la plaga; «frenan» es la misma política con `guardPlague`.

### Plaga que crece, en un árbol y cerca del Hogar (casi no mueve nada)

| Variante | Bosque (cert. · pistas · frenan) | Ancestral (cert. · pistas · frenan) |
| --- | --- | --- |
| Actual | 90 · 39 · 39 | 62 · 16 · 16 |
| Crece por estación (1·2·3) | 91 · 39 · 42 | 66 · 18 · 15 |
| Crece acumulada (hasta 6) | — | 65 · 17 · 14 |
| Plaga en un árbol | — | 60 · 18 · 17 |
| Cerca del Hogar, crece | 89 · 40 · 43 | 65 · 17 · 17 |
| Cerca del Hogar, crece + árbol | — | 59 · 10 · 15 |

Perder una casilla de la red no tenía consecuencias: los árboles producían igual y el Árbol Padre solo pide una casilla tejida a su lado.

### Con consecuencias

| Variante | Bosque | Ancestral |
| --- | --- | --- |
| Crece y come 1 nutriente por casilla | 91 · 34 · 41 | 60 · 12 · 17 |
| Crece y come, cerca del Hogar | 86 · 36 · 44 | 46 · 13 · 26 |
| Red unida al Hogar | 87 · 41 · 43 | 59 · 14 · 15 |
| **Red unida, crece, cerca del Hogar** | **87 · 35 · 43** | **41 · 10 · 20** |
| Lo mismo + plaga en un árbol | — | 37 · 8 · 19 |

En negrita, lo que eligió Mario. La plaga castiga ignorarla y premia frenarla.

## Después de regenerar
Con las pistas que frenan la plaga: Bosque 45 % (85 de 100 certificados, 920 de 1000) y Ancestral 17 % (42 de 100, 501 de 1000). Mario bajó el piso de Ancestral a 40.

Fuera de la tabla (`?seed=` mayor que 1000), casi ningún intento de Ancestral se gana con el experto y generar un claro tardaba ~235 ms en Node (límite 200). `MAP_GEN.levelAttemptsOutside` baja de 10 a 7 (~123 ms); si ningún intento sirve se juega el primer claro certificado, como antes.

## Reglas
- `LEVELS` suma `rooted` (Bosque y Ancestral). La plaga crece en todo nivel con plaga.
- `plagueCount(s, month)`: 1, 2 y 3 según el mes de la estación con plaga.
- `plagueTarget(s, k)`: la `k`-ésima casilla tejida sin plaga más cercana al Hogar, al azar con `hashString(mapId) ^ month ^ (k << 8)`.
- `rootedNet(s)`: búsqueda en anchura desde el Hogar por casillas de la red. `unrootedTrees(s)` y `producingCount(s)` la usan; `endMonth` produce con `producingCount`.
- La lluvia de Maestra Bruma sigue haciendo producir a todos los árboles vivos.

## Pistas y experto
- `guardPlague` (siempre): antes de los hechizos, para la casilla tejida con plaga que nadie frena (la más cercana al Hogar primero), el Ganoderma la limpia; si no, un miembro listo hace una acción útil a 2 casillas o menos.
- `weaveGoal`: los árboles sueltos cuentan como meta, como los grises.

## Tablero
- Árbol suelto: desaturado (modo "saturation", `neutral`) y una placa de papel con una raíz cortada (dos trazos de corteza con contorno de tinta) en la esquina inferior derecha.
- HUD: `data-count` en `.hud__plague` con más de una casilla.
