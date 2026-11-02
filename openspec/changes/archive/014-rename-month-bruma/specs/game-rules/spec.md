# Delta · game-rules

## RENAMED Requirements
- FROM: `### Requirement: Una acción por día`
- TO: `### Requirement: Una acción por mes`
- FROM: `### Requirement: Amanecer`
- TO: `### Requirement: Cambio de mes`

## MODIFIED Requirements

### Requirement: Tablero inicial
Cada partida nueva del juego SHALL generar un tablero vertical de 5 columnas por 8 filas con `newRandomGame(seed)`: el Hogar en la fila inferior y el Árbol Padre en la superior (columnas 2 a 4), un tronco junto al Hogar, 7 árboles grises a 2 o más casillas del Hogar, 5 troncos y 6 rocas en las filas intermedias. El Hogar es la única casilla con micelio. Un mapa solo se acepta si la red puede llegar al Árbol Padre y a todos los árboles, y si la política de las pistas lo gana entre el mes 8 y el 11; si no aparece ninguno, se usa el mapa clásico del Capítulo 1. La misma semilla SHALL producir el mismo mapa.

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
- WHEN se genera dos veces una partida con la misma semilla
- THEN el mapa es idéntico

### Requirement: Una acción por mes
Cada miembro SHALL actuar como máximo una vez por mes.

#### Scenario: Miembro cansado
- WHEN un miembro que ya actuó este mes intenta actuar de nuevo
- THEN la acción se rechaza indicando que descansa hasta el mes siguiente

### Requirement: Pasar la voz (Gliophorus psittacinus)
La Gliophorus psittacinus SHALL, por 1 espora, despertar a un compañero que ya trabajó este mes: se toca la casilla donde trabajó y ese compañero vuelve a estar disponible. No puede llamar a otra Gliophorus ni a Maestra Bruma. Su voz viaja por la red: la casilla puede estar en cualquier lugar del tablero.

#### Scenario: Llamar a un compañero
- WHEN Bruno ya descompuso un tronco este mes, hay al menos 1 espora y Chispa toca ese tronco
- THEN Bruno vuelve a estar disponible y las esporas bajan en 1

#### Scenario: Sin esporas
- WHEN hay 0 esporas
- THEN la acción se rechaza con "Falta 1 espora: pasar la voz cuesta 1."

#### Scenario: Casilla sin compañero
- WHEN Chispa toca una casilla donde nadie trabajó este mes
- THEN la acción se rechaza con "La Gliophorus pasa la voz donde un compañero ya trabajó este mes."

### Requirement: Llegada dla maga (Conocybe arcana)
Maestra Bruma SHALL unirse al gremio al empezar el mes siguiente a revivir el segundo árbol, una sola vez por partida. No se puede reclutar y no cuenta en el límite de 6. Si el segundo árbol revive el mes 12, Maestra Bruma no llega.

#### Scenario: Segundo árbol revivido
- WHEN se revive el segundo árbol durante el mes 4
- THEN al empezar el mes 5 Maestra Bruma está en el gremio y disponible

#### Scenario: Reclutar a la maga
- WHEN el jugador intenta reclutar un Conocybe arcana
- THEN la acción no está disponible

#### Scenario: Segundo árbol en el último mes
- WHEN se revive el segundo árbol durante el mes 12
- THEN Maestra Bruma no se une al gremio y la partida sigue su curso normal

### Requirement: Hechizos
Maestra Bruma SHALL lanzar como máximo un hechizo por estación, a elegir entre:
- Brote arcano: convierte una roca adyacente a la red en tierra con micelio. Esa casilla es, a todos los efectos, tierra tejida: pertenece a la red y extiende su alcance (por ejemplo, permite revivir árboles vecinos).
- Lluvia de esporas: sobre cualquier árbol vivo, suma de inmediato 1 espora y 1 nutriente por cada árbol vivo. Es un pago extra: el mes siguiente paga normal.

