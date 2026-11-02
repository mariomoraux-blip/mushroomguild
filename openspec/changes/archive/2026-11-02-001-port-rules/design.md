# Diseño · 001

## Estructura
```
src/
  rules/
    types.ts      # Tile, Member, Species, GameState, CheckResult
    config.ts     # constantes: W, H, DAYS, COST, GAIN, MAP, nombres
    state.ts      # newGame(), selectores (revivedCount, season, ...)
    actions.ts    # check(), act(), recruit(), endDay(), validTargets()
    rng.ts        # mulberry32(seed) para el bot de balance
    index.ts
  scenes/BootScene.ts
  main.ts
tests/
  rules.test.ts
  balance.test.ts
```

## Decisiones
- **Estado inmutable hacia afuera:** las acciones devuelven `{ state, message }` con un estado nuevo (copia estructurada). Facilita deshacer, repetir partidas y depurar. El PoC muta; el port no.
- **Errores como datos:** `check()` devuelve `{ ok: false, reason }` con texto para el jugador. `act()` sobre una acción inválida lanza `RuleError`.
- **Textos:** los mensajes de las reglas se toman de `src/copy/es.ts` mediante claves, no se escriben dentro de `actions.ts`.
- **Constantes en `config.ts`:** son las palancas de balance del GDD. Ninguna otra parte del código repite esos números.

## Mapa vertical
El PoC usa un mapa horizontal de 8×5. Para móvil se rota 90°: el Hogar queda abajo y el Árbol Madre arriba. La rotación conserva las adyacencias, así que el balance no cambia (verificado: bot al azar gana 29 %, día medio 11,3).

```ts
// H hogar · M Árbol Madre · . tierra · L tronco · T árbol gris · R roca
export const MAP = [
  '.TM..',
  '.L..T',
  '..R.R',
  'T..L.',
  'RR...',
  '..TR.',
  'L...T',
  '.LH..',
]; // W = 5, H = 8
```
La partida guiada de `balance.test.ts` se traduce con la misma rotación: `(x, y)` del PoC → `(y, 7 - x)`.

## Balance como test
`balance.test.ts` usa dos bots sembrados y una partida guiada fija (la del PoC, rotada). Umbrales:
- **Bot con criterio**: gana ≥ 95 % y en promedio antes del día 9. Política:
  - Acciones, por prioridad: Árbol Madre > revivir > descomponer > tejer hacia arriba (tierra más cercana al Árbol Madre). La Gliophorus pasa la voz solo con < 4 nutrientes.
  - Reclutar, con ≥ 2 esporas y cupo: Gliophorus si hay < 3 nutrientes y ningún tronco toca la red; si no, Lactarius mientras la red no toque al Árbol Madre; después Amanita.
  - Maese Bruma: Brote arcano en la roca válida más cercana al Árbol Madre; si no hay, Lluvia de esporas.
- **Bot al azar** (piso de dificultad): gana entre 15 % y 60 %.
- **Partida guiada:** gana en el día 9 o antes.

Referencia medida en Fase 0 con 5 especies: bot con criterio 100 % (día 7); bot al azar 19 % (día 11). El bot al azar baja frente a 3 especies (27 %) porque desperdicia esporas; por eso el umbral principal es el del bot con criterio.

## Especies nuevas frente al PoC
El PoC solo tiene 3 especies (la Tejedora se llamaba Ostra). `Gliophorus psittacinus` y `Conocybe arcana` se implementan desde la spec, no desde `poc/rules.js`. Claves internas sugeridas: `champi`, `lactarius`, `amanita`, `gliophorus`, `mago`.

### Decisiones de reglas (respuestas del 2 de noviembre)
- **Gliophorus:** actúa sobre cualquier árbol vivo; todo árbol vivo ya está en la red.
- **Brote arcano:** la casilla resultante es, a todos los efectos, tierra tejida (en la red, extiende el alcance).
- **Lluvia de esporas:** objetivo, cualquier árbol vivo. Pago extra inmediato (1 espora y 1 nutriente por árbol vivo); el amanecer siguiente paga normal.
- **Acción del mago:** lanzar un hechizo gasta su acción del día. No tiene otra acción; si ya lanzó en la estación, descansa hasta la próxima.
- **Llegada tardía:** si el segundo árbol revive el día 12, Maese Bruma no llega.

### Nombres de miembros (en orden de llegada, en `src/copy/es.ts`)
| Especie | Nombres |
| --- | --- |
| Champiñón | Bruno, Tomillo, Migas, Trufo |
| Lactarius indigo | Añil, Ola, Nube, Brisa |
| Amanita muscaria | Rubí, Cereza, Lunar, Pimienta |
| Gliophorus psittacinus | Perico, Loro, Kiwi, Lima |
| Conocybe arcana | Maese Bruma (único) |

### Textos nuevos (aprobados)
- "Maese Bruma descansa: su magia vuelve con la próxima estación."
- "La Gliophorus solo pasa la voz desde un árbol vivo."
- "El Brote arcano solo despierta rocas que tocan la red."
- "La Lluvia de esporas se lanza sobre un árbol vivo."
- Bitácora: "El bosque volvió a hablar, y alguien escuchó. Llega Maese Bruma."

Si un cambio futuro rompe estos umbrales, el test falla y el cambio debe justificar el ajuste.
