## ADDED Requirements

### Requirement: La plaga marchita
Cuando la plaga marchita una casilla, la red muerta (`board/plague/withered`) SHALL verse sobre el pasto y fundirse en menos de 1 s (280 ms quieta y 600 ms de fundido), con un poco de polvo violeta. Después la casilla es pasto. Con `prefers-reduced-motion` no hay animación: la casilla pasa a pasto de inmediato.

#### Scenario: Se marchita
- WHEN termina el mes y la plaga marchita una casilla
- THEN la red muerta se ve un momento sobre la casilla y se funde hasta dejar el pasto

#### Scenario: Movimiento reducido
- WHEN el sistema pide movimiento reducido y la plaga marchita una casilla
- THEN la casilla pasa a pasto sin animación

## MODIFIED Requirements

### Requirement: La red alumbra el invierno
La red de micelio SHALL tener su propia luz (salvo la casilla con plaga, que la pierde), encima del claro pintado y debajo del Árbol Padre, los retratos y las partículas, con una intensidad que crece con la estación: primavera 0,2, verano 0,4, otoño 0,65 e invierno 1,0. La saturación del progreso no SHALL afectar esa luz. Al cambiar de estación, la intensidad SHALL cambiar en 600 ms; con `prefers-reduced-motion`, de inmediato.

#### Scenario: Primavera
- WHEN empieza la partida
- THEN la luz de la red apenas se ve

#### Scenario: Invierno
- WHEN llega el mes 10
- THEN la red es lo más brillante del tablero y su luz alumbra las casillas vecinas
- AND el Árbol Padre y los retratos se ven encima de esa luz, con sus colores

#### Scenario: Movimiento reducido
- WHEN el sistema pide movimiento reducido y llega el mes 10
- THEN la luz de la red pasa a la intensidad de invierno sin transición
