# 004 · Sensación y arte final

## Por qué
Es lo que convierte el prototipo en pieza de portafolio. Va al final a propósito: la sensación se ajusta sobre algo que ya funciona, y depende de los sprites de Blender.

## Qué cambia
- Animaciones: el micelio crece al tejer, el tronco se encoge al descomponer, el árbol brota al revivir, las esporas vuelan al contador al amanecer.
- Partículas de esporas sobre árboles vivos y halo del Árbol Madre al despertar.
- Sprites de los tres hongos y del Árbol Madre desde Blender (atlas en `public/assets/`), con fallback a formas si no existen.
- Movimiento reducido: sin animaciones de desplazamiento ni partículas, solo cambios de estado.

## Flujo de arte (en local, no en esta sesión)
Hoja de personaje por especie → Blender MCP (low-poly, toon de 2–3 bandas, contorno café) → render ortográfico a ¾, fondo transparente, ~128 px → atlas → commit a `public/assets/`. Primero un personaje para validar legibilidad a 56 px en un teléfono real. Estilo y siluetas: `docs/art-direction.md`.

## Rendimiento en móvil
Partículas limitadas (≤ 40 en pantalla), sin filtros de desenfoque por cuadro, 60 fps en Android de gama media.

## Impacto
Capacidad nueva: `visual-feedback`. Depende de 002 y 003. Es lo primero que se recorta si faltan créditos.
