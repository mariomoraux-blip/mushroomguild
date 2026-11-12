# 044 · Insignia y pista del árbol suelto

## Por qué
En el 043 el árbol suelto se pintó sin color y con una raíz cortada chica. Mario (12 de noviembre de 2026) vio dos problemas: el gris se confunde con el árbol dormido y la placa parece una señal de «prohibido». Se probó pintar la raíz cortada dentro del árbol, pero a 56–64 px no se lee. Mario prefirió una **insignia independiente** sobre el árbol y la entregó (`assets/ui/source/insignia-suelto.webp`).

Además, el jugador se entera tarde: al terminar el mes la plaga marchita la red y, en el mismo paso, el árbol suelto ya no produce. Mario pidió una pista y eligió **aviso previo + carta**.

## Qué cambia
- **Tablero:** el árbol suelto conserva su color y lleva la insignia `board/trees/loose-badge` en la esquina superior derecha: un disco de pergamino con un hilo de micelio dorado y vivo a un lado, gris y seco al otro, y un hueco en el medio. Una sola pieza para las cuatro estaciones. Si no carga, se dibuja el disco con la raíz cortada (sin quitar el color).
- **Aviso previo:** al marcar la plaga casillas de la red, si marchitarlas dejaría árboles sueltos, la bitácora lo dice («Si se marchitan, un árbol quedará suelto y no dará nada.»). Es un aviso de la presión, así que también se ve en Ancestral.
- **Carta «Un árbol suelto»:** la primera vez en la partida que un árbol queda suelto (por la plaga o porque el Ganoderma curó uno a distancia), una carta corta con la insignia explica qué pasó y cómo arreglarlo. Después de la de la maga y la del frío si coinciden.
- **Arte:** fila de la insignia en `docs/art-direction.md`.

## Fuera
- Reglas, balance y puntaje: no cambian (`SCORE_VERSION` sigue en 13).
- La explicación al tocar el árbol suelto, el aviso al terminar el mes y la línea de la carta «Llega el frío» siguen igual.

## Impacto
- **Specs:** `board-interaction` › Árbol suelto; `player-guidance` › Avisos de la presión; `story-presentation` › Un árbol suelto (nueva).
- **Código:** `src/rules/state.ts` (`looseAtRisk`), `src/rules/actions.ts`, `src/copy/es.ts`, `src/theme.ts`, `src/scenes/paint.ts`, `src/store.ts`, `src/ui/story.ts`, `src/styles.css`.
- **Assets:** `public/assets/board/trees/loose-badge.webp` (~10 KB).
- **Pruebas:** `plague.test.ts`, prueba de la carta en el store, humo con captura.
