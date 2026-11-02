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
El dock, las fichas y el tablero SHALL usar los sprites de Blender de cada especie (`public/assets/characters/<personaje>/`: `rest`, `work`, `happy`): en el dock, el retrato en reposo; en la ficha, la pose feliz; en el tablero, la pose de trabajo sobre la casilla donde ese miembro trabajó hoy. La Gliophorus SHALL usar la variante de su estación. Maestra Bruna SHALL usar su propio sprite, más alto que el resto y sin deformarse.

#### Scenario: Trabajó hoy
- WHEN Bruno descompone un tronco
- THEN el tablero muestra a Bruno trabajando sobre ese tronco hasta el amanecer

#### Scenario: Retratos en el dock
- WHEN empieza la partida
- THEN las tarjetas de Añil, Bruno y Rubí muestran sus retratos

#### Scenario: La maga en el tablero
- WHEN Maestra Bruna lanza un hechizo
- THEN el tablero la muestra con el bastón en alto sobre la casilla del hechizo, más alta que los demás miembros

### Requirement: Estilo cozy
La interfaz SHALL verse como un bosque ilustrado, no como cajas planas: el HUD es un tablón de madera con una etiqueta de papel para el día y la estación, medallones festoneados con íconos ilustrados para nutrientes, esporas y árboles, y un sello de cera para la ayuda; la bitácora es papel rasgado con cinta; las tarjetas del gremio son fichas de criatura con costura y montículo de pasto; "Fin del día" es un botón redondo de madera con luna; el tablero tiene marco de madera con enredaderas; las hojas son pergamino con borde rasgado y cinta de título de puntas cortadas. Las piezas son SVG en línea y todos los colores y tipografías SHALL venir de `src/theme.ts`.

#### Scenario: Pantalla de juego
- WHEN se abre el juego a 390 × 844
- THEN el HUD muestra el tablón de madera, la etiqueta del día, los tres medallones y el sello de ayuda
- AND "Fin del día" es el botón de madera con luna
- AND el tablero pinta pradera, micelio y objetos ilustrados

### Requirement: Casilla ocupada
Cuando un miembro trabajó hoy en una casilla, su sprite SHALL ocupar la casilla y el objeto de abajo (tronco, árbol, roca, Hogar) no SHALL pintarse; el suelo, la red de micelio y el aura del Árbol Padre se mantienen.

#### Scenario: Hongo sobre un tronco
- WHEN Bruno descompone el tronco junto al Hogar
- THEN en esa casilla se ve a Bruno trabajando y no el tronco debajo
- AND al amanecer, cuando Bruno descansa, el tronco vuelve a verse

### Requirement: Fondo vivo
Detrás de la interfaz SHALL haber un fondo animado por shader (luz entre copas, esporas que flotan, grano de papel) que no compita con el tablero. Con `prefers-reduced-motion` SHALL quedar quieto; SHALL pausarse con la pestaña oculta; si no hay WebGL, queda el degradado de papel.

#### Scenario: Movimiento reducido
- WHEN el sistema pide movimiento reducido
- THEN el fondo pinta un solo cuadro y no se anima
