# Tareas · 019

## 1. Reglas (`src/rules/`, puras)
- [ ] 1.1 `config.ts`: `LEVELS`, `FROST_WEAVE`, `FADED_REVIVE`; `GameState.level` y, por casilla, `fading` y `faded`
- [ ] 1.2 `weaveCost` y `reviveCost`; `act`, `validTargets` y los mensajes de rechazo usan el costo real
- [ ] 1.3 `endMonth`: marcar el árbol más lejano al empezar un mes de `fading` (BFS sin rocas, desempate por fila y columna) y apagarlo al terminar el mes si sigue gris; revivir borra `fading`
- [ ] 1.4 Pruebas de los escenarios de Escarcha, Árboles que se apagan, Tejer y Revivir; prueba de propiedad «nada se pierde» (1000 partidas al azar por nivel)

## 2. Claros y bots
- [ ] 2.1 `autoplay.ts`: `playExpert` (pistas + reglas de presión + haz de 32 estados por mes)
- [ ] 2.2 `mapgen.ts`: `newRandomGame(seed, level)`; rocas extra sobre el claro de Brote con `mulberry32(seed ^ LEVEL_SALT)`, aceptación por el bot experto; el clásico con nivel usa la semilla fija 0
- [ ] 2.3 `balance.test.ts` por nivel con las metas de `game-rules` › Dificultad medida; ajustar `LEVELS` (rocas, meses, costos) hasta cumplirlas y anotar los valores medidos en `design.md`
- [ ] 2.4 Medir la generación de Bosque y Ancestral en Chromium con la CPU ×4 (< 300 ms); si no alcanza, aplicar el plan de `design.md` › Riesgos

## 3. Puntaje
- [ ] 3.1 `scoring.ts`: multiplicador del nivel y fila «Nivel» en el desglose; `thresholds` con el claro de Brote; `ScoreResult.level` y `replay(mapId, level, log)`; `SCORE_VERSION` 2
- [ ] 3.2 Pruebas de «Multiplicador del nivel», «Mismos umbrales en todos los niveles», «Récord entre niveles» y «Rejugar» con nivel

## 4. Interfaz
- [ ] 4.1 «Elige tu claro» (`screens.ts`, `ui.screen = { kind: 'level' }`): tres botones, foco en el último nivel (en `localStorage`, con try/catch), Esc a la portada, intro solo la primera vez por nivel (niveles vistos en `localStorage`); `?nivel=`
- [ ] 4.2 Store: sin ★ ni «Pista:» en Ancestral; avisos de la presión en la bitácora; «Jugar de nuevo» conserva el nivel
- [ ] 4.3 HUD: nivel en la etiqueta accesible; copo con escarcha; tarjeta de Añil con el costo real
- [ ] 4.4 Tablero: árbol marcado (late suave, quieto con movimiento reducido) y apagado (velo fijo y copo) con `frost` en `theme.ts`; etiquetas accesibles con estado y costo
- [ ] 4.5 Textos en `es.ts` (niveles, avisos, rechazos, etiquetas) y carta de victoria con la fila del nivel
- [ ] 4.6 Ficha de Rubí y Libreta de campo: costo de revivir un árbol apagado; ficha de Añil: escarcha

## 5. Cierre
- [ ] 5.1 Humo: «Elige tu claro» con teclado (Tab, Enter, Esc), Ancestral sin ★, aviso del árbol marcado, copo de escarcha, «Jugar de nuevo» conserva el nivel
- [ ] 5.2 Capturas a 390 × 844 y 844 × 390 (elegir nivel, árbol marcado, escarcha en el HUD); movimiento reducido
- [ ] 5.3 GDD y `docs/art-direction.md` (niveles, árbol marcado y apagado); `openspec/project.md`
- [ ] 5.4 Specs fusionadas en `openspec/specs/` y cambio archivado
