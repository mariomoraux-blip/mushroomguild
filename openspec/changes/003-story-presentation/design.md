# Diseño · 003

Plan aprobado el 2026-11-02. Desde el 008 el claro se pinta en Canvas2D y Phaser lo muestra como una imagen; el fondo de página es un shader WebGL propio (`ui/ambient.ts`).

## Luz del escenario
- `src/scenes/light.ts` (puro, sin Phaser) calcula `stageLight(game)`: estación, saturación, tinte, brillo, follaje y brillo del micelio.
- Los valores por estación viven en `theme.ts › SEASON_LIGHT`.
- Se gradúa el **escenario** con un filtro `ColorMatrix` de Phaser (saturación con luminancia Rec. 709, después tinte × brillo): uno en el contenedor del claro y otro en el sprite del Árbol Padre, que va aparte para quedar delante de la luz del micelio. El fondo vivo recibe los mismos valores como uniforms. (`Layer` no admite filtros en Phaser 4.2.)
- Orden de dibujo: claro (graduado) → luz del micelio (sin graduar) → Árbol Padre (graduado) → personajes (sin filtro). HUD, dock, fichas y cartas son DOM. Chispa cambia de tono con sus sprites por estación (006).
- El follaje vivo usa la paleta de la estación en `paint.ts` (el tinte solo no vuelve naranja el verde).
- El brillo del micelio va en una capa aparte (`paintMyceliumGlow`), encima del claro y debajo de los sprites, con mezcla aditiva y sin gradación: su alfa es el brillo de la estación (0,2 → 1,0). En invierno es lo más brillante de la escena.
- Transición de 600 ms al cambiar de estación o de saturación; con `prefers-reduced-motion`, inmediata. Sin WebGL no hay filtro: el escenario se ve sin gradación.

## Saturación
- Durante la partida: `0,15 + 0,85 × vivos / (árboles del claro + 2)`.
- Al despertar al Árbol Padre: `1` (la spec pide color pleno; la fórmula de la propuesta quedaba en 0,62 con 3 árboles).

## Cartas
- `ui.story` en el store: `intro` (página 0–2), `mage`, `won` o `lost`. Acciones `storyNext`, `storyClose` y `playAgain`.
- La intro sale la primera vez que se abre la página (`gremio.introSeen` en `localStorage`), no al pulsar «Jugar otra vez».
- La carta de la maga sale al amanecer en que llega (`mageArrived` pasa a `true`); la de victoria al despertar al Árbol Padre; la de fin del invierno cuando el estado pasa a `lost`.
- «Jugar otra vez»: claro aleatorio nuevo; con `?seed=N` o `?map=clasico`, el mismo mapa. Tras «Ver el claro», la bitácora ofrece «Jugar otra vez» como botón principal (amarillo) y «Fin del día» queda desactivado. No hay portada todavía (cambio por definir): no existe «volver al inicio».
- `src/ui/story.ts`: diálogo modal (`role="dialog"`, `aria-modal`, título y texto enlazados), el resto de la app `inert`, foco en el botón principal, Tab atrapado, Esc salta / cierra / «Ver el claro», el foco vuelve al cerrar.
- Ancho máximo 360 px con 16 px de margen, texto ≥ 16 px, botones ≥ 44 px; en horizontal la carta se desplaza por dentro.
- Fondos: `fondo-intro` (intro y fin del invierno), `fondo-victoria` (victoria); la carta de la maga va sobre el tablero con su retrato.

## Pruebas
- Solo en desarrollo: `?debugDay=N` juega siguiendo las pistas hasta el día N sin despertar al Árbol Padre; `?debugState=won|lost|mage` abre cada carta.
- Vitest: `light.test.ts` (saturación y estaciones) y transiciones de cartas en `store.test.ts`.
- Playwright: `tests/smoke/story.spec.ts` con las 6 capturas a 390 × 844 (`docs/screenshots/003-*.png`), foco, Tab, Esc y una carta a 360 px.

## Fuera de este cambio
Partículas, nieve y animaciones (004); repintar `fondo-victoria` en alta resolución.
