## ADDED Requirements

### Requirement: Configuración
La hoja «Configuración» SHALL abrirse desde el botón «Configuración» del menú de la portada y desde un botón con engranaje en el HUD del tablero, junto a "?" (los dos con área táctil de 44 px o más). SHALL tener dos secciones: «Sonido», con los interruptores «Sonido» y «Música» (`audio`), y «Créditos», con «By Mario Mora for BerryLab» y «Efectos de sonido generados con ElevenLabs (elevenlabs.io)». Como las demás hojas, SHALL tener título y botón de cerrar, atrapar el foco, cerrarse con «Listo», el botón de cerrar, Esc o «atrás», y devolver el foco a quien la abrió; en la partida, el juego sigue donde estaba. Los textos van en `src/copy/es.ts`. Reemplaza la modal «Atribuciones» del 049.

#### Scenario: Abrir desde la portada
- WHEN el jugador pulsa «Configuración» en la portada
- THEN se abre la hoja con «Sonido» encendido y «Música» apagada, y el foco en ella
- AND con Tab el foco no sale de la hoja
- AND con Esc se cierra y el foco vuelve a «Configuración»

#### Scenario: Abrir en la partida
- WHEN el jugador pulsa el engranaje del HUD
- THEN se abre la misma hoja, con los interruptores como quedaron guardados

#### Scenario: Créditos
- WHEN el jugador abre «Configuración»
- THEN ve la sección «Créditos» con la firma del autor y el crédito de ElevenLabs

## REMOVED Requirements

### Requirement: Atribuciones
**Reason:** 051: los créditos viven en «Configuración» y el enlace deja la zona de la firma.
**Migration:** ver «Configuración».

## MODIFIED Requirements

### Requirement: Portada
Al abrir el juego sin `?map`, `?seed`, `?nivel` ni `?debugState`, el juego SHALL mostrar la portada: el logo completo (sin recortes) y un menú con "Nueva partida" (principal), "Cómo jugar", "El gremio", "Ranking" y "Configuración" (051). "Nueva partida" SHALL abrir "Elige tu dificultad" y, tras elegir el nivel, la intro o el tablero. "Cómo jugar" SHALL empezar el tutorial (`tutorial`, 048), también si ya se completó o se saltó. "Ranking" SHALL abrir la pantalla del ranking (`leaderboard`). Si el dispositivo tiene un jugador registrado, la portada SHALL saludarlo por su alias en una línea que no es un control. "Configuración" SHALL abrir la hoja «Configuración» (ver «Configuración»).

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
- THEN el menú de cinco opciones, el saludo y el crédito se ven completos y la página no hace scroll

#### Scenario: Repetir el tutorial
- WHEN un jugador que ya completó el tutorial pulsa "Cómo jugar" en la portada
- THEN empieza el tutorial en su primer paso

### Requirement: Crédito del autor
La portada SHALL mostrar, fija al borde inferior de la pantalla y centrada, con un margen pequeño (8 px, o el área segura del teléfono si es mayor), en letra pequeña (12 px), la línea «By Mario Mora for BerryLab» (051: sin enlaces a su lado; los créditos completos están en «Configuración»). El texto SHALL tener un contraste de al menos 4,5:1 con su fondo inmediato, que es sólido (no depende del fondo pintado), y no SHALL tapar el logo ni el menú en vertical ni en horizontal. La línea no es un control: no recibe el foco.

#### Scenario: Ver el crédito
- WHEN el jugador abre el sitio
- THEN la portada muestra «By Mario Mora for BerryLab» centrada y a 8 px del borde inferior
- AND el contraste entre el texto y su fondo es de al menos 4,5:1

#### Scenario: Portada en horizontal
- WHEN se abre la portada a 844 × 390
- THEN el crédito sigue fijo abajo y centrado, se ve completo y no se superpone al logo ni al menú, y la página no hace scroll
