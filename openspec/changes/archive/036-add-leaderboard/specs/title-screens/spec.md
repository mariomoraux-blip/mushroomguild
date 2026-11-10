# Delta · title-screens

## MODIFIED Requirements

### Requirement: Portada
Al abrir el juego sin `?map`, `?seed`, `?nivel` ni `?debugState`, el juego SHALL mostrar la portada: el logo completo (sin recortes) y un menú con "Nueva partida" (principal), "Cómo jugar", "El gremio" y "Ranking". "Nueva partida" SHALL abrir "Elige tu dificultad" y, tras elegir el nivel, la intro o el tablero. "Ranking" SHALL abrir la pantalla del ranking (`leaderboard`). Si el dispositivo tiene un jugador registrado, la portada SHALL saludarlo por su alias en una línea que no es un control.

#### Scenario: Abrir el juego
- WHEN el jugador abre el sitio
- THEN ve la portada con el foco en "Nueva partida"
- AND la portada no muestra a los personajes
- AND al pulsarla ve "Elige tu dificultad"; al elegir Brote por primera vez ve la intro y después el tablero en el mes 1

#### Scenario: Abrir el ranking
- WHEN el jugador pulsa "Ranking" en la portada
- THEN ve el ranking y con Esc vuelve a la portada con el foco en "Ranking"

#### Scenario: Portada en horizontal con saludo
- WHEN un jugador registrado abre la portada a 844 × 390
- THEN el menú de cuatro opciones, el saludo y el crédito se ven completos y la página no hace scroll
