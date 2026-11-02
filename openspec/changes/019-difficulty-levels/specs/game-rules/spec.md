# Delta · game-rules

## ADDED Requirements

### Requirement: Niveles de dificultad
Cada partida SHALL jugarse en uno de tres niveles: Brote, Bosque o Ancestral. El nivel SHALL definir las rocas del claro, las estaciones con escarcha, los meses al final de los cuales se apaga un árbol, si hay pistas y el multiplicador de puntaje, todo en `config.ts › LEVELS`:

| | Brote | Bosque | Ancestral |
| --- | --- | --- | --- |
| Rocas | 6 | 8 | 10 |
| Escarcha | — | Otoño | Otoño e Invierno |
| Se apaga un árbol al final del mes | — | 6 | 3, 6 y 9 |
| Pistas | sí | sí | no |
| Multiplicador | ×1 | ×1,5 | ×2 |

Ninguna regla de nivel SHALL quitar progreso: la red, los árboles vivos, los nutrientes y las esporas solo cambian por las acciones del jugador y la producción de los árboles.

#### Scenario: Brote es el juego de siempre
- WHEN se juega en Brote
- THEN el claro tiene 6 rocas, tejer cuesta siempre 1 nutriente y ningún árbol se apaga

#### Scenario: Nada se pierde
- WHEN termina cualquier mes en cualquier nivel
- THEN las casillas de la red y los árboles vivos son al menos los mismos que antes de terminarlo

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
- THEN tejer vuelve a costar 1 nutriente

### Requirement: Árboles que se apagan
Al empezar un mes en el que el nivel apaga un árbol, el juego SHALL marcar el árbol gris (ni vivo ni apagado) más lejano de la red: el de mayor distancia en pasos ortogonales desde la red sin atravesar rocas; si hay empate, el de la fila más alta y después el de la columna menor. Si al terminar ese mes el árbol marcado sigue gris, SHALL apagarse. Revivirlo durante ese mes lo salva. Revivir un árbol apagado SHALL costar 5 nutrientes. Si no queda ningún árbol gris sin apagar, no se marca ninguno.

#### Scenario: Se marca el más lejano
- WHEN empieza el mes 6 en Bosque
- THEN el árbol gris más lejano de la red queda marcado

#### Scenario: Se apaga
- WHEN termina el mes 6 en Bosque y el árbol marcado sigue gris
- THEN el árbol queda apagado y revivirlo cuesta 5 nutrientes

#### Scenario: Se salva
- WHEN la Amanita revive el árbol marcado durante el mes 6
- THEN el árbol queda vivo y no se apaga ningún otro al terminar el mes

#### Scenario: Ancestral, tres veces
- WHEN se juega Ancestral sin revivir los árboles marcados
- THEN al terminar los meses 3, 6 y 9 se apaga un árbol cada vez

## MODIFIED Requirements

### Requirement: Tablero inicial
Cada partida nueva del juego SHALL generar un tablero vertical de 5 columnas por 8 filas con `newRandomGame(seed, level)`: el Hogar en la fila inferior y el Árbol Padre en la superior (columnas 2 a 4), un tronco junto al Hogar, 7 árboles grises a 2 o más casillas del Hogar, 5 troncos y las rocas del nivel (6 en Brote) en las filas intermedias. El Hogar es la única casilla con micelio. La semilla SHALL fijar el claro de Brote; Bosque y Ancestral le agregan rocas sobre casillas de tierra libres (nunca el Hogar, sus vecinas ni las vecinas del Árbol Padre), también según la semilla. En Brote, un mapa solo se acepta si la red puede llegar al Árbol Padre y a todos los árboles y si la política de las pistas lo gana entre el mes 8 y el 11; en Bosque y Ancestral, si la red puede llegar al Árbol Padre y a todos los árboles y si el bot experto lo gana con las reglas del nivel. Si no aparece ninguno, se usa el mapa clásico del Capítulo 1 (con las rocas del nivel). La misma semilla y el mismo nivel SHALL producir el mismo mapa.

#### Scenario: Partida nueva
- WHEN se inicia una partida
- THEN el mes es 1, hay 2 nutrientes y 0 esporas
- AND el gremio tiene un Lactarius indigo, un Champiñón y una Amanita muscaria, todos disponibles
- AND la maga no está en el gremio
- AND solo la casilla Hogar pertenece a la red

#### Scenario: Claros distintos
- WHEN se generan partidas con semillas distintas
- THEN los mapas cambian, y siempre tienen 7 árboles grises, el Hogar abajo y el Árbol Padre arriba

#### Scenario: Misma semilla
- WHEN se genera dos veces una partida con la misma semilla y el mismo nivel
- THEN el mapa es idéntico

#### Scenario: Más rocas, mismo claro
- WHEN se genera la semilla 1 en Brote y en Ancestral
- THEN el claro de Ancestral es el de Brote con 4 rocas más sobre casillas que en Brote eran tierra

### Requirement: Tejer micelio (Lactarius indigo)
El Lactarius indigo SHALL convertir una tierra adyacente a la red en parte de la red a cambio de 1 nutriente, o de 2 con escarcha.

#### Scenario: Tejer con nutrientes
- WHEN el Lactarius indigo teje sobre tierra adyacente sin escarcha y hay al menos 1 nutriente
- THEN la casilla pasa a la red y los nutrientes bajan en 1

#### Scenario: Tejer sin nutrientes
- WHEN hay 0 nutrientes
- THEN la acción se rechaza con "Falta 1 nutriente para tejer."

#### Scenario: Tejer con escarcha
- WHEN el Lactarius indigo teje con escarcha y hay al menos 2 nutrientes
- THEN la casilla pasa a la red y los nutrientes bajan en 2

### Requirement: Revivir árboles (Amanita muscaria)
La Amanita muscaria SHALL revivir un árbol gris adyacente a la red por 3 nutrientes, o por 5 si el árbol está apagado; el árbol revivido SHALL entrar a la red.

#### Scenario: Revivir extiende la red
- WHEN la Amanita muscaria revive un árbol con 3 o más nutrientes
- THEN el árbol queda vivo y en la red, y los nutrientes bajan en 3

#### Scenario: Revivir un árbol apagado
- WHEN la Amanita muscaria revive un árbol apagado con 5 o más nutrientes
- THEN el árbol queda vivo y en la red, y los nutrientes bajan en 5

### Requirement: Dificultad medida
El balance SHALL verificarse por simulación en 100 mapas generados por nivel, con semillas fijas:
- **Brote:** la política de las pistas gana el 100 % de los mapas aceptados con un mes medio entre 8 y 10, y un bot que juega al azar gana entre el 5 % y el 30 %.
- **Bosque:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 75 % y el 90 %, y el bot al azar gana como máximo el 10 %.
- **Ancestral:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 40 % y el 60 %, y el bot al azar gana como máximo el 3 %.

Generar un claro de Bosque o Ancestral SHALL tardar menos de 300 ms en un teléfono de gama media.

#### Scenario: Balance
- WHEN `balance.test.ts` juega 100 mapas generados por nivel con semillas fijas
- THEN en Brote las pistas ganan todos entre el mes 8 y el 11, con mes medio entre 8 y 10, y el bot al azar gana entre el 5 % y el 30 %
- AND en Bosque y Ancestral el bot experto gana todos, y la política de las pistas y el bot al azar quedan en sus rangos
