# board-interaction

## Purpose
Interacción con el tablero en el navegador: selección de miembros y casillas, hechizos del mago, avisos de la bitácora, HUD, teclado y layout móvil primero. Implementada en `src/store.ts`, `src/scenes/GameScene.ts` y `src/ui/`.

## Requirements

### Requirement: Selección de miembro
Al seleccionar un miembro disponible, la interfaz SHALL resaltar solo las casillas donde su acción es válida.

#### Scenario: Tejedor al inicio
- WHEN el jugador selecciona al Lactarius indigo en el mes 1
- THEN se resaltan las tierras adyacentes al Hogar y ninguna otra casilla

#### Scenario: Deseleccionar
- WHEN el jugador vuelve a tocar al miembro seleccionado o pulsa Esc
- THEN no queda ningún miembro seleccionado ni casilla resaltada

### Requirement: Hechizos dla maga
Al seleccionar a Maestra Bruma, la interfaz SHALL pedir primero el hechizo y después resaltar solo las casillas válidas para ese hechizo.

#### Scenario: Elegir Brote arcano
- WHEN el jugador selecciona a Maestra Bruma y elige Brote arcano
- THEN se resaltan solo las rocas adyacentes a la red

#### Scenario: Magia agotada
- WHEN Maestra Bruma ya lanzó un hechizo esta estación
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
| Gliophorus psittacinus | Hay un compañero que ya trabajó este mes, pero menos esporas que el costo de pasar la voz | "falta 1 espora: pasar la voz cuesta 1." |
| Gliophorus psittacinus | Nadie ha trabajado todavía este mes | "nadie ha trabajado todavía este mes. Pasa la voz después de que trabaje un compañero." |
| Maestra Bruma | Ya lanzó un hechizo esta estación | "su magia vuelve con la próxima estación." |

Maestra Bruma no tiene otro motivo de inactividad: cuando llega siempre hay árboles vivos.

#### Scenario: Toque en una casilla no válida
- WHEN hay un miembro seleccionado y el jugador toca una casilla no resaltada
- THEN la bitácora muestra el motivo exacto de `check()` para esa casilla y el miembro sigue seleccionado

#### Scenario: Sin trabajo disponible (Champiñón)
- WHEN se selecciona a Bruno y no hay troncos junto a la red
- THEN la bitácora dice "Bruno: no hay troncos junto a la red. Teje hacia uno."

#### Scenario: Sin trabajo disponible (Lactarius indigo)
- WHEN se selecciona a Indi con 0 nutrientes
- THEN la bitácora dice "Indi: faltan nutrientes."

#### Scenario: Sin trabajo disponible (Amanita muscaria)
- WHEN se selecciona a Rubí con nutrientes suficientes y ningún árbol gris junto a la red
- THEN la bitácora dice "Rubí: no hay árboles grises junto a la red."

#### Scenario: Sin trabajo disponible (Gliophorus psittacinus)
- WHEN se selecciona a Chispa, Bruno ya trabajó este mes y hay 0 esporas
- THEN la bitácora dice "Chispa: falta 1 espora: pasar la voz cuesta 1."

#### Scenario: Sin trabajo disponible (Maestra Bruma)
- WHEN se selecciona a Maestra Bruma después de que ya lanzó un hechizo esta estación
- THEN la bitácora dice "Maestra Bruma: su magia vuelve con la próxima estación."

### Requirement: Estado visible
El HUD SHALL mostrar en todo momento mes (de 12), estación, nutrientes, esporas, árboles vivos (del total de árboles del claro) y el cronómetro de juego activo (`scoring` › Cronómetro). El cronómetro va en la segunda línea de la pastilla del mes, junto al ícono de la estación; el nombre de la estación y el nivel SHALL estar en la etiqueta accesible de la pastilla. Con escarcha activa, la pastilla SHALL mostrar un copo junto al ícono de la estación, y su etiqueta accesible lo SHALL decir. Mientras haya una casilla con plaga, la pastilla SHALL mostrar la hoja podrida (`ui/icons/plague`) junto a la estación, y su etiqueta accesible SHALL decir «con plaga». Con más de una, la hoja SHALL llevar el número al lado y la etiqueta SHALL decir «con plaga en N casillas».

#### Scenario: Tras una acción
- WHEN el Champiñón descompone un tronco
- THEN el HUD muestra los nutrientes actualizados sin recargar la página

