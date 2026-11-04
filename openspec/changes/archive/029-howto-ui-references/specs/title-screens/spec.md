# Delta · title-screens

## MODIFIED Requirements

### Requirement: Cómo jugar
"Cómo jugar" SHALL mostrar 5 pasos (elige un hongo, trabaja junto a la red, una vez por mes, al empezar el mes, despierta al Árbol Padre) en un carrusel con anterior y siguiente, puntos que llevan a cada paso, flechas del teclado y deslizar con el dedo. El último paso no tiene "siguiente". Desde cualquier paso se puede abrir la Libreta de campo; "¡A jugar!" empieza la partida (desde la portada) o vuelve al tablero (desde el "?"). Cada paso SHALL ilustrarse con una miniatura de la interfaz del juego hecha con sus mismos componentes, decorativa (no se toca ni se enfoca): tarjetas del dock con la ★ (paso 1), casillas de red y casillas resaltadas (paso 2), una tarjeta que descansa y el botón «Fin del mes» (paso 3), un árbol vivo con lo que da y el medallón «Reclutar» (paso 4), y el Árbol Padre con las pastillas de árboles y nutrientes del HUD (paso 5).

#### Scenario: Recorrer los pasos
- WHEN el jugador abre "Cómo jugar" y pulsa "Paso siguiente"
- THEN ve el paso 2 de 5, "Trabaja junto a la red"
- AND con el punto 5 llega a "Despierta al Árbol Padre", sin "siguiente"

#### Scenario: El paso se parece a la partida
- WHEN el jugador está en el paso 3 de "Cómo jugar"
- THEN ve una tarjeta del dock con «Zz» y el botón «Fin del mes» como en el tablero, y ninguno recibe el foco
