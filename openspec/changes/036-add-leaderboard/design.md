# Diseño · 036

## Piezas
| Pieza | Dónde | Qué hace |
| --- | --- | --- |
| Verificador | `src/rules/verify.ts` (puro) | `verifyResult(result, now)` → `{ ok: true, total, stars } \| { ok: false, reason }`. Lo usan el servidor y las pruebas |
| Alias | `src/rules/alias.ts` (puro) | `rollAlias(rng)` y `isValidAlias(alias)`. Las listas de nombres viven en `src/copy/es.ts` |
| Cliente | `src/leaderboard.ts` | Clave del dispositivo, alias, envío pendiente y `fetch` a `api/`. Como `records.ts`: todo en try/catch |
| Contrato | `src/api-types.ts` | `Row`, `BoardResponse`, `ScoreResponse` y la cabecera del dispositivo, compartidos por cliente y servidor |
| Handler | `server/handler.ts` | Un handler web (Request → Response) para las tres rutas: lee el cuerpo, llama a `verify` y al almacén, responde JSON |
| Almacén | `server/store.ts` | Interfaz `LeaderboardStore` con dos implementaciones: Upstash Redis por REST con `fetch` (producción, sin dependencias) y memoria (pruebas y `npm run dev`) |
| Node y Vercel | `server/node.ts`, `server/vercel.ts`, `scripts/build-vercel.mjs` | Adaptador (req, res) → handler web; `npm run build` empaqueta la función con Vite y arma `.vercel/output` (Build Output API v3) |
| Pantalla | `src/ui/screens.ts` | `ui.screen = { kind: 'ranking', back }`. Mismo patrón que «Cómo jugar» y «El gremio»; desde una carta de final queda encima de ella (z 30 sobre 20) |
| Hoja | `src/ui/sheet.ts` | «Tu nombre en el gremio»: alias, «Otro nombre», «Registrar», «Ahora no» |

`src/rules/` sigue sin DOM, sin red y sin `Math.random` sin semilla (`alias.ts` usa `mulberry32` con la clave y un contador). `src/scenes/` no cambia.

### Por qué `server/` y no `api/`
Vercel compila cada archivo de `api/` por separado como ESM de Node, y las reglas importan sin extensión (`./config`), que Node ESM no resuelve. Por eso el servidor vive en `server/` y `npm run build` lo empaqueta con Vite en un solo `index.mjs` por ruta dentro de `.vercel/output/functions/api/<ruta>.func` (runtime `nodejs22.x`), junto a `dist/` copiado en `.vercel/output/static`. Si existe `.vercel/output`, Vercel lo usa tal cual. Se confirma en el deploy de preview (tarea 4.3).

## Identidad del dispositivo
- La primera vez que hace falta, el cliente crea `token = crypto.randomUUID()` y lo guarda en `localStorage` con su alias: `gremio.player.v1 = { token, alias }`.
- El token **nunca** va en la URL: viaja en el cuerpo del `POST` o en la cabecera `x-gremio-device`.
- El servidor guarda `sha256(token)` como id del jugador. Nadie ve el token ni el id: el ranking público solo muestra alias.
- Si `localStorage` falla, el juego no ofrece registrarse y el ranking se puede ver sin fila propia.

## Alias
- `«<nombre> del <lugar>»` o `«<nombre> de la <lugar>»`: unos 24 nombres (Bruno, Lía, Tomillo…) × 24 lugares (Musgo, Rocío, Hojarasca…) = 576 combinaciones. Las listas y el artículo de cada lugar viven en `es.ts`.
- «Otro nombre» sortea con una semilla derivada del token y un contador, así las pruebas son deterministas.
- El servidor rechaza cualquier alias que `isValidAlias` no reconozca. Dos jugadores pueden tener el mismo alias; la fila propia se distingue con «(tú)».
- Cambiar el alias (desde el ranking) actualiza la fila sin tocar el puntaje.

## API
| Método y ruta | Cuerpo / cabecera | Respuesta |
| --- | --- | --- |
| `POST /api/player` | `{ token, alias }` | `{ alias }` · 400 si el alias no es válido |
| `POST /api/scores` | `{ token, alias, result: ScoreResult }` | `{ accepted, best, rank, players }` · 422 con `reason` si no verifica · 429 si se pasa del límite |
| `GET /api/leaderboard` | `x-gremio-device` opcional | `{ season, players, top: Row[], me: Row \| null }` |

`Row = { rank, alias, total, level, stars, wonMonth, at, me }`. Todas las respuestas llevan `Cache-Control: no-store`: con el tráfico de un portafolio, la caché no compensa el riesgo de servir la fila propia de otro dispositivo.

