# board-interaction

## Purpose
Interacción con el tablero en el navegador: selección de miembros y casillas, hechizos del mago, avisos de la bitácora, HUD, teclado y layout móvil primero. Implementada en `src/store.ts`, `src/scenes/GameScene.ts` y `src/ui/`.

## Requirements

### Requirement: Selección de miembro
Al seleccionar un miembro disponible, la interfaz SHALL resaltar solo las casillas donde su acción es válida.

#### Scenario: Tejedor al inicio
- WHEN el jugador selecciona al Lactarius indigo en el día 1
- THEN se resaltan las tierras adyacentes al Hogar y ninguna otra casilla

#### Scenario: Deseleccionar
- WHEN el jugador vuelve a tocar al miembro seleccionado o pulsa Esc
- THEN no queda ningún miembro seleccionado ni casilla resaltada

### Requirement: Hechizos dla maga
Al seleccionar a Maestra Bruna, la interfaz SHALL pedir primero el hechizo y después resaltar solo las casillas válidas para ese hechizo.

#### Scenario: Elegir Brote arcano
- WHEN el jugador selecciona a Maestra Bruna y elige Brote arcano
- THEN se resaltan solo las rocas adyacentes a la red

#### Scenario: Magia agotada
- WHEN Maestra Bruna ya lanzó un hechizo esta estación
- THEN su tarjeta en el dock indica que su magia vuelve con la próxima estación

### Requirement: Feedback de acción inválida
La interfaz SHALL mostrar en la bitácora el motivo exacto que devuelve `check()` cuando una acción no es posible.
Cuando el miembro seleccionado no tiene ninguna casilla válida, la bitácora SHALL mostrar "Nombre: motivo", donde el motivo sale de `idleReason(state, memberId)` (lógica en `src/rules`, devuelve una clave) y su texto vive en `src/copy/es.ts`:

| Especie | Condición | Texto |
| --- | --- | --- |
| Champiñón | No hay troncos junto a la red | "no hay troncos junto a la red. Teje hacia uno." |
| Lactarius indigo | Menos nutrientes que el costo de tejer | "faltan nutrientes." |
| Lactarius indigo | No hay tierra libre junto a la red | "no hay tierra junto a la red." |
| Amanita muscaria | Menos nutrientes que el costo de revivir | "faltan nutrientes." |
| Amanita muscaria | No hay árboles grises junto a la red | "no hay árboles grises junto a la red." |
| Gliophorus psittacinus | Hay un compañero que ya trabajó hoy, pero menos esporas que el costo de pasar la voz | "falta 1 espora: pasar la voz cuesta 1." |
| Gliophorus psittacinus | Nadie ha trabajado todavía hoy | "nadie ha trabajado todavía hoy. Pasa la voz después de que trabaje un compañero." |
| Maestra Bruna | Ya lanzó un hechizo esta estación | "su magia vuelve con la próxima estación." |

Maestra Bruna no tiene otro motivo de inactividad: cuando llega siempre hay árboles vivos.

#### Scenario: Toque en una casilla no válida
- WHEN hay un miembro seleccionado y el jugador toca una casilla no resaltada
- THEN la bitácora muestra el motivo exacto de `check()` para esa casilla y el miembro sigue seleccionado

#### Scenario: Sin trabajo disponible (Champiñón)
- WHEN se selecciona a Bruno y no hay troncos junto a la red
- THEN la bitácora dice "Bruno: no hay troncos junto a la red. Teje hacia uno."

#### Scenario: Sin trabajo disponible (Lactarius indigo)
- WHEN se selecciona a Añil con 0 nutrientes
- THEN la bitácora dice "Añil: faltan nutrientes."

#### Scenario: Sin trabajo disponible (Amanita muscaria)
- WHEN se selecciona a Rubí con nutrientes suficientes y ningún árbol gris junto a la red
- THEN la bitácora dice "Rubí: no hay árboles grises junto a la red."

#### Scenario: Sin trabajo disponible (Gliophorus psittacinus)
- WHEN se selecciona a Chispa, Bruno ya trabajó hoy y hay 0 esporas
- THEN la bitácora dice "Chispa: falta 1 espora: pasar la voz cuesta 1."

#### Scenario: Sin trabajo disponible (Maestra Bruna)
- WHEN se selecciona a Maestra Bruna después de que ya lanzó un hechizo esta estación
- THEN la bitácora dice "Maestra Bruna: su magia vuelve con la próxima estación."

### Requirement: Estado visible
El HUD SHALL mostrar en todo momento día (de 12), estación, nutrientes, esporas y árboles vivos (del total de árboles del claro).

#### Scenario: Tras una acción
- WHEN el Champiñón descompone un tronco
- THEN el HUD muestra los nutrientes actualizados sin recargar la página

### Requirement: Accesibilidad básica
Todo lo que se hace con el puntero SHALL poder hacerse con teclado, y el foco SHALL ser visible.

#### Scenario: Jugar con teclado
- WHEN el jugador usa solo Tab, Enter y Esc
- THEN puede seleccionar un miembro, actuar sobre una casilla y terminar el día

