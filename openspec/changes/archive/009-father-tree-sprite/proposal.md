# 009 · Árbol Padre de Blender

## Por qué
El Árbol Padre es la meta de la partida, pero en el tablero se veía como un árbol más (pintado en Canvas2D, apenas mayor que los grises). Ya existe su modelo en Blender (`assets/blender/arbol-padre.blend`) con dos estados, siguiendo el referente del árbol dorado.

## Qué cambia
- **Sprite del Árbol Padre** en `public/assets/board/`: `arbol-padre-dormido.png` (corteza gris, ramas desnudas) y `arbol-padre-despierto.png` (copa dorada en paraguas con borde que brilla, luces cálidas y destellos). 176 × 192 px, a la misma escala que los personajes.
- En el tablero ocupa su casilla, un poco mayor que los personajes (1,2 casillas de ancho), apoyado en el borde inferior y **sobresaliendo hacia arriba**: el canvas tiene un margen sobre el claro (0,2 casillas) y la copa despierta asoma por encima del marco.
- El aura y el aro de meta siguen pintándose debajo. El árbol se ve siempre, aunque alguien trabaje encima: el miembro se dibuja delante.
- El claro pintado recorta sus esquinas redondeadas (antes lo hacía el contenedor del canvas).

## Fuera de alcance
Reglas, pistas y textos: no cambian. La animación de despertar es de 004.

## Impacto
Modifica `board-interaction` (Casilla ocupada) y añade el requisito "Árbol Padre de Blender".
