# Diseño · 028

## Reglas en `config.ts › LEVELS`
Tres campos nuevos por nivel:

| | Brote | Bosque | Ancestral |
| --- | --- | --- | --- |
| `upkeep` (estaciones en que el gremio come) | — | Invierno | Invierno |
| `sporeless` (estaciones sin esporas de los árboles) | — | Invierno | Invierno |
| `mother` (nutrientes del Árbol Padre) | 10 | 12 | 12 |

`UPKEEP = 1` nutriente en total por mes. `motherCost(s)` reemplaza a `COST.mother`.

## Orden de `endMonth`
1. Árbol marcado que sigue gris → se apaga (019).
2. Mes + 1; los árboles dan esporas (0 si la estación del mes nuevo es `sporeless`) y nutrientes.
3. Todos quedan disponibles (`used = false`, `at = null`, sin `hungry`).
4. Si la estación del mes que terminó es `upkeep`: el gremio resta `UPKEEP`; si no alcanza, el primer miembro que no es la maga queda `used = true`, `hungry = true`.
5. Mensajes: mes nuevo, lo que dieron los árboles, lo que comió el gremio o quién tiene hambre, estación, escarcha, invierno sin esporas, árbol marcado, maga.

Comer después de la producción es la versión amable: el mes que termina ya cuenta lo que dan los árboles. Terminar el mes 12 sigue siendo el final; no se come.

## `Member.hungry`
Se pone al no comer y se borra al empezar el mes siguiente. La Mensajera no puede llamarlo: pasar la voz apunta a la casilla donde alguien trabajó. El dock muestra «Con hambre» en vez de «Descansa».

## Carta
`Story` suma `{ kind: 'cold' }`. `storyFor` la devuelve cuando el mes nuevo es el primero de una estación `upkeep` y la anterior no lo era. Si también llega la maga, se muestra `{ kind: 'mage', then: { kind: 'cold' } }` y al cerrarla aparece la del frío. Arte: los tres retratos del gremio inicial en reposo, como la carta del gremio en la intro.

## Balance
Variantes medidas sobre los 100 claros certificados antes del cambio (pistas · bot experto rápido):

| Variante | Bosque | Ancestral |
| --- | --- | --- |
| Antes | 84 % · 94 % | 48 % · 76 % |
| Cada hongo come en otoño e invierno + invierno sin esporas + 12 | 1 % · 6 % | 4 % · 6 % |
| Solo el Árbol Padre de 12 | 73 % · 89 % | 30 % · 45 % |
| Sin comer + invierno sin esporas + 12 | 73 % · 89 % | 31 % · 53 % |
| **El gremio come 1 en invierno + invierno sin esporas + 12 (elegida)** | **62 % · 81 %** | **27 % · 46 %** |
| El gremio come 1 en otoño e invierno + invierno sin esporas + 12 | 47 % · 64 % | 12 % · 24 % |

El invierno sin esporas casi no mueve el balance (la mayoría gana antes del mes 10); lo que más pesa es comer por hongo. Después se regenera `level-seeds.ts` y se mide de nuevo con `balance.test.ts`.
