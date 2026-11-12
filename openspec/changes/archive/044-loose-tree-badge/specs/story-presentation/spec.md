## ADDED Requirements

### Requirement: Un árbol suelto
En Bosque y Ancestral, la primera vez en la partida que un árbol vivo queda suelto (ver `game-rules` › Red unida al Hogar), porque la plaga cortó la red o porque el Ganoderma lo curó a distancia, el juego SHALL mostrar una carta breve, como la del frío, con la insignia del árbol suelto (`board/trees/loose-badge`), el título «Un árbol suelto», que el árbol sigue vivo pero no da nada mientras la red no lo una al Hogar y que se arregla tejiendo un camino de red desde el Hogar hasta él. Se cierra con «Entendido». Si en el mismo cambio de mes llegan Maestra Bruma o el frío, sus cartas SHALL mostrarse primero y esta al final. La carta SHALL mostrarse también en Ancestral, una sola vez por partida.

#### Scenario: La plaga deja el primer árbol suelto
- WHEN termina un mes en Bosque y la plaga marchita la casilla que unía un árbol vivo con el Hogar
- THEN aparece la carta «Un árbol suelto» con la insignia

#### Scenario: Otro árbol suelto
- WHEN en la misma partida otro árbol queda suelto
- THEN no aparece otra vez la carta

#### Scenario: Partida nueva
- WHEN empieza una partida nueva y un árbol queda suelto
- THEN la carta aparece otra vez
