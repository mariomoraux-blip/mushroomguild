## MODIFIED Requirements

### Requirement: La plaga marchita
Cuando la plaga marchita una casilla, la plaga viva (`board/plague/blight`, o `blight-winter` en invierno) SHALL fundirse en menos de 1 s (280 ms quieta y 600 ms de fundido) sobre la red muerta (`board/plague/withered`), con un poco de polvo violeta. La red muerta se queda mientras la casilla tenga plaga; cuando los hongos la limpian, la casilla es pasto. Con `prefers-reduced-motion` no hay animación: la casilla pasa a la red muerta de inmediato.

#### Scenario: Se marchita
- WHEN termina el mes y la plaga marchita una casilla
- THEN la plaga viva se funde y deja la red muerta en la casilla

#### Scenario: Movimiento reducido
- WHEN el sistema pide movimiento reducido y la plaga marchita una casilla
- THEN la casilla pasa a la red muerta sin animación
