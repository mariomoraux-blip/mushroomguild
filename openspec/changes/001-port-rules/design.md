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
`balance.test.ts` juega 2.000 partidas con un bot aleatorio sembrado y una partida guiada fija (la del PoC). Umbrales:
- Bot aleatorio: tasa de victoria ≥ 20 % y ≤ 60 %.
- Partida guiada: gana en el día 9 o antes.

Si un cambio futuro rompe estos umbrales, el test falla y el cambio debe justificar el ajuste.
