# Delta · game-rules

## MODIFIED Requirements

### Requirement: Tablero inicial
Cada partida nueva del juego SHALL generar un tablero vertical de 5 columnas por 8 filas con `newRandomGame(seed)`: el Hogar en la fila inferior y el Árbol Padre en la superior (columnas 2 a 4), un tronco junto al Hogar, 7 árboles grises a 2 o más casillas del Hogar, 5 troncos y 6 rocas en las filas intermedias. El Hogar es la única casilla con micelio. Un mapa solo se acepta si la red puede llegar al Árbol Padre y a todos los árboles, y si la política de las pistas lo gana entre el día 8 y el 11; si no aparece ninguno, se usa el mapa clásico del Capítulo 1. La misma semilla SHALL producir el mismo mapa.

#### Scenario: Partida nueva
- WHEN se inicia una partida
- THEN el día es 1, hay 2 nutrientes y 0 esporas
- AND el gremio tiene un Lactarius indigo, un Champiñón y una Amanita muscaria, todos disponibles
- AND la maga no está en el gremio
- AND solo la casilla Hogar pertenece a la red

#### Scenario: Claros distintos
- WHEN se generan partidas con semillas distintas
- THEN los mapas cambian, y siempre tienen 7 árboles grises, el Hogar abajo y el Árbol Padre arriba

#### Scenario: Misma semilla
- WHEN se genera dos veces una partida con la misma semilla
- THEN el mapa es idéntico

### Requirement: Descomponer (Champiñón)
El Champiñón SHALL obtener 2 nutrientes de un tronco adyacente a la red; el tronco SHALL convertirse en tierra después de 2 usos.

#### Scenario: Segundo uso de un tronco
- WHEN un tronco con 1 uso se descompone de nuevo
- THEN se suman 2 nutrientes
- AND la casilla queda como tierra sin micelio

### Requirement: Pasar la voz (Gliophorus psittacinus)
La Gliophorus psittacinus SHALL, por 1 espora, despertar a un compañero que ya trabajó hoy: se toca la casilla donde trabajó y ese compañero vuelve a estar disponible. No puede llamar a otra Gliophorus ni a Maestra Bruna. Su voz viaja por la red: la casilla puede estar en cualquier lugar del tablero.

#### Scenario: Llamar a un compañero
- WHEN Bruno ya descompuso un tronco hoy, hay al menos 1 espora y Chispa toca ese tronco
- THEN Bruno vuelve a estar disponible y las esporas bajan en 1

#### Scenario: Sin esporas
- WHEN hay 0 esporas
- THEN la acción se rechaza con "Falta 1 espora: pasar la voz cuesta 1."

#### Scenario: Casilla sin compañero
- WHEN Chispa toca una casilla donde nadie trabajó hoy
- THEN la acción se rechaza con "La Gliophorus pasa la voz donde un compañero ya trabajó hoy."

### Requirement: Reclutar
Con 2 esporas el jugador SHALL poder reclutar un Champiñón, un Lactarius indigo, una Amanita muscaria o una Gliophorus psittacinus, hasta 6 miembros reclutables; el recluta SHALL trabajar desde el día siguiente. Los nombres de la Gliophorus son Chispa, Pluma, Trina y Gota.

#### Scenario: Gremio completo
- WHEN el gremio tiene 6 miembros
- THEN reclutar se rechaza con "El gremio está completo."

### Requirement: Victoria
La Amanita muscaria SHALL despertar al Árbol Padre si este toca la red, hay 10 nutrientes y al menos 3 árboles revividos; eso SHALL terminar la partida con victoria.

#### Scenario: Bosque que aún no habla
- WHEN la Amanita muscaria intenta despertar al Árbol Padre con 2 árboles revividos
- THEN la acción se rechaza pidiendo revivir al menos 3 árboles

## ADDED Requirements

### Requirement: Dificultad medida
El balance SHALL verificarse por simulación en mapas generados: la política de las pistas gana el 100 % de los mapas aceptados con un día medio entre 8 y 10, y un bot que juega al azar gana entre el 5 % y el 30 %.

#### Scenario: Balance
- WHEN `balance.test.ts` juega 100 mapas generados con semillas fijas
- THEN las pistas ganan todos entre el día 8 y el 11, con día medio entre 8 y 10
- AND el bot al azar gana entre el 5 % y el 30 % de sus partidas