### Requirement: Móvil primero
El juego SHALL ser jugable de principio a fin en un navegador de teléfono en vertical, con el tablero completo visible y sin scroll de página. En vertical las casillas SHALL medir al menos 48 px en cualquier tamaño de ventana soportado. No hay dock plegable.

#### Scenario: Teléfono en vertical
- WHEN la ventana mide 390 × 844
- THEN el HUD está arriba, el tablero de 5×8 completo al centro con casillas de al menos 64 px, y el dock del gremio abajo
- AND la página no se desplaza al tocar el tablero

#### Scenario: Safari con barras
- WHEN la ventana mide 390 × 664 (iPhone con las barras del navegador visibles)
- THEN el HUD, el tablero completo y el dock caben sin scroll, con casillas de al menos 56 px
- AND "Terminar el día" está en la misma fila que las tarjetas del gremio

#### Scenario: Teléfono en horizontal
- WHEN la ventana mide 844 × 390
- THEN el tablero queda a la izquierda y el dock a la derecha, ambos completos
- AND las casillas miden al menos 44 px

#### Scenario: Escritorio
- WHEN la ventana mide 1280 × 800
- THEN el mismo layout se centra con más espacio, sin estirar las casillas más de 96 px

#### Scenario: Gremio completo en el dock
- WHEN el gremio tiene 7 miembros (6 reclutables y Maestra Bruna) en una ventana de 390 px de ancho
- THEN las tarjetas se desplazan en horizontal dentro del dock y la tarjeta siguiente asoma cortada
- AND "Terminar el día" queda fijo fuera de ese desplazamiento
- AND la página no se mueve
- AND las tarjetas mantienen siempre el mismo orden (orden de llegada al gremio)

### Requirement: Objetivos táctiles
Todo control interactivo SHALL medir al menos 44 × 44 px y no SHALL depender de hover ni de gestos largos.

#### Scenario: Tocar un miembro con el pulgar
- WHEN el jugador toca la tarjeta de un miembro en el dock
- THEN el miembro queda seleccionado sin zoom de la página

### Requirement: Retratos del gremio
El tablero, el dock y las fichas SHALL usar el retrato pintado de cada especie (`public/assets/characters/<personaje>/portrait`): en el dock, dentro de un medallón de madera, con un pequeño salto cuando el miembro está seleccionado o sugerido; en la ficha, grande; en el tablero, sobre la casilla donde ese miembro trabajó hoy. En la interfaz, la Gliophorus SHALL llevar la corona de su estación (`frame-<estación>`). Maestra Bruna SHALL conservar la proporción de su retrato, más alto que ancho, sin deformarse.

#### Scenario: Trabajó hoy
- WHEN Bruno descompone un tronco
- THEN el tablero muestra el retrato de Bruno sobre ese tronco hasta el amanecer

#### Scenario: Retratos en el dock
- WHEN empieza la partida
- THEN el dock muestra los medallones de Añil, Bruno y Rubí con sus retratos pintados y sus nombres

#### Scenario: La maga en el tablero
- WHEN Maestra Bruna lanza un hechizo
- THEN el tablero muestra su retrato sobre la casilla del hechizo, más alto que el de los demás miembros

### Requirement: Estilo cozy
La pantalla de juego SHALL seguir el lenguaje del referente "Bosque pintado": el tablero va sobre un bosque pintado (vertical en teléfono, apaisado en horizontal y escritorio); el HUD es una barra con la pastilla verde del día y el ícono de la estación, pastillas de crema con ícono pintado, valor y etiqueta para nutrientes, esporas y árboles, y el botón amarillo de ayuda; la bitácora es un pergamino con el libro de campo; el dock es una fila de medallones de madera con el retrato, el nombre en una cinta y una insignia (★ sugerido, Zz descansa), más el medallón de reclutar; "Fin del día" es una píldora amarilla con la luna; el tablero tiene marco de raíces trenzadas. Las piezas pintadas vienen de `public/assets/`, sus rutas las arma `src/theme.ts`, y todos los colores y tipografías SHALL venir de `src/theme.ts`. El juego no SHALL mostrar sistemas que las reglas no tienen (misiones, moneda, potenciadores).

#### Scenario: Pantalla de juego
- WHEN se abre el juego a 390 × 844
- THEN detrás del tablero se ve el bosque pintado
- AND el HUD muestra la pastilla verde del día, las tres pastillas con ícono y el botón de ayuda
- AND el dock muestra los medallones del gremio y la píldora amarilla "Fin del día"

#### Scenario: Miembro que descansa
- WHEN un miembro ya trabajó hoy
- THEN su medallón se ve apagado y lleva la insignia Zz

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

### Requirement: Fondo vivo
Sobre el bosque pintado y detrás de la interfaz SHALL haber una capa animada por shader (esporas y luciérnagas que flotan) que no compita con el tablero. Con `prefers-reduced-motion` SHALL quedar quieta; SHALL pausarse con la pestaña oculta; si no hay WebGL, queda solo el bosque pintado.

#### Scenario: Movimiento reducido
- WHEN el sistema pide movimiento reducido
- THEN el fondo pinta un solo cuadro y no se anima
