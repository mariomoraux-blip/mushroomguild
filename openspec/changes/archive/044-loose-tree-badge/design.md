# Diseño · 044

## Insignia
- Fuente: `assets/ui/source/insignia-suelto.webp` (1254 × 1254, fondo transparente). Se recorta al disco y se exporta a 160 × 160 (2× de unos 80 px, el tamaño en la carta) como `public/assets/board/trees/loose-badge.webp`.
- En el tablero: diámetro 0,42 de la casilla, centro en (x + 0,77, y + 0,23), encima del árbol y después del paso de saturación, así que siempre se ve a color. A 390 × 844 (casilla ≈ 64 px) mide unos 27 px.
- El árbol ya no se desatura: la insignia sola dice «suelto». Así no se confunde con el árbol gris dormido.
- Respaldo sin la pieza: el disco de papel con los dos trazos de corteza del 043, en la misma posición y tamaño.

## Aviso previo
`looseAtRisk(s)`: árboles vivos que hoy la red une al Hogar y que quedarían sueltos si todas las casillas tejidas con plaga perdieran la red. Se calcula en `endMonth`, después de marcar la plaga, y se agrega a la bitácora solo si es mayor que 0 y el nivel es `rooted`. Supone lo peor (nadie frena ninguna casilla), que es lo que pasa si el jugador no hace nada.

## Carta
- `Story` suma `{ kind: 'loose' }`. Se abre cuando, tras una acción, `unrootedTrees(next)` tiene un árbol que no estaba suelto antes y todavía no se mostró en la partida (`UiState.looseShown`, se reinicia en una partida nueva).
- Orden si coinciden: maga → frío → suelto (`then`, como el frío tras la maga).
- Contenido: la insignia grande, el título, que el árbol sigue vivo pero no da nada mientras la red no lo una al Hogar, y que se arregla tejiendo un camino de red desde el Hogar. Botón «Entendido».
- No es una pista: se muestra también en Ancestral. Brote nunca tiene árboles sueltos.
