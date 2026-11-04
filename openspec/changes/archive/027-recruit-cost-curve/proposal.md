# 027 · Reclutar cuesta más con cada recluta

## Por qué
Reclutar cuesta 2 esporas siempre, así que llenar el gremio sale barato y temprano. Mario pidió que cada recluta cueste más: «primer reclutado 3, segundo reclutado 5, tercer reclutado 7». Crecer el gremio pasa a ser una decisión que compite con pasar la voz (1 espora).

## Qué cambia
- **Regla:** el costo depende de cuántos miembros ya se reclutaron en la partida: el primero 3 esporas, el segundo 5 y el tercero 7. Los tres miembros iniciales no son reclutas y Maestra Bruma no se recluta ni cuenta en el cupo, así que con `MAX_GUILD = 6` hay exactamente tres reclutas posibles.
- **Reglas en código:** `RECRUIT_COSTS = [3, 5, 7]` en `config.ts` reemplaza `COST.recruit`; `recruitedCount(s)` y `recruitCost(s)` en `state.ts`; `canRecruit(s)` en `advice.ts` (cupo y esporas para el próximo).
- **Interfaz:** la hoja de reclutar dice cuánto cuesta el próximo y la curva; el medallón «Reclutar» del dock se atenúa si no alcanza y su etiqueta accesible dice el costo actual (o que el gremio está completo); el chip «esporas +» del HUD dice el costo del próximo al lector de pantalla. La pista ★ solo sugiere reclutar si alcanza para el próximo.
- **Textos:** «Cómo jugar» (paso 4) y la Libreta de campo dejan de decir «Con 2 esporas reclutas otro hongo» y dicen la curva.
- **Puntaje:** la fórmula no cambia, pero los `actionLog` guardados ya no se reproducen con los costos nuevos: `SCORE_VERSION` pasa a 3 (los récords anteriores dejan de leerse, como en el 019).

## Fuera de alcance
Otros costos y ganancias, el cupo del gremio, las recetas visuales (no muestran reclutar) y el cambio 022 (abierto).

## Impacto
- **Specs:** `game-rules` › Reclutar (MODIFIED); `player-guidance` › Cómo reclutar (MODIFIED).
- **Código:** `src/rules/config.ts`, `state.ts`, `actions.ts`, `advice.ts`; `src/ui/dock.ts`, `sheet.ts`, `hud.ts`; `src/copy/es.ts`; `src/rules/level-seeds.ts` (regenerada).
- **Docs:** `docs/gdd-fase-0.md` (tabla de economía). El GDD de Claude Docs queda por sincronizar.
- **Balance y semillas:** el generador acepta claros con la política de las pistas, así que `?seed=N` puede dar un claro distinto; la tabla de Bosque y Ancestral se regenera con `npm run certify`.
