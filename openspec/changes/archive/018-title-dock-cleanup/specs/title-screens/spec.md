## MODIFIED Requirements

### Requirement: Portada
Al abrir el juego sin `?map`, `?seed` ni `?debugState`, el juego SHALL mostrar la portada: el logo completo (sin recortes) y un menú con "Nueva partida" (principal), "Cómo jugar" y "El gremio". "Nueva partida" SHALL abrir la intro y después el tablero.

#### Scenario: Abrir el juego
- WHEN el jugador abre el sitio
- THEN ve la portada con el foco en "Nueva partida"
- AND la portada no muestra a los personajes
- AND al pulsarla ve la intro y después el tablero en el mes 1
