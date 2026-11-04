# Tareas · 027

- [x] 1.1 /autoplan: comprobar `MAX_GUILD`, `STARTING_GUILD` y `recruitableCount` (3 reclutas posibles; iniciales y maga no cuentan), plan y decisiones
- [x] 1.2 Reglas: `RECRUIT_COSTS` en `config.ts` (sale `COST.recruit`), `recruitedCount` y `recruitCost` en `state.ts`, `recruit()` cobra el costo del próximo, `canRecruit` en `advice.ts`
- [x] 1.3 UI: dock (atenuado y aria-label con el costo actual), hoja de reclutar (costo del próximo y la curva), HUD (aria del chip de esporas)
- [x] 1.4 Textos en `src/copy/es.ts`: «Cómo jugar», Libreta, hoja, dock y HUD, todo desde `RECRUIT_COSTS`
- [x] 1.5 `SCORE_VERSION` 2 → 3 y tabla de economía del GDD local
- [x] 2.1 Pruebas: curva 3/5/7, rechazo con el costo del próximo, maga e iniciales no cuentan, pista con y sin esporas para el próximo, textos; claro del reporte 024 fijo en `empty-month.test.ts`
- [x] 2.2 Balance (`balance.test.ts`) y `npm run certify` (tabla de Bosque y Ancestral)

  | Medida | Antes (2 fijo) | Después (3, 5, 7) |
  | --- | --- | --- |
  | Brote · pistas (100 claros) | 100 %, mes medio 9,0 | 100 %, mes medio 8,9 |
  | Brote · bot al azar | 15,9 % | 12,3 % |
  | Clásico · pistas | gana el mes 11 | gana el mes 10 |
  | Bosque · pistas / azar | 83 % / 6,9 % | 84 % / 8,1 % |
  | Ancestral · pistas / azar | 50 % / 4,1 % | 48 % / 3,7 % |
  | Ancestral · generar un claro (máx.) | 19,1 ms | 54,4 ms (límite 75) |

  `npm run certify`: Bosque cambia el intento de rocas en 50 de 1001 semillas (sigue sin claros descartados); Ancestral en 154 (de 3 descartados a 2). Las semillas 1–100 siguen certificadas en los dos niveles. `?seed=N` puede dar otro claro que antes (el generador juega con la pista nueva).
- [x] 2.3 Definición de terminado: `npm run test`, `npm run build`, `npx playwright test`; captura de la hoja de reclutar a 390 × 844 (`docs/screenshots/027-reclutar-390x844.png`); 207 pruebas de Vitest y 117 de humo en los 4 tamaños
- [x] 2.4 Fusionar las deltas en `openspec/specs/` y archivar el cambio
