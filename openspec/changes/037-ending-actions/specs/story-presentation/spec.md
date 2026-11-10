# Delta · story-presentation

## MODIFIED Requirements

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
