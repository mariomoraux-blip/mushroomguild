# Diseño · 019

## Niveles como datos
Todo lo que distingue a un nivel vive en `config.ts › LEVELS`, y ninguna otra parte del código repite esos números:

```ts
export const LEVELS = {
  brote:     { rocks: 6,  frost: [],     fading: [],        hints: true,  multiplier: 1 },
  bosque:    { rocks: 8,  frost: [2],    fading: [6],       hints: true,  multiplier: 1.5 },
  ancestral: { rocks: 10, frost: [2, 3], fading: [3, 6, 9], hints: false, multiplier: 2 },
};
export const FROST_WEAVE = 2;   // costo de tejer con escarcha
export const FADED_REVIVE = 7;  // costo de revivir un árbol apagado (empezó en 5; ver «Valores medidos»)
```

`frost` usa los índices de estación de `seasonIndex()` (2 = otoño, 3 = invierno); `fading` lista los meses al final de los cuales se apaga el árbol marcado. Los números de rocas, meses y costos fueron el punto de partida: la simulación los ajustó hasta las metas de balance y el valor final queda aquí.

### Valores medidos (2 de noviembre)
Con `FADED_REVIVE = 5`, Ancestral quedaba en ~69 % de victorias de las pistas sobre los claros certificados (meta 40–60 %). Lo que se probó, en Ancestral, 120 semillas, sobre los claros que acepta el certificador:

| Ajuste | Pistas ganan | Bot al azar |
| --- | --- | --- |
| 10 rocas, meses 3/6/9, revivir 5 | 69 % | 5,8 % |
| 12 rocas (lejano o cercano) | 70–78 % | — |
| Apagar el árbol más cercano en vez del más lejano | 69 % | — |
| Meses 2/4/6/8/10, revivir 5 | 61 % | 5,8 % |
| Meses 3/6/9, revivir 6 | 59 % | 5,7 % |
| **Meses 3/6/9, revivir 7** | **51 %** | **3,6–4,8 %** |
| Meses 3/6/9, revivir 8 | 52 % | 5,3 % |

Se eligió revivir 7, que deja las reglas aprobadas como están (el árbol más lejano, escarcha de 2). Bosque, con el mismo 7: pistas 85 %, azar 8,9 %. El bot al azar de Ancestral no baja de ~4 % con ningún ajuste (más rocas lo suben), así que su meta pasa de ≤ 3 % a ≤ 5 %. En `balance.test.ts` (semillas 1–100): Bosque, pistas 83 % y azar 6,9 %; Ancestral, pistas 50 % y azar 4,1 %; Brote sin cambios (100 %, mes medio 9,0).

## Reglas (`src/rules/`, puras)
- **`GameState.level`:** `'brote' | 'bosque' | 'ancestral'`. `newGame(map, mapId, level = 'brote')`.
- **Costo de tejer:** `weaveCost(s)` devuelve `FROST_WEAVE` si la estación del mes está en `LEVELS[level].frost`, si no `COST.weave`. `act` y `validTargets` lo usan; el mensaje de rechazo dice el costo real.
- **Árbol marcado:** al empezar un mes que está en `fading`, `endMonth` (que crea el mes nuevo) marca `fading: true` en el árbol gris no apagado con mayor distancia a la red. La distancia es un BFS desde las casillas de la red, en pasos ortogonales, por cualquier casilla que no sea roca. Desempate: fila más alta (más lejos del Hogar) y luego columna menor. Si no queda ningún árbol gris sin apagar, no se marca ninguno.
- **Apagarse:** al terminar ese mes, si el árbol marcado sigue gris, pasa a `faded: true` y pierde `fading`. Si se revive durante el mes, se salva (revivir borra `fading`).
- **Revivir:** `reviveCost(tile)` es `FADED_REVIVE` si `faded`, si no `COST.revive`. Lo usan `act`, `validTargets`, `advise` y las fichas.
- **Nada quita progreso:** ni la escarcha ni el apagado tocan `net`, `alive`, nutrientes ni esporas. Prueba de propiedad: en 1000 partidas al azar por nivel, ningún paso de `endMonth` reduce la red ni los árboles vivos.

## Claros por nivel (`mapgen.ts`)
- La semilla genera el claro de Brote como hoy (con sus 6 rocas y la aceptación por la política de las pistas).
- Para Bosque y Ancestral, un segundo `mulberry32(seed ^ LEVEL_SALT)` elige `rocks − 6` casillas de tierra libres (no el Hogar, no sus vecinas, no las vecinas del Árbol Padre) y las vuelve roca (`levelAttempt`). El claro se acepta si la red todavía puede llegar al Árbol Padre y a todos los árboles y si el **certificador** lo gana con las reglas del nivel. Si no, se prueba otra combinación con el mismo rng, hasta `MAP_GEN.levelAttempts` (20).
- **Tabla precalculada** (`src/rules/level-seeds.ts`, generada con `npm run certify` en ~2 min): para las semillas 0 a 1000 de cada nivel, el número del intento que el certificador acepta (`-` si ninguno: 3 de 1001 en Ancestral, 0 en Bosque). `levelMap(seed, level)` la usa y no certifica nada en la app; para una semilla fuera de la tabla (solo con `?seed=`) acepta con `playExpert`, que sí cabe en el presupuesto. Si ningún intento sirve, se usa el clásico con las rocas del nivel. Generar un claro tarda ≤ 20 ms en Node (≤ 80 ms con la CPU ×4).
- **Partidas nuevas** de Bosque y Ancestral eligen su semilla entre las certificadas de la tabla (`randomSeed`); las de Brote, como siempre.
- `?map=clasico` con `?nivel=` aplica el mismo procedimiento con la semilla fija 0 (`newRandomGame(0, level)`, `mapId` `clasico`).

