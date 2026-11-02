# Tareas · 015

- [x] 1.1 `config.ts`: `SCORE`, `SCORE_VERSION`, factores de estrellas y segundos por mes de la referencia
- [x] 1.2 `GameState`: `mapId` y `log`; `act`, `recruit` y `endMonth` registran su acción
- [x] 1.3 `scoring.ts`: `score`, `thresholds`, `stars`, `replay` y `scoreResult` (puros, con pruebas)
- [x] 1.4 `advice.ts`: reclutar solo sin acción útil o si falta el rol; pruebas de los tres escenarios
- [x] 1.5 `mapgen.ts`: referencia y umbrales por claro desde la partida de `isFairMap`
- [x] 1.6 `balance.test.ts`: balance con la pista nueva, bot con criterio con 2 estrellas en cada claro, calibración < 100 ms
- [x] 2.1 `clock.ts` y `ui.clock` en el store: arranca con la primera acción, se pausa con cualquier hoja, carta o pantalla y con la pestaña oculta, y se congela al terminar
- [x] 2.2 HUD: cronómetro mm:ss tabular en la pastilla del mes, estación como ícono y en la etiqueta accesible, sin `aria-live`
- [x] 2.3 Carta de victoria: estrellas accesibles, total, tiempo, desglose y "Nuevo récord" (textos en `es.ts`)
- [x] 2.4 `records.ts`: mejor `ScoreResult` en `localStorage` versionado, con try/catch
- [x] 3.1 Pruebas de humo: cronómetro pausado con carta, carta de victoria, `localStorage` que falla
- [x] 3.2 `openspec/project.md` (capacidades) y GDD (puntaje y claro del día)
- [x] 3.3 Capturas a 390 × 844 y 844 × 390; specs fusionadas y cambio archivado
