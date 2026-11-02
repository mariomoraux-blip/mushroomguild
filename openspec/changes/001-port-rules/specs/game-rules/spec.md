# Delta · game-rules

## ADDED Requirements

### Requirement: Tablero inicial
El juego SHALL crear un tablero vertical de 5 columnas por 8 filas a partir del mapa del Capítulo 1 (Hogar en la fila inferior, Árbol Madre en la superior), con el Hogar como única casilla con micelio.

#### Scenario: Partida nueva
- WHEN se inicia una partida
- THEN el día es 1, hay 2 nutrientes y 0 esporas
- AND el gremio tiene una Ostra, un Champiñón y una Amanita, todos disponibles
- AND solo la casilla Hogar pertenece a la red

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

### Requirement: Tejer micelio (Ostra)
La Ostra SHALL convertir una tierra adyacente a la red en parte de la red a cambio de 1 nutriente.

#### Scenario: Tejer con nutrientes
- WHEN la Ostra teje sobre tierra adyacente y hay al menos 1 nutriente
- THEN la casilla pasa a la red y los nutrientes bajan en 1

#### Scenario: Tejer sin nutrientes
- WHEN hay 0 nutrientes
- THEN la acción se rechaza con "Falta 1 nutriente para tejer."

### Requirement: Descomponer (Champiñón)
El Champiñón SHALL obtener 3 nutrientes de un tronco adyacente a la red; el tronco SHALL convertirse en tierra después de 2 usos.

#### Scenario: Segundo uso de un tronco
- WHEN un tronco con 1 uso se descompone de nuevo
- THEN se suman 3 nutrientes
- AND la casilla queda como tierra sin micelio

### Requirement: Revivir árboles (Amanita)
La Amanita SHALL revivir un árbol gris adyacente a la red por 3 nutrientes; el árbol revivido SHALL entrar a la red.

#### Scenario: Revivir extiende la red
- WHEN la Amanita revive un árbol con 3 o más nutrientes
- THEN el árbol queda vivo y en la red, y los nutrientes bajan en 3

### Requirement: Amanecer
Al terminar el día, cada árbol vivo SHALL producir 1 espora y 1 nutriente, y todos los miembros SHALL quedar disponibles.

#### Scenario: Dos árboles vivos
- WHEN termina el día con 2 árboles vivos
- THEN se suman 2 esporas y 2 nutrientes, y el día avanza en 1

### Requirement: Reclutar
Con 2 esporas el jugador SHALL poder reclutar un miembro de cualquier especie, hasta un gremio de 6; el recluta SHALL trabajar desde el día siguiente.

#### Scenario: Gremio completo
- WHEN el gremio tiene 6 miembros
- THEN reclutar se rechaza con "El gremio está completo."

### Requirement: Estaciones
El juego SHALL tener 12 días agrupados en 4 estaciones de 3 días: Primavera, Verano, Otoño, Invierno.

#### Scenario: Cambio de estación
- WHEN termina el día 3
- THEN el día 4 pertenece a Verano

### Requirement: Victoria
La Amanita SHALL despertar al Árbol Madre si este toca la red, hay 6 nutrientes y al menos 2 árboles revividos; eso SHALL terminar la partida con victoria.

#### Scenario: Bosque que aún no habla
- WHEN la Amanita intenta despertar al Árbol Madre con 1 árbol revivido
- THEN la acción se rechaza pidiendo revivir al menos 2 árboles

### Requirement: Final suave
Si termina el día 12 sin victoria, la partida SHALL terminar en estado `lost` sin penalización, permitiendo reiniciar.

#### Scenario: Fin del invierno
- WHEN el jugador termina el día 12 sin haber ganado
- THEN el estado es `lost`
