# Diseño · 041

## Reclutas
- `MAX_GUILD = 7` y `RECRUIT_COSTS = [3, 4, 6, 7]`. `recruitCost` y `recruit` no cambian de forma: el cupo y los costos salen de config.
- El dock pasa a tener 8 tarjetas (3 iniciales, 4 reclutas y Maestra Bruma). Ya se desplaza en horizontal con su flecha; se revisa a 360 px.

## Variedad
- `SCORE.variety` pasa a ser una escala por escalón: `[150, 150, 250, 350, 450]`, indexada por las especies reclutables que hay en el gremio al ganar.
- La condición no cambia: todas las especies del gremio actuaron al menos una vez. Si no, vale 0.
- El desglose guarda el escalón para elegir la etiqueta. `es.score.breakdown.variety` pasa a ser una función de cuántas especies hay.

## Rocas
- Se mide con un `tests/zz-*.test.ts` temporal:
  - Para cada combinación de rocas (Bosque 8–11, Ancestral 10–13), con `LEVELS` parcheado, se mide el porcentaje de victorias con pistas y al azar sobre las semillas 1–100 de claros conectados.
  - El bot experto se mide sobre una muestra.
- Se le muestra la tabla a Mario. Con su elección se regenera `level-seeds.ts` (`npm run certify`, ~16 min).

Medido con cuatro reclutas, semillas 1–100 (certificados / pistas / azar):

| Bosque | | Ancestral | |
| --- | --- | --- | --- |
| 8 rocas (hoy) | 98 · 76 % · 3,4 % | 10 rocas (hoy) | 82 · 33 % · 0,2 % |
| 9 rocas | 99 · 67 % · 2,1 % | 11 rocas | 79 · 32 % · 0,4 % |
| 10 rocas | 99 · 75 % · 2,3 % | 12 rocas | 79 · 29 % · 0,4 % |
| 11 rocas | 96 · 75 % · 1,6 % | 13 rocas | 69 · 30 % · 0,7 % |
| Padre 11 | 98 · 71 % · 1,8 % | Padre 13 | 79 · 27 % · 0,4 % |
| **9 rocas + Padre 11** | **98 · 61 % · 1,6 %** | Padre 14 | 75 · 28 % · 0,5 % |
| | | **11 rocas + Padre 13** | **77 · 21 % · 0 %** |
| | | Escarcha desde verano | 68 · 21 % · 0,3 % |
| | | Come desde verano | 57 · 21 % · 0,4 % |
| | | Plaga desde verano | 81 · 33 % · 0,2 % |

Las rocas solas no son lineales: cambian qué claros se aceptan y dónde caen. En negrita, lo que eligió Mario.
- La regla de generación no cambia: las rocas del nivel se agregan sobre el claro de Brote de la misma semilla.

## Pistas y bots
- `recruitPick` ya devuelve la primera especie que falta, así que con 4 cupos los bots pueden reclutar las cuatro.
- Se revisa si la política de las pistas debería reclutar la cuarta (el puntaje de variedad sube y el de gremio eficiente baja 60).
