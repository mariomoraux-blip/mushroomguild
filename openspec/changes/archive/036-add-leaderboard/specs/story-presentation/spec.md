# Delta · story-presentation

## MODIFIED Requirements

### Requirement: Finales
Al ganar o al terminar el invierno, el juego SHALL mostrar una carta de final con las opciones "Ver el claro", "Jugar de nuevo" y "Ver ranking". "Jugar de nuevo" SHALL empezar una partida nueva sin repetir la intro. La carta de victoria SHALL mostrar las estrellas (con "N de 3 estrellas" como nombre accesible, legible sin color), el total, el tiempo, el desglose por componente en una lista corta, "Nuevo récord" si supera el mejor resultado local (`scoring`) y el estado del ranking (`leaderboard`): «Registra tu puntaje», el puesto, «Tu mejor: N» o el aviso sin conexión. La carta del fin del invierno SHALL mostrar el resumen (mes, árboles revividos, nutrientes y esporas), sin puntaje ni estrellas. Tras "Ver el claro", la partida terminada SHALL seguir teniendo salida: el botón de fin de mes SHALL decir "Ver final" y volver a abrir la carta de final.

#### Scenario: Victoria
- WHEN la Amanita muscaria despierta al Árbol Padre en el mes 8
- THEN la carta dice "El Árbol Padre despertó en el mes 8." y muestra estrellas, total, tiempo, desglose y "Ver ranking"

#### Scenario: Estrellas sin color
- WHEN la victoria vale 2 estrellas
- THEN las estrellas tienen el nombre accesible "2 de 3 estrellas"

#### Scenario: Fin del invierno
- WHEN el estado pasa a `lost`
- THEN la carta dice "El bosque esperará la próxima primavera.", sugiere revivir árboles temprano, no muestra puntaje y ofrece "Ver ranking"

#### Scenario: Volver al final
- WHEN la partida terminó y el jugador eligió "Ver el claro"
- THEN el botón de fin de mes dice "Ver final" y está activo
- AND al tocarlo vuelve la carta de final con "Jugar de nuevo"
