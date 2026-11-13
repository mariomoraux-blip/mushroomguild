# 048 · «Cómo jugar» es el tutorial

## Por qué
Con el tutorial guiado (046), el carrusel «Cómo jugar» quedó repetido. Mario (13 de noviembre de 2026) pidió que «Cómo jugar» sea el tablero del tutorial, que en «Elige tu dificultad» la opción se llame «Cómo jugar» y que, una vez completado o saltado, ya no aparezca ahí.

## Decisiones de Mario
- «Cómo jugar» de la portada empieza el tutorial (siempre: así se repite).
- En «Elige tu dificultad», la primera opción se llama «Cómo jugar» y solo aparece mientras el tutorial no se haya completado ni saltado.
- El «?» del tablero abre directo la Libreta de campo; la partida sigue al cerrarla.

## Qué cambia
- Fuera el carrusel de 5 pasos y sus miniaturas (`screen.kind = 'howto'`, `howto-art.ts`, sus estilos y textos).
- `es.levels.names.tutorial` = «Cómo jugar»; sin «Recomendado» (ya no hace falta: solo aparece la primera vez).
- El paso 24 del tutorial dice que el «?» abre la Libreta.
- Saltar el tutorial vuelve a «Elige tu dificultad», ya sin «Cómo jugar» y con el foco en Brote.

## Impacto
- **Specs:** `title-screens` (Portada, Cómo jugar eliminado, Volver, Elige tu dificultad), `player-guidance` (Libreta de campo), `scoring` (Cronómetro), `tutorial` (Nivel, Saltar).
- **Código:** `src/store.ts`, `src/ui/screens.ts`, `src/ui/hud.ts`, `src/main.ts`, `src/copy/es.ts`, `src/styles.css`; se borra `src/ui/howto-art.ts`.
- **Pruebas:** `story.test.ts`, `clock.test.ts`, `advice.test.ts`, `tutorial.test.ts`, humo (Libreta, Portada, Niveles, tutorial).
