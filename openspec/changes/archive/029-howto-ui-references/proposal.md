# 029 · «Cómo jugar» con la interfaz de verdad

## Por qué
Los pasos de «Cómo jugar» muestran arte suelto: los tres retratos, una casilla de red y un tronco, la luna y un árbol gris, un árbol vivo con esporas y el Árbol Padre. El jugador lee «toca un hongo del gremio» o «pulsa Fin del mes», pero la imagen no se parece a lo que va a tocar. Mario pidió el 4 de noviembre de 2026 usar imágenes de referencia de la interfaz para que el jugador asocie cada paso con lo que ve en la partida.

## Qué cambia
Cada paso muestra una miniatura de la interfaz real, hecha con los mismos componentes (y clases) que el juego, decorativa y quieta:
1. **Elige un hongo:** tres tarjetas del dock (Indi, Bruno y Rubí) con Bruno elegido y la ★ de sugerido.
2. **Trabaja junto a la red:** tres casillas del tablero: red, una tierra resaltada y un tronco resaltado.
3. **Una vez por mes:** la tarjeta de Indi descansando (Zz) y el botón «Fin del mes».
4. **Al empezar el mes:** un árbol vivo, las pastillas +1 espora y +1 nutriente, y el medallón «Reclutar».
5. **Despierta al Árbol Padre:** el Árbol Padre con su aro de meta y las pastillas del HUD de árboles (3) y nutrientes (los del nivel).

Los textos no cambian. Las miniaturas usan las piezas de la estación actual y no se pueden tocar ni enfocar.

## Fuera de alcance
La Libreta de campo (ya tiene recetas, 026), la intro de 3 cartas y el cambio 022 (abierto).

## Impacto
- **Specs:** `title-screens` › Cómo jugar (MODIFIED).
- **Código:** `src/ui/howto-art.ts` (nuevo), `src/ui/screens.ts`, `src/ui/recipe.ts` (exporta la casilla), `src/styles.css`, `src/theme.ts` (`SCREEN_ART.howto` deja de usarse).
