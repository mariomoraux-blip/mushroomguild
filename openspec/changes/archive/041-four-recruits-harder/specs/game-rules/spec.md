## MODIFIED Requirements

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
- THEN el claro de Ancestral es el de Brote con 5 rocas más sobre casillas que en Brote eran tierra

### Requirement: Niveles de dificultad
Cada partida SHALL jugarse en uno de tres niveles: Brote, Bosque o Ancestral. El nivel SHALL definir las rocas del claro, las estaciones con escarcha, los meses al final de los cuales se apaga un árbol, las estaciones en que come el gremio, las estaciones sin esporas, las estaciones con plaga, los árboles revividos y los nutrientes que pide el Árbol Padre, si hay pistas y el multiplicador de puntaje, todo en `config.ts › LEVELS`:

| | Brote | Bosque | Ancestral |
| --- | --- | --- | --- |
| Rocas | 6 | 9 | 11 |
| Escarcha | — | Otoño | Otoño e Invierno |
| Se apaga un árbol al final del mes | — | 6 | 3, 5, 7, 9 y 11 |
| El gremio come 1 nutriente al terminar el mes | — | Otoño e Invierno | Otoño e Invierno |
| Los árboles no dan esporas | — | Invierno | Invierno |
| Plaga (una casilla tejida por estación) | — | — | Otoño e Invierno |
| Árboles revividos que pide el Árbol Padre | 3 | 3 | 4 |
| Nutrientes del Árbol Padre | 10 | 11 | 13 |
| Pistas | sí | sí | no |
| Multiplicador | ×1 | ×1,5 | ×2 |

Ninguna regla de nivel SHALL quitar árboles vivos. La red solo cambia por las acciones del jugador y por la plaga de Ancestral, que quita a lo más una casilla tejida al terminar un mes. Las esporas y los nutrientes solo cambian por las acciones del jugador, la producción de los árboles y lo que come el gremio en otoño e invierno.

#### Scenario: Brote es el juego de siempre
- WHEN se juega en Brote
- THEN el claro tiene 6 rocas, tejer cuesta siempre 1 nutriente, ningún árbol se apaga, el gremio no come y el Árbol Padre pide 3 árboles revividos y 10 nutrientes

#### Scenario: Nada se pierde
- WHEN termina cualquier mes en cualquier nivel
- THEN los árboles vivos son al menos los mismos que antes de terminarlo, y las casillas de la red también, salvo a lo más la casilla con plaga

### Requirement: Reclutar
El jugador SHALL poder reclutar una Gliophorus psittacinus, una Morchella esculenta, un Ganoderma lucidum o un Lycoperdon perlatum, una sola vez cada especie, hasta 7 miembros reclutables; el recluta SHALL trabajar desde el mes siguiente. El Lactarius indigo, el Champiñón y la Amanita muscaria solo están al empezar y no se reclutan. Los reclutas se llaman Chispa (Gliophorus), Panal (Morchella), Ámbar (Ganoderma) y Pompón (Lycoperdon). Si la especie ya está en el gremio, reclutar SHALL rechazarse con «Ya hay una Gliophorus en el gremio.» (o «una Morchella», «un Ganoderma», «un Lycoperdon»). El costo SHALL subir con cada recluta de la partida: el primero cuesta 3 esporas, el segundo 4, el tercero 6 y el cuarto 7 (`config.ts › RECRUIT_COSTS`). Los tres miembros iniciales no son reclutas y Maestra Bruma no se recluta ni cuenta en el cupo, así que hay a lo más cuatro reclutas por partida: una de cada especie reclutable. `recruitCost(estado)` SHALL devolver el costo del próximo recluta, o nada si el gremio está completo. Sin esporas suficientes, reclutar SHALL rechazarse con «Reclutar cuesta N esporas.», con N el costo del próximo.

#### Scenario: Cada recluta cuesta más
- WHEN el jugador recluta cuatro veces en la misma partida
- THEN paga 3 esporas por el primero, 4 por el segundo, 6 por el tercero y 7 por el cuarto

#### Scenario: No alcanza para el próximo
- WHEN el gremio ya tiene un recluta y el jugador tiene 3 esporas
- THEN reclutar se rechaza con "Reclutar cuesta 4 esporas."

