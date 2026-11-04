# story-presentation

## Purpose
Historia del claro: intro, llegada de Maestra Bruma, finales y el color que vuelve con el progreso.
Origen: cambio 003 (archivado); el 017 agregó la salida tras "Ver el claro". La estación la cuentan las piezas pintadas del tablero (`board-interaction` › Tablero pintado por estación). Implementada en `src/store.ts` (`ui.story`), `src/ui/story.ts` y `src/scenes/paint.ts` (`progressSaturation`).

## Requirements

### Requirement: Intro
Una partida nueva SHALL abrir con tres cartas de una frase cada una (el bosque se apaga; un gremio despierta; lleva la red al Árbol Padre antes del invierno), con indicador de progreso, que se pueden saltar. Con `?map`, `?seed` o `?debugState` en la URL no hay intro.

#### Scenario: Saltar la intro
- WHEN el jugador pulsa "Saltar" en la primera carta
- THEN se cierra la intro y la bitácora invita a elegir un miembro del gremio

#### Scenario: Recorrer la intro
- WHEN el jugador pulsa "Siguiente" dos veces y luego "Comenzar"
- THEN ve las tres cartas en orden y después el tablero

### Requirement: Llegada de la maga
Cuando Maestra Bruma se une al gremio, el juego SHALL mostrar una carta breve que la presente y explique sus dos hechizos.

#### Scenario: Mes nuevo con la maga
- WHEN empieza el mes en que llega Maestra Bruma
- THEN aparece la carta "El bosque volvió a hablar, y alguien escuchó." con sus hechizos en una línea cada uno

### Requirement: Finales
Al ganar o al terminar el invierno, el juego SHALL mostrar una carta de final con las opciones "Ver el claro" y "Jugar de nuevo". "Jugar de nuevo" SHALL empezar una partida nueva sin repetir la intro. La carta de victoria SHALL mostrar las estrellas (con "N de 3 estrellas" como nombre accesible, legible sin color), el total, el tiempo, el desglose por componente en una lista corta y "Nuevo récord" si supera el mejor resultado local (`scoring`). La carta del fin del invierno SHALL mostrar el resumen (mes, árboles revividos, nutrientes y esporas), sin puntaje ni estrellas. Tras "Ver el claro", la partida terminada SHALL seguir teniendo salida: el botón de fin de mes SHALL decir "Ver final" y volver a abrir la carta de final.

#### Scenario: Victoria
- WHEN la Amanita muscaria despierta al Árbol Padre en el mes 8
- THEN la carta dice "El Árbol Padre despertó en el mes 8." y muestra estrellas, total, tiempo y desglose

#### Scenario: Estrellas sin color
- WHEN la victoria vale 2 estrellas
- THEN las estrellas tienen el nombre accesible "2 de 3 estrellas"

#### Scenario: Fin del invierno
- WHEN el estado pasa a `lost`
- THEN la carta dice "El bosque esperará la próxima primavera.", sugiere revivir árboles temprano y no muestra puntaje

#### Scenario: Volver al final
- WHEN la partida terminó y el jugador eligió "Ver el claro"
- THEN el botón de fin de mes dice "Ver final" y está activo
- AND al tocarlo vuelve la carta de final con "Jugar de nuevo"

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

### Requirement: Llega el frío
En Bosque y Ancestral, al empezar el invierno el juego SHALL mostrar una carta breve, como la de la maga, que diga que al terminar cada mes el gremio come 1 nutriente, que si no hay el primero en llegar al gremio descansa el mes siguiente y que los árboles ya no dan esporas. Si Maestra Bruma llega ese mismo mes, su carta SHALL mostrarse primero y esta después. La carta SHALL mostrarse también en Ancestral.

#### Scenario: Empieza el invierno en Bosque
- WHEN empieza el mes 10 en Bosque
- THEN aparece la carta "Llega el frío" con las tres reglas

#### Scenario: Llegan la maga y el frío
- WHEN empieza el mes 10 en Ancestral y llega Maestra Bruma
- THEN primero aparece la carta de la maga y, al cerrarla, la del frío

#### Scenario: Brote sin carta
- WHEN empieza el mes 10 en Brote
- THEN no aparece la carta del frío
