# scoring

## Purpose
Puntaje de la victoria: cronómetro de juego activo, desglose, estrellas por claro, resultado verificable (`ScoreResult` con su registro de acciones) y mejor resultado local. Origen: cambio 015 (archivado). Implementado en `src/rules/scoring.ts`, `src/clock.ts`, `src/records.ts`, `src/store.ts` y `src/ui/story.ts`.

## Requirements

### Requirement: Cronómetro
El HUD SHALL mostrar un cronómetro mm:ss que cuenta hacia arriba, sin límite, solo durante el juego activo. SHALL empezar cuando el tablero acepta la primera acción del jugador (actuar sobre una casilla, reclutar o terminar el mes), haya intro o no; pausarse con cualquier hoja o pantalla encima del tablero (cartas de historia, fichas, hechizo, reclutar, Libreta de campo, "Cómo jugar", "El gremio") y con la pestaña oculta; y detenerse al despertar al Árbol Padre o al terminar el invierno. Los números SHALL ser tabulares y el cronómetro no SHALL anunciarse cada segundo al lector de pantalla.

#### Scenario: Antes de la primera acción
- WHEN el jugador cierra la intro y mira el tablero 20 segundos sin actuar
- THEN el cronómetro sigue en 00:00
- AND empieza a correr cuando Bruno descompone el primer tronco

#### Scenario: Carta abierta
- WHEN llega Maestra Bruma y su carta queda abierta 30 segundos
- THEN el cronómetro no avanza mientras la carta está abierta
- AND vuelve a correr al cerrarla

#### Scenario: Hoja abierta
- WHEN el jugador abre la ficha de un miembro, la hoja de reclutar o "Cómo jugar"
- THEN el cronómetro no avanza hasta que la cierra

#### Scenario: Fin de la partida
- WHEN la Amanita despierta al Árbol Padre
- THEN el cronómetro se detiene y la carta de victoria muestra ese tiempo

### Requirement: Puntaje
Al ganar, el juego SHALL calcular un puntaje con `score(estadoFinal, timeMs)`, función pura que devuelve el total y el desglose: victoria 500; meses 80 × (12 − mes de victoria); árboles 120 × árboles revividos sin contar el Árbol Padre; reservas 10 × nutrientes + 20 × esporas; gremio eficiente 60 × (6 − miembros reclutables); actividad 5 × acciones con tope de 40 acciones; variedad 150 si las 5 especies actuaron al menos una vez (Maestra Bruma cuenta con un hechizo); tiempo 1 punto por segundo por debajo de 8:00, con máximo de 480. El total SHALL multiplicarse por el multiplicador del nivel (×1 Brote, ×1,5 Bosque, ×2 Ancestral) y redondearse; el desglose SHALL incluir la fila del nivel. Los pesos y topes SHALL vivir en `config.ts › SCORE` y los multiplicadores en `config.ts › LEVELS`.

#### Scenario: Victoria conocida
- WHEN se gana en Brote en el mes 8 con 5 árboles revividos, 4 nutrientes, 3 esporas, 5 miembros reclutables, 30 acciones, las 5 especies y 3:20 de juego
- THEN el desglose es victoria 500, meses 320, árboles 600, reservas 100, gremio 60, actividad 150, variedad 150 y tiempo 280
- AND el total es 2160

#### Scenario: Multiplicador del nivel
- WHEN se gana la misma partida en Bosque
- THEN el desglose suma 2160 y la fila del nivel dice ×1,5
- AND el total es 3240

#### Scenario: Tope de actividad
- WHEN se gana con 47 acciones
- THEN la actividad vale 200 (40 × 5), igual que con 40 acciones

#### Scenario: Variedad sin Gliophorus
- WHEN se gana sin que ninguna Gliophorus haya actuado
- THEN la variedad vale 0

#### Scenario: Derrota
- WHEN termina el invierno sin despertar al Árbol Padre
- THEN no se calcula puntaje y la carta de final no muestra puntaje ni estrellas

### Requirement: Estrellas
Toda victoria SHALL dar al menos 1 estrella; 2 estrellas con puntaje ≥ `umbral2` y 3 con puntaje ≥ `umbral3`. Los umbrales SHALL calcularse por claro: al generar el claro, el bot con criterio (la política de las pistas) juega una partida determinista sobre el claro de **Brote** de esa semilla, modelando 25 s de juego por mes, y su puntaje es la referencia; `umbral2` = 90 % y `umbral3` = 110 % de la referencia, redondeados. Los umbrales SHALL ser los mismos en los tres niveles y se comparan con el total ya multiplicado. Los factores (0,9 y 1,1) y los 25 s por mes SHALL vivir en `config.ts`. La calibración SHALL tardar menos de 100 ms en un teléfono de gama media.

#### Scenario: Límites exactos
- WHEN el puntaje es `umbral2 − 1`, `umbral2` y `umbral3` del claro
- THEN las estrellas son 1, 2 y 3

#### Scenario: Calibración por claro
- WHEN se genera el claro de la semilla 1
- THEN la referencia es el puntaje del bot con criterio sobre el claro de Brote de esa semilla, y `umbral2` y `umbral3` son su 90 % y su 110 %
- AND el bot con criterio, jugando ese claro en Brote, obtiene 2 estrellas

#### Scenario: Mismos umbrales en todos los niveles
- WHEN se genera la semilla 1 en Bosque
- THEN `umbral2` y `umbral3` son los mismos que en Brote

### Requirement: Resultado verificable
Al ganar, el juego SHALL armar un `ScoreResult` con `{ scoringVersion, mapId, level, wonMonth, timeMs, total, breakdown, stars, actionLog }`. `mapId` es `clasico` o `seed-<n>` y no depende del nivel. `actionLog` es la lista ordenada de acciones (miembro y casilla, hechizo, reclutar, fin del mes). Rejugar el `actionLog` desde el claro de `mapId` en `level` SHALL producir el mismo estado final y el mismo total con el mismo `timeMs`.

#### Scenario: Rejugar
- WHEN se rejuega el `actionLog` de una victoria desde su `mapId` y su `level`
- THEN el estado final y `score(final, timeMs).total` coinciden con el `ScoreResult`

### Requirement: Mejor resultado local
El juego SHALL guardar solo el mejor `ScoreResult` de cada claro en `localStorage`, con una clave versionada por `mapId` y `scoringVersion`: un solo récord por claro para los tres niveles, comparando totales ya multiplicados. Si leer o escribir falla, el juego SHALL seguir sin récord. No hay nombres de jugador, cuentas ni llamadas de red.

#### Scenario: Nuevo récord
- WHEN una victoria supera el mejor resultado guardado de su mismo `mapId`
- THEN la carta de victoria dice "Nuevo récord" y se guarda el nuevo resultado

#### Scenario: Récord entre niveles
- WHEN el récord de la semilla 1 es de Brote y se gana la semilla 1 en Ancestral con un total multiplicado mayor
- THEN la carta dice "Nuevo récord" y el récord guardado es el de Ancestral

#### Scenario: Primer resultado de un claro
- WHEN se gana un claro que no tiene resultado guardado
- THEN se guarda el resultado y la carta no dice "Nuevo récord"

#### Scenario: Estado de depuración
- WHEN se gana desde `?debugState`
- THEN no se lee ni se guarda récord

#### Scenario: Almacenamiento que falla
- WHEN `localStorage` lanza un error al leer o escribir
- THEN la carta de victoria se muestra completa, sin "Nuevo récord", y no hay errores sin manejar
