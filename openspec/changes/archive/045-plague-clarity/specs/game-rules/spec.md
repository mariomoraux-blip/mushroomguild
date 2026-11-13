## MODIFIED Requirements

### Requirement: Plaga
En las estaciones con plaga del nivel (Bosque: invierno; Ancestral: otoño e invierno), al empezar cada mes de la estación la plaga SHALL marcar casillas tejidas de la red (tierra de la red; nunca el Hogar, un árbol ni el Árbol Padre), más cada mes: 1 el primer mes de la estación, 2 el segundo y 3 el tercero. Cada una SHALL ser una casilla tejida sin plaga a 2 pasos en cruz o más del Hogar y vecina en cruz de un árbol vivo; si no hay ninguna así, la más cercana al Hogar entre las tejidas a 2 pasos o más; si tampoco hay, la más cercana al Hogar entre todas. Se elige al azar con el claro, el mes y su orden (la misma partida marca siempre las mismas). Así la plaga va por la raíz de los árboles y no por el tronco de la red junto al Hogar. Si hay menos casillas tejidas sin plaga, marca las que hay. Cada casilla SHALL seguir con plaga hasta que termine un mes en que algún hongo trabajó a 2 casillas o menos de ella (pasos en cruz; cualquier miembro, también Maestra Bruma). Al terminar un mes sin hongos cerca, una casilla con plaga aún tejida SHALL marchitarse: sale de la red y sigue con plaga; una ya marchita sigue igual. Mientras tenga plaga, el Lactarius no SHALL poder tejerla. Al terminar un mes con un hongo cerca, la plaga se va: si la casilla seguía tejida sigue en la red (los hongos la frenaron) y si estaba marchita vuelve a ser tierra, que se puede tejer otra vez a su costo (los hongos la limpiaron). Las casillas con plaga de meses anteriores SHALL seguir mientras se marcan otras. Brote no tiene plaga.

#### Scenario: La plaga marca
- WHEN empieza el mes 7 en Ancestral con la red tejida en (2,6), (2,4) y (2,3) del mapa clásico y el árbol (2,5) vivo
- THEN se marca (2,4), vecina del árbol; (2,6) también lo toca pero está a 1 paso del Hogar
- AND la bitácora dice que se marchitará al terminar el mes si ningún hongo trabaja a 2 casillas o menos

#### Scenario: La plaga crece
- WHEN empieza el mes 8 en Ancestral y (2,6) quedó marchita
- THEN se marcan dos casillas más, (2,4) y (2,3)
- AND la bitácora dice "La plaga crece: 2 casillas de la red se marchitarán al terminar el mes si ningún hongo trabaja a 2 casillas o menos de cada una."

#### Scenario: Se marchita
- WHEN termina el mes con una casilla marcada y ningún hongo trabajó a 2 casillas o menos
- THEN la casilla sale de la red, sigue con plaga y la bitácora dice que no se puede tejer hasta que un hongo trabaje a 2 casillas o menos

#### Scenario: Los hongos la frenan
- WHEN termina el mes y un hongo trabajó a 2 casillas de la casilla marcada
- THEN la casilla sigue en la red y la bitácora dice "Los hongos frenaron la plaga."

#### Scenario: Bosque sin plaga
- WHEN empieza el mes 7 en Bosque o cualquier mes en Brote
- THEN no se marca ninguna casilla

#### Scenario: Plaga del invierno en Bosque
- WHEN empieza el mes 10 en Bosque con casillas tejidas
- THEN la plaga marca una casilla tejida, como en Ancestral

#### Scenario: No se puede tejer
- WHEN el Lactarius intenta tejer una casilla marchita con plaga
- THEN la acción se rechaza con "La plaga no deja tejer aquí: se va al terminar un mes en que un hongo trabaje a 2 casillas o menos."

#### Scenario: Se queda
- WHEN termina otro mes sin hongos a 2 casillas o menos de la casilla marchita
- THEN la casilla sigue fuera de la red y con plaga

#### Scenario: Los hongos la limpian
- WHEN termina un mes en que un hongo trabajó a 2 casillas de la casilla marchita
- THEN la casilla vuelve a ser tierra sin plaga, se puede tejer otra vez y la bitácora dice "Los hongos limpiaron la plaga: la casilla volvió a ser tierra."

#### Scenario: Dos plagas
- WHEN empieza el mes 10 en Ancestral y una casilla que marcó el otoño sigue marchita
- THEN la plaga marca otra casilla tejida y las dos tienen plaga
