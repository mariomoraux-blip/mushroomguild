# Handoff · El Gremio de los Hongos

Traspaso de la sesión en la nube (2 de noviembre de 2026) a Claude Code local. Último commit de `main` antes de este documento: `25f3bb6`.

## Estado de OpenSpec
**No hay ningún cambio en curso.** `openspec/changes/` solo contiene `archive/`. El próximo cambio que se abra sería el **016**.

Candidatos para el siguiente cambio, en orden sugerido:
1. **Recalibrar el puntaje con playtest:** medir el tiempo real por mes y los meses de victoria, y ajustar `SCORE`, `REFERENCE_SECONDS_PER_MONTH` (25 s) y los factores de `STARS` (0,9 y 1,1) en `src/rules/config.ts`. Primera tarea: definir qué se mide y con cuántas partidas.
2. **Arte pendiente:** fondos verticales nítidos (≥ 780 px de ancho) y las capas transparentes de casilla válida y seleccionada (ver Problemas conocidos).
3. **Decisiones abiertas:** Opciones (no existe hasta que haya algo que ajustar), audio, y los sistemas del referente visual (ver `docs/gdd-fase-0.md` › Ideas del referente visual).

## Cambios archivados (`openspec/changes/archive/`)
| Cambio | Qué hizo |
| --- | --- |
| 001-port-rules | Reglas en TypeScript puro (`src/rules/`), 5 especies, hechizos, bots de balance |
| 002-board-interaction | Tablero jugable en Phaser, dock, HUD, teclado, móvil primero |
| 003-story-presentation | Intro de 3 cartas, llegada de la maga, finales y el color que vuelve con el progreso |
| 004-visual-feedback | Animaciones por jugada, esporas al contador, partículas, movimiento reducido, presupuesto de assets |
| 005-guide-player | Fichas al seleccionar, pistas con ★, Libreta de campo, reclutar visible |
| 006-deepen-game | Gliophorus "Chispa" (pasar la voz), claros aleatorios justos, dificultad medida |
| 007-maga-sprite | Sprite propio de la maga (otra sesión) |
| 008-illustrate-forest | Bosque ilustrado en Canvas2D/SVG/shader; casilla ocupada |
| 009-father-tree-sprite | Árbol Padre de Blender (otra sesión) |
| 010-painted-forest | Tablero con piezas pintadas por estación; retratos pintados en todas partes |
| 011-reference-ui | HUD de pastillas, dock de medallones, fondo del bosque, bitácora en pergamino |
| 012-title-screens | Portada, "Cómo jugar" (carrusel de 5) y "El gremio" |
| 013-reference-sheets | Fichas, reclutar, hechizos y libreta con el lenguaje del referente |
| 014-rename-month-bruma | Día → mes (12 meses en 4 estaciones) y Maestra Bruna → Maestra Bruma, en textos, specs, docs, código y assets |
| 015-scoring | Cronómetro de juego activo, puntaje con desglose, estrellas por claro, `ScoreResult` rejugable, récord local; pista de reclutar nueva |

Specs vivas: `game-rules`, `board-interaction`, `player-guidance`, `story-presentation`, `title-screens`, `visual-feedback` y `scoring`.

## Decisiones de esta sesión que no están en las specs
- **Flujo de trabajo:** el dueño pidió subir todo directo a `main` ("En adelante sube todo a la rama Main"). Los cambios 003–015 se hicieron así, sin pull request. Esta regla no está en `CLAUDE.md`.
- **Numeración:** el puntaje se pidió como "005-scoring" y se renumeró a 015, porque el 005 ya existía (`005-guide-player`). El renombre a meses se separó en su propio cambio (014) y se hizo antes que el puntaje.
- **Ajustes visuales sin cambio de OpenSpec** (las specs no fijan qué pieza de arte se usa):
  - fondos nuevos de partida/portada (`fondo-claro-v2`) y victoria (`fondo-victoria-v2`), con la carta de final a un costado en apaisado;
  - estrellas de la carta de victoria con la pieza `ui/icons/star` (las no ganadas en gris).
