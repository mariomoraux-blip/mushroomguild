# Tareas · 035

## 1. Reglas
- [x] 1.1 La plaga se queda hasta que un hongo trabaje a 2 casillas o menos; la casilla marchita no se teje; varias casillas con plaga.
- [x] 1.2 Regenerar `level-seeds.ts` (`npm run certify`).

## 2. Textos y arte
- [x] 2.1 Rechazo al tejer, avisos de la bitácora, ayuda y etiqueta de la casilla marchita, carta del frío y «Cómo jugar».
- [x] 2.2 La casilla marchita pinta `board/plague/withered`; al marchitarse, la plaga viva se funde encima.

## 3. Pruebas
- [x] 3.1 `plague.test.ts`: se marchita y sigue, no se teje, se queda, los hongos la limpian, dos plagas, ayuda de la casilla marchita; `paint.test.ts`: red muerta.
- [x] 3.2 `npm run test`, `npm run build` y Playwright; captura `docs/screenshots/035-*-390x844.png`.

## 4. Cierre
- [x] 4.1 GDD local y `docs/art-direction.md`.
- [x] 4.2 Fusionar deltas y archivar.
