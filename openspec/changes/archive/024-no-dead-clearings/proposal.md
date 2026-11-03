# 024 · Claros sin callejones: el caso del mes 4 en Ancestral

> **Estado: aprobado e implementado.** Mario eligió **solo A** (2 de noviembre de 2026). B, C, D y E quedan fuera.

## Por qué
Reporte de producción (mushroomguild.vercel.app, sin `?seed`): Mes 4/12, 2 nutrientes, 2 esporas, 1/7 árboles, bitácora «Añil: no hay tierra junto a la red». El jugador sintió que se había quedado sin opciones.

**El claro es Ancestral, semilla 745** (está en `LEVEL_SEEDS`, intento 0). Se encontró recorriendo la tabla y se recreó el estado con un estado de prueba. Lo que dice el solver (detalle en `design.md`):

1. **No estaba perdido.** Desde ese estado, `certify` gana en el mes 9 y una búsqueda más ancha también gana si se termina el mes sin reclutar (en el mes 11).
2. **El jugador no se encerró.** Sus jugadas de los meses 1 a 3 son **idénticas** a la línea ganadora del propio certificador. En el mes 4 nadie del gremio tiene ninguna casilla válida: es un **mes vacío** forzado por el mapa. Toca esperar la hojarasca para revivir (3,5).
3. **El mapa sí es muy estrecho.** Las 4 rocas de Ancestral, (0,5), (0,6), (0,7) y (1,7), cierran la salida por la izquierda que el claro de Brote tenía abierta. Desde el Hogar solo se sale reviviendo dos árboles seguidos, (4,5) y (3,5). Ninguna de las 5 variantes del bot experto lo gana: solo la búsqueda por haz encuentra la línea. Si el jugador recluta la Mensajera con esas 2 esporas, ni una búsqueda de 24 variantes y 150 estados por mes encuentra victoria.
4. **No es un caso aislado.** En la tabla, el **25,5 % de los claros de Ancestral** (254 de 997) y el 6,3 % de Bosque (63 de 1000) se certifican solo por la búsqueda por haz. Unos 11 claros de Ancestral y 8 de Bosque tienen un mes vacío en su línea ganadora.
5. **Ancestral no avisa.** En Brote y Bosque la pista ya dice «Nadie más puede trabajar este mes. Pulsa «Fin del mes»…». En Ancestral no hay pistas, así que solo se ve el motivo de un miembro y parece un callejón.

En resumen, el generador no produjo una partida imposible. Produjo una partida ganable por un camino muy estrecho y, en el momento clave, el juego no dijo que la jugada correcta era esperar.

## Opciones (Mario elige; se pueden combinar)

| | Qué cambia | Arregla este reporte | Costo | Efectos |
| --- | --- | --- | --- | --- |
| **A. Aviso de mes vacío** (recomendada) | Si al empezar el mes (o después de reclutar) ningún miembro listo tiene una casilla válida, la bitácora lo dice en todos los niveles, también en Ancestral, porque es estado y no pista, igual que los avisos de la presión. | Sí: es justo lo que vio el jugador. | S: `noWorkThisMonth(s)` puro en `rules/idle.ts`, el store, una línea en `es.ts`, la delta de `player-guidance` y pruebas. | No cambia mapas, semillas, puntajes ni balance. |
| **B. Certificador con margen** | Bosque y Ancestral aceptan solo los claros que gana alguna variante del bot experto (`playExpert`), no solo la búsqueda por haz. | Sí, a futuro: la semilla 745 deja de ofrecerse. | M: un cambio en `mapgen`/prueba de la tabla, `npm run certify` y **rebalancear**. | Se van 254 claros de Ancestral y 63 de Bosque. La política de las pistas pasaría a ganar ~73 % en Ancestral (la spec pide 40–60 %) y ~90 % en Bosque (75–90 %), así que hay que subir la presión o cambiar las metas: otra decisión de balance. |
| **C. Salida abierta desde el Hogar** | Las rocas del nivel no pueden dejar menos de 4 casillas de tierra o tronco alcanzables desde el Hogar sin pasar por árboles. | Sí para la 745. | S–M: regla en `levelAttempt`, `npm run certify`. | Ataca un síntoma: de 44 claros de Ancestral con salida ≤ 3, solo 4 son «solo por haz». No toca los otros 250. |
| **D. Detectar derrota segura** | Si la partida ya no se puede ganar, avisar y ofrecer empezar de nuevo. | No: este estado era ganable. | M–L: exacto solo para el bloqueo total (sin árboles vivos, sin troncos alcanzables, sin nutrientes para nada). El resto pide el solver en el teléfono (~150 ms en Node, y `null` no prueba la derrota). | Riesgo de decir «perdiste» sin estar seguros. |
| **E. Regla anti-encierro** | Impedir jugadas que llevan a callejones. | No: el jugador no se encerró. | M, y cambia el juego. | Sin evidencia a favor. |

**Recomendación:** A en este cambio. B solo si Ancestral no debe tener claros que únicamente gana una búsqueda; en ese caso conviene un cambio aparte (025) con su propio rebalanceo, porque mueve las metas de `game-rules` › Dificultad medida.

## Qué cambia (con A)
- **Aviso de mes vacío:** cuando hay miembros listos y ninguno tiene una casilla válida, y en este mes todavía nadie actuó, la bitácora dice «Nadie tiene trabajo este mes. Termina el mes: la hojarasca traerá N nutrientes.» (con 0 árboles vivos: «Nadie tiene trabajo este mes. Termina el mes.»). Sale en todos los niveles. En Brote y Bosque reemplaza la pista de terminar el mes solo en ese caso.
- **Prueba de regresión** con el estado del reporte: semilla 745 en Ancestral, mes 4. El aviso aparece y `certify` sigue ganando.

## Fuera de alcance
- Cambiar la tabla de semillas o el balance (eso es B).
- Resaltar o animar «Fin del mes» (lo puede pedir 022 › movimiento si hace falta).
- Recomendar qué reclutar en Ancestral (sería una pista).

## Impacto
- `player-guidance`: nuevo requisito «Aviso de mes vacío»; se aclara el escenario «Ancestral sin pistas».
- `src/rules/idle.ts`, `src/store.ts`, `src/copy/es.ts`; pruebas en `tests/empty-month.test.ts` y `tests/smoke/board.spec.ts`.
- Sin cambios en `level-seeds.ts` (no cambian reglas ni certificador).
