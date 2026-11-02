# 010 · Bosque pintado (tablero, HUD y dock)

## Por qué
La propuesta visual v2 ("Bosque pintado", `docs/art-direction.md`) ya tiene sus piezas en `public/assets/`, pero el juego seguía viéndose con el estilo vectorial del 008. Este cambio lleva las piezas pintadas a la pantalla de juego. Portada, "Cómo jugar", intro y victoria quedan para otro cambio.

## Decisiones (2 de noviembre)
- **Estaciones:** variantes pintadas donde existan (pasto, rocas, árboles vivos); donde no, la pieza de primavera. Reemplaza el principio de "un solo juego + gradación".
- **Personajes:** retratos pintados en todas partes (tablero, dock, fichas). Los sprites de Blender quedan como fuente.
- **Micelio:** tile completo `net`/`net-b` sobre la casilla, no conectores.

## Qué cambia
- **Tablero** (`paint.ts`): suelo de pasto de la estación, red de micelio dorada, troncos (`log` → `log-used`), rocas (`rock-winter` en invierno), árboles (`grey` → `waking` cuando la red los alcanza → `alive`, `autumn` o `winter`), casa-hongo como casilla y ★ pintada. Si una pieza no carga, se usa el dibujo vectorial del 008.
- **Árbol Padre:** `asleep-painted` / `awake-painted`, 1,35 casillas de ancho.
- **Miembros en el tablero:** su retrato pintado sobre la casilla donde trabajaron hoy (sigue tapando el objeto de abajo; sobre el Hogar queda la red).
- **HUD:** pastillas pintadas (`ui/hud/pill-*`), ícono de la estación junto al día y botón de ayuda pintado.
- **Dock:** retratos pintados (Chispa con la corona de la estación), "feliz" como un pequeño salto en CSS, ícono pintado de reclutar y luna pintada en "Fin del día".
- **Marco:** raíces trenzadas (`ui/frames/roots`) en lugar del marco de madera con enredaderas.
- Los sprites de Blender (`rest`, `work`, `happy`, y el Árbol Padre de Blender) salen de `public/assets/` a `assets/sprites/webp/`: 93 archivos, 2,19 MB.
- `?debugState=autumn` y `?debugState=winter` (solo desarrollo) para revisar las estaciones.

## Fuera de alcance
Reglas, pistas y textos no cambian. Portada, "Cómo jugar", intro y victoria; capas transparentes de casilla válida y seleccionada (las hojas las traen con pasto horneado); Árbol Padre por estación; brote del Brote arcano (`sprout`).

## Impacto
Modifica `board-interaction` (Retratos del gremio, Estilo cozy, Casilla ocupada, Árbol Padre) y añade "Tablero pintado por estación".