#### Scenario: Maestra Bruma no cuenta
- WHEN Maestra Bruma ya llegó y el gremio tiene un recluta
- THEN el próximo recluta cuesta 4 esporas

#### Scenario: Gremio completo
- WHEN el gremio tiene 7 miembros
- THEN reclutar se rechaza con "El gremio está completo."

#### Scenario: Una de cada especie
- WHEN el gremio ya tiene a Panal y el jugador intenta reclutar otra Morchella
- THEN la acción se rechaza con "Ya hay una Morchella en el gremio."

#### Scenario: Los del inicio no se reclutan
- WHEN el jugador abre la hoja de reclutar
- THEN puede elegir entre Gliophorus, Morchella, Ganoderma y Lycoperdon, y no entre Lactarius, Champiñón ni Amanita

#### Scenario: Las cuatro especies
- WHEN el jugador recluta a Chispa, Panal, Ámbar y Pompón en la misma partida
- THEN los cuatro entran al gremio y el gremio queda completo

### Requirement: Dificultad medida
El balance SHALL verificarse por simulación en 100 mapas generados por nivel, con semillas fijas (en Bosque y Ancestral, las certificadas de la tabla precalculada):
- **Brote:** la política de las pistas gana el 100 % de los mapas aceptados con un mes medio entre 8 y 10, y un bot que juega al azar gana entre el 5 % y el 30 %.
- **Bosque:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 55 % y el 70 %, y el bot al azar gana como máximo el 10 %.
- **Ancestral:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 10 % y el 25 %, y el bot al azar gana como máximo el 5 %.

Generar un claro de Bosque o Ancestral de la tabla certificada SHALL tardar menos de 300 ms en un teléfono de gama media; uno fuera de la tabla (solo con `?seed=` mayor que 1000) SHALL tardar menos de 800 ms.

#### Scenario: Balance
- WHEN `balance.test.ts` juega 100 mapas generados por nivel con semillas fijas
- THEN en Brote las pistas ganan todos entre el mes 8 y el 11, con mes medio entre 8 y 10, y el bot al azar gana entre el 5 % y el 30 %
- AND en Bosque y Ancestral el bot experto gana todos, y la política de las pistas y el bot al azar quedan en sus rangos

## ADDED Requirements

### Requirement: Victoria por nivel
La Amanita muscaria SHALL despertar al Árbol Padre si este toca la red y hay los árboles revividos y los nutrientes del nivel (`LEVELS › motherTrees` y `mother`): 3 árboles y 10 nutrientes en Brote, 3 árboles y 11 nutrientes en Bosque, 4 árboles y 13 nutrientes en Ancestral; eso SHALL terminar la partida con victoria.

#### Scenario: Bosque que aún no habla
- WHEN la Amanita muscaria intenta despertar al Árbol Padre con 2 árboles revividos
- THEN la acción se rechaza pidiendo revivir al menos 3 árboles

#### Scenario: Once nutrientes en Bosque
- WHEN en Bosque la Amanita muscaria intenta despertar al Árbol Padre con 3 árboles revividos y 10 nutrientes
- THEN la acción se rechaza con "El Árbol Padre necesita 11 nutrientes."
- AND con 11 nutrientes lo despierta y gana

#### Scenario: Ancestral pide cuatro árboles
- WHEN en Ancestral la Amanita muscaria intenta despertar al Árbol Padre con 3 árboles revividos y 13 nutrientes
- THEN la acción se rechaza con "El bosque aún no habla: revive al menos 4 árboles primero."

#### Scenario: Trece nutrientes en Ancestral
- WHEN en Ancestral la Amanita muscaria intenta despertar al Árbol Padre con 4 árboles revividos y 12 nutrientes
- THEN la acción se rechaza con "El Árbol Padre necesita 13 nutrientes."
- AND con 13 nutrientes lo despierta y gana

## REMOVED Requirements

### Requirement: Victoria
**Reason**: 041 cambia los nutrientes del Árbol Padre en Bosque (11) y Ancestral (13); los escenarios con 10 y 12 ya no aplican.
**Migration**: Ver «Victoria por nivel».