#### Scenario: Cronómetro en el HUD
- WHEN pasan 75 segundos de juego activo en primavera
- THEN la pastilla del mes muestra "Mes 1/12" y, debajo, el ícono de la estación y 01:15 con números tabulares
- AND su etiqueta accesible nombra la estación ("Primavera") y el nivel

#### Scenario: Escarcha en el HUD
- WHEN empieza el mes 7 en Bosque
- THEN la pastilla del mes muestra un copo junto al ícono del otoño
- AND su etiqueta accesible dice "Otoño, con escarcha"

#### Scenario: Pastilla con plaga
- WHEN la plaga marca una casilla en Ancestral
- THEN la pastilla del mes muestra la hoja podrida junto a la estación y su etiqueta dice «con plaga»
- AND la hoja sigue mientras alguna casilla tenga plaga, también marchita, y desaparece cuando los hongos la frenan o la limpian

#### Scenario: La plaga crece en el HUD
- WHEN hay 3 casillas con plaga
- THEN la pastilla del mes muestra la hoja podrida con un 3 al lado y su etiqueta dice «con plaga en 3 casillas»

### Requirement: Accesibilidad básica
Todo lo que se hace con el puntero SHALL poder hacerse con teclado, y el foco SHALL ser visible.

#### Scenario: Jugar con teclado
- WHEN el jugador usa solo Tab, Enter y Esc
- THEN puede seleccionar un miembro, actuar sobre una casilla y terminar el mes

### Requirement: Móvil primero
El juego SHALL ser jugable de principio a fin en un navegador de teléfono en vertical, con el tablero completo visible y sin scroll de página. En vertical las casillas SHALL medir al menos 48 px en cualquier tamaño de ventana soportado. No hay dock plegable.

#### Scenario: Teléfono en vertical
- WHEN la ventana mide 390 × 844
- THEN el HUD está arriba, el tablero de 5×8 completo al centro con casillas de al menos 64 px, y el dock del gremio abajo
- AND la página no se desplaza al tocar el tablero

#### Scenario: Safari con barras
- WHEN la ventana mide 390 × 664 (iPhone con las barras del navegador visibles)
- THEN el HUD, el tablero completo y el dock caben sin scroll, con casillas de al menos 56 px
- AND "Terminar el mes" está en la misma fila que las tarjetas del gremio

#### Scenario: Teléfono en horizontal
- WHEN la ventana mide 844 × 390
- THEN el tablero queda a la izquierda y el dock a la derecha, ambos completos
- AND las casillas miden al menos 44 px

#### Scenario: Escritorio
- WHEN la ventana mide 1280 × 800
- THEN el mismo layout se centra con más espacio, sin estirar las casillas más de 96 px

#### Scenario: Gremio completo en el dock
- WHEN el gremio tiene 7 miembros (6 reclutables y Maestra Bruma) en una ventana de 390 px de ancho
- THEN las tarjetas se desplazan en horizontal dentro del dock, de tarjeta en tarjeta, y ninguna tarjeta visible queda cortada por el borde
- AND una flecha en el borde indica de qué lado hay más tarjetas
- AND "Terminar el mes" queda fijo fuera de ese desplazamiento
- AND la página no se mueve
- AND las tarjetas mantienen siempre el mismo orden (orden de llegada al gremio)

### Requirement: Objetivos táctiles
Todo control interactivo SHALL medir al menos 44 × 44 px y no SHALL depender de hover ni de gestos largos.

#### Scenario: Tocar un miembro con el pulgar
- WHEN el jugador toca la tarjeta de un miembro en el dock
- THEN el miembro queda seleccionado sin zoom de la página

### Requirement: Retratos del gremio
El tablero, el dock y las fichas SHALL usar el retrato pintado de cada especie (`public/assets/characters/<personaje>/portrait`): en el dock, dentro de un medallón de madera, con un pequeño salto cuando el miembro está seleccionado o sugerido; en la ficha, grande; en el tablero, sobre la casilla donde ese miembro trabajó este mes. En la interfaz, la Gliophorus SHALL llevar la corona de su estación (`frame-<estación>`). Maestra Bruma SHALL conservar la proporción de su retrato, más alto que ancho, sin deformarse.

#### Scenario: Trabajó este mes
- WHEN Bruno descompone un tronco
- THEN el tablero muestra el retrato de Bruno sobre ese tronco hasta el mes siguiente

