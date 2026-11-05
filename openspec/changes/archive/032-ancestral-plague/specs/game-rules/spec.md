## ADDED Requirements

### Requirement: Plaga
En Ancestral, al empezar el otoño y el invierno (meses 7 y 10) la plaga SHALL marcar una casilla tejida de la red (tierra de la red; nunca el Hogar, un árbol ni el Árbol Padre): una de las más cercanas al Árbol Padre en pasos en cruz, elegida al azar con el claro y el mes (la misma partida marca siempre la misma). Al terminar ese mes, si ningún hongo trabajó ese mes a 2 casillas o menos de ella (pasos en cruz; cualquier miembro, también Maestra Bruma), la casilla SHALL salir de la red y volver a ser tierra, que se puede tejer otra vez a su costo; si alguno trabajó cerca, la casilla se salva. En ambos casos deja de estar marcada. Sin casillas tejidas, no se marca ninguna. Brote y Bosque no tienen plaga.

#### Scenario: La plaga marca
- WHEN empieza el mes 7 en Ancestral con la red tejida en (2,6), (2,5), (2,4) y (2,3) del mapa clásico
- THEN se marca (2,3), la casilla tejida más cercana al Árbol Padre
- AND la bitácora dice que se marchitará al terminar el mes si ningún hongo trabaja a 2 casillas o menos

#### Scenario: Se marchita
- WHEN termina el mes con la casilla marcada y ningún hongo trabajó a 2 casillas o menos
- THEN la casilla vuelve a ser tierra fuera de la red y se puede tejer otra vez

#### Scenario: Los hongos la frenan
- WHEN termina el mes y un hongo trabajó a 2 casillas de la casilla marcada
- THEN la casilla sigue en la red y la bitácora dice "Los hongos frenaron la plaga."

#### Scenario: Bosque sin plaga
- WHEN empieza el mes 7 o el 10 en Bosque
- THEN no se marca ninguna casilla

## MODIFIED Requirements

### Requirement: Niveles de dificultad
Cada partida SHALL jugarse en uno de tres niveles: Brote, Bosque o Ancestral. El nivel SHALL definir las rocas del claro, las estaciones con escarcha, los meses al final de los cuales se apaga un árbol, las estaciones en que come el gremio, las estaciones sin esporas, las estaciones con plaga, los árboles revividos y los nutrientes que pide el Árbol Padre, si hay pistas y el multiplicador de puntaje, todo en `config.ts › LEVELS`:

| | Brote | Bosque | Ancestral |
| --- | --- | --- | --- |
| Rocas | 6 | 8 | 10 |
| Escarcha | — | Otoño | Otoño e Invierno |
| Se apaga un árbol al final del mes | — | 6 | 3, 6 y 9 |
| El gremio come 1 nutriente al terminar el mes | — | Otoño e Invierno | Otoño e Invierno |
| Los árboles no dan esporas | — | Invierno | Invierno |
| Plaga (una casilla tejida por estación) | — | — | Otoño e Invierno |
| Árboles revividos que pide el Árbol Padre | 3 | 3 | 4 |
| Nutrientes del Árbol Padre | 10 | 10 | 12 |
| Pistas | sí | sí | no |
| Multiplicador | ×1 | ×1,5 | ×2 |

Ninguna regla de nivel SHALL quitar árboles vivos. La red solo cambia por las acciones del jugador y por la plaga de Ancestral, que quita a lo más una casilla tejida al terminar un mes. Las esporas y los nutrientes solo cambian por las acciones del jugador, la producción de los árboles y lo que come el gremio en otoño e invierno.

#### Scenario: Brote es el juego de siempre
- WHEN se juega en Brote
- THEN el claro tiene 6 rocas, tejer cuesta siempre 1 nutriente, ningún árbol se apaga, el gremio no come y el Árbol Padre pide 3 árboles revividos y 10 nutrientes

#### Scenario: Nada se pierde
- WHEN termina cualquier mes en cualquier nivel
- THEN los árboles vivos son al menos los mismos que antes de terminarlo, y las casillas de la red también, salvo a lo más la casilla con plaga
