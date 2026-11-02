# game-rules

## Purpose
Reglas del juego del Capítulo 1 (El Claro Gris): tablero, especies del gremio, economía, tiempo, hechizos y victoria. Implementadas como lógica pura en `src/rules/`.

## Requirements

### Requirement: Tablero inicial
El juego SHALL crear un tablero vertical de 5 columnas por 8 filas a partir del mapa del Capítulo 1 (Hogar en la fila inferior, Árbol Padre en la superior), con el Hogar como única casilla con micelio.

#### Scenario: Partida nueva
- WHEN se inicia una partida
- THEN el día es 1, hay 2 nutrientes y 0 esporas
- AND el gremio tiene un Lactarius indigo, un Champiñón y una Amanita muscaria, todos disponibles
- AND la maga no está en el gremio
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

### Requirement: Tejer micelio (Lactarius indigo)
El Lactarius indigo SHALL convertir una tierra adyacente a la red en parte de la red a cambio de 1 nutriente.

#### Scenario: Tejer con nutrientes
- WHEN el Lactarius indigo teje sobre tierra adyacente y hay al menos 1 nutriente
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

### Requirement: Revivir árboles (Amanita muscaria)
La Amanita muscaria SHALL revivir un árbol gris adyacente a la red por 3 nutrientes; el árbol revivido SHALL entrar a la red.

#### Scenario: Revivir extiende la red
- WHEN la Amanita muscaria revive un árbol con 3 o más nutrientes
- THEN el árbol queda vivo y en la red, y los nutrientes bajan en 3

### Requirement: Pasar la voz (Gliophorus psittacinus)
La Gliophorus psittacinus SHALL, sobre cualquier árbol vivo, cambiar 2 esporas por 3 nutrientes. Todo árbol vivo ya pertenece a la red, así que no se exige otra condición de alcance.

#### Scenario: Trueque
- WHEN la Gliophorus actúa sobre un árbol vivo con 2 o más esporas
- THEN las esporas bajan en 2 y los nutrientes suben en 3

#### Scenario: Sin esporas
- WHEN hay menos de 2 esporas
- THEN la acción se rechaza con "Faltan esporas: pasar la voz cuesta 2."

#### Scenario: Pasar la voz desde cualquier árbol vivo
- WHEN la Gliophorus actúa sobre un árbol revivido lejos del Hogar, con 2 o más esporas
- THEN el trueque se aplica igual que en cualquier otro árbol vivo

#### Scenario: Fuera de un árbol vivo
- WHEN la Gliophorus intenta actuar sobre una casilla que no es un árbol vivo
- THEN la acción se rechaza con "La Gliophorus solo pasa la voz desde un árbol vivo."

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
Con 2 esporas el jugador SHALL poder reclutar un Champiñón, un Lactarius indigo, una Amanita muscaria o una Gliophorus psittacinus, hasta 6 miembros reclutables; el recluta SHALL trabajar desde el día siguiente.

#### Scenario: Gremio completo
- WHEN el gremio tiene 6 miembros
- THEN reclutar se rechaza con "El gremio está completo."

### Requirement: Estaciones
El juego SHALL tener 12 días agrupados en 4 estaciones de 3 días: Primavera, Verano, Otoño, Invierno.

#### Scenario: Cambio de estación
- WHEN termina el día 3
- THEN el día 4 pertenece a Verano

### Requirement: Victoria
La Amanita muscaria SHALL despertar al Árbol Padre si este toca la red, hay 6 nutrientes y al menos 2 árboles revividos; eso SHALL terminar la partida con victoria.

#### Scenario: Bosque que aún no habla
- WHEN la Amanita muscaria intenta despertar al Árbol Padre con 1 árbol revivido
- THEN la acción se rechaza pidiendo revivir al menos 2 árboles

### Requirement: Final suave
Si termina el día 12 sin victoria, la partida SHALL terminar en estado `lost` sin penalización, permitiendo reiniciar.

#### Scenario: Fin del invierno
- WHEN el jugador termina el día 12 sin haber ganado
- THEN el estado es `lost`
