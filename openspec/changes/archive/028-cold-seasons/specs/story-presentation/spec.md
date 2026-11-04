# Delta · story-presentation

## ADDED Requirements

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