Lanzar un hechizo SHALL gastar la acción del mes de Maestra Bruma. No tiene otra acción: si ya lanzó en la estación, descansa hasta la próxima.

#### Scenario: Brote arcano
- WHEN Maestra Bruma actúa sobre una roca adyacente a la red
- THEN la roca pasa a ser tierra con micelio

#### Scenario: Brote arcano extiende la red
- WHEN un árbol gris solo toca la red a través de una casilla creada por el Brote arcano
- THEN la Amanita muscaria puede revivirlo

#### Scenario: Roca lejana
- WHEN Maestra Bruma intenta el Brote arcano sobre una roca que no toca la red
- THEN la acción se rechaza con "El Brote arcano solo despierta rocas que tocan la red."

#### Scenario: Lluvia de esporas es un pago extra
- WHEN Maestra Bruma lanza Lluvia de esporas sobre un árbol vivo con 3 árboles vivos
- THEN se suman de inmediato 3 esporas y 3 nutrientes
- AND al empezar el mes siguiente se suman otras 3 esporas y 3 nutrientes

#### Scenario: Lluvia fuera de un árbol vivo
- WHEN Maestra Bruma intenta la Lluvia de esporas sobre una casilla que no es un árbol vivo
- THEN la acción se rechaza con "La Lluvia de esporas se lanza sobre un árbol vivo."

#### Scenario: El hechizo gasta la acción del mes
- WHEN Maestra Bruma lanza un hechizo
- THEN queda cansada hasta el mes siguiente, como cualquier miembro que ya actuó

#### Scenario: Segundo hechizo en la misma estación
- WHEN Maestra Bruma ya lanzó un hechizo en Verano y lo intenta de nuevo en Verano
- THEN la acción se rechaza con "Maestra Bruma descansa: su magia vuelve con la próxima estación."
- AND esto ocurre aunque sea un mes nuevo de la misma estación

#### Scenario: Nueva estación
- WHEN empieza Otoño
- THEN Maestra Bruma puede lanzar un hechizo otra vez

### Requirement: Cambio de mes
Al terminar el mes, cada árbol vivo SHALL producir 1 espora y 1 nutriente, y todos los miembros SHALL quedar disponibles.

#### Scenario: Dos árboles vivos
- WHEN termina el mes con 2 árboles vivos
- THEN se suman 2 esporas y 2 nutrientes, y el mes avanza en 1

### Requirement: Reclutar
Con 2 esporas el jugador SHALL poder reclutar un Champiñón, un Lactarius indigo, una Amanita muscaria o una Gliophorus psittacinus, hasta 6 miembros reclutables; el recluta SHALL trabajar desde el mes siguiente. Los nombres de la Gliophorus son Chispa, Pluma, Trina y Gota.

#### Scenario: Gremio completo
- WHEN el gremio tiene 6 miembros
- THEN reclutar se rechaza con "El gremio está completo."

### Requirement: Estaciones
El juego SHALL tener 12 meses agrupados en 4 estaciones de 3 meses: Primavera, Verano, Otoño, Invierno.

#### Scenario: Cambio de estación
- WHEN termina el mes 3
- THEN el mes 4 pertenece a Verano

### Requirement: Final suave
Si termina el mes 12 sin victoria, la partida SHALL terminar en estado `lost` sin penalización, permitiendo reiniciar.

#### Scenario: Fin del invierno
- WHEN el jugador termina el mes 12 sin haber ganado
- THEN el estado es `lost`

### Requirement: Dificultad medida
El balance SHALL verificarse por simulación en mapas generados: la política de las pistas gana el 100 % de los mapas aceptados con un mes medio entre 8 y 10, y un bot que juega al azar gana entre el 5 % y el 30 %.

#### Scenario: Balance
- WHEN `balance.test.ts` juega 100 mapas generados con semillas fijas
- THEN las pistas ganan todos entre el mes 8 y el 11, con mes medio entre 8 y 10
- AND el bot al azar gana entre el 5 % y el 30 % de sus partidas
