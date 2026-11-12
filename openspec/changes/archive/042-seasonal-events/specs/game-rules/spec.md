## MODIFIED Requirements

### Requirement: Niveles de dificultad
Cada partida SHALL jugarse en uno de tres niveles: Brote, Bosque o Ancestral. El nivel SHALL definir las rocas del claro, las estaciones con escarcha, los meses al final de los cuales se apaga un árbol, las estaciones en que come el gremio, las estaciones sin esporas, las estaciones con plaga, los árboles revividos y los nutrientes que pide el Árbol Padre, si hay pistas y el multiplicador de puntaje, todo en `config.ts › LEVELS`:

| | Brote | Bosque | Ancestral |
| --- | --- | --- | --- |
| Rocas | 6 | 9 | 11 |
| Escarcha | — | Otoño e Invierno | Otoño e Invierno |
| Se apaga un árbol al final del mes | — | 4 y 6 | 2, 3, 5, 7, 9 y 11 |
| El gremio come 1 nutriente al terminar el mes | — | Otoño e Invierno | Otoño e Invierno |
| Los árboles no dan esporas | — | Invierno | Invierno |
| Plaga (una casilla tejida por estación) | — | Invierno | Otoño e Invierno |
| Árboles revividos que pide el Árbol Padre | 3 | 3 | 4 |
| Nutrientes del Árbol Padre | 10 | 11 | 13 |
| Pistas | sí | sí | no |
| Multiplicador | ×1 | ×1,5 | ×2 |

Ninguna regla de nivel SHALL quitar árboles vivos. La red solo cambia por las acciones del jugador y por la plaga de Bosque y Ancestral, que quita a lo más una casilla tejida al terminar un mes. Las esporas y los nutrientes solo cambian por las acciones del jugador, la producción de los árboles y lo que come el gremio en otoño e invierno.

#### Scenario: Brote es el juego de siempre
- WHEN se juega en Brote
- THEN el claro tiene 6 rocas, tejer cuesta siempre 1 nutriente, ningún árbol se apaga, el gremio no come y el Árbol Padre pide 3 árboles revividos y 10 nutrientes

#### Scenario: Nada se pierde
- WHEN termina cualquier mes en cualquier nivel
- THEN los árboles vivos son al menos los mismos que antes de terminarlo, y las casillas de la red también, salvo a lo más la casilla con plaga

### Requirement: Dificultad medida
El balance SHALL verificarse por simulación en 100 mapas generados por nivel, con semillas fijas (en Bosque y Ancestral, las certificadas de la tabla precalculada):
- **Brote:** la política de las pistas gana el 100 % de los mapas aceptados con un mes medio entre 8 y 10, y un bot que juega al azar gana entre el 5 % y el 30 %.
- **Bosque:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 35 % y el 50 %, y el bot al azar gana como máximo el 10 %.
- **Ancestral:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 10 % y el 20 %, y el bot al azar gana como máximo el 5 %.

Generar un claro de Bosque o Ancestral de la tabla certificada SHALL tardar menos de 300 ms en un teléfono de gama media; uno fuera de la tabla (solo con `?seed=` mayor que 1000) SHALL tardar menos de 800 ms.

#### Scenario: Balance
- WHEN `balance.test.ts` juega 100 mapas generados por nivel con semillas fijas
- THEN en Brote las pistas ganan todos entre el mes 8 y el 11, con mes medio entre 8 y 10, y el bot al azar gana entre el 5 % y el 30 %
- AND en Bosque y Ancestral el bot experto gana todos, y la política de las pistas y el bot al azar quedan en sus rangos

### Requirement: Escarcha
En las estaciones con escarcha del nivel, tejer SHALL costar 2 nutrientes en vez de 1. La escarcha no SHALL cambiar la producción de los árboles ni ninguna otra acción.

#### Scenario: Llega la escarcha
- WHEN empieza el mes 7 (Otoño) en Bosque
- THEN tejer cuesta 2 nutrientes
- AND cada árbol vivo sigue produciendo 1 espora y 1 nutriente al terminar el mes

