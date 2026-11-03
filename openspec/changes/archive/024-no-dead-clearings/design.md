# Diseño · 024

## Evidencia del solver (2 de noviembre de 2026)

### El claro
Transcrito de la captura y encontrado en `LEVEL_SEEDS.ancestral[745]` (intento `0`). `levelMap(745, 'ancestral')`:

```
y0  . T . M L      T gris marcado/apagado en (1,0)
y1  . R . . T
y2  . . . . T
y3  L T . R .
y4  . R L L R
y5  R T . T T      (4,5) vivo
y6  R . R R .
y7  R R L H .      tronco inicial en (2,7)
```

Claro de Brote de la misma semilla: `..LH.`, `..RR.`, `.T.TT` en las filas 7–5. Las rocas que agrega Ancestral son (0,5), (0,6), (0,7) y (1,7). Cierran el pasillo izquierdo; desde el Hogar quedan 3 casillas libres, (2,7), (4,7) y (4,6), y después solo árboles.

### Estado del reporte (recreado)
Mes 4, 2 nutrientes, 2 esporas, (1,0) apagado, red = Hogar, (2,7), (4,7), (4,6) y (4,5) vivo. Gremio: Añil, Bruno y Rubí, los tres listos. `validTargets` da 0 casillas para cada uno.

| Prueba | Resultado |
| --- | --- |
| `playExpert(estado)` | pierde (mes 12, 5 árboles) |
| `certify(estado)` | **gana en el mes 9** |
| Búsqueda ancha (24 variantes × 150 estados), terminar el mes | gana en el mes 11 |
| … reclutar Lactarius / Champiñón / Amanita y terminar | gana en el mes 9 |
| … **reclutar Gliophorus** y terminar | **sin victoria** |
| `playExpert(inicio de la semilla 745)` | pierde |
| `certify(inicio)` | gana en el mes 9 |

Línea ganadora de `certify` desde el inicio (miembro@casilla; 1 Añil, 2 Bruno, 3 Rubí):

```
m1: 2@2,7 1@4,7 | m2: 2@2,7 1@4,6 3@4,5 | m3: 1@2,7 | m4: recluta Lactarius | m5: 3@3,5 2@3,4 1@2,5 | …  | m9: 3@3,0 (victoria)
```

Los meses 1 a 3 coinciden con lo que hizo el jugador (la red de la captura sale de exactamente esas jugadas). El mes 4 es vacío en la propia línea del certificador.

### Toda la tabla
Script de una sola vez (no versionado): para cada semilla aceptada, `playExpert`, `playAdvised` y, si el experto pierde, `certify`.

| | Bosque | Ancestral |
| --- | --- | --- |
| Claros aceptados | 1000 | 997 |
| Gana alguna variante del experto | 93,7 % | 74,5 % |
| **Solo la búsqueda por haz** | **63 (6,3 %)** | **254 (25,5 %)** |
| Mes de victoria de esos (haz) | 7–12, moda 11 | 6–12, moda 10 |
| Gana la política de las pistas | 84,8 % | 54,3 % |
| Con mes vacío en la línea ganadora | 8 | 11 |
| Salida del Hogar ≤ 3 casillas | 23 (0 solo por haz) | 44 (4 solo por haz) |

Lectura: la estrechez de la salida no explica el problema general (opción C). Lo que sí lo describe es «solo por haz» (opción B). El mes vacío es raro (~1 %), pero cuando ocurre en Ancestral no hay ningún texto que diga que esperar es la jugada.

## Decisiones (con la opción A)

### Qué es un mes vacío
`noWorkThisMonth(s)`, en `src/rules/idle.ts` (puro):
- `s.status === 'playing'`;
- hay al menos un miembro listo (`!used`);
- ningún miembro listo tiene casillas válidas (`validTargets(s, id).length === 0`, la maga incluida);
- en este mes nadie actuó: ninguna entrada `act` en `s.log` después del último `endMonth`. Reclutar no cuenta como actuar, porque el recluta llega cansado.

La última condición separa el mes vacío del final normal de un mes, donde quedan miembros sin trabajo después de que otros actuaron. Eso en Brote y Bosque ya lo cubre la pista «Nadie más puede trabajar…», y en Ancestral sigue sin decirse: el reto sin pistas se mantiene.

### Por qué no es una pista
No sugiere a nadie ni ninguna casilla: dice algo del estado (no hay jugadas posibles) y cuánto trae la hojarasca. Es la misma categoría que «Avisos de la presión», que ya se muestran en Ancestral.

### Texto
Una función en `src/copy/es.ts` (junto a los avisos de la presión): «Nadie tiene trabajo este mes. Termina el mes: la hojarasca traerá N nutrientes.»; con 0 árboles vivos, «Nadie tiene trabajo este mes. Termina el mes.». N es `revivedCount × GAIN.treeNutrients`. Mario puede cambiar las palabras.

### Dónde se muestra
En el store (`withEmptyMonth` e `idleHint`):
- Después de terminar el mes y de reclutar, el aviso se agrega al final del mensaje de la bitácora, en todos los niveles.
- Sin nada seleccionado (al empezar la partida o al cancelar), en Ancestral reemplaza a «Elige a un miembro del gremio.». En Brote y Bosque reemplaza a la pista solo si esa pista era terminar el mes; si la pista sugiere reclutar, se queda la pista.
- Tocar un miembro sigue mostrando su motivo («Añil: no hay tierra junto a la red»).

## Si algún día se elige B (no elegida)
- `tests/level-seeds.test.ts › certified`: `reachable(map) && playExpert(newGame(map, 'custom', level)).status === 'won'`. `certify` queda solo para el balance.
- `npm run certify` regenera la tabla: se espera que sigan siendo aceptadas ~937 semillas en Bosque y ~743 en Ancestral (algunas pueden encontrar otro intento de rocas que el experto sí gane).
- `balance.test.ts`: con la tabla nueva, la política de las pistas gana ~73 % en Ancestral (meta 40–60 %) y ~90 % en Bosque (meta 75–90 %). Hay que subir la presión (p. ej. `rocks` 11, `FADED_REVIVE`, meses de `fading`) o mover las metas. Es una decisión de Mario.
- Los récords guardados de semillas que dejan de ofrecerse siguen en el almacenamiento, pero ya no se alcanzan por la portada.

## Riesgos
- **Ruido:** el aviso sale solo en meses vacíos (~1 % de los claros, una vez por mes). Una prueba lo verifica en la partida del clásico con la política de las pistas: ningún mes vacío.
- **Gliophorus como trampa:** en la 745, reclutar la Mensajera en el mes 4 parece perder. El aviso no lo menciona; en Ancestral eso es parte del reto. Queda anotado por si el playtest lo pide.
