# 023 · «Elige tu dificultad»

## Por qué
La pantalla que abre «Nueva partida» se llamaba «Elige tu claro», pero lo que el jugador elige ahí es la dificultad (Brote, Bosque o Ancestral); el claro sale al azar en cada nivel. El título tiene que decir lo que se elige.

## Qué cambia
- El título de la pantalla pasa a ser **«Elige tu dificultad»** (`src/copy/es.ts` › `levels.title`).
- El nombre de la pantalla en specs, comentarios del código, nombres de pruebas y docs (`CLAUDE.md`, `openspec/project.md`, `docs/art-direction.md`).

## Fuera de alcance
Reglas, niveles, textos de cada nivel y diseño de la pantalla no cambian. «Claro» sigue siendo el nombre del mapa («un claro aleatorio», «Tablero del claro»). Los cambios archivados quedan como historial. `docs/gdd-fase-0.md` es copia del GDD en Claude Docs: se actualiza allá y después se copia.

## Impacto
`title-screens`: se renombra el requisito «Elige tu claro» y se modifica «Portada» (solo el nombre de la pantalla).
