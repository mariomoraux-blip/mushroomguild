## MODIFIED Requirements

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
