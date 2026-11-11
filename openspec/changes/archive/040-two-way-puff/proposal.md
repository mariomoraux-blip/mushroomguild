# 040 · Pompón cambia en los dos sentidos

## Por qué
Mario (11 de noviembre de 2026): el Lycoperdon debería dar las dos opciones, cambiar nutrientes por esporas y esporas por nutrientes. Hoy solo sopla esporas, así que cuando el gremio ya está completo y sobran esporas no sirve de nada.

## Qué cambia
- **Dos cambios desde un árbol vivo:** «Soplar esporas» (1 nutriente → 2 esporas, como hoy) y «Abonar el árbol» (2 esporas → 1 nutriente). Es el cambio inverso exacto: ida y vuelta no gana nada, ni aunque Chispa le pase la voz.
- **Cómo se elige:** como con Maestra Bruma. Al tocar a Pompón se abre la hoja «¿Qué cambia Pompón?» con los dos botones (cada uno deshabilitado si no alcanza); después se toca un árbol vivo.
- **Registro de acciones:** el cambio elegido viaja en la acción (`spell`), así la verificación del servidor rejuega lo mismo. `SCORE_VERSION` sube a 10: empieza la Temporada 10.
- **Pistas y bots:** la pista sugiere abonar cuando el gremio ya está completo y sobran esporas; soplar, cuando faltan esporas para reclutar, pasar la voz o curar.
- **Ficha y Libreta:** Pompón muestra dos recetas, cada una con su nombre arriba.

## Riesgos
Más nutrientes al final puede facilitar el Árbol Padre. Se mide; si un nivel sale de su rango (Bosque 55–75 %, Ancestral 10–35 %), se le muestran los números a Mario antes de ajustar.

## Impacto
- **Specs:** `game-rules` › Soplar esporas (MODIFIED); `player-guidance` › Recetas visuales (MODIFIED); `visual-feedback` › Respuesta a cada acción (MODIFIED); `leaderboard` › temporada nueva por `SCORE_VERSION` (sin cambio de requisito).
- **Código:** `src/rules/` (types, config, actions, idle, advice, autoplay, scoring, verify, level-seeds), `src/store.ts`, `src/ui/` (sheet, recipe, flyers), `src/effects.ts`, `src/copy/es.ts`.
