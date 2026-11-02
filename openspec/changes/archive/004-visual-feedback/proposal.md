# 004 · Sensación

## Por qué
Es lo que convierte el prototipo en pieza de portafolio: cada jugada se siente. Va al final a propósito: la sensación se ajusta sobre algo que ya funciona.

## Qué cambia
- **Animaciones por jugada (≤ 400 ms):** al tejer, el pasto de antes se desvanece y un hilo dorado crece desde la casilla vecina de la red; al descomponer, el tronco se encoge y saltan astillas; al revivir, brota un estallido de hojas y luz; al despertar al Árbol Padre, se abre un anillo de luz.
- **Esporas al contador:** al amanecer, una espora vuela desde cada árbol vivo (hasta 12) al contador del HUD, que da un saltito; con la Lluvia de esporas, desde el árbol del hechizo.
- **Partículas:** motas de luz que suben de los árboles vivos (≤ 40 en pantalla) y halo cálido que late detrás del Árbol Padre despierto.
- **Movimiento reducido:** sin animaciones, vuelos ni partículas; solo el estado final (el halo queda quieto).
- **Arte opcional:** si una pieza pintada no carga, el claro usa el dibujo vectorial (010) y un miembro sin retrato se dibuja como silueta.
- **Peso:** prueba que mide `public/assets/` (≤ 4 MB) y prueba de humo de que la partida no descarga el logo ni los fondos de intro y victoria.

## Decisión (2 de noviembre)
El atlas de sprites de Blender del plan original ya no aplica: el 010 pasó a piezas pintadas sueltas (retratos, tablero) y los sprites de Blender quedaron como fuente. `public/assets/atlas/` sigue reservado por si más adelante conviene empaquetar.

## Diseño
- `src/effects.ts` (puro, probado con Vitest): `diffEffects(antes, después)` dice qué efectos tuvo una jugada; ignora un reinicio u otro claro.
- `src/scenes/fx.ts` anima en Phaser encima del claro ya pintado (el estado final ya está dibujado por `paint.ts`); `src/ui/flyers.ts` hace volar las esporas en el DOM hasta el HUD.
- Rendimiento: un punto de luz como única textura, mezcla aditiva, sin filtros de desenfoque por cuadro, tope de 40 partículas y 12 esporas en vuelo.

## Impacto
Capacidad nueva: `visual-feedback`. Depende de 002, 003 y 010.
