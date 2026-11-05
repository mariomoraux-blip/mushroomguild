# 033 · Arte de la plaga

## Por qué
El 5 de noviembre de 2026 Mario entregó las piezas pintadas de la plaga de Ancestral (032), en una hoja con cuatro piezas: la casilla marcada, la red muerta, la hoja podrida y la casilla marcada con nieve. Reemplazan el velo violeta dibujado en código.

## Qué cambia
- **Casilla con plaga:** se pinta con `board/plague/blight` (otoño) o `blight-winter` (invierno) en vez de la red. Pierde la luz de la red y conserva el contorno punteado que late. Si la pieza no carga, vuelve el velo violeta con manchas.
- **Se marchita:** `board/plague/withered` se ve un momento y se funde hasta dejar el pasto. Con movimiento reducido no hay animación.
- **HUD:** la hoja podrida (`ui/icons/plague`) aparece junto a la estación mientras hay una casilla marcada, y la etiqueta accesible dice «con plaga».
- **Piezas:** cortadas de la hoja (`assets/ui/source/hoja-plaga.webp`), con la transparencia de la hoja y exportadas a 232 px de ancho (las casillas) y 96 px (el ícono). 22 + 22 + 22 + 4 KB.
- **Dirección de arte:** la lista «Piezas de la plaga» pasa a «Listo» y se agrega al inventario.

## Fuera de alcance
Reglas de la plaga (sin cambios) y el cambio 022.

## Impacto
- **Specs:** `player-guidance` › Avisos de la presión; `board-interaction` › Estado visible; `visual-feedback` › La red alumbra el invierno (MODIFIED) y La plaga marchita (ADDED).
- **Código:** `src/theme.ts`, `src/scenes/paint.ts`, `GameScene.ts`, `fx.ts`, `src/effects.ts`, `src/ui/hud.ts`, `src/styles.css`, `src/copy/es.ts`.
- **Assets:** `public/assets/board/plague/` (3), `public/assets/ui/icons/plague.webp`; fuente en `assets/ui/source/hoja-plaga.webp`.
