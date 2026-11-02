# Delta · story-presentation

## ADDED Requirements

### Requirement: Intro
Una partida nueva SHALL abrir con tres cartas de una frase cada una (el bosque se apaga; un gremio despierta; lleva la red al Árbol Padre antes del invierno), con indicador de progreso, que se pueden saltar. Con `?map`, `?seed` o `?debugState` en la URL no hay intro.

#### Scenario: Saltar la intro
- WHEN el jugador pulsa "Saltar" en la primera carta
- THEN se cierra la intro y la bitácora invita a elegir un miembro del gremio

#### Scenario: Recorrer la intro
- WHEN el jugador pulsa "Siguiente" dos veces y luego "Comenzar"
- THEN ve las tres cartas en orden y después el tablero

### Requirement: Llegada de la maga
Cuando Maestra Bruna se une al gremio, el juego SHALL mostrar una carta breve que la presente y explique sus dos hechizos.

#### Scenario: Amanecer con la maga
- WHEN empieza el día en que llega Maestra Bruna
- THEN aparece la carta "El bosque volvió a hablar, y alguien escuchó." con sus hechizos en una línea cada uno

### Requirement: Finales
Al ganar o al terminar el invierno, el juego SHALL mostrar una carta de final con un resumen (día, árboles revividos, nutrientes y esporas) y las opciones "Ver el claro" y "Jugar de nuevo". "Jugar de nuevo" SHALL empezar una partida nueva sin repetir la intro.

#### Scenario: Victoria
- WHEN la Amanita muscaria despierta al Árbol Padre en el día 8
- THEN la carta dice "El Árbol Padre despertó en el día 8." e indica los árboles revividos

#### Scenario: Fin del invierno
- WHEN el estado pasa a `lost`
- THEN la carta dice "El bosque esperará la próxima primavera." y sugiere revivir árboles temprano

### Requirement: Cartas accesibles
Las cartas SHALL ser modales: el foco va al botón principal al abrirse, Esc las cierra y el foco vuelve al juego. Cada carta usa su fondo pintado, que se descarga solo cuando se muestra.

#### Scenario: Teclado
- WHEN se abre la intro y el jugador pulsa Esc
- THEN la carta se cierra y se ve el tablero

### Requirement: El color vuelve
La saturación del claro SHALL aumentar con cada árbol revivido y alcanzar el máximo al despertar al Árbol Padre: 0,4 + 0,6 × (árboles vivos + Árbol Padre × 2) / (árboles del claro + 2). Los personajes, el Árbol Padre y la interfaz conservan su color.

#### Scenario: Inicio y final
- WHEN empieza la partida
- THEN el claro se ve apagado
- AND WHEN se despierta al Árbol Padre THEN se ve con más color
