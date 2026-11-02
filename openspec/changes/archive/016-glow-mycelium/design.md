# Diseño · 016

## Capa de luz
- `src/scenes/paint.ts` › `paintMyceliumGlow(ctx, T, game)`: función pura (sin Phaser), con los colores de `theme.ts` (`mycelium`, `glow`). Pinta, recortado a las esquinas redondeadas del claro:
  - un halo radial de unas 1,05 casillas en cada casilla de la red;
  - un núcleo pequeño en el centro de las casillas de tierra; sobre árboles, troncos y la casa, la luz forma un anillo y deja el centro limpio (en la primera captura de invierno, el halo lavaba las piezas);
  - el resplandor de los hilos entre casillas vecinas, con la misma curva que `paintNet`.
- `src/scenes/GameScene.ts`: una segunda `CanvasTexture` (`micelio`) del tamaño del claro, en una imagen con `BlendModes.ADD`.
- **Profundidad 0,5:** encima del claro (0) y debajo de la cubierta de tejer (1), el hilo de tejer (2), las piezas animadas (3), el halo (3,5), el Árbol Padre (4), los retratos (5) y las partículas (6). Se redibuja cuando cambia la red o el tamaño de casilla, no en cada cuadro.
- **Alfa** = intensidad de la estación. La saturación del progreso se aplica en el canvas del claro, así que no llega a esta capa.

## Valores
- `theme.ts` › `MYCELIUM_GLOW = [0.2, 0.4, 0.65, 1]`, por índice de estación, y `LIGHT_TRANSITION_MS = 600`.
- El orden de la tabla de `docs/art-direction.md` se mantiene: apenas visible, sutil, se nota, brilla.

## Transición
- Un tween de Phaser lleva el alfa de la intensidad anterior a la nueva en 600 ms (`Sine.easeInOut`). Al cargar, o con movimiento reducido, el cambio es inmediato.
- Con la pestaña oculta, el bucle de Phaser ya se pausa, y el tween también.

## Pruebas
- **Vitest:** `MYCELIUM_GLOW` crece con las estaciones y el invierno es el máximo; `paintMyceliumGlow` solo pinta casillas de la red (prueba con un contexto falso, como las de `paint.test.ts`).
- **Playwright** (`board.spec.ts`):
  - la capa `micelio` existe, va con mezcla aditiva y su alfa es 0,2 al empezar (`?map=clasico`) y 1 con `?debugState=winter`;
  - los retratos y el Árbol Padre se dibujan encima;
  - capturas a 390 × 844 de primavera, otoño e invierno.
- **Rendimiento:** el halo se pinta en un canvas que no se redibuja en cada cuadro; la capa agrega una imagen al render, sin filtros.