- **Arte:** los retratos pintados reemplazan a los sprites de Blender en todo el juego (los de Blender quedan como fuente en `assets/sprites/webp/`). El Árbol Padre usa solo `asleep-painted` y `awake-painted`: sus variantes por estación se ven como un árbol vivo y se confunden con "despierto". El micelio se dibuja con la losa completa `net`/`net-b`, no con conectores.
- **Semillas:** desde el 015 el generador acepta claros con la pista de reclutar nueva, así que `?seed=N` da claros distintos de los anteriores (reproducibles desde el 015 en adelante).
- **Puntaje, observaciones de calibración** (están en el `design.md` archivado del 015, no en la spec): la velocidad cuenta dos veces ("Meses de sobra" y "Rapidez", ≈ 22 % del total); "Gremio eficiente" premia reclutar poco, y por eso el bot al azar llega a 3 estrellas en ~9 % de sus partidas; el bot con criterio saca siempre 2 estrellas (es la referencia).
- **Leaderboard futuro:** la base sería el "claro del día" (semilla por fecha del calendario, igual para todos); un servidor rejugaría el `actionLog` del `ScoreResult`. El `timeMs` no se puede verificar en el servidor.
- **Tipos de Node:** `@types/node` (dev, versión fija) solo se carga en `tests/budget.test.ts` con `/// <reference types="node" />`; `tsconfig.json` sigue con `types: ["vite/client"]` para que `src/` no use APIs de Node.

## Problemas conocidos
- **Fondos verticales blandos:** `backgrounds/menu.webp` y `victory.webp` son cortes de 527 px de ancho (para 2× a 390 px harían falta ≥ 780 px). `intro.webp` tiene 465 × 631.
- **Capas de casilla:** `board/terrain/state-valid` y `state-selected` traen el pasto horneado y no sirven como capa sobre un objeto; el brillo de casilla válida sigue siendo el trazo vectorial del 008.
- **Micelio:** falta la pieza de conector en T (los conectores están publicados pero no se usan).
- **Erratas viejas en títulos de requisitos:** "Llegada dla maga (Conocybe arcana)" en `game-rules` y "Hechizos dla maga" en `board-interaction` (dicen "dla" en vez de "de la"). Corregirlas exige un `RENAMED` en un cambio.
- **Ramas remotas viejas:** `art/bruno-personaje`, `chore/archivo-001`, `chore/cierre-002`, `chore/fase-0`, `chore/paquete-fase-0-v2`, `docs/gdd-fase-0`, `feat/001-especies` y `feat/001-port-rules` ya están contenidas en `main`; se pueden borrar.
- **Las pruebas de humo reescriben capturas:** `npm run smoke` regenera los PNG de `docs/screenshots/`, así que cada corrida deja archivos modificados en git.
- **La suite de humo tarda** unos 6–7 minutos (4 tamaños de ventana, 73 pruebas). Mientras corre, no edites `src/`: usa el servidor de desarrollo y lo recarga.
- **Mapa clásico:** con la pista nueva, el bot con criterio lo gana en el mes 11 (antes, el 10). Sigue dentro de lo que pide la spec.

## Cómo correr el proyecto
Node **22.23.4** (ver `.nvmrc`; `engines` pide ≥ 22.23.4 y < 23) y npm ≥ 10.9.

```bash
nvm use
```

```bash
npm ci
```

```bash
npm run dev
```
Abre `http://localhost:5173/`. Parámetros útiles: `?map=clasico`, `?seed=N` y, solo en desarrollo, `?debugState=fullGuild|fatherAwake|autumn|winter|mageNextMonth|nearWin|lastMonth` (ver `CLAUDE.md` › URL de la app).

```bash
npm run test
```
Vitest: 139 pruebas, incluido `balance.test.ts` (claros generados, bots, estrellas por claro).

```bash
npm run build
```
`tsc --noEmit` y build de Vite a `dist/` (ignorado por git).

```bash
npx playwright install chromium
```
Solo la primera vez en local, para descargar el navegador de las pruebas de humo.

```bash
npm run smoke
```
Playwright levanta su propio servidor de desarrollo en el puerto 4173. Para usar un Chromium ya instalado: `PW_CHROMIUM=/ruta/a/chromium npm run smoke`.

```bash
npx playwright test -g "Puntaje" --project=vertical-390x844
```
Una prueba de humo en un solo tamaño de ventana.

## Dónde leer primero
`CLAUDE.md` (reglas del repo), `openspec/project.md` (capacidades), `openspec/specs/` (fuente de verdad), `docs/art-direction.md` (arte) y `docs/prompts.md` (prompts por cambio).