#### Scenario: Retratos en el dock
- WHEN empieza la partida
- THEN el dock muestra los medallones de Indi, Bruno y Rubí con sus retratos pintados y sus nombres

#### Scenario: La maga en el tablero
- WHEN Maestra Bruma lanza un hechizo
- THEN el tablero muestra su retrato sobre la casilla del hechizo, más alto que el de los demás miembros

### Requirement: Estilo cozy
La pantalla de juego SHALL seguir el lenguaje del referente "Bosque pintado": el tablero va sobre un bosque pintado (vertical en teléfono, apaisado en horizontal y escritorio); el HUD es una barra con la pastilla verde del mes y el ícono de la estación, pastillas de crema con ícono pintado, valor y etiqueta para nutrientes, esporas y árboles, y el botón amarillo de ayuda; la bitácora es un pergamino con el libro de campo; el dock es una fila de medallones de madera con el retrato, el nombre en una cinta y una insignia (★ sugerido, Zz descansa), más el medallón de reclutar; "Fin del mes" es una píldora amarilla con la luna; el tablero tiene marco de raíces trenzadas; las hojas (ficha, reclutar, hechizos, Libreta de campo) son pergamino redondeado con letrero de madera, botón redondo de cerrar y retratos en medallón. Las piezas pintadas vienen de `public/assets/`, sus rutas las arma `src/theme.ts`, y todos los colores y tipografías SHALL venir de `src/theme.ts`. El juego no SHALL mostrar sistemas que las reglas no tienen (misiones, moneda, potenciadores).

#### Scenario: Pantalla de juego
- WHEN se abre el juego a 390 × 844
- THEN detrás del tablero se ve el bosque pintado
- AND el HUD muestra la pastilla verde del mes, las tres pastillas con ícono y el botón de ayuda
- AND el dock muestra los medallones del gremio y la píldora amarilla "Fin del mes"

#### Scenario: Miembro que descansa
- WHEN un miembro ya trabajó este mes
- THEN su medallón se ve apagado y lleva la insignia Zz

### Requirement: Casilla ocupada
Cuando un miembro trabajó este mes en una casilla, su retrato SHALL ocupar la casilla y el objeto de abajo (tronco, árbol, roca, Hogar) no SHALL pintarse; el suelo, la red de micelio y el aura del Árbol Ancestral se mantienen. Sobre el Hogar queda la red. El Árbol Ancestral es la excepción: se sigue viendo y el miembro se dibuja delante.

#### Scenario: Hongo sobre un tronco
- WHEN Bruno descompone el tronco junto al Hogar
- THEN en esa casilla se ve a Bruno y no el tronco debajo
- AND al empezar el mes, cuando Bruno descansa, el tronco vuelve a verse

#### Scenario: Hongo sobre la casa
- WHEN un miembro trabaja sobre el Hogar
- THEN en esa casilla se ve al miembro sobre la red, sin la casa-hongo debajo

### Requirement: Árbol Ancestral pintado
El Árbol Ancestral SHALL dibujarse con su pieza pintada: dormido (gris) mientras no despierte y despierto (copa dorada, luces cálidas) desde que despierta. SHALL ocupar su casilla, ser mayor que los personajes y poder sobresalir hacia arriba, también por encima del marco del tablero.

#### Scenario: Dormido al empezar
- WHEN empieza la partida
- THEN el Árbol Ancestral se ve gris sobre su casilla, con el aro de meta punteado

#### Scenario: Despierto
- WHEN la Amanita despierta al Árbol Ancestral
- THEN el Árbol Ancestral se ve con la copa dorada encendida y su copa asoma por encima del marco

### Requirement: Tablero pintado por estación
El claro SHALL pintarse con las piezas pintadas de `public/assets/board/`, con la variante de la estación del mes cuando exista y la de primavera cuando no: pasto (primavera y verano alternan tres losas; otoño e invierno tienen la suya), red de micelio como losa dorada, troncos enteros y usados, rocas (nevadas en invierno), árboles dormidos, despertando (la red ya los alcanza) y vivos (de otoño o nevados), y la casa-hongo. Si una pieza no carga, la casilla SHALL pintarse con el dibujo vectorial.

