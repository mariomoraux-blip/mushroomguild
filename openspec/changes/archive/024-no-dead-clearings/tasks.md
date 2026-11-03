# Tareas · 024

> Mario eligió la opción A (ver `proposal.md` › Opciones).

## 0. Diagnóstico
- [x] 0.1 Encontrar el claro del reporte: Ancestral, semilla 745, intento 0
- [x] 0.2 Recrear el estado del mes 4 y correr `playExpert`, `certify` y una búsqueda más ancha (`design.md` › Evidencia)
- [x] 0.3 Medir en toda la tabla los claros «solo por haz», los meses vacíos y la salida del Hogar

## 1. Reglas (`src/rules/`, puras)
- [x] 1.1 `idle.ts`: `noWorkThisMonth(s)` según `design.md` › Qué es un mes vacío; exportarla en `index.ts`
- [x] 1.2 Pruebas: el estado del reporte (semilla 745, Ancestral, mes 4) da `true` y `certify` sigue ganando; después de que alguien actuó da `false`; con la partida terminada da `false`; reclutar no la apaga
- [x] 1.3 Prueba de ruido: la política de las pistas en el clásico (Brote) no pasa por ningún mes vacío

## 2. Interfaz
- [x] 2.1 `es.ts`: texto del aviso de mes vacío (con N nutrientes y sin árboles vivos)
- [x] 2.2 `store.ts`: al empezar la partida, al cambiar de mes y después de reclutar, si `noWorkThisMonth`, el aviso se agrega a la bitácora en todos los niveles (sin selección, reemplaza a «elegir» o a la pista de terminar el mes, ver `design.md` › Dónde se muestra); tocar un miembro sigue mostrando su motivo
- [x] 2.3 Prueba del store (`tests/empty-month.test.ts`) y de humo (`board.spec.ts` › Mes vacío): Ancestral muestra el aviso y no dice «Pista:»

## 3. Cierre
- [x] 3.1 `npm run test` (con `balance.test.ts`) y `npm run build` sin warnings
- [x] 3.2 Captura a 390 × 844 con `?seed=745&nivel=ancestral` jugando los meses 1 a 3 del reporte (`024-mes-vacio-*.png`), 844 × 390 y teclado; restaurar `docs/screenshots` y conservar solo las capturas nuevas
- [x] 3.3 Fusionar las deltas en `openspec/specs/` y archivar el cambio
