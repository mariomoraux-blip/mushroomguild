# Delta · board-interaction

## MODIFIED Requirements

### Requirement: Casilla ocupada
Cuando un miembro trabajó hoy en una casilla, su sprite SHALL ocupar la casilla y el objeto de abajo (tronco, árbol, roca, Hogar) no SHALL pintarse; el suelo, la red de micelio y el aura del Árbol Padre se mantienen. El Árbol Padre es la excepción: se sigue viendo y el miembro se dibuja delante.

#### Scenario: Hongo sobre un tronco
- WHEN Bruno descompone el tronco junto al Hogar
- THEN en esa casilla se ve a Bruno trabajando y no el tronco debajo
- AND al amanecer, cuando Bruno descansa, el tronco vuelve a verse

## ADDED Requirements

### Requirement: Árbol Padre de Blender
El Árbol Padre SHALL dibujarse con su sprite de Blender: dormido (gris, ramas desnudas) mientras no despierte y despierto (copa dorada, luces cálidas) desde que despierta. SHALL ocupar su casilla, ser algo mayor que los personajes y poder sobresalir hacia arriba, también por encima del marco del tablero.

#### Scenario: Dormido al empezar
- WHEN empieza la partida
- THEN el Árbol Padre se ve gris y sin hojas sobre su casilla, con el aro de meta punteado

#### Scenario: Despierto
- WHEN la Amanita despierta al Árbol Padre
- THEN el Árbol Padre se ve con la copa dorada encendida y su copa asoma por encima del marco
