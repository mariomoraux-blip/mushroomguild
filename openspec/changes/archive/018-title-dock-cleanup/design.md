# Diseño · 018

- **Dock:** `.dock__rail` envuelve a `.dock__cards` (el scroll) y a dos flechas `.dock__more` (decorativas, `aria-hidden`, sin eventos: no son controles y no necesitan 44 px). Al cambiar el tamaño o la cantidad de tarjetas, `fit()` calcula cuántas tarjetas enteras caben y reparte el sobrante en `--dock-gap`; con `scroll-snap-type: x mandatory` cada parada cae en una tarjeta. A la última se le suma el margen que falte para que el final también sea una parada entera. `data-more` (`start`, `end`) se actualiza con el scroll.
- **Relleno de 4 px** en el carril: el aro de madera del medallón sobresale 3 px del ancho de la tarjeta.
- **Logo:** recorte por el canal alfa de la hoja (hasta la primera fila vacía sobre los fondos) con 4 px de margen; WebP con alfa sin pérdida.
