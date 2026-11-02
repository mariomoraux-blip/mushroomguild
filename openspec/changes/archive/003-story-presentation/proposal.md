# 003 · Historia y color

## Por qué
El pilar 2 dice que el mundo cuenta la historia. Sin intro, final ni color que vuelve, el juego es un puzzle sin emoción.

## Qué cambia
- Tres cartas de intro con "Saltar"; una carta cuando llega Maestra Bruna; dos finales (victoria y fin del invierno) con resumen, "Ver el claro" y "Jugar de nuevo".
- El claro pasa de apagado a color pleno según el progreso.

## Decisiones (2 de noviembre)
- **Sin tinte por estación:** las piezas pintadas por estación del 010 ya cuentan la estación; la gradación de color se descarta. La Gliophorus ya cambia con la estación (corona del 010).
- **Saturación:** 0,4 + 0,6 × (árboles vivos + Árbol Padre × 2) / (árboles del claro + 2). El piso del diseño original (0,15) dejaba el claro casi gris y apagaba las piezas pintadas; se subió a 0,4.
- **Sin "Ver resumen":** el resumen (día, árboles, nutrientes, esporas) ya se ve en la carta de final.
- **Cuándo hay intro:** al abrir el juego sin `?map`, `?seed` ni `?debugState`. "Jugar de nuevo" no repite la intro y usa un claro aleatorio nuevo (o el clásico con `?map=clasico`).

## Diseño
- Estado `ui.story` en el store (`intro` con paso, `mage`, `won`, `lost`). Las cartas de maga y finales las abre el store al comparar el juego antes y después de una acción; "Jugar de nuevo" recibe la partida nueva desde `main.ts` (el store no usa azar).
- Carta en el DOM (`src/ui/story.ts`): modal accesible, foco en el botón principal, Esc la cierra y el foco vuelve al juego. Fondo pintado `backgrounds/intro` o `victory` (sus `-wide` en apaisado), que se descarga solo al mostrarse la carta.
- Letrero de madera con el título, pergamino con el texto y botón principal amarillo, como el resto de la interfaz (011).
- La desaturación la pinta `paint.ts` sobre el claro (modo `saturation`), así retratos, Árbol Padre e interfaz conservan su color.
- `?debugState=mageTomorrow`, `nearWin` y `lastDay` (solo desarrollo) para llegar rápido a cada carta.

## Impacto
Capacidad nueva: `story-presentation`. Depende de 002.
