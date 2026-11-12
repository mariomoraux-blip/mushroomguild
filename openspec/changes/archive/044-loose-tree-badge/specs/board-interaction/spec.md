## MODIFIED Requirements

### Requirement: Árbol suelto
En Bosque y Ancestral, un árbol vivo que la red no une al Hogar SHALL conservar su color y llevar la insignia `board/trees/loose-badge` en la esquina superior derecha de su casilla (0,42 de la casilla de diámetro): un disco de pergamino con un hilo de micelio dorado y vivo a un lado, gris y seco al otro y un hueco en el medio, que se lee sin color. La insignia SHALL verse a color aunque el claro esté apagado. Si la pieza no carga, se dibuja en su lugar un disco de papel con una raíz cortada (dos trazos de corteza separados, con contorno de tinta). Su etiqueta accesible SHALL decir «suelto: la red no lo une al Hogar y no da nada». Cuando la red lo une otra vez, pierde la insignia.

#### Scenario: La plaga deja un árbol suelto
- WHEN la plaga marchita la casilla que unía un árbol vivo con el Hogar
- THEN el árbol conserva su color, lleva la insignia del hilo cortado y su etiqueta dice «suelto»

#### Scenario: Se vuelve a unir
- WHEN el Lactarius teje un camino de red del Hogar al árbol suelto
- THEN el árbol pierde la insignia
