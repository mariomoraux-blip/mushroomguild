## MODIFIED Requirements

### Requirement: Cambio de mes
Al terminar el mes, cada árbol vivo SHALL producir 1 espora y 1 nutriente (sin esporas si el mes nuevo es de una estación sin esporas del nivel; en Bosque y Ancestral, solo si la red lo une al Hogar, ver «Red unida al Hogar»), el gremio SHALL comer si el mes que terminó es de una estación en que come según el nivel, y todos los miembros SHALL quedar disponibles, menos el que se quedó sin comer.

#### Scenario: Dos árboles vivos
- WHEN termina el mes con 2 árboles vivos unidos a la red
- THEN se suman 2 esporas y 2 nutrientes, y el mes avanza en 1

### Requirement: Niveles de dificultad
Cada partida SHALL jugarse en uno de tres niveles: Brote, Bosque o Ancestral. El nivel SHALL definir las rocas del claro, las estaciones con escarcha, los meses al final de los cuales se apaga un árbol, las estaciones en que come el gremio, las estaciones sin esporas, las estaciones con plaga, si los árboles solo producen unidos al Hogar, los árboles revividos y los nutrientes que pide el Árbol Padre, si hay pistas y el multiplicador de puntaje, todo en `config.ts › LEVELS`:

| | Brote | Bosque | Ancestral |
| --- | --- | --- | --- |
| Rocas | 6 | 9 | 11 |
| Escarcha | — | Otoño e Invierno | Otoño e Invierno |
| Se apaga un árbol al final del mes | — | 4 y 6 | 2, 3, 5, 7, 9 y 11 |
| El gremio come 1 nutriente al terminar el mes | — | Otoño e Invierno | Otoño e Invierno |
| Los árboles no dan esporas | — | Invierno | Invierno |
| Plaga que crece (1, 2 y 3 casillas por mes de la estación) | — | Invierno | Otoño e Invierno |
| Los árboles solo producen si la red los une al Hogar | no | sí | sí |
| Árboles revividos que pide el Árbol Padre | 3 | 3 | 4 |
| Nutrientes del Árbol Padre | 10 | 11 | 13 |
| Pistas | sí | sí | no |
| Multiplicador | ×1 | ×1,5 | ×2 |

Ninguna regla de nivel SHALL quitar árboles vivos. La red solo cambia por las acciones del jugador y por la plaga de Bosque y Ancestral, que al terminar un mes quita las casillas tejidas con plaga que nadie frenó. Las esporas y los nutrientes solo cambian por las acciones del jugador, la producción de los árboles y lo que come el gremio en otoño e invierno.

#### Scenario: Brote es el juego de siempre
- WHEN se juega en Brote
- THEN el claro tiene 6 rocas, tejer cuesta siempre 1 nutriente, ningún árbol se apaga, el gremio no come, todo árbol vivo produce y el Árbol Padre pide 3 árboles revividos y 10 nutrientes

#### Scenario: Nada se pierde
- WHEN termina cualquier mes en cualquier nivel
- THEN los árboles vivos son al menos los mismos que antes de terminarlo, y las casillas de la red también, salvo las tejidas que tenían plaga

### Requirement: Plaga
En las estaciones con plaga del nivel (Bosque: invierno; Ancestral: otoño e invierno), al empezar cada mes de la estación la plaga SHALL marcar casillas tejidas de la red (tierra de la red; nunca el Hogar, un árbol ni el Árbol Padre), más cada mes: 1 el primer mes de la estación, 2 el segundo y 3 el tercero. Cada una SHALL ser una de las casillas tejidas sin plaga más cercanas al Hogar en pasos en cruz, elegida al azar con el claro, el mes y su orden (la misma partida marca siempre las mismas). Si hay menos casillas tejidas sin plaga, marca las que hay. Cada casilla SHALL seguir con plaga hasta que termine un mes en que algún hongo trabajó a 2 casillas o menos de ella (pasos en cruz; cualquier miembro, también Maestra Bruma). Al terminar un mes sin hongos cerca, una casilla con plaga aún tejida SHALL marchitarse: sale de la red y sigue con plaga; una ya marchita sigue igual. Mientras tenga plaga, el Lactarius no SHALL poder tejerla. Al terminar un mes con un hongo cerca, la plaga se va: si la casilla seguía tejida sigue en la red (los hongos la frenaron) y si estaba marchita vuelve a ser tierra, que se puede tejer otra vez a su costo (los hongos la limpiaron). Las casillas con plaga de meses anteriores SHALL seguir mientras se marcan otras. Brote no tiene plaga.

