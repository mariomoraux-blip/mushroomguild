# Diseño · 019

## Niveles como datos
Todo lo que distingue a un nivel vive en `config.ts › LEVELS`, y ninguna otra parte del código repite esos números:

```ts
export const LEVELS = {
  brote:     { rocks: 6,  frost: [],                       fading: [],      hints: true,  multiplier: 1 },
  bosque:    { rocks: 8,  frost: ['autumn'],               fading: [6],     hints: true,  multiplier: 1.5 },
  ancestral: { rocks: 10, frost: ['autumn', 'winter'],     fading: [3, 6, 9], hints: false, multiplier: 2 },
} as const;
export const FROST_WEAVE = 2;   // costo de tejer con escarcha
export const FADED_REVIVE = 5;  // costo de revivir un árbol apagado
```

`frost` usa las estaciones de `season()`; `fading` lista los meses al final de los cuales se apaga el árbol marcado. Los números de rocas, meses y costos son el punto de partida: la simulación los ajusta hasta las metas de balance (ver abajo) y el valor final queda aquí.

## Reglas (`src/rules/`, puras)
- **`GameState.level`:** `'brote' | 'bosque' | 'ancestral'`. `newGame(map, mapId, level = 'brote')`.
- **Costo de tejer:** `weaveCost(s)` devuelve `FROST_WEAVE` si la estación del mes está en `LEVELS[level].frost`, si no `COST.weave`. `act` y `validTargets` lo usan; el mensaje de rechazo dice el costo real.
- **Árbol marcado:** al empezar un mes que está en `fading`, `endMonth` (que crea el mes nuevo) marca `fading: true` en el árbol gris no apagado con mayor distancia a la red. La distancia es un BFS desde las casillas de la red, en pasos ortogonales, por cualquier casilla que no sea roca. Desempate: fila más alta (más lejos del Hogar) y luego columna menor. Si no queda ningún árbol gris sin apagar, no se marca ninguno.
- **Apagarse:** al terminar ese mes, si el árbol marcado sigue gris, pasa a `faded: true` y pierde `fading`. Si se revive durante el mes, se salva (revivir borra `fading`).
- **Revivir:** `reviveCost(tile)` es `FADED_REVIVE` si `faded`, si no `COST.revive`. Lo usan `act`, `validTargets`, `advise` y las fichas.
- **Nada quita progreso:** ni la escarcha ni el apagado tocan `net`, `alive`, nutrientes ni esporas. Prueba de propiedad: en 1000 partidas al azar por nivel, ningún paso de `endMonth` reduce la red ni los árboles vivos.

## Claros por nivel (`mapgen.ts`)
- La semilla genera el claro de Brote como hoy (con sus 6 rocas y la aceptación por la política de las pistas).
- Para Bosque y Ancestral, un segundo `mulberry32(seed ^ LEVEL_SALT)` elige `rocks − 6` casillas de tierra libres (no el Hogar, no sus vecinas, no las vecinas del Árbol Padre) y las vuelve roca. El claro se acepta si la red todavía puede llegar al Árbol Padre y a todos los árboles y si el **bot experto** lo gana con las reglas del nivel. Si no, se prueba otra combinación con el mismo rng; tras `MAP_GEN.attempts` intentos se usa el claro de Brote con las rocas que se pudieron agregar (y se registra en la prueba de balance).
- `?map=clasico` con `?nivel=` aplica el mismo procedimiento con la semilla fija 0.

## Bots
- **Política de las pistas** (`playAdvised`): modela al jugador con experiencia. Sabe jugar Brote, pero no anticipa la presión más allá de lo que avisa la bitácora. Es también la ★ de Brote y Bosque (decisión 2): en Bosque seguirla gana ~80 %.
- **Bot experto** (`playExpert`, nuevo, `src/rules/autoplay.ts`): la política de las pistas más tres reglas: revivir primero el árbol marcado si alcanza, tejer antes de la escarcha (guardar 1 nutriente por casilla que falte tejer antes del otoño) y preferir el Brote arcano sobre rocas que acortan el camino. Si no gana, una búsqueda acotada (haz de 32 estados por mes) prueba alternativas. Certifica que el claro es ganable.

