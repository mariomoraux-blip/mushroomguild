# Delta · visual-feedback

## ADDED Requirements

### Requirement: La red alumbra el invierno
La red de micelio SHALL tener su propia luz, encima del claro pintado y debajo del Árbol Padre, los retratos y las partículas, con una intensidad que crece con la estación: primavera 0,2, verano 0,4, otoño 0,65 e invierno 1,0. La saturación del progreso no SHALL afectar esa luz. Al cambiar de estación, la intensidad SHALL cambiar en 600 ms; con `prefers-reduced-motion`, de inmediato.

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
