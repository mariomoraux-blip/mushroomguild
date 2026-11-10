## MODIFIED Requirements

### Requirement: Llega el frío
En Bosque y Ancestral, al empezar el otoño el juego SHALL mostrar una carta breve, como la de la maga, que diga que al terminar cada mes de otoño e invierno el gremio come 1 nutriente, que si no hay el primero en llegar al gremio descansa el mes siguiente y que en invierno los árboles no dan esporas; en Ancestral, también que cada estación la plaga marca una casilla de la red cerca del Árbol Padre, que se marchita al terminar el mes si ningún hongo trabaja a 2 casillas o menos, y que se queda hasta que uno lo haga. Si Maestra Bruma llega ese mismo mes, su carta SHALL mostrarse primero y esta después. La carta SHALL mostrarse también en Ancestral, una sola vez por partida.

#### Scenario: Empieza el otoño en Bosque
- WHEN empieza el mes 7 en Bosque
- THEN aparece la carta "Llega el frío" con las tres reglas

#### Scenario: Llegan la maga y el frío
- WHEN empieza el mes 7 en Ancestral y llega Maestra Bruma
- THEN primero aparece la carta de la maga y, al cerrarla, la del frío

#### Scenario: Empieza el invierno en Bosque
- WHEN empieza el mes 10 en Bosque
- THEN no aparece otra vez la carta del frío

#### Scenario: Brote sin carta
- WHEN empieza el mes 7 en Brote
- THEN no aparece la carta del frío
