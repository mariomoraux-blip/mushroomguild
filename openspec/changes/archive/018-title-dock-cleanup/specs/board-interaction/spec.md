## MODIFIED Requirements

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