## Metas de balance (`balance.test.ts`)
| Nivel | Bot experto | Política de las pistas | Bot al azar |
| --- | --- | --- | --- |
| Brote | — | 100 %, mes 8 a 11, media 8 a 10 (como hoy) | 5 % a 30 % |
| Bosque | 100 % de los claros aceptados | gana 75 % a 90 % | ≤ 10 % |
| Ancestral | 100 % de los claros aceptados | gana 40 % a 60 % | ≤ 3 % |

Generar un claro de Bosque o Ancestral (con su certificación) SHALL tardar menos de 300 ms en un teléfono de gama media (×4 de CPU en Chromium); se mide como en el 015.

## Puntaje
- `score(final, timeMs)` suma el desglose de siempre y multiplica el total por `LEVELS[level].multiplier`, redondeado. El desglose gana la fila «Nivel ×1,5».
- `thresholds(start)` juega la política de las pistas sobre el claro de **Brote** de la misma semilla, así que la referencia no depende del nivel.
- `ScoreResult` gana `level`; `replay(mapId, level, log)`. El récord sigue siendo uno por `mapId` (la semilla): el mejor total multiplicado, venga del nivel que venga. `SCORE_VERSION` pasa a 2.

## Interfaz
- **«Elige tu claro»** (`src/ui/screens.ts`, `ui.screen = { kind: 'level' }`): tres tarjetas grandes (≥ 44 px) con nombre, una línea de qué cambia y el multiplicador; el foco va al último nivel elegido (recordado en `localStorage`, con try/catch). Esc vuelve a la portada. Elegir abre la intro la primera vez que se juega ese nivel (los niveles ya vistos se recuerdan en `localStorage`, como las fichas) o el tablero.
- **HUD:** el nivel va en la etiqueta accesible de la pastilla del mes («Mes 7 de 12, Otoño, Bosque»). Con escarcha activa, un copo junto al ícono de la estación. La tarjeta de Añil dice «Teje · −2 nutrientes».
- **Tablero:** sin pieza nueva. `paint.ts` dibuja sobre el árbol gris un velo de escarcha con el color nuevo `frost` de `theme.ts`: el marcado late suave (alfa entre 0,35 y 0,6 cada 1,6 s; fijo en 0,5 con movimiento reducido) y el apagado lleva el velo fijo y un copo en la esquina superior.
- **Bitácora:** al empezar la estación con escarcha, «Llegó la escarcha: tejer cuesta 2 nutrientes.»; al marcar un árbol, «Este árbol se apagará al terminar el mes si nadie lo revive.»; al apagarse, «Un árbol se apagó: revivirlo ahora cuesta 5 nutrientes.» Textos finales en `es.ts`.
- **Ancestral:** `advise` sigue corriendo (lo usan los bots), pero el store no muestra la ★ ni «Pista:»; la bitácora queda con los mensajes de acción y los avisos.

## Riesgos
- **Las semillas de Bosque y Ancestral** dependen del bot experto: si se ajusta, los claros de esos niveles pueden cambiar (los de Brote no).
- **Costo de la certificación** en el teléfono: si la búsqueda supera los 300 ms, se baja el haz o se precalcula la aceptación en la prueba de balance y se guarda una lista de semillas aceptadas.
- **3 estrellas fáciles en niveles altos:** con ×1,5 y ×2 sobre la referencia de Brote, casi cualquier victoria en Bosque o Ancestral da 3 estrellas. Es intencional (premio por el riesgo); se revisa con playtest.
- **Récords anteriores:** al subir `SCORE_VERSION` dejan de leerse.