#### Scenario: Tejer sin nutrientes suficientes con escarcha
- WHEN hay 1 nutriente y hay escarcha
- THEN tejer se rechaza con "Faltan 2 nutrientes para tejer con escarcha."

#### Scenario: Invierno en Bosque
- WHEN empieza el mes 10 (Invierno) en Bosque
- THEN tejer sigue costando 2 nutrientes
- AND WHEN empieza el mes 4 (Verano) THEN tejer cuesta 1 nutriente

### Requirement: Plaga
En las estaciones con plaga del nivel (Bosque: invierno; Ancestral: otoño e invierno), al empezar la estación (mes 7 o 10) la plaga SHALL marcar una casilla tejida de la red (tierra de la red; nunca el Hogar, un árbol ni el Árbol Padre): una de las más cercanas al Árbol Padre en pasos en cruz, elegida al azar con el claro y el mes (la misma partida marca siempre la misma). La casilla SHALL seguir con plaga hasta que termine un mes en que algún hongo trabajó a 2 casillas o menos de ella (pasos en cruz; cualquier miembro, también Maestra Bruma). Al terminar un mes sin hongos cerca, una casilla con plaga aún tejida SHALL marchitarse: sale de la red y sigue con plaga; una ya marchita sigue igual. Mientras tenga plaga, el Lactarius no SHALL poder tejerla. Al terminar un mes con un hongo cerca, la plaga se va: si la casilla seguía tejida sigue en la red (los hongos la frenaron) y si estaba marchita vuelve a ser tierra, que se puede tejer otra vez a su costo (los hongos la limpiaron). La plaga del otoño SHALL poder seguir cuando el invierno marca otra casilla; la nueva se elige entre las casillas tejidas sin plaga. Sin casillas tejidas, no se marca ninguna. Brote no tiene plaga.

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
- WHEN empieza el mes 10 en Ancestral y la casilla que marcó el otoño sigue marchita
- THEN la plaga marca otra casilla tejida y las dos tienen plaga

## REMOVED Requirements

### Requirement: Árboles marcados
**Reason**: Ancestral apaga un árbol también al terminar el mes 2 (seis veces); el escenario «Ancestral, cinco veces» deja de valer.
**Migration**: Reemplazado por «Árboles que se apagan», con la misma regla y el escenario «Ancestral, seis veces».

## ADDED Requirements

### Requirement: Árboles que se apagan
Al empezar un mes en el que el nivel apaga un árbol, el juego SHALL marcar el árbol gris (ni vivo ni apagado) más lejano de la red: el de mayor distancia en pasos ortogonales desde la red sin atravesar rocas; si hay empate, el de la fila más alta y después el de la columna menor. Si al terminar ese mes el árbol marcado sigue gris, SHALL apagarse. Revivirlo durante ese mes lo salva. Revivir un árbol apagado SHALL costar 7 nutrientes. Si no queda ningún árbol gris sin apagar, no se marca ninguno.

#### Scenario: Se marca el más lejano
- WHEN empieza el mes 6 en Bosque
- THEN el árbol gris más lejano de la red queda marcado

#### Scenario: Se apaga
- WHEN termina el mes 6 en Bosque y el árbol marcado sigue gris
- THEN el árbol queda apagado y revivirlo cuesta 7 nutrientes

#### Scenario: Se salva
- WHEN la Amanita revive el árbol marcado durante el mes 6
- THEN el árbol queda vivo y no se apaga ningún otro al terminar el mes

#### Scenario: Bosque, dos veces
- WHEN se juega Bosque sin revivir los árboles marcados
- THEN al terminar los meses 4 y 6 se apaga un árbol cada vez

#### Scenario: Ancestral, seis veces
- WHEN se juega Ancestral sin revivir los árboles marcados
- THEN al terminar los meses 2, 3, 5, 7, 9 y 11 se apaga un árbol cada vez
