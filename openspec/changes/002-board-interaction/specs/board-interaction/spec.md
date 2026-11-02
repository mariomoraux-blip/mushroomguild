# Delta · board-interaction

## ADDED Requirements

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
| Gliophorus psittacinus | Menos esporas que el costo de pasar la voz | "faltan esporas: pasar la voz cuesta 2." |
| Gliophorus psittacinus | No hay árboles vivos | "no hay árboles vivos todavía." |
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
- WHEN se selecciona a Perica con 1 espora y árboles vivos
- THEN la bitácora dice "Perica: faltan esporas: pasar la voz cuesta 2."

#### Scenario: Sin trabajo disponible (Maestra Bruna)
- WHEN se selecciona a Maestra Bruna después de que ya lanzó un hechizo esta estación
- THEN la bitácora dice "Maestra Bruna: su magia vuelve con la próxima estación."

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
