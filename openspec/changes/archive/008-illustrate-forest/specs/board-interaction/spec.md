# Delta · board-interaction

## MODIFIED Requirements

### Requirement: Estilo cozy
La interfaz SHALL verse como un bosque ilustrado, no como cajas planas: el HUD es un tablón de madera con una etiqueta de papel para el día y la estación, medallones festoneados con íconos ilustrados para nutrientes, esporas y árboles, y un sello de cera para la ayuda; la bitácora es papel rasgado con cinta; las tarjetas del gremio son fichas de criatura con costura y montículo de pasto; "Fin del día" es un botón redondo de madera con luna; el tablero tiene marco de madera con enredaderas; las hojas son pergamino con borde rasgado y cinta de título de puntas cortadas. Las piezas son SVG en línea y todos los colores y tipografías SHALL venir de `src/theme.ts`.

#### Scenario: Pantalla de juego
- WHEN se abre el juego a 390 × 844
- THEN el HUD muestra el tablón de madera, la etiqueta del día, los tres medallones y el sello de ayuda
- AND "Fin del día" es el botón de madera con luna
- AND el tablero pinta pradera, micelio y objetos ilustrados

## ADDED Requirements

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
