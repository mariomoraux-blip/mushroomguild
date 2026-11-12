## MODIFIED Requirements

### Requirement: Estado visible
El HUD SHALL mostrar en todo momento mes (de 12), estación, nutrientes, esporas, árboles vivos (del total de árboles del claro) y el cronómetro de juego activo (`scoring` › Cronómetro). El cronómetro va en la segunda línea de la pastilla del mes, junto al ícono de la estación; el nombre de la estación y el nivel SHALL estar en la etiqueta accesible de la pastilla. Con escarcha activa, la pastilla SHALL mostrar un copo junto al ícono de la estación, y su etiqueta accesible lo SHALL decir. Mientras haya una casilla con plaga, la pastilla SHALL mostrar la hoja podrida (`ui/icons/plague`) junto a la estación, y su etiqueta accesible SHALL decir «con plaga». Con más de una, la hoja SHALL llevar el número al lado y la etiqueta SHALL decir «con plaga en N casillas».

#### Scenario: Tras una acción
- WHEN el Champiñón descompone un tronco
- THEN el HUD muestra los nutrientes actualizados sin recargar la página

#### Scenario: Cronómetro en el HUD
- WHEN pasan 75 segundos de juego activo en primavera
- THEN la pastilla del mes muestra "Mes 1/12" y, debajo, el ícono de la estación y 01:15 con números tabulares
- AND su etiqueta accesible nombra la estación ("Primavera") y el nivel

#### Scenario: Escarcha en el HUD
- WHEN empieza el mes 7 en Bosque
- THEN la pastilla del mes muestra un copo junto al ícono del otoño
- AND su etiqueta accesible dice "Otoño, con escarcha"

#### Scenario: Pastilla con plaga
- WHEN la plaga marca una casilla en Ancestral
- THEN la pastilla del mes muestra la hoja podrida junto a la estación y su etiqueta dice «con plaga»
- AND la hoja sigue mientras alguna casilla tenga plaga, también marchita, y desaparece cuando los hongos la frenan o la limpian

#### Scenario: La plaga crece en el HUD
- WHEN hay 3 casillas con plaga
- THEN la pastilla del mes muestra la hoja podrida con un 3 al lado y su etiqueta dice «con plaga en 3 casillas»

## ADDED Requirements

### Requirement: Árbol suelto
En Bosque y Ancestral, un árbol vivo que la red no une al Hogar SHALL verse sin color (como el claro dormido) y con una raíz cortada en la esquina inferior derecha: dos trazos de corteza separados, con contorno de tinta, sobre una placa de papel, para que se lea sin color. Su etiqueta accesible SHALL decir «suelto: la red no lo une al Hogar y no da nada». Cuando la red lo une otra vez, vuelve a su color.

#### Scenario: La plaga deja un árbol suelto
- WHEN la plaga marchita la casilla que unía un árbol vivo con el Hogar
- THEN el árbol se ve sin color, con la raíz cortada, y su etiqueta dice «suelto»

#### Scenario: Se vuelve a unir
- WHEN el Lactarius teje un camino de red del Hogar al árbol suelto
- THEN el árbol recupera el color y pierde la raíz cortada
