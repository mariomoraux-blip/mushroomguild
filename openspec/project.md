# Proyecto: El Gremio de los Hongos

## Propósito
Vertical slice jugable (Capítulo 1: El Claro Gris) para la sección Lab del portafolio de Mario Mora. Objetivo doble: aprender desarrollo de juegos asistido por IA y mostrar el proceso de producto completo, de concepto a código.

## Pilares de diseño
1. Cuidar, no conquistar: sin enemigos, sin derrota dura.
2. El mundo cuenta la historia: el color vuelve a medida que se revive el bosque.
3. Decisiones pequeñas, efecto en cadena: los árboles vivos alimentan el motor.

## Capacidades
| Capacidad | Qué cubre |
| --- | --- |
| `game-rules` | Tablero, especies, economía, meses y estaciones, victoria, niveles de dificultad (escarcha, árboles que se apagan) y dificultad medida |
| `board-interaction` | Selección, casillas válidas, feedback, HUD, teclado, móvil y estilo |
| `player-guidance` | Pistas con ★, fichas, Libreta de campo, reclutamiento visible |
| `story-presentation` | Cartas de intro, llegada de la maga y finales; el color que vuelve |
| `title-screens` | Portada, "Elige tu dificultad", "Cómo jugar" y "El gremio" |
| `visual-feedback` | Animaciones, partículas, luz de la red por estación, movimiento reducido, peso de la página |
| `scoring` | Cronómetro, puntaje con multiplicador del nivel, estrellas por claro, resultado verificable y récord local |

## Convenciones
- Requisitos con SHALL; escenarios con WHEN / THEN.
- IDs de cambio: `NNN-verbo-objeto` (ej. `001-port-rules`).
- Idioma de specs y textos de juego: español. Código e identificadores: inglés.

## Plataforma y estilo
- Navegador móvil en vertical primero; escritorio después. Tablero vertical de 5×8.
- Estilo ilustrado con contorno café; la luz cambia con las estaciones. Detalle en `docs/art-direction.md`.

## Restricciones
- Créditos de sesión en la nube vencen el 5 de noviembre de 2026: los cambios se ordenan para que cada uno deje algo jugable.
- Arte de personajes producido en Blender en local; el código no depende de que exista (usa placeholders).
