## ADDED Requirements

### Requirement: Atribuciones
Junto a la firma de la portada («By Mario Mora for BerryLab») SHALL haber un enlace «Atribuciones», con área táctil de 44 px o más, que abre una modal encima de la portada con los créditos de terceros: «Efectos de sonido generados con ElevenLabs (elevenlabs.io)». La modal SHALL tener título y botón de cerrar, atrapar el foco (Tab no sale de ella), cerrarse con el botón, con Esc, con «atrás» o tocando fuera, y devolver el foco a «Atribuciones». Los textos van en `src/copy/es.ts`.

#### Scenario: Ver las atribuciones
- WHEN el jugador pulsa «Atribuciones» en la portada
- THEN se abre una modal con el crédito de ElevenLabs y el foco en ella
- AND con Tab el foco no sale de la modal
- AND con Esc se cierra y el foco vuelve a «Atribuciones»

#### Scenario: Atribuciones en horizontal
- WHEN el jugador abre la portada a 844 × 390
- THEN la firma y «Atribuciones» se ven completas y la página no hace scroll

## MODIFIED Requirements

### Requirement: Portada
Al abrir el juego sin `?map`, `?seed`, `?nivel` ni `?debugState`, el juego SHALL mostrar la portada: el logo completo (sin recortes) y un menú con "Nueva partida" (principal), "Cómo jugar", "El gremio" y "Ranking". "Nueva partida" SHALL abrir "Elige tu dificultad" y, tras elegir el nivel, la intro o el tablero. "Cómo jugar" SHALL empezar el tutorial (`tutorial`, 048), también si ya se completó o se saltó. "Ranking" SHALL abrir la pantalla del ranking (`leaderboard`). Si el dispositivo tiene un jugador registrado, la portada SHALL saludarlo por su alias en una línea que no es un control. Debajo del menú SHALL estar los interruptores «Sonido» y «Música» (`audio`, 049), y junto a la firma, el enlace «Atribuciones» (049).

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
- THEN el menú de cuatro opciones, el saludo, los interruptores de sonido y el crédito se ven completos y la página no hace scroll

#### Scenario: Repetir el tutorial
- WHEN un jugador que ya completó el tutorial pulsa "Cómo jugar" en la portada
- THEN empieza el tutorial en su primer paso

### Requirement: Crédito del autor
La portada SHALL mostrar, fija al borde inferior de la pantalla, con un margen pequeño (8 a 12 px, o el área segura del teléfono si es mayor), en letra pequeña (12 px), la línea «By Mario Mora for BerryLab» y a su lado el enlace «Atribuciones» (049); los dos juntos van centrados. El texto SHALL tener un contraste de al menos 4,5:1 con su fondo inmediato, que es sólido (no depende del fondo pintado), y no SHALL tapar el logo ni el menú en vertical ni en horizontal. La línea no es un control: no recibe el foco (el enlace sí).

#### Scenario: Ver el crédito
- WHEN el jugador abre el sitio
- THEN la portada muestra «By Mario Mora for BerryLab» y «Atribuciones» centrados y a unos 10 px del borde inferior
- AND el contraste entre el texto y su fondo es de al menos 4,5:1

#### Scenario: Portada en horizontal
- WHEN se abre la portada a 844 × 390
- THEN el crédito y «Atribuciones» siguen fijos abajo y centrados, se ven completos y no se superponen al logo ni al menú, y la página no hace scroll
