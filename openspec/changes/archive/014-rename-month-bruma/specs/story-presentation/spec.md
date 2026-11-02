# Delta · story-presentation

## MODIFIED Requirements

### Requirement: Llegada de la maga
Cuando Maestra Bruma se une al gremio, el juego SHALL mostrar una carta breve que la presente y explique sus dos hechizos.

#### Scenario: Mes nuevo con la maga
- WHEN empieza el mes en que llega Maestra Bruma
- THEN aparece la carta "El bosque volvió a hablar, y alguien escuchó." con sus hechizos en una línea cada uno

### Requirement: Finales
Al ganar o al terminar el invierno, el juego SHALL mostrar una carta de final con un resumen (mes, árboles revividos, nutrientes y esporas) y las opciones "Ver el claro" y "Jugar de nuevo". "Jugar de nuevo" SHALL empezar una partida nueva sin repetir la intro.

#### Scenario: Victoria
- WHEN la Amanita muscaria despierta al Árbol Padre en el mes 8
- THEN la carta dice "El Árbol Padre despertó en el mes 8." e indica los árboles revividos

#### Scenario: Fin del invierno
- WHEN el estado pasa a `lost`
- THEN la carta dice "El bosque esperará la próxima primavera." y sugiere revivir árboles temprano
