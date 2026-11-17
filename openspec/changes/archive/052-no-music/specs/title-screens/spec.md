## MODIFIED Requirements

### Requirement: Configuración
La hoja «Configuración» SHALL abrirse desde el botón «Configuración» del menú de la portada y desde un botón con engranaje en el HUD del tablero, junto a "?" (los dos con área táctil de 44 px o más). SHALL tener dos secciones: «Sonido», con el interruptor «Sonido» (`audio`; 052: sin «Música»), y «Créditos», con «By Mario Mora for BerryLab» y «Efectos de sonido generados con ElevenLabs (elevenlabs.io)». Como las demás hojas, SHALL tener título y botón de cerrar, atrapar el foco, cerrarse con «Listo», el botón de cerrar, Esc o «atrás», y devolver el foco a quien la abrió; en la partida, el juego sigue donde estaba. Los textos van en `src/copy/es.ts`. Reemplaza la modal «Atribuciones» del 049.

#### Scenario: Abrir desde la portada
- WHEN el jugador pulsa «Configuración» en la portada
- THEN se abre la hoja con «Sonido» encendido y el foco en ella
- AND con Tab el foco no sale de la hoja
- AND con Esc se cierra y el foco vuelve a «Configuración»

#### Scenario: Abrir en la partida
- WHEN el jugador pulsa el engranaje del HUD
- THEN se abre la misma hoja, con «Sonido» como quedó guardado

#### Scenario: Créditos
- WHEN el jugador abre «Configuración»
- THEN ve la sección «Créditos» con la firma del autor y el crédito de ElevenLabs
