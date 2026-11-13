## ADDED Requirements

### Requirement: Red cortada
En Bosque y Ancestral, las casillas de la red sin plaga que ningún camino de red une al Hogar SHALL verse apagadas: sin color, un poco más oscuras y sin la luz de la red. El árbol suelto conserva su color y su insignia, pero también pierde la luz. Su etiqueta accesible SHALL decir «red cortada: no llega al Hogar». Cuando la red las une otra vez, vuelven a su color y su luz.

#### Scenario: La plaga corta la red
- WHEN la plaga marchita la casilla que unía al Hogar el resto de la red
- THEN las casillas del otro lado se ven apagadas y su etiqueta dice «red cortada»

### Requirement: Casillas que frenan la plaga
Mientras hay casillas con plaga (tejidas o marchitas) que nadie frenó este mes, al seleccionar un miembro sus casillas válidas a 2 casillas o menos de alguna de ellas SHALL llevar un escudo de hoja en la esquina superior izquierda, con contorno de tinta para leerse sin color, y su etiqueta accesible SHALL decir «frena la plaga».

#### Scenario: Indi cerca de la plaga
- WHEN hay una casilla con plaga y el jugador selecciona a Indi
- THEN las casillas válidas a 2 o menos de la plaga llevan el escudo y su etiqueta dice «frena la plaga»
