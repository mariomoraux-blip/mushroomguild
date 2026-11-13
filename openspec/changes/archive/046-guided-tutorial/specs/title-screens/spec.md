## MODIFIED Requirements

### Requirement: Elige tu dificultad
"Nueva partida" SHALL abrir la pantalla "Elige tu dificultad" con «Primeros pasos» primero (046: el tutorial, marcado «Recomendado» hasta que se complete o se salte, sin multiplicador) y los tres niveles (Brote, Bosque y Ancestral), cada uno con su nombre, una línea que diga qué cambia y su multiplicador de puntaje. Cada nivel SHALL ser un botón de al menos 44 px de alto. El foco SHALL ir al último nivel elegido (la primera vez, «Primeros pasos»; después del tutorial, Brote), recordado entre visitas; si el almacenamiento falla, el foco va a «Primeros pasos». Esc SHALL volver a la portada. Elegir un nivel SHALL abrir la intro la primera vez que se juega ese nivel y el tablero las demás; la intro vista en el tutorial no se repite en Brote. "Jugar de nuevo" SHALL conservar el nivel. `?nivel=tutorial|brote|bosque|ancestral` SHALL entrar directo al tablero en ese nivel.

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
- THEN «Primeros pasos» aparece primero, con «Recomendado» y el foco
