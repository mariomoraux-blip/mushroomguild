# Delta · board-interaction

## MODIFIED Requirements

### Requirement: Estilo cozy
La pantalla de juego SHALL seguir el lenguaje del referente "Bosque pintado": el tablero va sobre un bosque pintado (vertical en teléfono, apaisado en horizontal y escritorio); el HUD es una barra con la pastilla verde del día y el ícono de la estación, pastillas de crema con ícono pintado, valor y etiqueta para nutrientes, esporas y árboles, y el botón amarillo de ayuda; la bitácora es un pergamino con el libro de campo; el dock es una fila de medallones de madera con el retrato, el nombre en una cinta y una insignia (★ sugerido, Zz descansa), más el medallón de reclutar; "Fin del día" es una píldora amarilla con la luna; el tablero tiene marco de raíces trenzadas; las hojas (ficha, reclutar, hechizos, Libreta de campo) son pergamino redondeado con letrero de madera, botón redondo de cerrar y retratos en medallón. Las piezas pintadas vienen de `public/assets/`, sus rutas las arma `src/theme.ts`, y todos los colores y tipografías SHALL venir de `src/theme.ts`. El juego no SHALL mostrar sistemas que las reglas no tienen (misiones, moneda, potenciadores).

#### Scenario: Pantalla de juego
- WHEN se abre el juego a 390 × 844
- THEN detrás del tablero se ve el bosque pintado
- AND el HUD muestra la pastilla verde del día, las tres pastillas con ícono y el botón de ayuda
- AND el dock muestra los medallones del gremio y la píldora amarilla "Fin del día"

#### Scenario: Miembro que descansa
- WHEN un miembro ya trabajó hoy
- THEN su medallón se ve apagado y lleva la insignia Zz
