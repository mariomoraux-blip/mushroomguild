# visual-feedback

## Purpose
Sensación del juego: animaciones por jugada, esporas que vuelan al contador, partículas, movimiento reducido, arte opcional y peso de la página. Origen: cambio 004 (archivado). Implementada en `src/effects.ts`, `src/scenes/fx.ts`, `src/ui/flyers.ts` y `tests/budget.test.ts`.

## Requirements

### Requirement: Respuesta a cada acción
Cada acción válida SHALL tener una animación de 400 ms o menos que muestre su efecto en el tablero, dibujada encima del estado final y que se limpia al terminar.

#### Scenario: Tejer
- WHEN el Lactarius indigo teje micelio
- THEN la línea de micelio crece desde la casilla vecina hacia la nueva

#### Scenario: Descomponer
- WHEN el Champiñón descompone un tronco
- THEN el tronco se encoge y desaparece con astillas en menos de 400 ms

#### Scenario: Despertar
- WHEN la Amanita despierta al Árbol Padre
- THEN un anillo de luz se abre desde el árbol y queda un halo cálido detrás de él

### Requirement: Esporas al contador
Al empezar el mes, por cada árbol vivo (hasta 12) SHALL volar una espora al contador de esporas del HUD, que da un saltito al recibirlas. Con la Lluvia de esporas, las esporas salen del árbol del hechizo.

#### Scenario: Mes nuevo con árboles vivos
- WHEN termina el mes con dos árboles vivos
- THEN dos esporas vuelan desde esos árboles hasta el contador

### Requirement: Partículas
Sobre los árboles vivos SHALL subir motas de luz suaves; nunca habrá más de 40 partículas en pantalla.

#### Scenario: Claro con vida
- WHEN hay árboles vivos en el claro
- THEN de ellos suben motas de luz de vez en cuando

### Requirement: Movimiento reducido
Con `prefers-reduced-motion: reduce`, el juego SHALL omitir animaciones, vuelos y partículas y mostrar solo el estado final.

#### Scenario: Usuario con movimiento reducido
- WHEN el sistema pide movimiento reducido y la Amanita muscaria revive un árbol
- THEN el árbol aparece vivo sin animación de brote

### Requirement: Arte opcional
El juego SHALL funcionar aunque falte una pieza pintada: el claro usa su dibujo vectorial y un miembro sin retrato se dibuja como silueta del color de su especie.

#### Scenario: Retrato ausente
- WHEN el retrato de una especie no carga
- THEN ese miembro se ve como silueta sobre su casilla y el juego sigue

### Requirement: Peso de la página
El total de assets publicados (`public/assets/`) SHALL ser de 4 MB o menos, sin contar el JavaScript del juego, y las piezas de portada, intro y victoria SHALL cargarse solo al mostrarse esas pantallas.

#### Scenario: Build de producción
- WHEN se ejecuta `npm run test`
- THEN la suma de `public/assets/` no supera 4 MB

#### Scenario: Partida directa
- WHEN se abre `?map=clasico`
- THEN no se descargan el logo ni los fondos de intro y victoria
