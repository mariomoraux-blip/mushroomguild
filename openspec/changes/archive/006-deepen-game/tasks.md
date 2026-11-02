# Tareas · 006

## 1. Reglas
- [x] 1.1 Gliophorus: Pasa la voz (despierta a un compañero que ya trabajó hoy, 1 espora); nombres Chispa, Pluma, Trina, Gota
- [x] 1.2 `mapgen.ts`: claros aleatorios con semilla y filtro de justicia (`playAdvised` gana entre el día 8 y el 11)
- [x] 1.3 Palancas: Árbol Padre por 3 árboles y 10 nutrientes; tronco +2
- [x] 1.4 Tests de reglas, pistas y balance con los escenarios nuevos; retirar la paridad con el PoC

## 2. Arte e interfaz
- [x] 2.1 Sprites en `public/assets/characters/` (≤ 2 MB en total) y retratos en dock, fichas y tablero
- [x] 2.2 Estilo cozy: tokens nuevos en `theme.ts`, cintas, chips con íconos, tarjetas, botón amarillo, marco de madera, Fredoka y Nunito
- [x] 2.3 Partida nueva con mapa aleatorio en la app

## 3. Documentación y cierre
- [x] 3.1 Actualizar GDD, dirección de arte, CLAUDE.md, README, prompts y hojas de personaje
- [x] 3.2 Fusionar deltas de 005 y 006 en `openspec/specs/` y archivar ambos cambios
- [x] 3.3 `npm run test`, `npm run build`, prueba de humo y capturas

## Notas de cierre (2 de noviembre)
- Palancas elegidas por simulación (300 claros sin filtrar): Árbol Padre 10 nutrientes y 3 árboles, tronco +2, revivir 3. Con el filtro de justicia, las pistas ganan el 100 % con día medio ≈ 8,9 y el bot al azar ≈ 17 %.
- Se descartaron por fáciles (día medio de las pistas < 8) las combinaciones con Árbol Padre 6–8 y tronco +3, y por difícil la de revivir 4 + Árbol Padre 10 + tronco +2 (42 % de claros perdidos).
- Maestra Bruna sigue con placeholder hasta que exista su modelo de Blender.