#### Scenario: Primavera
- WHEN empieza la partida
- THEN el pasto es verde con flores, los árboles dormidos son grises y los troncos están enteros

#### Scenario: Otoño
- WHEN llega el mes 7
- THEN el pasto tiene hojas naranjas y los árboles vivos tienen la copa de otoño

#### Scenario: Invierno
- WHEN llega el mes 10
- THEN el pasto y las rocas tienen nieve y los árboles vivos están nevados

#### Scenario: La red alcanza un árbol dormido
- WHEN la red de micelio llega a un árbol dormido
- THEN el árbol se ve despertando, aún sin hojas vivas

### Requirement: Fondo vivo
Sobre el bosque pintado y detrás de la interfaz SHALL haber una capa animada por shader (esporas y luciérnagas que flotan) que no compita con el tablero. Con `prefers-reduced-motion` SHALL quedar quieta; SHALL pausarse con la pestaña oculta; si no hay WebGL, queda solo el bosque pintado.

#### Scenario: Movimiento reducido
- WHEN el sistema pide movimiento reducido
- THEN el fondo pinta un solo cuadro y no se anima

### Requirement: Árbol marcado y apagado
El tablero SHALL distinguir el árbol marcado (se apagará al terminar el mes) y el árbol apagado de un árbol gris común, con un velo de escarcha del color `frost` de `theme.ts`. El árbol marcado SHALL latir suave, sin animarse con `prefers-reduced-motion`. La etiqueta accesible de la casilla SHALL decir el estado y el costo de revivirlo. Ninguno de los dos estados SHALL depender solo del color.

#### Scenario: Árbol marcado
- WHEN empieza el mes 6 en Bosque
- THEN el árbol marcado se ve con el velo de escarcha y su etiqueta dice que se apagará al terminar el mes

#### Scenario: Árbol apagado
- WHEN un árbol se apagó
- THEN se ve con el velo fijo y un copo, y su etiqueta dice que revivirlo cuesta 7 nutrientes

### Requirement: Árbol suelto
En Bosque y Ancestral, un árbol vivo que la red no une al Hogar SHALL conservar su color y llevar la insignia `board/trees/loose-badge` en la esquina superior derecha de su casilla (0,42 de la casilla de diámetro): un disco de pergamino con un hilo de micelio dorado y vivo a un lado, gris y seco al otro y un hueco en el medio, que se lee sin color. La insignia SHALL verse a color aunque el claro esté apagado. Si la pieza no carga, se dibuja en su lugar un disco de papel con una raíz cortada (dos trazos de corteza separados, con contorno de tinta). Su etiqueta accesible SHALL decir «suelto: la red no lo une al Hogar y no da nada». Cuando la red lo une otra vez, pierde la insignia.

#### Scenario: La plaga deja un árbol suelto
- WHEN la plaga marchita la casilla que unía un árbol vivo con el Hogar
- THEN el árbol conserva su color, lleva la insignia del hilo cortado y su etiqueta dice «suelto»

#### Scenario: Se vuelve a unir
- WHEN el Lactarius teje un camino de red del Hogar al árbol suelto
- THEN el árbol pierde la insignia

### Requirement: Red cortada
En Bosque y Ancestral, las casillas de la red sin plaga que ningún camino de red une al Hogar SHALL verse apagadas: sin color, un poco más oscuras y sin la luz de la red. El árbol suelto conserva su color y su insignia, pero también pierde la luz. Su etiqueta accesible SHALL decir «red cortada: no llega al Hogar». Cuando la red las une otra vez, vuelven a su color y su luz.

#### Scenario: La plaga corta la red
- WHEN la plaga marchita la casilla que unía al Hogar el resto de la red
- THEN las casillas del otro lado se ven apagadas y su etiqueta dice «red cortada»

### Requirement: Casillas que frenan la plaga
Mientras hay casillas con plaga (tejidas o marchitas) que nadie frenó este mes, al seleccionar un miembro sus casillas válidas a 2 casillas o menos de alguna de ellas SHALL llevar un escudo de hoja en la esquina superior izquierda, con contorno de tinta para leerse sin color, y su etiqueta accesible SHALL decir «frena la plaga».

#### Scenario: Indi cerca de la plaga
- WHEN hay una casilla con plaga y el jugador selecciona a Indi
- THEN las casillas válidas a 2 o menos de la plaga llevan el escudo y su etiqueta dice «frena la plaga»
