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

Todo vive en `config.ts › SCORE` junto a `SCORE_VERSION`, los factores de estrellas (`STARS = { two: 0.9, three: 1.1 }`) y los 25 s por día de la referencia. Ninguna otra parte del código repite estos números.

## Dónde vive cada cosa
- **`src/rules/types.ts`:** `GameState` gana `mapId` (`'clasico'` o `'seed-<n>'`; los estados de depuración usan `'debug'` y no guardan récord) y `log: readonly LoggedAction[]`, con `{ type: 'act', memberId, x, y, spell? } | { type: 'recruit', species } | { type: 'endDay' }`. `act`, `recruit` y `endDay` agregan su entrada; las reglas no cambian.
- **`src/rules/scoring.ts` (puro):** `score(final, timeMs) → { total, breakdown }`, `thresholds(start) → { reference, two, three }`, `stars(total, thresholds)`, `replay(mapId, log) → GameState` y `scoreResult(final, timeMs, thresholds) → ScoreResult`.
- **`src/rules/mapgen.ts`:** `isFairMap` ya juega una partida del bot con criterio para aceptar el claro; esa misma partida da la referencia, así que la calibración casi no cuesta. Los estados de `?debugState` se calibran jugando desde su estado inicial.
- **`src/rules/advice.ts`:** reclutar baja al final de la prioridad (antes de terminar el día) y solo aparece en los dos casos de `player-guidance` › Cómo reclutar. Como el recluta trabaja desde el día siguiente, reclutar al final del día no pierde nada.
- **`src/clock.ts` (puro):** cronómetro como datos, `{ elapsedMs, since: number | null, started: boolean }` con `start`, `pause`, `resume` y `read(now)`. `main.ts` le pasa `performance.now()`; así las pruebas no dependen del reloj.
- **`src/store.ts`:** guarda el cronómetro en `ui.clock`. Arranca con la primera acción aceptada (actuar, reclutar o terminar el día; seleccionar no cuenta). Corre solo si hay partida en juego, no hay hoja, carta ni pantalla encima (`sheet`, `story` y `screen` en `null`) y la pestaña es visible. Se congela al ganar o al perder.
- **`src/ui/hud.ts`:** muestra mm:ss en la segunda línea de la pastilla del día, junto al ícono de la estación (el nombre de la estación pasa a la etiqueta accesible), con `font-variant-numeric: tabular-nums`, refrescando una vez por segundo y sin `aria-live`.
- **`src/ui/story.ts`:** la carta de victoria muestra estrellas ("2 de 3 estrellas" como nombre accesible), total, tiempo, desglose en lista y "Nuevo récord".
- **`src/records.ts`:** lee y escribe el mejor `ScoreResult` en `localStorage` con la clave `gremio.best.v<scoringVersion>.<mapId>`, todo en try/catch.

## Calibración (2 de noviembre)
### Umbrales globales (primera propuesta, descartada)
Con el bot con criterio en los 100 claros de `balance.test.ts` y 25 s por día: puntaje mín 1825 · mediana 2327,5 · p90 2565 · máx 2650. Parte media de cada componente: árboles 31,0 % · victoria 21,7 % · reservas 12,1 % · tiempo 11,2 % · días 10,9 % · actividad 6,7 % · variedad 6,5 % · gremio 0 %. Ninguno supera el 40 %.

### Umbrales por claro (decisión)
Medido con un prototipo desechable de la pista nueva y del generador, en 200 semillas:
- **Balance con la pista nueva:** 200 de 200 claros aceptados sin respaldo; el bot gana entre el día 8 y el 11 (media 8,90; con la pista vieja, 8,87). El gremio final del bot sigue siendo 6 (recluta al final del día).
- **Referencia:** puntaje mediano del bot 2277,5. Ejemplo, semilla 1: referencia 2205, `umbral2` 1985, `umbral3` 2426 (gana el día 8).
- **Estrellas en 200 semillas:**
  - bot con criterio: 2 estrellas en las 200 (por construcción: es la referencia);
  - pista vieja (recluta temprano): 3 con 1 estrella, 187 con 2 y 10 con 3;
  - bot al azar, 5 partidas por claro (1000): 624 sin victoria, 78 con 1, 209 con 2 y 89 con 3. El azar llega a 3 estrellas porque recluta poco (gremio eficiente) y gana tarde con muchas reservas.
- **Tiempo de la calibración** (una partida del bot y su puntaje), en Chromium con la CPU limitada (emulación de móvil de Lighthouse): ×1 mediana 6 ms (máx 13); **×4, gama media: mediana 17 ms, p90 34 ms, máx 39 ms**; ×6: mediana 32 ms (máx 56). Por debajo de 100 ms aun sin reutilizar la partida de `isFairMap`. Generar el claro entero (lo que ya pasa hoy) tarda ×4 mediana 59 ms y máx 185 ms.

### Qué se recalibra con playtest
La velocidad cuenta dos veces ("Días" y "Tiempo", juntos ≈ 22 % del total) y los 25 s por día son un supuesto. Con datos reales de playtest (tiempo por día, días de victoria) se recalibran los pesos, los 25 s y los factores 0,9 y 1,1.

## Riesgos
- **Las semillas cambian de claro:** el generador acepta claros con la política de las pistas; con la pista nueva, una misma semilla puede dar otro claro. `?seed=N` sigue siendo reproducible desde este cambio, pero no con los claros de antes.
- **Gremio eficiente:** se mantiene el peso. La pista ya no empuja a reclutar temprano, pero el bot sigue llenando el gremio al final del día; un jugador que reclute menos saca más puntos que la referencia.
- **Récord con claros aleatorios:** casi toda victoria es el primer resultado de su claro, así que "Nuevo récord" aparecerá sobre todo con `?seed` o el mapa clásico (o con el claro del día).
- **Tiempo no verificable:** `timeMs` lo reporta el cliente; un servidor puede rejugar el `actionLog`, pero no comprobar el tiempo.

## Hacia un leaderboard (fuera de alcance)
La base sería el **claro del día**: una semilla derivada de la fecha (por ejemplo `seed = AAAAMMDD`), igual para todos los jugadores ese día, con `mapId = seed-<AAAAMMDD>`. Un servidor recibe el `ScoreResult`, regenera el claro desde el `mapId`, rejuega el `actionLog` y recalcula el total antes de aceptarlo.
