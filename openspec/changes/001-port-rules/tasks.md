# Tareas · 001

## 1. Proyecto
- [x] 1.1 Crear proyecto Vite + TypeScript (`strict: true`) e instalar Phaser y Vitest con versiones fijadas
- [x] 1.2 Scripts `dev`, `build`, `test`, `test:watch`
- [x] 1.3 `BootScene` que muestra "El Gremio de los Hongos" sobre el color de fondo del juego

## 2. Reglas
- [x] 2.1 `types.ts` y `config.ts` a partir de `poc/rules.js`
- [x] 2.2 `state.ts`: `newGame()` y selectores
- [x] 2.3 `actions.ts`: `check`, `act`, `recruit`, `endDay`, `validTargets`, sin mutar el estado recibido
- [x] 2.4 `src/copy/es.ts` con todos los mensajes de reglas
- [ ] 2.5 Especies nuevas desde la spec: Gliophorus psittacinus (pasar la voz) y Conocybe arcana (llegada, Brote arcano, Lluvia de esporas, un hechizo por estación)

## 3. Pruebas
- [ ] 3.1 Un test por escenario de `specs/game-rules/spec.md`
- [ ] 3.2 `balance.test.ts` con bot con criterio, bot al azar y partida guiada (umbrales en design.md)
- [ ] 3.3 `npm run test` y `npm run build` en verde

## 4. Cierre
- [ ] 4.1 Pull request con captura de `BootScene` y resultado del test de balance
