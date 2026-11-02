# Delta · board-interaction

## ADDED Requirements

### Requirement: Selección de miembro
Al seleccionar un miembro disponible, la interfaz SHALL resaltar solo las casillas donde su acción es válida.

#### Scenario: Ostra al inicio
- WHEN el jugador selecciona a la Ostra en el día 1
- THEN se resaltan las tierras adyacentes al Hogar y ninguna otra casilla

#### Scenario: Deseleccionar
- WHEN el jugador vuelve a tocar al miembro seleccionado o pulsa Esc
- THEN no queda ningún miembro seleccionado ni casilla resaltada

### Requirement: Feedback de acción inválida
La interfaz SHALL mostrar en la bitácora el motivo exacto que devuelve `check()` cuando una acción no es posible.

#### Scenario: Sin trabajo disponible
- WHEN se selecciona un Champiñón y no hay troncos junto a la red
- THEN la bitácora dice que no hay troncos junto a la red y sugiere tejer hacia uno

### Requirement: Estado visible
El HUD SHALL mostrar en todo momento día (de 12), estación, nutrientes, esporas y árboles vivos (de 5).

#### Scenario: Tras una acción
- WHEN el Champiñón descompone un tronco
- THEN el HUD muestra los nutrientes actualizados sin recargar la página

### Requirement: Accesibilidad básica
Todo lo que se hace con el puntero SHALL poder hacerse con teclado, y el foco SHALL ser visible.

#### Scenario: Jugar con teclado
- WHEN el jugador usa solo Tab, Enter y Esc
- THEN puede seleccionar un miembro, actuar sobre una casilla y terminar el día

### Requirement: Móvil primero
El juego SHALL ser jugable de principio a fin en un navegador de teléfono en vertical, con el tablero completo visible y sin scroll de página.

#### Scenario: Teléfono en vertical
- WHEN la ventana mide 390 × 844
- THEN el HUD está arriba, el tablero de 5×8 completo al centro con casillas de al menos 64 px, y el dock del gremio abajo
- AND la página no se desplaza al tocar el tablero

#### Scenario: Teléfono en horizontal
- WHEN la ventana mide 844 × 390
- THEN el tablero queda a la izquierda y el dock a la derecha, ambos completos

#### Scenario: Escritorio
- WHEN la ventana mide 1280 × 800
- THEN el mismo layout se centra con más espacio, sin estirar las casillas más de 96 px

### Requirement: Objetivos táctiles
Todo control interactivo SHALL medir al menos 44 × 44 px y no SHALL depender de hover ni de gestos largos.

#### Scenario: Tocar un miembro con el pulgar
- WHEN el jugador toca la tarjeta de un miembro en el dock
- THEN el miembro queda seleccionado sin zoom de la página
