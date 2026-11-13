# 045 · La plaga se entiende

## Por qué
Mario jugó el 044 (12 de noviembre de 2026) y vio tres problemas:
- **Mensajes largos:** al terminar el mes, la bitácora junta todo en un párrafo y repite una frase por cada casilla marchita.
- **No se entiende cómo recuperarse:** frenar la plaga (un hongo trabaja a 2 casillas o menos) y limpiar la marchita no se ven en el tablero, solo se leen.
- **Todos los árboles quedan sueltos:** la plaga elegía las casillas tejidas más cercanas al Hogar, el tronco de la red; una sola casilla marchita cortaba todo. Y la red cortada seguía brillando, así que no se veía dónde estaba el corte.

## Qué cambia
- **Resumen del mes:** la bitácora dice «Mes N · » y una frase con lo más urgente y qué hacer. El botón «Ver el mes» abre la lista completa, una línea con ícono por cada cosa. Las casillas que la plaga marchita, frena o limpia van en una sola línea con cuántas.
- **Red cortada:** las casillas de la red que ya no llegan al Hogar se ven grises y sin luz, y se nombran («red cortada»).
- **Casillas que frenan la plaga:** al seleccionar un hongo, sus casillas válidas a 2 o menos de una plaga llevan un escudo de hoja («frena la plaga»).
- **Regla (Bosque y Ancestral):** la plaga marca casillas tejidas a 2 pasos o más del Hogar y vecinas de un árbol vivo (si no hay, la más cercana al Hogar a 2 pasos o más). Va por la raíz de un árbol, no por el tronco. Mario la eligió entre cinco variantes medidas (ver diseño).
- **Puntaje:** cambian las partidas de Bosque y Ancestral; `SCORE_VERSION` pasa a 14 y se recertifica `level-seeds.ts`.

## Impacto
- **Specs:** `player-guidance` › Resumen del mes (nueva); `board-interaction` › Red cortada y Casillas que frenan la plaga (nuevas); `game-rules` › Plaga; `story-presentation` › Llega el frío.
- **Código:** `src/rules/` (`types.ts`, `config.ts`, `state.ts`, `actions.ts`, `level-seeds.ts`), `src/store.ts`, `src/copy/es.ts`, `src/theme.ts`, `src/scenes/paint.ts`, `src/scenes/GameScene.ts`, `src/ui/sheet.ts`, `src/ui/board.ts`, `src/main.ts`, `index.html`, `src/styles.css`.
- **Pruebas:** `plague.test.ts`, `effects.test.ts`, `store.test.ts`, `empty-month.test.ts`, `balance.test.ts`, humo con capturas.
