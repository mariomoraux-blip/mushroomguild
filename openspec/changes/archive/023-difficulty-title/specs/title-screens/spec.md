# Delta · title-screens

## RENAMED Requirements
- FROM: `### Requirement: Elige tu claro`
- TO: `### Requirement: Elige tu dificultad`

## MODIFIED Requirements

### Requirement: Portada
Al abrir el juego sin `?map`, `?seed`, `?nivel` ni `?debugState`, el juego SHALL mostrar la portada: el logo completo (sin recortes) y un menú con "Nueva partida" (principal), "Cómo jugar" y "El gremio". "Nueva partida" SHALL abrir "Elige tu dificultad" y, tras elegir el nivel, la intro o el tablero.

#### Scenario: Abrir el juego
- WHEN el jugador abre el sitio
- THEN ve la portada con el foco en "Nueva partida"
- AND la portada no muestra a los personajes
- AND al pulsarla ve "Elige tu dificultad"; al elegir Brote por primera vez ve la intro y después el tablero en el mes 1

### Requirement: Elige tu dificultad
"Nueva partida" SHALL abrir la pantalla "Elige tu dificultad" con los tres niveles (Brote, Bosque y Ancestral), cada uno con su nombre, una línea que diga qué cambia y su multiplicador de puntaje. Cada nivel SHALL ser un botón de al menos 44 px de alto. El foco SHALL ir al último nivel elegido (Brote la primera vez), recordado entre visitas; si el almacenamiento falla, el foco va a Brote. Esc SHALL volver a la portada. Elegir un nivel SHALL abrir la intro la primera vez que se juega ese nivel y el tablero las demás. "Jugar de nuevo" SHALL conservar el nivel. `?nivel=brote|bosque|ancestral` SHALL entrar directo al tablero en ese nivel.

#### Scenario: Elegir Ancestral
- WHEN el jugador pulsa "Nueva partida" y elige Ancestral
- THEN empieza una partida en Ancestral
- AND la próxima vez que pulse "Nueva partida", el foco está en Ancestral

#### Scenario: Volver a la portada
- WHEN el jugador está en "Elige tu dificultad" y pulsa Esc
- THEN vuelve a la portada con el foco en "Nueva partida"

#### Scenario: Jugar de nuevo conserva el nivel
- WHEN el jugador termina una partida en Bosque y pulsa "Jugar de nuevo"
- THEN la partida nueva es en Bosque
