# Delta · board-interaction

## MODIFIED Requirements

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

### Requirement: Fondo vivo
Sobre el bosque pintado y detrás de la interfaz SHALL haber una capa animada por shader (esporas y luciérnagas que flotan) que no compita con el tablero. Con `prefers-reduced-motion` SHALL quedar quieta; SHALL pausarse con la pestaña oculta; si no hay WebGL, queda solo el bosque pintado.

#### Scenario: Movimiento reducido
- WHEN el sistema pide movimiento reducido
- THEN el fondo pinta un solo cuadro y no se anima
