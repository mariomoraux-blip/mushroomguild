# Diseño · 014

## Fórmula
| Componente | Cálculo | Tope |
| --- | --- | --- |
| Victoria | 500 | — |
| Días | 80 × (12 − día de victoria) | — |
| Árboles | 120 × árboles revividos (sin el Árbol Padre) | — |
| Reservas | 10 × nutrientes + 20 × esporas al ganar | — |
| Gremio eficiente | 60 × (6 − miembros reclutables) | — |
| Actividad | 5 × acciones realizadas | 40 acciones |
| Variedad | 150 si las 5 especies actuaron al menos una vez (Maestra Bruna, con un hechizo) | — |
| Tiempo | 1 por segundo por debajo de 8:00 | 480 |

Todo vive en `config.ts › SCORE` junto a `SCORE_VERSION` y los umbrales de estrellas. Ninguna otra parte del código repite estos números.

## Dónde vive cada cosa
- **`src/rules/types.ts`:** `GameState` gana `mapId` (`'clasico'` o `'seed-<n>'`; los estados de depuración usan `'debug'` y no guardan récord) y `log: readonly LoggedAction[]`, con `{ type: 'act', memberId, x, y, spell? } | { type: 'recruit', species } | { type: 'endDay' }`. `act`, `recruit` y `endDay` agregan su entrada; las reglas no cambian.
- **`src/rules/scoring.ts` (puro):** `score(final, timeMs) → { total, breakdown, stars }`, `stars(total)`, `replay(mapId, log) → GameState` y `scoreResult(final, timeMs) → ScoreResult`.
- **`src/clock.ts` (puro):** cronómetro como datos, `{ elapsedMs, since: number | null }` con `start`, `pause`, `resume` y `read(now)`. `main.ts` le pasa `performance.now()`; así las pruebas no dependen del reloj.
- **`src/store.ts`:** guarda el cronómetro en `ui.clock` y lo pausa o reanuda según la UI: corre solo si hay partida en juego, no hay carta, no está abierta la hoja de reclutar y la pestaña es visible. Se congela al ganar o al perder.
- **`src/ui/hud.ts`:** muestra mm:ss con números tabulares, refrescando una vez por segundo y sin `aria-live`.
- **`src/ui/story.ts`:** la carta de victoria muestra estrellas ("2 de 3 estrellas" como nombre accesible), total, tiempo, desglose en lista y "Nuevo récord".
- **`src/records.ts`:** lee y escribe el mejor `ScoreResult` en `localStorage` con la clave `gremio.best.v<scoringVersion>.<mapId>`, todo en try/catch.

## Calibración (2 de noviembre, bot con criterio, 100 claros de `balance.test.ts`, 25 s por día)
- Puntaje: mín 1825 · mediana 2327,5 · p90 2565 · máx 2650.
- Umbrales propuestos: `umbral2 = 2328` (mediana redondeada) y `umbral3 = 2565` (p90).
- Estrellas del bot: 50 % con 1, 39 % con 2, 11 % con 3.
- Parte media de cada componente en el total: árboles 31,0 % · victoria 21,7 % · reservas 12,1 % · tiempo 11,2 % · días 10,9 % · actividad 6,7 % · variedad 6,5 % · gremio 0 %. Ninguno supera el 40 %.
- Mapa clásico (`playAdvised`): 2175 en el día 10 → 1 estrella.

`balance.test.ts` vuelve a calcular la distribución y falla si los umbrales guardados se alejan de la mediana y el p90 del bot.

## Riesgos
- **Velocidad contada dos veces:** con 25 s por día, "Días" y "Tiempo" dependen del día de victoria (juntos, 22 % del total). Un jugador rápido pero de muchos días y uno lento de pocos días se separan solo por el tiempo real.
- **Gremio eficiente choca con las pistas:** la ★ recomienda reclutar hasta llenar el gremio; el bot termina siempre con 6 y ese componente vale 0. Para un jugador, reclutar menos sube el puntaje pero va contra la pista.
- **Récord con claros aleatorios:** cada partida nueva es un claro distinto, así que casi toda victoria es el primer resultado de su claro.
