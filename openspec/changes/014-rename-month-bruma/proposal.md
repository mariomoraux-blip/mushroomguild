# 014 · Meses y Maestra Bruma

## Por qué
Cada ronda del juego (lo que pasa entre dos "Fin del día") dura una estación entera dividida en tres: con 12 rondas y 4 estaciones, cada ronda es un **mes**, no un día. Llamarla "día" confunde (12 días no hacen un año) y el puntaje del 015 depende de esa unidad. Además, la maga pasa a llamarse **Maestra Bruma**.

## Qué cambia
- **Día → mes** en todo el juego: HUD ("Mes 1/12"), "Fin del mes", bitácora, fichas, Cómo jugar, cartas de historia, specs y docs. Vocabulario "mes literal" (glosario en `design.md`).
- **Bruna → Bruma**: "Maestra Bruma" en textos, specs, docs y código; carpetas `characters/maestra-bruma/` (publicado y fuente) y ficha `docs/personajes/bruma.md`.
- **Código** (identificadores en inglés): `day` → `month`, `endDay` → `endMonth`, `DAYS` → `MONTHS`, `wonDay` → `wonMonth`, etc. (tabla en `design.md`). Parámetros de depuración `lastDay` → `lastMonth` y `mageTomorrow` → `mageNextMonth`.

## Fuera de alcance
Reglas, balance y arte no cambian: es un renombre. Los cambios archivados (`openspec/changes/archive/`) quedan como historial. "Claro del día" (semilla por fecha del calendario, 015) y "mediodía" no se tocan.

## Impacto
Modifica `game-rules`, `board-interaction`, `player-guidance`, `story-presentation`, `title-screens` y `visual-feedback` (28 requisitos, solo vocabulario; dos títulos cambian en `game-rules`). Va antes de 015-scoring.
