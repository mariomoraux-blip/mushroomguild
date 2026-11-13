## MODIFIED Requirements

### Requirement: Cronómetro
El HUD SHALL mostrar un cronómetro mm:ss que cuenta hacia arriba, sin límite, solo durante el juego activo. SHALL empezar cuando el tablero acepta la primera acción del jugador (actuar sobre una casilla, reclutar o terminar el mes), haya intro o no; pausarse con cualquier hoja o pantalla encima del tablero (cartas de historia, fichas, hechizo, reclutar, Libreta de campo, "El gremio") y con la pestaña oculta; y detenerse al despertar al Árbol Ancestral o al terminar el invierno. Los números SHALL ser tabulares y el cronómetro no SHALL anunciarse cada segundo al lector de pantalla.

#### Scenario: Antes de la primera acción
- WHEN el jugador cierra la intro y mira el tablero 20 segundos sin actuar
- THEN el cronómetro sigue en 00:00
- AND empieza a correr cuando Bruno descompone el primer tronco

#### Scenario: Carta abierta
- WHEN llega Maestra Bruma y su carta queda abierta 30 segundos
- THEN el cronómetro no avanza mientras la carta está abierta
- AND vuelve a correr al cerrarla

#### Scenario: Hoja abierta
- WHEN el jugador abre la ficha de un miembro, la hoja de reclutar o la Libreta de campo
- THEN el cronómetro no avanza hasta que la cierra

#### Scenario: Fin de la partida
- WHEN la Amanita despierta al Árbol Ancestral
- THEN el cronómetro se detiene y la carta de victoria muestra ese tiempo