## Bots
- **Política de las pistas** (`playAdvised`): modela al jugador con experiencia. Sabe jugar Brote, pero no anticipa la presión más allá de lo que avisa la bitácora. Es también la ★ de Brote y Bosque (decisión 2): en Bosque seguirla gana ~80 %.
- **Bot experto** (`playExpert`, `src/rules/autoplay.ts`): la política de las pistas con variantes: medir caminos alrededor de las rocas, revivir primero el árbol marcado y cuatro órdenes de reclutar; gana si alguna gana.
- **Certificador** (`certify`): el bot experto y, si no gana, una búsqueda por haz que cada mes prueba todas las variantes (reclutando o no) y conserva los 12 estados más prometedores (`CERTIFY_BEAM`; con 24 casi no cambia). Certifica que el claro es ganable. Tarda ~150 ms por claro en Node (~600 ms en un teléfono), así que no corre en la app: ver «Claros por nivel».

## Metas de balance (`balance.test.ts`)
| Nivel | Bot experto | Política de las pistas | Bot al azar |
| --- | --- | --- | --- |
| Brote | — | 100 %, mes 8 a 11, media 8 a 10 (como hoy) | 5 % a 30 % |
| Bosque | 100 % de los claros aceptados | gana 75 % a 90 % | ≤ 10 % |
| Ancestral | 100 % de los claros aceptados | gana 40 % a 60 % | ≤ 5 % |

Generar un claro de Bosque o Ancestral (con su certificación) SHALL tardar menos de 300 ms en un teléfono de gama media (×4 de CPU en Chromium); se mide como en el 015.

## Puntaje
- `score(final, timeMs)` suma el desglose de siempre y multiplica el total por `LEVELS[level].multiplier`, redondeado. El desglose gana la fila «Nivel ×1,5».
- `thresholds(start)` juega la política de las pistas sobre el claro de **Brote** de la misma semilla, así que la referencia no depende del nivel.
- `ScoreResult` gana `level`; `replay(mapId, level, log)`. El récord sigue siendo uno por `mapId` (la semilla): el mejor total multiplicado, venga del nivel que venga. `SCORE_VERSION` pasa a 2.

## Interfaz
- **«Elige tu claro»** (`src/ui/screens.ts`, `ui.screen = { kind: 'level' }`): tres tarjetas grandes (≥ 44 px) con nombre, una línea de qué cambia y el multiplicador; el foco va al último nivel elegido (recordado en `localStorage`, con try/catch). Esc vuelve a la portada. Elegir abre la intro la primera vez que se juega ese nivel (los niveles ya vistos se recuerdan en `localStorage`, como las fichas) o el tablero.
- **HUD:** el nivel va en la etiqueta accesible de la pastilla del mes («Mes 7 de 12, Otoño, Bosque»). Con escarcha activa, un copo junto al ícono de la estación. La tarjeta de Añil dice «Teje · −2 nutrientes».
- **Tablero:** sin pieza nueva. `paint.ts` dibuja sobre el árbol gris un velo de escarcha con el color nuevo `frost` de `theme.ts`: el marcado late suave (alfa entre 0,35 y 0,6 cada 1,6 s; fijo en 0,5 con movimiento reducido) y el apagado lleva el velo fijo y un copo en la esquina superior.
- **Tablero (implementación):** el apagado se pinta en el claro (`paint.ts › paintFaded`); el marcado va en su propia capa de Phaser (`paintMarked`, con contorno punteado y un copo chico) cuyo alfa hace el vaivén (`theme.ts › FROST_PULSE`).
- **Bitácora:** al empezar la primera estación con escarcha, «Llegó la escarcha: tejer cuesta 2 nutrientes.» (en Ancestral no se repite al llegar el invierno); al marcar un árbol, «Este árbol se apagará al terminar el mes si nadie lo revive.»; al apagarse, «Un árbol se apagó: revivirlo ahora cuesta 7 nutrientes.» Textos finales en `es.ts`.
- **Ancestral:** `advise` sigue corriendo (lo usan los bots), pero el store no muestra la ★ ni «Pista:»; la bitácora queda con los mensajes de acción y los avisos.

## Riesgos
- **Las semillas de Bosque y Ancestral** dependen del bot experto: si se ajusta, los claros de esos niveles pueden cambiar (los de Brote no).
- **Costo de la certificación** en el teléfono: la búsqueda superaba los 300 ms, así que se aplicó el plan: la aceptación se precalcula en `level-seeds.ts` (ver «Claros por nivel»). Si cambian las reglas, los niveles o el certificador, hay que regenerarla con `npm run certify`; `tests/level-seeds.test.ts` comprueba una muestra.
- **3 estrellas fáciles en niveles altos:** con ×1,5 y ×2 sobre la referencia de Brote, casi cualquier victoria en Bosque o Ancestral da 3 estrellas. Es intencional (premio por el riesgo); se revisa con playtest.
- **Récords anteriores:** al subir `SCORE_VERSION` dejan de leerse.
