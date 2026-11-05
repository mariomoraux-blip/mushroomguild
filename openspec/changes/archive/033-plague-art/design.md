# Diseño · 033

- **Piezas:** la hoja trae transparencia; se corta por columnas vacías (alfa) y se exporta con `cwebp` (q 80, alfa 90) a 232 px de ancho las casillas (como `board/mycelium/net`, 226 × 234) y 96 px el ícono. Las casillas son opacas por dentro (centro crema con hilos dorados): reemplazan la pieza de la red, no van encima.
- **Suelo:** `groundKey` devuelve `BOARD_ART.plague.blight`, o `.winter` en invierno, para una casilla con `blighted`. Al estar en `BOARD_ART`, se precargan con el tablero.
- **Capa marcada:** `paintMarked(ctx, T, game, plagueArt)`: con la pieza cargada solo pinta el contorno punteado; sin ella, también el velo y las manchas del 032. La clave de repintado de `GameScene.drawMarked` incluye `plagueArt`.
- **Luz:** `paintMyceliumGlow` salta la casilla con plaga y los hilos de luz hacia ella; la clave de la capa de luz excluye esas casillas. Sin esto, la luz aditiva lavaba el centro crema.
- **Marchitarse:** `diffEffects` emite `{ kind: 'wither', at }` cuando una casilla con `blighted` sale de la red. `BoardFx.wither` pone `withered` sobre la casilla (profundidad 1), la funde (280 ms quieta y 600 ms de fundido) y suelta polvo `blight`/`stone`. `play` no corre con movimiento reducido.
- **HUD:** `.hud__plague` junto al copo, con `--art-plague` de fondo; `es.hud.season(…, plague)` agrega «con plaga».
