# story-presentation

## Purpose
Historia del claro: intro, llegada de Maestra Bruma, finales y el color que vuelve con el progreso.
Origen: cambio 003 (archivado); el 017 agregó la salida tras "Ver tablero" (antes "Ver el claro") y el 037 ordenó las acciones de la carta de final. La estación la cuentan las piezas pintadas del tablero (`board-interaction` › Tablero pintado por estación). Implementada en `src/store.ts` (`ui.story`), `src/ui/story.ts` y `src/scenes/paint.ts` (`progressSaturation`).

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
Al ganar o al terminar el invierno, el juego SHALL mostrar una carta de final con las opciones "Ver tablero", "Jugar de nuevo" y "Ver ranking". "Jugar de nuevo" SHALL empezar una partida nueva sin repetir la intro; SHALL ir fuera de la carta, debajo (en horizontal bajo, a su lado), como un botón grande con icono, igual que "Nueva partida" en la portada. "Ver tablero" SHALL ser un enlace debajo de las estrellas y el puntaje (en la derrota, debajo del resumen) que cierra la carta. El ranking SHALL ir en una caja dentro de la carta con el estado (`leaderboard`) y dos botones: «Registra tu puntaje» como principal y "Ver ranking" como secundario. La carta de victoria SHALL mostrar las estrellas (con "N de 3 estrellas" como nombre accesible, legible sin color), el total, el tiempo, el desglose por componente en una lista corta, "Nuevo récord" si supera el mejor resultado local (`scoring`) y el estado del ranking: «Registra tu puntaje», el puesto, «Tu mejor: N» o el aviso sin conexión. La carta del fin del invierno SHALL mostrar el resumen (mes, árboles revividos, nutrientes y esporas), sin puntaje ni estrellas. Tras "Ver tablero", la partida terminada SHALL seguir teniendo salida: el botón de fin de mes SHALL decir "Ver final" y volver a abrir la carta de final.

#### Scenario: Victoria
- WHEN la Amanita muscaria despierta al Árbol Padre en el mes 8
- THEN la carta dice "El Árbol Padre despertó en el mes 8." y muestra estrellas, total, tiempo, "Ver tablero", desglose y "Ver ranking"

#### Scenario: Acciones del final
- WHEN aparece la carta de victoria de un jugador sin registrar
- THEN la caja del ranking tiene «Registra tu puntaje» como botón principal, con el foco, y "Ver ranking" como secundario
- AND "Jugar de nuevo" está fuera de la carta y "Ver tablero" es un enlace bajo el puntaje

#### Scenario: Estrellas sin color
- WHEN la victoria vale 2 estrellas
- THEN las estrellas tienen el nombre accesible "2 de 3 estrellas"

#### Scenario: Fin del invierno
- WHEN el estado pasa a `lost`
- THEN la carta dice "El bosque esperará la próxima primavera.", sugiere revivir árboles temprano, no muestra puntaje y ofrece "Ver ranking"

#### Scenario: Volver al final
- WHEN la partida terminó y el jugador eligió "Ver tablero"
- THEN el botón de fin de mes dice "Ver final" y está activo
- AND al tocarlo vuelve la carta de final con "Jugar de nuevo"

### Requirement: Cartas accesibles
Las cartas SHALL ser modales: el foco va al botón principal al abrirse (en la carta de victoria sin registrar, «Registra tu puntaje»; si no, "Jugar de nuevo"), Esc las cierra y el foco vuelve al juego. Cada carta usa su fondo pintado, que se descarga solo cuando se muestra.

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
En Bosque y Ancestral, al empezar el otoño el juego SHALL mostrar una carta breve, como la de la maga, que diga que al terminar cada mes de otoño e invierno el gremio come 1 nutriente, que si no hay el primero en llegar al gremio descansa el mes siguiente y que en invierno los árboles no dan esporas; también que la plaga marca casillas de la red cerca del Hogar, cada mes de la estación más (1, 2 y 3; en Bosque, en invierno; en Ancestral, en otoño y en invierno), que se marchitan al terminar el mes si ningún hongo trabaja a 2 casillas o menos, y que un árbol que la red ya no une al Hogar no da nada. Si Maestra Bruma llega ese mismo mes, su carta SHALL mostrarse primero y esta después. La carta SHALL mostrarse también en Ancestral, una sola vez por partida.

#### Scenario: Empieza el otoño en Bosque
- WHEN empieza el mes 7 en Bosque
- THEN aparece la carta "Llega el frío" con las tres reglas, la de la plaga del invierno y la de la red unida al Hogar

#### Scenario: Llegan la maga y el frío
- WHEN empieza el mes 7 en Ancestral y llega Maestra Bruma
- THEN primero aparece la carta de la maga y, al cerrarla, la del frío

#### Scenario: Empieza el invierno en Bosque
- WHEN empieza el mes 10 en Bosque
- THEN no aparece otra vez la carta del frío

#### Scenario: Brote sin carta
- WHEN empieza el mes 7 en Brote
- THEN no aparece la carta del frío