## Verificación (`verifyResult`)
En orden; el primero que falla da el `reason`:
1. Forma: tipos, `actionLog` ≤ `LEADERBOARD.maxLog` acciones, cuerpo ≤ 64 KB.
2. `scoringVersion === SCORE_VERSION` (si no, `outdated`).
3. El claro existe: `startOf(mapId, level)` no es null; en Bosque y Ancestral, la semilla está en `level-seeds.ts`. `clasico`, `debug` y `custom` se rechazan.
4. `replay(mapId, level, actionLog)` termina en `won` y en el mismo `wonMonth`.
5. `timeMs` entre `acciones × LEADERBOARD.minMsPerAction` y `LEADERBOARD.maxTimeMs`.
6. `score(final, timeMs).total === total` y `stars(total, thresholds(start)) === stars`.

El servidor guarda **sus** números, no los del cliente. Rejugar y calibrar tarda decenas de ms (medido en el 015), bien dentro del límite de una función de Vercel.

Riesgo aceptado: alguien puede armar una partida válida fuera del juego (por ejemplo, con el bot) y reportar un tiempo bajo. Las cotas de tiempo y el límite de envíos lo hacen poco rentable; para un ranking de portafolio alcanza.

## Almacén (Upstash Redis)
- `lb:v<ver>` · ZSET: miembro = id del jugador, puntaje = mejor total.
- `pl:v<ver>:<id>` · HASH: `alias, total, level, stars, wonMonth, timeMs, at`.
- `rl:dev:<id>` y `rl:ip:<hash>` · contadores con TTL de una hora: `LEADERBOARD.rate` (propuesta: 10 por dispositivo, 30 por IP).
- Puesto = `ZCOUNT(lb, total + 1, +inf) + 1`: los empates comparten puesto.
- Un envío que no supera el mejor total responde `accepted: false` con el puesto actual; no reescribe nada.
- Variables de entorno: `KV_REST_API_URL` y `KV_REST_API_TOKEN` (las crea la integración de Vercel). Sin ellas, las funciones responden 503 y el cliente lo trata como «sin conexión».

## Desarrollo y pruebas
- `npm run dev`: un plugin de Vite (solo en `serve`, en `vite.config.ts`) monta el mismo handler en `/api` con el almacén en memoria; lo carga con `ssrLoadModule` para que la configuración no arrastre las reglas. No hace falta cuenta de Vercel para desarrollar.
- Vitest: `verify.ts` (cada `reason`, una victoria real del bot que verifica, un total alterado que no), `alias.ts`, handlers con el almacén en memoria (mejor total, empates, límite de envíos) y `leaderboard.ts` con `fetch` y `localStorage` falsos.
- Playwright (`tests/smoke/leaderboard.spec.ts`): intercepta `/api/*` con `page.route`; nunca toca el ranking real. Para ganar desde la portada, el bot con criterio despacha al store con una pausa corta entre acciones (cada carta cerrada consume su entrada del historial de forma asíncrona).

## Configuración (`config.ts › LEADERBOARD`)
`topSize: 10`, `maxLog: 200`, `minMsPerAction: 500`, `maxTimeMs: 4 h`, `maxBodyBytes: 64 KB`, `rate: 10 por dispositivo y 30 por IP por hora`.

Calibración (10 de noviembre): una partida tiene a lo sumo unas 100 acciones registradas (12 meses × 7 miembros + 12 fines de mes + 3 reclutas); el bot con criterio gana con 38–60. `maxLog` deja el doble de holgura. Cada acción registrada pide al menos un toque y actuar pide dos; 500 ms por acción da un piso de 20–30 s por partida, por debajo de una partida humana rápida (el bot jugando con 650 ms por acción terminó en 25–32 s). El componente de rapidez del puntaje sigue siendo falsificable dentro de esas cotas (riesgo aceptado).

## Textos (borrador, en `es.ts › leaderboard`)
- Portada: «Ranking»; saludo «Hola de nuevo, Bruno del Musgo».
- Hoja: «Tu nombre en el gremio» · «Otro nombre» · «Registrar» · «Ahora no».
- Carta: «Registra tu puntaje» · «Puesto 12 de 340» · «Tu mejor: 3240» · «Ver ranking».
- Pantalla: «Ranking · Temporada 8» · «(tú)» · «Cambiar nombre» · «Aún no hay puntajes. ¡Sé el primero!».
- Sin conexión: «No pudimos llegar al bosque. Tu puntaje quedó guardado y lo enviaremos después.»
- Privacidad: «Guardamos tu nombre del gremio y tus puntajes. Nada más.»

## Móvil y accesibilidad
- La pantalla no hace scroll de página a 390 × 844, 390 × 664 ni 844 × 390: la lista se desplaza dentro de su panel.
- Filas ≥ 44 px; la tabla es una `<ol>` con el puesto en el nombre accesible («Puesto 3, Lía del Rocío, 3240 puntos, Bosque, 2 de 3 estrellas»).
- El resultado del envío se anuncia una vez con `aria-live="polite"`.
- Sin animaciones nuevas fuera de los tokens `MOTION`; con movimiento reducido, todo aparece sin desplazarse.
- Sin assets nuevos: los íconos de nivel y estrellas ya existen.
