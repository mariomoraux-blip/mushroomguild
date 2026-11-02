# Diseño · 017

- **Mismo botón, otro trabajo:** se reutiliza `.end` (ya es el control principal del dock, ≥ 44 px, al alcance del pulgar) en vez de sumar un botón nuevo. Mientras se juega, termina el mes; con `status` `won` o `lost`, despacha `showEnd`.
- **`showEnd`:** abre `ui.story` con `{ kind: game.status }` solo si la partida terminó y no hay otra carta abierta; si no, no cambia el estado. La carta de victoria vuelve con el mismo puntaje (`ui.result` no se toca).
- **Foco:** al abrir la carta, el foco va a "Jugar de nuevo" y al cerrarla vuelve a "Ver final" (comportamiento existente de `story.ts`).
