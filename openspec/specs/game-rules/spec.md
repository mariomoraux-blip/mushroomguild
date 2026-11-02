# game-rules

## Purpose
Reglas del juego del Capítulo 1 (El Claro Gris): tablero, especies del gremio, economía, tiempo, hechizos y victoria. Implementadas como lógica pura en `src/rules/`.

## Requirements

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

### Requirement: Alcance de la red
Una acción SHALL aplicarse solo a casillas ortogonalmente adyacentes a una casilla de la red.

#### Scenario: Casilla lejana
- WHEN un miembro intenta actuar sobre una casilla que no toca la red
- THEN la acción se rechaza con el motivo "Muy lejos: … debe tocar la red."

### Requirement: Una acción por día
Cada miembro SHALL actuar como máximo una vez por día.

#### Scenario: Miembro cansado
- WHEN un miembro que ya actuó hoy intenta actuar de nuevo
- THEN la acción se rechaza indicando que descansa hasta el amanecer

### Requirement: Tejer micelio (Lactarius indigo)
El Lactarius indigo SHALL convertir una tierra adyacente a la red en parte de la red a cambio de 1 nutriente.

#### Scenario: Tejer con nutrientes
- WHEN el Lactarius indigo teje sobre tierra adyacente y hay al menos 1 nutriente
- THEN la casilla pasa a la red y los nutrientes bajan en 1

#### Scenario: Tejer sin nutrientes
- WHEN hay 0 nutrientes
- THEN la acción se rechaza con "Falta 1 nutriente para tejer."

### Requirement: Descomponer (Champiñón)
El Champiñón SHALL obtener 2 nutrientes de un tronco adyacente a la red; el tronco SHALL convertirse en tierra después de 2 usos.

#### Scenario: Segundo uso de un tronco
- WHEN un tronco con 1 uso se descompone de nuevo
- THEN se suman 2 nutrientes
- AND la casilla queda como tierra sin micelio

### Requirement: Revivir árboles (Amanita muscaria)
La Amanita muscaria SHALL revivir un árbol gris adyacente a la red por 3 nutrientes; el árbol revivido SHALL entrar a la red.

#### Scenario: Revivir extiende la red
- WHEN la Amanita muscaria revive un árbol con 3 o más nutrientes
- THEN el árbol queda vivo y en la red, y los nutrientes bajan en 3

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

### Requirement: Llegada dla maga (Conocybe arcana)
Maestra Bruna SHALL unirse al gremio al amanecer siguiente a revivir el segundo árbol, una sola vez por partida. No se puede reclutar y no cuenta en el límite de 6. Si el segundo árbol revive el día 12, Maestra Bruna no llega.

#### Scenario: Segundo árbol revivido
- WHEN se revive el segundo árbol durante el día 4
- THEN al empezar el día 5 Maestra Bruna está en el gremio y disponible

#### Scenario: Reclutar a la maga
- WHEN el jugador intenta reclutar un Conocybe arcana
- THEN la acción no está disponible

#### Scenario: Segundo árbol en el último día
- WHEN se revive el segundo árbol durante el día 12
- THEN Maestra Bruna no se une al gremio y la partida sigue su curso normal

### Requirement: Hechizos
Maestra Bruna SHALL lanzar como máximo un hechizo por estación, a elegir entre:
- Brote arcano: convierte una roca adyacente a la red en tierra con micelio. Esa casilla es, a todos los efectos, tierra tejida: pertenece a la red y extiende su alcance (por ejemplo, permite revivir árboles vecinos).
- Lluvia de esporas: sobre cualquier árbol vivo, suma de inmediato 1 espora y 1 nutriente por cada árbol vivo. Es un pago extra: el amanecer siguiente paga normal.

Lanzar un hechizo SHALL gastar la acción del día de Maestra Bruna. No tiene otra acción: si ya lanzó en la estación, descansa hasta la próxima.

#### Scenario: Brote arcano
- WHEN Maestra Bruna actúa sobre una roca adyacente a la red
- THEN la roca pasa a ser tierra con micelio

