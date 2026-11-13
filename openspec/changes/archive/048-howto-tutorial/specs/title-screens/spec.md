## MODIFIED Requirements

### Requirement: Portada
Al abrir el juego sin `?map`, `?seed`, `?nivel` ni `?debugState`, el juego SHALL mostrar la portada: el logo completo (sin recortes) y un menú con "Nueva partida" (principal), "Cómo jugar", "El gremio" y "Ranking". "Nueva partida" SHALL abrir "Elige tu dificultad" y, tras elegir el nivel, la intro o el tablero. "Cómo jugar" SHALL empezar el tutorial (`tutorial`, 048), también si ya se completó o se saltó. "Ranking" SHALL abrir la pantalla del ranking (`leaderboard`). Si el dispositivo tiene un jugador registrado, la portada SHALL saludarlo por su alias en una línea que no es un control.

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

#### Scenario: Repetir el tutorial
- WHEN un jugador que ya completó el tutorial pulsa "Cómo jugar" en la portada
- THEN empieza el tutorial en su primer paso

### Requirement: Volver
"Volver" (‹) y Esc SHALL regresar a donde se abrió la pantalla (portada o tablero); si hay una hoja abierta encima, Esc la cierra primero. En la portada, Esc no hace nada. En el tutorial, Esc no lo deja: se sale con «Saltar tutorial». Ninguna pantalla SHALL obligar a desplazar la página a 390 × 844 ni a 844 × 390.

#### Scenario: Esc en Cómo jugar
- WHEN el jugador empieza "Cómo jugar" desde la portada y pulsa Esc en un paso del tutorial
- THEN sigue en el mismo paso del tutorial

### Requirement: Elige tu dificultad
"Nueva partida" SHALL abrir la pantalla "Elige tu dificultad" con los tres niveles (Brote, Bosque y Ancestral), cada uno con su nombre, una línea que diga qué cambia y su multiplicador de puntaje. Mientras el tutorial no se haya completado ni saltado, «Cómo jugar» (el tutorial, sin multiplicador) SHALL ir primero; después ya no SHALL aparecer en esta pantalla (sigue en la portada). Cada nivel SHALL ser un botón de al menos 44 px de alto. El foco SHALL ir al último nivel elegido (mientras aparezca, «Cómo jugar»; después del tutorial, Brote), recordado entre visitas; si el almacenamiento falla, «Cómo jugar» aparece y recibe el foco. Esc SHALL volver a la portada. Elegir un nivel SHALL abrir la intro la primera vez que se juega ese nivel y el tablero las demás; la intro vista en el tutorial no se repite en Brote. "Jugar de nuevo" SHALL conservar el nivel. `?nivel=tutorial|brote|bosque|ancestral` SHALL entrar directo al tablero en ese nivel.

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

#### Scenario: Primera vez
- WHEN el jugador pulsa "Nueva partida" por primera vez
- THEN «Cómo jugar» aparece primero y con el foco

#### Scenario: Tutorial visto
- WHEN el jugador ya completó o saltó el tutorial y pulsa "Nueva partida"
- THEN ve solo Brote, Bosque y Ancestral

## REMOVED Requirements

### Requirement: Cómo jugar
**Reason**: el carrusel de 5 pasos quedó repetido con el tutorial guiado (046); «Cómo jugar» ahora es el tutorial.
**Migration**: «Cómo jugar» de la portada empieza el tutorial; el «?» del tablero abre la Libreta de campo.
