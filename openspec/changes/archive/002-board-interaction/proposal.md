# 002 · Tablero jugable en Phaser

## Por qué
Con las reglas probadas (001), el siguiente paso es la primera versión jugable de principio a fin en Phaser, con formas simples como placeholders.

## Qué cambia
- `GameScene` dibuja el tablero, la red, los troncos, árboles, rocas, el Hogar y el Árbol Padre.
- Panel del gremio, reclutamiento, botón de terminar el día y bitácora.
- HUD con día, estación, nutrientes, esporas y árboles vivos.
- Flujo de selección: miembro → casillas válidas resaltadas → acción.
- Layout móvil primero: HUD arriba, tablero vertical de 5×8 al centro, dock del gremio abajo. Horizontal y escritorio como variantes.
- Teclado en escritorio.

## Diseño
- La UI de paneles (gremio, HUD, bitácora) va en DOM sobre el canvas, no dentro de Phaser: es texto accesible y responsive gratis. Phaser dibuja solo el tablero.
- Un `store` mínimo (estado + suscriptores) conecta reglas, canvas y DOM. Toda acción pasa por `rules`.
- Las posiciones del tablero salen de una función `tileToScreen()`; el tablero escala para caber en el alto y ancho visibles (`100dvh` menos HUD y dock).
- Phaser con `Scale.FIT`, `resolution` = min(devicePixelRatio, 2), entrada táctil y de puntero unificada, `touch-action: manipulation` en el canvas.
- Estilo de los paneles DOM según `docs/art-direction.md` (libreta de campo), con placeholders de color mientras llega el arte.

## Fuera de alcance
Intro, finales, animaciones, sprites finales.

## Impacto
Capacidad nueva: `board-interaction`. Depende de 001. Sesión estimada: 1.