#### Scenario: Brote arcano extiende la red
- WHEN un árbol gris solo toca la red a través de una casilla creada por el Brote arcano
- THEN la Amanita muscaria puede revivirlo

#### Scenario: Roca lejana
- WHEN Maestra Bruna intenta el Brote arcano sobre una roca que no toca la red
- THEN la acción se rechaza con "El Brote arcano solo despierta rocas que tocan la red."

#### Scenario: Lluvia de esporas es un pago extra
- WHEN Maestra Bruna lanza Lluvia de esporas sobre un árbol vivo con 3 árboles vivos
- THEN se suman de inmediato 3 esporas y 3 nutrientes
- AND al terminar ese día el amanecer suma otras 3 esporas y 3 nutrientes

#### Scenario: Lluvia fuera de un árbol vivo
- WHEN Maestra Bruna intenta la Lluvia de esporas sobre una casilla que no es un árbol vivo
- THEN la acción se rechaza con "La Lluvia de esporas se lanza sobre un árbol vivo."

#### Scenario: El hechizo gasta la acción del día
- WHEN Maestra Bruna lanza un hechizo
- THEN queda cansada hasta el amanecer, como cualquier miembro que ya actuó

#### Scenario: Segundo hechizo en la misma estación
- WHEN Maestra Bruna ya lanzó un hechizo en Verano y lo intenta de nuevo en Verano
- THEN la acción se rechaza con "Maestra Bruna descansa: su magia vuelve con la próxima estación."
- AND esto ocurre aunque sea un día nuevo de la misma estación

#### Scenario: Nueva estación
- WHEN empieza Otoño
- THEN Maestra Bruna puede lanzar un hechizo otra vez

### Requirement: Amanecer
Al terminar el día, cada árbol vivo SHALL producir 1 espora y 1 nutriente, y todos los miembros SHALL quedar disponibles.

#### Scenario: Dos árboles vivos
- WHEN termina el día con 2 árboles vivos
- THEN se suman 2 esporas y 2 nutrientes, y el día avanza en 1

### Requirement: Reclutar
Con 2 esporas el jugador SHALL poder reclutar un Champiñón, un Lactarius indigo, una Amanita muscaria o una Gliophorus psittacinus, hasta 6 miembros reclutables; el recluta SHALL trabajar desde el día siguiente. Los nombres de la Gliophorus son Chispa, Pluma, Trina y Gota.

#### Scenario: Gremio completo
- WHEN el gremio tiene 6 miembros
- THEN reclutar se rechaza con "El gremio está completo."

### Requirement: Estaciones
El juego SHALL tener 12 días agrupados en 4 estaciones de 3 días: Primavera, Verano, Otoño, Invierno.

#### Scenario: Cambio de estación
- WHEN termina el día 3
- THEN el día 4 pertenece a Verano

### Requirement: Victoria
La Amanita muscaria SHALL despertar al Árbol Padre si este toca la red, hay 10 nutrientes y al menos 3 árboles revividos; eso SHALL terminar la partida con victoria.

#### Scenario: Bosque que aún no habla
- WHEN la Amanita muscaria intenta despertar al Árbol Padre con 2 árboles revividos
- THEN la acción se rechaza pidiendo revivir al menos 3 árboles

### Requirement: Final suave
Si termina el día 12 sin victoria, la partida SHALL terminar en estado `lost` sin penalización, permitiendo reiniciar.

#### Scenario: Fin del invierno
- WHEN el jugador termina el día 12 sin haber ganado
- THEN el estado es `lost`

### Requirement: Dificultad medida
El balance SHALL verificarse por simulación en mapas generados: la política de las pistas gana el 100 % de los mapas aceptados con un día medio entre 8 y 10, y un bot que juega al azar gana entre el 5 % y el 30 %.

#### Scenario: Balance
- WHEN `balance.test.ts` juega 100 mapas generados con semillas fijas
- THEN las pistas ganan todos entre el día 8 y el 11, con día medio entre 8 y 10
- AND el bot al azar gana entre el 5 % y el 30 % de sus partidas
