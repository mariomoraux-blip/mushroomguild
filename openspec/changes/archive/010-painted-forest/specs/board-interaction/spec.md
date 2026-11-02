# Delta · board-interaction

## RENAMED Requirements
- FROM: `### Requirement: Árbol Padre de Blender`
- TO: `### Requirement: Árbol Padre pintado`

## MODIFIED Requirements

### Requirement: Retratos del gremio
El tablero, el dock y las fichas SHALL usar el retrato pintado de cada especie (`public/assets/characters/<personaje>/portrait`): en el dock, con un pequeño salto cuando el miembro está seleccionado o sugerido; en la ficha, grande; en el tablero, sobre la casilla donde ese miembro trabajó hoy. En la interfaz, la Gliophorus SHALL llevar la corona de su estación (`frame-<estación>`). Maestra Bruna SHALL conservar la proporción de su retrato, más alto que ancho, sin deformarse.

#### Scenario: Trabajó hoy
- WHEN Bruno descompone un tronco
- THEN el tablero muestra el retrato de Bruno sobre ese tronco hasta el amanecer

#### Scenario: Retratos en el dock
- WHEN empieza la partida
- THEN las tarjetas de Añil, Bruno y Rubí muestran sus retratos pintados

#### Scenario: La maga en el tablero
- WHEN Maestra Bruna lanza un hechizo
- THEN el tablero muestra su retrato sobre la casilla del hechizo, más alto que el de los demás miembros

### Requirement: Estilo cozy
La interfaz SHALL verse como un bosque pintado: el HUD es un tablón de madera con una etiqueta de papel para el día y el ícono de la estación, pastillas pintadas para nutrientes, esporas y árboles, y el botón pintado de ayuda; la bitácora es papel rasgado con cinta; las tarjetas del gremio son fichas de criatura con costura y retrato pintado; reclutar muestra el sobre y la mochila pintados; "Fin del día" lleva la luna pintada; el tablero tiene marco de raíces trenzadas; las hojas son pergamino con borde rasgado y cinta de título. Las piezas pintadas vienen de `public/assets/`, sus rutas las arma `src/theme.ts`, y todos los colores y tipografías SHALL venir de `src/theme.ts`.

#### Scenario: Pantalla de juego
- WHEN se abre el juego a 390 × 844
- THEN el HUD muestra el tablón, la etiqueta del día con el ícono de la estación, las tres pastillas pintadas y el botón de ayuda
- AND "Fin del día" lleva la luna pintada
- AND el tablero tiene marco de raíces y pinta pasto, micelio y objetos con las piezas pintadas

### Requirement: Casilla ocupada
Cuando un miembro trabajó hoy en una casilla, su retrato SHALL ocupar la casilla y el objeto de abajo (tronco, árbol, roca, Hogar) no SHALL pintarse; el suelo, la red de micelio y el aura del Árbol Padre se mantienen. Sobre el Hogar queda la red. El Árbol Padre es la excepción: se sigue viendo y el miembro se dibuja delante.

#### Scenario: Hongo sobre un tronco
- WHEN Bruno descompone el tronco junto al Hogar
- THEN en esa casilla se ve a Bruno y no el tronco debajo
- AND al amanecer, cuando Bruno descansa, el tronco vuelve a verse

#### Scenario: Hongo sobre la casa
- WHEN un miembro trabaja sobre el Hogar
- THEN en esa casilla se ve al miembro sobre la red, sin la casa-hongo debajo

### Requirement: Árbol Padre pintado
El Árbol Padre SHALL dibujarse con su pieza pintada: dormido (gris) mientras no despierte y despierto (copa dorada, luces cálidas) desde que despierta. SHALL ocupar su casilla, ser mayor que los personajes y poder sobresalir hacia arriba, también por encima del marco del tablero.

#### Scenario: Dormido al empezar
- WHEN empieza la partida
- THEN el Árbol Padre se ve gris sobre su casilla, con el aro de meta punteado

#### Scenario: Despierto
- WHEN la Amanita despierta al Árbol Padre
- THEN el Árbol Padre se ve con la copa dorada encendida y su copa asoma por encima del marco

## ADDED Requirements

### Requirement: Tablero pintado por estación
El claro SHALL pintarse con las piezas pintadas de `public/assets/board/`, con la variante de la estación del día cuando exista y la de primavera cuando no: pasto (primavera y verano alternan tres losas; otoño e invierno tienen la suya), red de micelio como losa dorada, troncos enteros y usados, rocas (nevadas en invierno), árboles dormidos, despertando (la red ya los alcanza) y vivos (de otoño o nevados), y la casa-hongo. Si una pieza no carga, la casilla SHALL pintarse con el dibujo vectorial.

#### Scenario: Primavera
- WHEN empieza la partida
- THEN el pasto es verde con flores, los árboles dormidos son grises y los troncos están enteros

#### Scenario: Otoño
- WHEN llega el día 7
- THEN el pasto tiene hojas naranjas y los árboles vivos tienen la copa de otoño

#### Scenario: Invierno
- WHEN llega el día 10
- THEN el pasto y las rocas tienen nieve y los árboles vivos están nevados

#### Scenario: La red alcanza un árbol dormido
- WHEN la red de micelio llega a un árbol dormido
- THEN el árbol se ve despertando, aún sin hojas vivas
