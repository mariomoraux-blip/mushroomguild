# Tareas · 036

Antes de empezar, se responden las preguntas abiertas de `proposal.md`.

## 0. Preparación
- [x] 0.1 Respuestas de Mario a las preguntas 1–3 anotadas en `proposal.md`
- [ ] 0.2 Mario crea la base Upstash Redis desde Vercel (Storage → Marketplace) y la enlaza al proyecto (producción y preview)

## 1. Reglas (puro)
- [x] 1.1 `config.ts › LEADERBOARD` con valores calibrados (anotados en `design.md`)
- [x] 1.2 `src/rules/alias.ts`: `rollAlias`, `isValidAlias`; listas en `es.ts`; pruebas
- [x] 1.3 `src/rules/verify.ts`: `verifyResult` con cada `reason`; pruebas con una victoria real del bot, totales y tiempos alterados, semillas fuera de `level-seeds.ts`

## 2. Servidor
- [x] 2.1 `server/store.ts`: interfaz, almacén en memoria y Upstash Redis por REST (sin dependencias)
- [x] 2.2 `server/handler.ts` (las tres rutas), adaptador de Node y salida para Vercel (`scripts/build-vercel.mjs`); pruebas de handlers (mejor total, empates, 400, 422, 429, 503)
- [x] 2.3 Plugin de Vite para `/api` en desarrollo con el almacén en memoria

## 3. Cliente
- [x] 3.1 `src/leaderboard.ts`: clave del dispositivo, alias, envío pendiente y reintento; pruebas con `fetch` y `localStorage` falsos
- [x] 3.2 Store: `ui.screen` `ranking`, estado del envío; solo envían partidas desde «Nueva partida» (pregunta 3)
- [x] 3.3 Hoja «Tu nombre en el gremio»
- [x] 3.4 Carta de victoria: registrar, puesto, «Ver ranking»; carta del invierno: «Ver ranking»
- [x] 3.5 Pantalla «Ranking» y botón en la portada con saludo
- [x] 3.6 Textos en `es.ts`

## 4. Cierre
- [x] 4.1 Humo con `page.route`: registrar, jugador que vuelve, sin conexión, ranking desde la portada y victoria que no cuenta; Esc y foco de vuelta. Sin animaciones nuevas: las capas usan las de 022, que ya respetan el movimiento reducido
- [x] 4.2 Capturas a 390 × 844 y 844 × 390
- [ ] 4.3 Deploy de preview contra Redis real: que Vercel use `.vercel/output`, un envío verificado y uno alterado rechazado (necesita 0.2)
- [x] 4.4 `CLAUDE.md` (stack y «sin backend»), `openspec/project.md` (capacidad `leaderboard`) y GDD
- [ ] 4.5 Specs fusionadas y cambio archivado
