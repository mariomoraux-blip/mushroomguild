# 003 · Historia, estaciones y color

## Por qué
El pilar 2 dice que el mundo cuenta la historia. Sin intro, final ni cambio de color, el juego es un puzzle sin emoción.

## Qué cambia
- Tres cartas de intro con opción de saltar; una carta cuando llega Maese Bruma; dos finales (victoria y fin del invierno) con "Jugar otra vez".
- La Gliophorus psittacinus cambia de tono con la estación (verde, amarillo, naranja, rosa).
- El tablero pasa de desaturado a saturado según el progreso.
- La luz del escenario avanza con las estaciones: mañana (primavera), mediodía (verano), atardecer (otoño), anochecer (invierno). En invierno el micelio brilla y alumbra el claro.

## Diseño
- Un solo juego de assets; cada estación es una gradación de color (filtro de color de Phaser) solo sobre el escenario, no sobre personajes ni UI.
- Saturación = 0,15 + 0,85 × (árboles vivos + Árbol Madre × 2) / 7, combinada con la gradación de la estación.
- Brillo del micelio por estación (0,2 → 1,0) y transición de luz de 600 ms al cambiar de estación.
- Valores en `src/theme.ts`, según la tabla de `docs/art-direction.md`.
- Cartas de intro y final con estilo de papel y globo de diálogo, legibles a 360 px.

## Impacto
Capacidad nueva: `story-presentation`. Depende de 002. Sesión estimada: 1.
