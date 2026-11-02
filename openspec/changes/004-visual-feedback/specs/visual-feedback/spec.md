# Delta · visual-feedback

## ADDED Requirements

### Requirement: Respuesta a cada acción
Cada acción válida SHALL tener una animación de 400 ms o menos que muestre su efecto en el tablero.

#### Scenario: Tejer
- WHEN el Lactarius indigo teje micelio
- THEN la línea de micelio crece desde la casilla vecina hacia la nueva

### Requirement: Movimiento reducido
Con `prefers-reduced-motion: reduce`, el juego SHALL omitir desplazamientos y partículas y mostrar solo el estado final.

#### Scenario: Usuario con movimiento reducido
- WHEN el sistema pide movimiento reducido y la Amanita muscaria revive un árbol
- THEN el árbol aparece vivo sin animación de brote

### Requirement: Sprites opcionales
El juego SHALL funcionar con o sin el atlas de sprites.

#### Scenario: Atlas ausente
- WHEN el atlas de `public/assets/atlas/` no existe
- THEN los personajes se dibujan con formas y no hay errores en consola

### Requirement: Peso de la página
El total de assets publicados (`public/assets/`) SHALL ser de 4 MB o menos, sin contar el JavaScript del juego, y las piezas de portada, intro y victoria SHALL cargarse solo al mostrarse esas pantallas.

#### Scenario: Build de producción
- WHEN se ejecuta `npm run build`
- THEN la suma de `public/assets/` no supera 4 MB
