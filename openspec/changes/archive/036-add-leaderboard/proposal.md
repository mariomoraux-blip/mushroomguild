# 036 · Ranking del gremio

## Por qué
Mario pidió el 10 de noviembre de 2026 un leaderboard: que los jugadores registren sus puntajes, que el juego reconozca el dispositivo y a los jugadores que vuelven, y que el ranking se vea al terminar la partida y desde la portada. El 015 dejó listo el `ScoreResult` verificable (con su `actionLog`) justo para esto.

Decisiones de Mario (10 de noviembre):
- **Ranking global** en el mismo proyecto de Vercel: funciones en `api/` y Upstash Redis. El servidor rejuega el `actionLog` antes de aceptar un puntaje.
- **Una tabla general:** cada jugador aparece una vez, con su mejor total (ya multiplicado por el nivel).
- **Alias generado:** el juego propone un nombre cozy («Bruno del Musgo») que se puede volver a sortear. Sin texto libre, sin moderación.
- **Reconocer por dispositivo:** una clave anónima guardada en el navegador. Si se borran los datos o se cambia de teléfono, es un jugador nuevo.

## Qué cambia
- **Registro:** la primera victoria ofrece «Registra tu puntaje»: una hoja con el alias propuesto, «Otro nombre» y «Registrar». El dispositivo guarda su clave y su alias.
- **Jugador que vuelve:** la portada y la carta de victoria lo saludan por su alias, y sus victorias se envían solas (ver pregunta 2).
- **Verificación:** `POST /api/scores` rejuega la partida con `src/rules` (las mismas reglas del cliente), recalcula total y estrellas y acota el tiempo. Solo guarda el mejor total de cada jugador.
- **Pantalla «Ranking»:** los 10 primeros (puesto, alias, total, nivel y estrellas), la fila propia resaltada y fijada abajo si queda fuera, y «Cambiar nombre». Se abre desde la portada y desde las cartas de final.
- **Carta de victoria:** además de lo que ya muestra, el puesto («Puesto 12 de 340») y «Ver ranking». La carta del invierno solo gana «Ver ranking».
- **Sin conexión:** el juego sigue completo. El envío queda pendiente en el dispositivo y se reintenta al abrir el ranking o al ganar otra vez.

## Preguntas abiertas
Mario aprobó las tres propuestas el 10 de noviembre de 2026: un ranking por `SCORE_VERSION`, envío automático tras registrarse y solo cuentan las partidas que empiezan desde «Nueva partida».

1. **Temporadas.** Cuando sube `SCORE_VERSION`, las partidas viejas ya no se pueden rejugar ni comparar. Propuesta: cada versión abre un ranking nuevo («Temporada 8») y el anterior deja de mostrarse.
2. **Envío automático.** Propuesta: tras registrarse, cada victoria se envía sola (solo cuenta si supera su mejor total). Alternativa: botón «Registrar» en cada victoria.
3. **Qué partidas cuentan.** Propuesta: solo las que empiezan desde «Nueva partida». `?seed`, `?nivel` y `?map=clasico` no envían (permiten repetir un claro conocido y las pruebas de humo los usan); `?debugState` nunca.

## Fuera de alcance
Cuentas, contraseñas, correo, recuperar el alias en otro dispositivo, nombres escritos a mano, rankings por nivel o por claro, amigos, compartir en redes y verificar el tiempo de forma segura (el `timeMs` lo sigue reportando el cliente; el servidor solo lo acota).

## Impacto
- **Specs:** capacidad nueva `leaderboard`. `scoring` › Mejor resultado local (MODIFIED: ya hay red, el récord local no cambia), `story-presentation` › Finales (MODIFIED) y `title-screens` › Portada (MODIFIED).
- **Arquitectura:** primera pieza de servidor. `CLAUDE.md` y `openspec/project.md` dejan de decir «sin backend» sin matices: el sitio sigue siendo estático y `server/` solo tiene la API del ranking, que se publica como funciones de Vercel en `/api`.
- **Código:** `server/` y `scripts/build-vercel.mjs` (nuevos), `src/rules/verify.ts` y `src/rules/alias.ts` (puros), `src/api-types.ts`, `src/leaderboard.ts` (cliente), `src/store.ts`, `src/main.ts`, `src/ui/screens.ts`, `src/ui/story.ts`, `src/ui/sheet.ts`, `src/copy/es.ts`, `src/rules/config.ts`, `src/styles.css`, `vite.config.ts`, `package.json` (`build`), `tsconfig.json`, `.gitignore`.
- **Operación:** una base Upstash Redis enlazada al proyecto de Vercel (plan gratis) y sus variables de entorno. Mario la crea; el código no guarda secretos.
- **Privacidad:** el servidor guarda alias, puntaje, nivel, fecha y el hash de la clave del dispositivo. La IP solo se usa, con hash y sal, para limitar envíos durante una hora.
- Depende de 015 (resultado verificable), 019 (niveles) y 035 (reglas vigentes). No toca el 022, que sigue abierto.
