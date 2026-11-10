## MODIFIED Requirements

### Requirement: Plaga
En Ancestral, al empezar el otoño y el invierno (meses 7 y 10) la plaga SHALL marcar una casilla tejida de la red (tierra de la red; nunca el Hogar, un árbol ni el Árbol Padre): una de las más cercanas al Árbol Padre en pasos en cruz, elegida al azar con el claro y el mes (la misma partida marca siempre la misma). La casilla SHALL seguir con plaga hasta que termine un mes en que algún hongo trabajó a 2 casillas o menos de ella (pasos en cruz; cualquier miembro, también Maestra Bruma). Al terminar un mes sin hongos cerca, una casilla con plaga aún tejida SHALL marchitarse: sale de la red y sigue con plaga; una ya marchita sigue igual. Mientras tenga plaga, el Lactarius no SHALL poder tejerla. Al terminar un mes con un hongo cerca, la plaga se va: si la casilla seguía tejida sigue en la red (los hongos la frenaron) y si estaba marchita vuelve a ser tierra, que se puede tejer otra vez a su costo (los hongos la limpiaron). La plaga del otoño SHALL poder seguir cuando el invierno marca otra casilla; la nueva se elige entre las casillas tejidas sin plaga. Sin casillas tejidas, no se marca ninguna. Brote y Bosque no tienen plaga.

#### Scenario: La plaga marca
- WHEN empieza el mes 7 en Ancestral con la red tejida en (2,6), (2,5), (2,4) y (2,3) del mapa clásico
- THEN se marca (2,3), la casilla tejida más cercana al Árbol Padre
- AND la bitácora dice que se marchitará al terminar el mes si ningún hongo trabaja a 2 casillas o menos

#### Scenario: Se marchita
- WHEN termina el mes con la casilla marcada y ningún hongo trabajó a 2 casillas o menos
- THEN la casilla sale de la red, sigue con plaga y la bitácora dice que no se puede tejer hasta que un hongo trabaje a 2 casillas o menos

#### Scenario: Los hongos la frenan
- WHEN termina el mes y un hongo trabajó a 2 casillas de la casilla marcada
- THEN la casilla sigue en la red y la bitácora dice "Los hongos frenaron la plaga."

#### Scenario: Bosque sin plaga
- WHEN empieza el mes 7 o el 10 en Bosque
- THEN no se marca ninguna casilla

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
- WHEN empieza el mes 10 en Ancestral y la casilla que marcó el otoño sigue marchita
- THEN la plaga marca otra casilla tejida y las dos tienen plaga