#### Scenario: La plaga marca
- WHEN empieza el mes 7 en Ancestral con la red tejida en (2,6), (2,4) y (2,3) del mapa clásico
- THEN se marca (2,6), la casilla tejida más cercana al Hogar
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
- THEN la plaga marca la casilla tejida más cercana al Hogar, como en Ancestral

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

### Requirement: Dificultad medida
El balance SHALL verificarse por simulación en 100 mapas generados por nivel, con semillas fijas (en Bosque y Ancestral, las certificadas de la tabla precalculada):
- **Brote:** la política de las pistas gana el 100 % de los mapas aceptados con un mes medio entre 8 y 10, y un bot que juega al azar gana entre el 5 % y el 30 %.
- **Bosque:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 35 % y el 50 %, y el bot al azar gana como máximo el 10 %.
- **Ancestral:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 10 % y el 20 %, y el bot al azar gana como máximo el 5 %.

En Bosque al menos 85 y en Ancestral al menos 40 de las semillas 1 a 100 SHALL tener un claro certificado (043: la plaga que corta la red deja menos claros ganables en Ancestral). Generar un claro de Bosque o Ancestral de la tabla certificada SHALL tardar menos de 300 ms en un teléfono de gama media; uno fuera de la tabla (solo con `?seed=` mayor que 1000) SHALL tardar menos de 800 ms.

#### Scenario: Balance
- WHEN `balance.test.ts` juega 100 mapas generados por nivel con semillas fijas
- THEN en Brote las pistas ganan todos entre el mes 8 y el 11, con mes medio entre 8 y 10, y el bot al azar gana entre el 5 % y el 30 %
- AND en Bosque y Ancestral el bot experto gana todos, y la política de las pistas y el bot al azar quedan en sus rangos

## ADDED Requirements

### Requirement: Red unida al Hogar
En Bosque y Ancestral, un árbol vivo SHALL producir al terminar el mes solo si la red lo une al Hogar: un camino de casillas de la red (pasos en cruz) desde el Hogar hasta el árbol. Un árbol vivo sin ese camino está suelto: sigue vivo, cuenta para el Árbol Padre, la maga y el puntaje, pero no da esporas ni nutrientes. Al terminar un mes con árboles sueltos, la bitácora SHALL decir cuántos no dieron nada y por qué. Un árbol que el Ganoderma cura a distancia o que la plaga separa del Hogar puede quedar suelto; vuelve a producir cuando la red lo une otra vez. La lluvia de Maestra Bruma hace producir a todos los árboles vivos, sueltos o no. En Brote todo árbol vivo produce.

#### Scenario: Árbol unido
- WHEN termina un mes en Bosque con el árbol (2,5) del clásico vivo y la red tejida en (2,6)
- THEN el árbol da 1 nutriente

#### Scenario: Árbol suelto
- WHEN termina un mes en Bosque con el árbol (2,5) vivo y sin red en (2,6)
- THEN el árbol no da nada y la bitácora dice "Un árbol no dio nada: la red no lo une al Hogar."

#### Scenario: La plaga corta la red
- WHEN la plaga marchita (2,6), la casilla que unía al árbol (2,5) con el Hogar
- THEN el árbol queda suelto y deja de producir hasta que la red lo una otra vez

#### Scenario: Brote no pide la red unida
- WHEN termina un mes en Brote con un árbol vivo sin camino de red al Hogar
- THEN el árbol produce como siempre
