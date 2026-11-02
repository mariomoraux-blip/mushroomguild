# 007 · Maestra Bruna con sprite

## Por qué
Maestra Bruna ya tiene modelo en Blender (`assets/blender/mago-bruma.blend`) y renders, pero el juego seguía mostrando la silueta de cono que 006 dejó como placeholder.

## Qué cambia
- **Sprites de la maga** en `public/assets/characters/`: `mago-reposo.png`, `mago-trabajando.png` (el render "hechizo": bastón en alto y espora brillando) y `mago-feliz.png`.
- **Lienzo más alto:** 176 × 160 px en vez de 176 × 128, a la misma escala (100 px/m) y con el suelo a la misma distancia del borde inferior. En el tablero cada sprite toma su alto de la textura, así la maga se ve más alta sin deformarse; en el dock el retrato tiene alto fijo y la maga se ajusta a la tarjeta.

## Fuera de alcance
Reglas, balance y textos: no cambian.

## Impacto
Modifica `board-interaction` (Retratos del gremio).
