# 025 · Añil pasa a llamarse Indi

> **Estado: aprobado e implementado.** Pedido por Mario (2 de noviembre de 2026).

## Por qué
El primer *Lactarius indigo* del gremio inicial (el Tejedor, id 1, junto a Bruno y Rubí) se llamaba «Añil». Mario lo renombra a «Indi».

## Qué cambia
- **Nombre visible:** `memberNames.lactarius[0]` en `src/copy/es.ts` pasa de «Añil» a «Indi». Todos los textos que nombran al miembro (bitácora, dock, ficha, pistas) lo toman de ahí.
- **Specs:** los escenarios de `board-interaction` y `player-guidance` que nombran a Añil pasan a nombrar a Indi. El cambio abierto 022 se corrige en su lugar.
- **Pruebas:** la constante `ANIL` de `tests/helpers.ts` pasa a `INDI`; los textos esperados de unidad y humo dicen «Indi».
- **Docs:** GDD (`docs/gdd-fase-0.md`), `docs/art-direction.md` y las hojas de `docs/personajes/`.

## Fuera de alcance
- `poc/` y los cambios archivados de `openspec/changes/archive/`: son historia.
- «anillo», «anillos» e «índigo»: no son el personaje.
- Nombres de archivos y carpetas con `anil` (`public/assets/characters/anil/`, `assets/sprites/webp/characters/anil/`, `assets/blender/lactarius-anil.blend`, `docs/personajes/anil.md` y las siluetas `silueta-56-*-anil.png`): se renombran solo si Mario lo confirma.
- Reglas, balance y semillas: el nombre no participa en ellos (`level-seeds.ts` no cambia).

## Impacto
- `board-interaction` › Feedback de acción inválida, Retratos del gremio.
- `player-guidance` › Ficha al seleccionar un hongo, Pista y camino sugerido, Para qué sirve cada hongo.
- `src/copy/es.ts`, un comentario en `src/scenes/fx.ts`; `tests/`; `docs/`; `openspec/changes/022-motion-microinteractions/`.
