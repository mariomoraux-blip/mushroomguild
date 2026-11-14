## MODIFIED Requirements

### Requirement: Libreta de campo
El HUD SHALL tener un botón "?" que abre la Libreta de campo encima del tablero (048: ya no pasa por "Cómo jugar"): la meta, cómo se juega en 4 pasos, para qué sirve cada una de las 5 especies, cada una con su retrato, su nombre, qué hace y su receta visual (ver «Recetas visuales») y la leyenda de casillas. Al final SHALL tener una sección «Sonido» con los interruptores «Sonido» y «Música» (`audio`, 049). La libreta no se abre sola; se cierra con "¡A jugar!", el botón de cerrar o Esc, y la partida sigue donde estaba.

#### Scenario: Consultar la ayuda
- WHEN el jugador pulsa "?" durante la partida
- THEN se abre la Libreta de campo con las 5 especies, qué hace cada una y su receta visual con lo que gana o gasta

#### Scenario: Apagar el sonido en la partida
- WHEN el jugador abre la Libreta y pulsa «Sonido»
- THEN el interruptor queda apagado y los efectos del tablero dejan de sonar

