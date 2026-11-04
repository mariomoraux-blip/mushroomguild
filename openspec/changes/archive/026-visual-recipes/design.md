# Diseño · 026

## Receta
Una fila: `[antes] → [después] [pastilla]`. Mockup aprobado: `docs/screenshots/026-mockup.png`.
- **Casillas:** 52 px en la ficha y en la Libreta, borde tinta y esquinas de 10 px, como las del tablero. El fondo es la pieza de tierra o de red y el objeto (tronco, roca, árbol) va encima, apoyado abajo. La casilla donde trabaja el hongo lleva el aro Sol de las casillas válidas.
- **Chispa:** en lugar de casillas, el medallón del compañero cansado, desaturado y con «Zz», → el mismo medallón despierto.
- **Pastilla:** como las del HUD, con el ícono pintado y el número teñido. Verde (`leafDark`) si gana y baya (`berry`) si gasta, igual que la etiqueta «±n» del 022.
- **Datos:** `src/ui/recipe.ts` define las recetas por especie con claves de `BOARD_ART` y números de `COST` y `GAIN`. Es presentación: no lee el estado de la partida.
- **Accesible:** cada receta es `role="img"` con una frase de `es.recipe` («Antes: la red y un tronco. Después: el tronco usado y 2 nutrientes más.»). Las piezas son decorativas (`alt=""`).

## Movimiento
Al montar la hoja, las casillas del «después» y la pastilla entran con un saltito (`standard`, `springy`) después de una pausa `fast`. La flecha se desliza 4 px. En la Libreta, cada fila espera 40 ms más que la anterior. Con movimiento reducido no hay animación: la receta se ve quieta desde el principio.

## Tamaño
A 360 px de ancho: 4 casillas de 52 px, la flecha y la pastilla suman ≈ 300 px, dentro del panel (328 px útiles). En horizontal, la hoja ya es de 480 px como máximo.
