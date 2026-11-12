# Diseño · 042

## Medición
Todo se midió con `tests/zz-*.test.ts` temporales y `LEVELS` parcheado, sobre los claros certificados de las semillas 1–100.
- **Pistas:** `playAdvised`.
- **Experto:** `playExpert`, 5 variantes sin búsqueda.
- **Azar:** 5 partidas por claro.
- **Certifica:** `certify` sobre 50 claros de hoy. Es un piso: la regeneración prueba hasta 20 acomodos de rocas por semilla.

### Palancas sueltas (pistas · experto)

| Palanca | Brote | Bosque | Ancestral |
| --- | --- | --- | --- |
| Actual | 100 · 100 | 61 · 92 | 21 · 49 |
| Empezar con 1 nutriente | 87 · 92 | 37 · 62 | 6 · 12 |
| Revivir cuesta 4 | 64 · 72 | 9 · 26 | 0 · 0 |
| Hambre desde verano | 100 · 100 | 38 · 63 | 6 · 18 |
| Escarcha una estación más | 99 · 99 | 46 · 78 | 6 · 27 |
| Apagados en 4 y 8 | 94 · 98 | 37 · 59 | 14 · 27 |
| Ganar a más tardar en el mes 10 | 91 · 92 | 31 · 40 | 12 · 16 |
| Reclutas 4·5·7·8, plaga, Padre +1 árbol | sin cambio | ~igual | ~igual |

Mario eligió los eventos por estación.

### Combinaciones (pistas · experto · certifica)

| Bosque | | Ancestral | |
| --- | --- | --- | --- |
| Actual | 61 · 92 · 100 | Actual | 21 · 49 · 100 |
| Escarcha en invierno | 46 · 78 · 90 | Apagados 3·5·6·7·9·11 | 18 · 32 · 66 |
| **Escarcha y plaga en invierno** | **48 · 80 · 92** | **Apagados 2·3·5·7·9·11** | **13 · 27 · 48** |
| Apagados 4·6 | 42 · 63 · 84 | Apagados 3·4·5·7·8·9·11 | 14 · 27 · 52 |
| Apagados 4·6·8 | 37 · 59 · 80 | Escarcha desde verano | 6 · 27 · 44 |
| Hambre desde verano | 38 · 63 · 78 | Hambre desde verano | 6 · 18 · 36 |
| Escarcha invierno + apagados 4·6 | 34 · 54 · 76 | Plaga desde verano | 21 · 47 · 96 |

En negrita, lo que eligió Mario. El bot al azar no pasa del 2 % en ninguna.

### Después de regenerar
Con la tabla nueva, Bosque quedó en 52 % (96 certificados) y Ancestral en 15,4 % (65), algo más fáciles que lo estimado: cada semilla prueba hasta 20 acomodos de rocas. Desde aquí se mide con el mismo proceso de la regeneración (`levelAttempt` + `certify` en las semillas 1–100), que reproduce esos números exactos.

| Bosque | Certificados · pistas · azar | Ancestral | Certificados · pistas · azar |
| --- | --- | --- | --- |
| Actual | 96 · 52 · 1,0 | Actual | 65 · 15,4 · 0,2 |
| **Apagados 4·6** | **89 · 39 · 0,7** | Escarcha desde verano | 44 · 4,5 · 0,2 |
| Apagados 3·6 | 88 · 40 · 0,7 | Escarcha desde verano, apagados 3·5·7·9·11 | 58 · 10,3 · 0 |
| Plaga en otoño e invierno | 96 · 52 · 1,5 | Escarcha desde verano, Padre en 12 | 53 · 9,4 · 0 |
| | | Hambre desde verano | 37 · 5,4 · 0,3 |
| | | 12 rocas | 60 · 25 · 0,2 |
| | | Padre en 14 | 57 · 15,8 · 0,5 |
| | | Plaga desde verano | 65 · 15,4 · 0,2 |

Mario sumó el apagado del mes 4 en Bosque y dejó Ancestral como estaba; el rango de Ancestral pasa a 10–20 %.

## Reglas
- Solo cambia `LEVELS`:
  - **Bosque:** `frost: [2, 3]`, `fading: [4, 6]`, `plague: [3]`.
  - **Ancestral:** `fading: [2, 3, 5, 7, 9, 11]`.
- La plaga, la escarcha y los apagados ya leían `LEVELS`, así que no cambia ninguna función de reglas.

## Arreglo de la certificación
La plaga elige su casilla con `hashString(mapId)`. La tabla se certificaba con `newGame(map, 'custom', level)`, pero la partida usa `seed-<n>`: con la plaga en Bosque, la semilla 49 quedaba certificada y no se ganaba. `level-seeds.test.ts` y `levelMap` (fuera de la tabla) certifican ahora con el nombre real.

## Textos
- **Carta «Llega el frío»:** `es.story.coldPlague` pasa a depender del nivel.
  - Bosque: «En invierno, la plaga marca…».
  - Ancestral: «Cada estación…».
- **«Cómo jugar»:** nombra la plaga de Bosque en invierno.
