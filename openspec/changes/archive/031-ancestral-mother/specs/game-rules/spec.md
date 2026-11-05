## REMOVED Requirements

### Requirement: Despertar al Árbol Padre
**Reason**: pasa a pedir los árboles y los nutrientes de cada nivel; se reescribe como «Victoria».
**Migration**: ninguna; `SCORE_VERSION` sube a 6.

## ADDED Requirements

### Requirement: Victoria
La Amanita muscaria SHALL despertar al Árbol Padre si este toca la red y hay los árboles revividos y los nutrientes del nivel (`LEVELS › motherTrees` y `mother`): 3 árboles y 10 nutrientes en Brote y Bosque, 4 árboles y 12 nutrientes en Ancestral; eso SHALL terminar la partida con victoria.

#### Scenario: Bosque que aún no habla
- WHEN la Amanita muscaria intenta despertar al Árbol Padre con 2 árboles revividos
- THEN la acción se rechaza pidiendo revivir al menos 3 árboles

#### Scenario: Diez nutrientes en Bosque
- WHEN en Bosque la Amanita muscaria intenta despertar al Árbol Padre con 3 árboles revividos y 9 nutrientes
- THEN la acción se rechaza con "El Árbol Padre necesita 10 nutrientes."

#### Scenario: Ancestral pide cuatro árboles
- WHEN en Ancestral la Amanita muscaria intenta despertar al Árbol Padre con 3 árboles revividos y 12 nutrientes
- THEN la acción se rechaza con "El bosque aún no habla: revive al menos 4 árboles primero."

#### Scenario: Doce nutrientes en Ancestral
- WHEN en Ancestral la Amanita muscaria intenta despertar al Árbol Padre con 4 árboles revividos y 11 nutrientes
- THEN la acción se rechaza con "El Árbol Padre necesita 12 nutrientes."
- AND con 12 nutrientes lo despierta y gana

## MODIFIED Requirements

### Requirement: Niveles de dificultad
Cada partida SHALL jugarse en uno de tres niveles: Brote, Bosque o Ancestral. El nivel SHALL definir las rocas del claro, las estaciones con escarcha, los meses al final de los cuales se apaga un árbol, las estaciones en que come el gremio, las estaciones sin esporas, los árboles revividos y los nutrientes que pide el Árbol Padre, si hay pistas y el multiplicador de puntaje, todo en `config.ts › LEVELS`:

| | Brote | Bosque | Ancestral |
| --- | --- | --- | --- |
| Rocas | 6 | 8 | 10 |
| Escarcha | — | Otoño | Otoño e Invierno |
| Se apaga un árbol al final del mes | — | 6 | 3, 6 y 9 |
| El gremio come 1 nutriente al terminar el mes | — | Otoño e Invierno | Otoño e Invierno |
| Los árboles no dan esporas | — | Invierno | Invierno |
| Árboles revividos que pide el Árbol Padre | 3 | 3 | 4 |
| Nutrientes del Árbol Padre | 10 | 10 | 12 |
| Pistas | sí | sí | no |
| Multiplicador | ×1 | ×1,5 | ×2 |

Ninguna regla de nivel SHALL quitar progreso del tablero: la red y los árboles vivos solo cambian por las acciones del jugador. Las esporas y los nutrientes solo cambian por las acciones del jugador, la producción de los árboles y lo que come el gremio en otoño e invierno.

#### Scenario: Brote es el juego de siempre
- WHEN se juega en Brote
- THEN el claro tiene 6 rocas, tejer cuesta siempre 1 nutriente, ningún árbol se apaga, el gremio no come y el Árbol Padre pide 3 árboles revividos y 10 nutrientes

#### Scenario: Nada se pierde
- WHEN termina cualquier mes en cualquier nivel
- THEN las casillas de la red y los árboles vivos son al menos los mismos que antes de terminarlo

### Requirement: Tablero inicial
Cada partida nueva del juego SHALL generar un tablero vertical de 5 columnas por 8 filas con `newRandomGame(seed, level)`: el Hogar en la fila inferior y el Árbol Padre en la superior (columnas 2 a 4), un tronco junto al Hogar, 7 árboles grises a 2 o más casillas del Hogar, 5 troncos y las rocas del nivel (6 en Brote) en las filas intermedias. El Hogar es la única casilla con micelio. La semilla SHALL fijar el claro de Brote; Bosque y Ancestral le agregan rocas sobre casillas de tierra libres (nunca el Hogar, sus vecinas ni las vecinas del Árbol Padre), también según la semilla. En Brote, un mapa solo se acepta si la red puede llegar al Árbol Padre y a todos los árboles y si la política de las pistas lo gana entre el mes 8 y el 11; en Bosque y Ancestral, si la red puede llegar al Árbol Padre y a todos los árboles y si el bot experto (con su búsqueda) lo gana con las reglas del nivel; esa aceptación se precalcula para las semillas 0 a 1000 y las partidas nuevas de esos niveles eligen entre las aceptadas. Fuera de la tabla (`?seed=` mayor que 1000) se prueban hasta 10 intentos. Si no aparece ninguno, en Brote se usa el mapa clásico del Capítulo 1 y en Bosque y Ancestral el primer claro certificado del nivel (desde el 031 el clásico no se gana en Ancestral); la semilla 0 (`?map=clasico`) es el clásico, con las rocas certificadas del nivel si las hay. La misma semilla y el mismo nivel SHALL producir el mismo mapa.

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

