# visual-feedback

## Purpose
Sensación del juego: animaciones por jugada, esporas que vuelan al contador, partículas, luz de la red por estación, movimiento reducido, arte opcional y peso de la página. Origen: cambios 004 y 016 (archivados). Implementada en `src/effects.ts`, `src/scenes/fx.ts`, `src/scenes/paint.ts` (`paintMyceliumGlow`), `src/scenes/GameScene.ts`, `src/ui/flyers.ts` y `tests/budget.test.ts`.

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
- WHEN la Amanita despierta al Árbol Ancestral
- THEN un anillo de luz se abre desde el árbol y queda un halo cálido detrás de él

#### Scenario: Romper una roca
- WHEN la Morchella rompe una roca
- THEN la roca se parte en piedras que caen y queda la tierra, en menos de 400 ms

#### Scenario: Curar a distancia
- WHEN el Ganoderma revive un árbol que la red no tocaba
- THEN un hilo dorado va de la red al árbol y el árbol revive como con la Amanita

#### Scenario: Soplar esporas
- WHEN el Lycoperdon sopla esporas
- THEN una nube de esporas sale del árbol y vuela al contador de esporas

#### Scenario: Abonar el árbol
- WHEN el Lycoperdon abona un árbol
- THEN unas hojas salen del árbol y vuelan al contador de nutrientes

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
El total de assets publicados (`public/assets/`) SHALL ser de 4 MB o menos, sin contar el JavaScript del juego, y las piezas de portada, intro y victoria SHALL cargarse solo al mostrarse esas pantallas. Lo publicado SHALL ser WebP, salvo el audio (049): `.m4a` y el mapa `sfx.json` dentro de `audio/`, que se descargan solo después del primer gesto del jugador.

#### Scenario: Build de producción
- WHEN se ejecuta `npm run test`
- THEN la suma de `public/assets/` no supera 4 MB

#### Scenario: Partida directa
- WHEN se abre `?map=clasico`
- THEN no se descargan el logo ni los fondos de intro y victoria

#### Scenario: Audio diferido
- WHEN se abre el juego y nadie toca la pantalla ni el teclado
- THEN no se descarga ningún archivo de `audio/`

### Requirement: La red alumbra el invierno
La red de micelio SHALL tener su propia luz (salvo la casilla con plaga, que la pierde), encima del claro pintado y debajo del Árbol Ancestral, los retratos y las partículas, con una intensidad que crece con la estación: primavera 0,2, verano 0,4, otoño 0,65 e invierno 1,0. La saturación del progreso no SHALL afectar esa luz. Al cambiar de estación, la intensidad SHALL cambiar en 600 ms; con `prefers-reduced-motion`, de inmediato.

#### Scenario: Primavera
- WHEN empieza la partida
- THEN la luz de la red apenas se ve

#### Scenario: Invierno
- WHEN llega el mes 10
- THEN la red es lo más brillante del tablero y su luz alumbra las casillas vecinas
- AND el Árbol Ancestral y los retratos se ven encima de esa luz, con sus colores

#### Scenario: Movimiento reducido
- WHEN el sistema pide movimiento reducido y llega el mes 10
- THEN la luz de la red pasa a la intensidad de invierno sin transición

### Requirement: La plaga marchita
Cuando la plaga marchita una casilla, la plaga viva (`board/plague/blight`, o `blight-winter` en invierno) SHALL fundirse en menos de 1 s (280 ms quieta y 600 ms de fundido) sobre la red muerta (`board/plague/withered`), con un poco de polvo violeta. La red muerta se queda mientras la casilla tenga plaga; cuando los hongos la limpian, la casilla es pasto. Con `prefers-reduced-motion` no hay animación: la casilla pasa a la red muerta de inmediato.

#### Scenario: Se marchita
- WHEN termina el mes y la plaga marchita una casilla
- THEN la plaga viva se funde y deja la red muerta en la casilla

#### Scenario: Movimiento reducido
- WHEN el sistema pide movimiento reducido y la plaga marchita una casilla
- THEN la casilla pasa a la red muerta sin animación
