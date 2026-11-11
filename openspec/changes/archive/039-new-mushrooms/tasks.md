# Tareas · 039

## 1. Reglas
- [x] 1.1 Especies nuevas en `types.ts` y `config.ts` (`RECRUITABLE`, costos, `HEAL_REACH`); reclutar una de cada especie.
- [x] 1.2 Acciones: romper rocas (Morchella), curar a distancia y limpiar plaga (Ganoderma), soplar esporas (Lycoperdon); `idle.ts`.
- [x] 1.3 Variedad del puntaje: todas las especies del gremio; `SCORE_VERSION = 9`.

## 2. Bots y balance
- [x] 2.1 Pista y bots usan las especies nuevas; orden de reclutar de la pista medido.
- [x] 2.2 Medir Brote, Bosque y Ancestral; si un nivel sale de su rango, mostrarle los números a Mario antes de ajustar. Mario eligió ensanchar los rangos (Bosque 55–75 %, Ancestral 10–35 %).
- [x] 2.3 Regenerar `level-seeds.ts` (`npm run certify`).

## 3. Textos e interfaz
- [x] 3.1 `es.ts`: especies, roles, fichas, rechazos, bitácora, ayuda de casillas, Libreta y «Cómo jugar».
- [x] 3.2 Dock, hoja de reclutar, recetas, «El gremio», siluetas y sombreros con tokens nuevos; efectos `crumble`, `thread` y `cleanse` (el soplo reutiliza el de esporas); retratos de Mario en `characters/{panal,ambar,pompon}`.

## 4. Pruebas
- [x] 4.1 `rules.test.ts`, `scoring.test.ts`, `advice.test.ts`, `recipe.test.ts`, `effects.test.ts`, `store.test.ts` (las especies nuevas, en `mushrooms.test.ts`).
- [x] 4.2 `npm run test`, `npm run build` y Playwright; captura `docs/screenshots/039-*-390x844.png`.

## 5. Cierre
- [x] 5.1 GDD local y `docs/art-direction.md` (piezas pendientes de las especies nuevas).
- [x] 5.2 Fusionar deltas y archivar.
