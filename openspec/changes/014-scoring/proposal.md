# 014 · Puntaje, estrellas y cronómetro

## Por qué
Hoy una victoria en el día 8 y otra en el día 11 se sienten iguales. Un puntaje con desglose y estrellas da una razón para volver a jugar el mismo claro y hacerlo mejor, sin castigar la derrota (pilar 1: sin derrota dura). También deja preparado el formato de un resultado verificable para un leaderboard futuro.

## Qué cambia
- **Cronómetro** en el HUD (mm:ss, hacia arriba, sin límite) que cuenta solo el tiempo de juego activo.
- **Puntaje** al ganar: victoria, días ahorrados, árboles revividos, reservas, gremio eficiente, actividad, variedad y tiempo. Pesos y topes en `config.ts` (`SCORE`); cálculo puro `score(estadoFinal, timeMs)` en `src/rules/scoring.ts`.
- **Estrellas** (1–3) con umbrales por claro: al generarlo, el bot con criterio lo juega y su puntaje es la referencia (2 estrellas desde el 90 %, 3 desde el 110 %).
- **Pista de reclutar:** la ★ ya no empuja a reclutar temprano; sugiere reclutar solo si nadie tiene una acción útil o si falta el rol del siguiente paso.
- **Carta de victoria** con estrellas, total, tiempo, desglose y "Nuevo récord". La derrota no cambia: sin puntaje ni estrellas.
- **Resultado verificable:** tipo `ScoreResult` con el registro ordenado de acciones (`actionLog`) que permite rejugar la partida y recalcular el total. Se guarda solo el mejor por claro en `localStorage`.

## Fuera de alcance
Servidor, leaderboard, nombres de jugador, cuentas y llamadas de red. Verificar el tiempo en un servidor (el `timeMs` lo reporta el cliente).

## Impacto
Capacidad nueva: `scoring`. Modifica `board-interaction` (Estado visible: HUD), `story-presentation` (Finales: carta de victoria) y `player-guidance` (Pista y camino sugerido, Cómo reclutar). Agrega a `GameState` el `mapId` y el registro de acciones (sin cambiar ninguna regla de `game-rules`). Como el generador acepta claros con la política de las pistas, una misma semilla puede dar otro claro que antes. Depende de 003 y 004 (archivados).
