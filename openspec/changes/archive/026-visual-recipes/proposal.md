# 026 · Recetas visuales de cada hongo

## Por qué
Las instrucciones explican qué hace cada hongo solo con texto. «Cómo usarlo» en la ficha y la lista del gremio en la Libreta de campo dicen «toca un tronco resaltado que toque la red», pero el jugador tiene que imaginar cómo se ve eso en el tablero. Mario pidió referencias visuales de lo que hace cada uno.

## Qué cambia
- **Receta visual:** una tira «antes → después» hecha con las mismas piezas del tablero. Muestra la red y la casilla resaltada donde trabaja el hongo; después, cómo queda, y una pastilla con lo que gana o gasta (`+2` nutrientes, `−3`, `−1` espora). Los números salen de `COST` y `GAIN`, así que no se desfasan de las reglas.
  - Indi: tierra junto a la red → red (−1 nutriente; −2 con escarcha no se muestra, lo dice el texto).
  - Bruno: tronco junto a la red → tronco usado (+2 nutrientes).
  - Rubí: árbol gris junto a la red → árbol vivo (−3 nutrientes).
  - Chispa: compañero cansado (Zz) → compañero listo (−1 espora).
  - Maestra Bruma: dos recetas con el nombre del hechizo arriba: Brote arcano (roca junto a la red → red) y Lluvia de esporas (árbol vivo → +esporas y +nutrientes).
- **Ficha:** la sección «Cómo usarlo» lleva la receta de su especie arriba del texto.
- **Libreta de campo:** la lista del gremio pasa a ser las cinco recetas, cada una con retrato, nombre, qué hace y su tira.
- **Movimiento:** al abrir la ficha o la Libreta, el «después» aparece una sola vez (tokens de 022: `standard`, `springy`). Con movimiento reducido, la receta queda quieta.

## Decisiones de Mario (4 de noviembre)
- Las cinco recetas juntas van en la Libreta de campo; cada ficha lleva la suya en «Cómo usarlo». «Cómo jugar» se queda en 5 pasos.
- Las recetas se animan una vez.

## Fuera de alcance
Reglas, costos y arte nuevo: todo sale de piezas que ya existen en `public/assets/`. «Cómo jugar», «El gremio» y la ficha que se abre al seleccionar no cambian de comportamiento.

## Impacto
- **Spec:** `player-guidance` › Libreta de campo (MODIFIED) y Recetas visuales (ADDED). No toca «Ficha al seleccionar un hongo», que modifica el 022 (abierto).
- **Código:** `src/ui/recipe.ts` (nuevo), `src/ui/sheet.ts`, `src/copy/es.ts` (etiquetas accesibles), `src/styles.css`, `src/theme.ts` (claves de arte de las recetas).
- **Pruebas:** unitaria de las recetas (números de `COST` y `GAIN`) y humo de ficha y Libreta.
