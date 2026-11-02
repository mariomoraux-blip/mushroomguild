# story-presentation

## Purpose
El mundo cuenta la historia (pilar 2): tres cartas de intro, una carta cuando llega Maestra Bruna, dos finales y un escenario que gana color con el progreso y cambia de luz con las estaciones. Cartas en `src/ui/story.ts` y `src/store.ts`; luz en `src/scenes/light.ts`, con valores en `src/theme.ts`.

## Requirements

### Requirement: Intro
La primera vez que se abre el juego, la partida SHALL abrir con tres cartas de una frase cada una, que se pueden saltar. "Jugar otra vez" no repite la intro.

#### Scenario: Saltar la intro
- WHEN el jugador pulsa "Saltar" en la primera carta
- THEN se cierra la intro y la bitácora invita a elegir un miembro del gremio

#### Scenario: Intro ya vista
- WHEN el jugador vuelve a abrir el juego después de cerrar la intro
- THEN la partida empieza sin cartas

### Requirement: Llegada dla maga
Cuando Maestra Bruna se une al gremio, el juego SHALL mostrar una carta breve que lo presente y explique sus dos hechizos.

#### Scenario: Amanecer con la maga
- WHEN empieza el día en que llega Maestra Bruna
- THEN aparece la carta "El bosque volvió a hablar, y alguien escuchó." con sus hechizos en una línea cada uno

### Requirement: Finales
Al ganar o al terminar el invierno, el juego SHALL mostrar una carta de final con un resumen y la opción de jugar otra vez. "Ver el claro" cierra la carta y la bitácora SHALL seguir ofreciendo "Jugar otra vez".

#### Scenario: Victoria
- WHEN la Amanita muscaria despierta al Árbol Padre en el día 8
- THEN la carta dice "El Árbol Padre despertó en el día 8." e indica los árboles revividos

#### Scenario: Fin del invierno
- WHEN el estado pasa a `lost`
- THEN la carta dice "El bosque esperará la próxima primavera." y sugiere revivir árboles temprano

#### Scenario: Jugar otra vez
- WHEN el jugador pulsa "Jugar otra vez" en la carta o en la bitácora
- THEN empieza una partida nueva en otro claro aleatorio (el mismo con `?seed=N` o `?map=clasico`) y sin intro

### Requirement: Cartas accesibles
Las cartas SHALL ser diálogos modales: el resto del juego queda inactivo, el foco empieza en el botón principal y no sale de la carta con Tab, Esc la cierra ("Saltar" en la intro, "Ver el claro" en los finales) y, al cerrar, el foco vuelve al juego. A 360 px de ancho SHALL caber con 16 px de margen, texto de al menos 16 px y botones de al menos 44 px.

#### Scenario: Cerrar con teclado
- WHEN hay una carta abierta y el jugador pulsa Esc
- THEN la carta se cierra y el foco vuelve al juego

### Requirement: El color vuelve
La saturación del escenario SHALL aumentar con cada árbol revivido (0,15 + 0,85 × vivos / (árboles del claro + 2)) y alcanzar el máximo al despertar al Árbol Padre.

#### Scenario: Inicio y final
- WHEN empieza la partida
- THEN el escenario se ve casi gris
- AND WHEN se despierta al Árbol Padre THEN se ve con color pleno

### Requirement: La luz sigue a las estaciones
La gradación del escenario (claro, Árbol Padre y fondo vivo) SHALL cambiar con la estación: mañana, mediodía, atardecer y anochecer, con una transición de 600 ms (inmediata con movimiento reducido).

#### Scenario: Otoño
- WHEN comienza el día 7
- THEN el escenario usa la gradación de atardecer y el follaje vivo se ve naranja

#### Scenario: Invierno
- WHEN comienza el día 10
- THEN el escenario usa la gradación de anochecer
- AND el micelio brilla con su intensidad máxima

#### Scenario: Personajes y UI
- WHEN cambia la estación
- THEN los personajes y los paneles conservan sus colores originales, excepto la Gliophorus psittacinus, que adopta el tono de la estación
