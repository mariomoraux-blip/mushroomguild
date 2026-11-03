# Tareas · 025

## 1. Specs
- [x] 1.1 Deltas MODIFIED de `board-interaction` y `player-guidance` con Indi
- [x] 1.2 Corregir el cambio abierto 022 (`specs/player-guidance`, `specs/visual-feedback`, `design.md`)

## 2. Código y pruebas
- [x] 2.1 `es.ts`: `memberNames.lactarius[0]` = «Indi»; comentarios de `src/` que nombran al personaje
- [x] 2.2 `tests/helpers.ts`: `ANIL` → `INDI` y sus usos en `tests/*.test.ts`
- [x] 2.3 Textos esperados con «Indi» en las pruebas de unidad y en `tests/smoke/board.spec.ts`

## 3. Docs
- [x] 3.1 `docs/gdd-fase-0.md`, `docs/art-direction.md` y `docs/personajes/` (bruno, rubi, chispa, indi)
- [x] 3.2 Renombrar archivos y carpetas `anil` → `indi` (assets publicados y fuente, `.blend`, hoja y siluetas) y sus rutas en `src/theme.ts`, `art-direction.md` y `rubi.md`

## 4. Cierre
- [x] 4.1 `npm run test` (con `balance.test.ts`) y `npm run build` sin warnings
- [x] 4.2 Humo con los textos nuevos; captura a 390 × 844 con «Indi» en el dock (`025-indi-vertical-390x844.png`, `025-indi-horizontal-844x390.png`; el humo del teclado en escritorio pasa), 844 × 390 y teclado; restaurar `docs/screenshots` y conservar solo las capturas nuevas
- [x] 4.3 Fusionar las deltas en `openspec/specs/` y archivar el cambio
