# Delta · scoring

## ADDED Requirements

### Requirement: Cronómetro
El HUD SHALL mostrar un cronómetro mm:ss que cuenta hacia arriba, sin límite, solo durante el juego activo. SHALL empezar al cerrar la intro (o al empezar la partida si no hay intro), pausarse con cualquier carta abierta (intro, llegada de la maga, final), con la hoja de reclutar abierta y con la pestaña oculta, y detenerse al despertar al Árbol Padre o al terminar el invierno. Los números SHALL ser tabulares y el cronómetro no SHALL anunciarse cada segundo al lector de pantalla.

#### Scenario: Carta abierta
- WHEN llega Maestra Bruna y su carta queda abierta 30 segundos
- THEN el cronómetro no avanza mientras la carta está abierta
- AND vuelve a correr al cerrarla

#### Scenario: Fin de la partida
- WHEN la Amanita despierta al Árbol Padre
- THEN el cronómetro se detiene y la carta de victoria muestra ese tiempo

### Requirement: Puntaje
Al ganar, el juego SHALL calcular un puntaje con `score(estadoFinal, timeMs)`, función pura que devuelve el total y el desglose: victoria 500; días 80 × (12 − día de victoria); árboles 120 × árboles revividos sin contar el Árbol Padre; reservas 10 × nutrientes + 20 × esporas; gremio eficiente 60 × (6 − miembros reclutables); actividad 5 × acciones con tope de 40 acciones; variedad 150 si las 5 especies actuaron al menos una vez (Maestra Bruna cuenta con un hechizo); tiempo 1 punto por segundo por debajo de 8:00, con máximo de 480. Los pesos y topes SHALL vivir en `config.ts › SCORE`.

#### Scenario: Victoria conocida
- WHEN se gana en el día 8 con 5 árboles revividos, 4 nutrientes, 3 esporas, 5 miembros reclutables, 30 acciones, las 5 especies y 3:20 de juego
- THEN el desglose es victoria 500, días 320, árboles 600, reservas 100, gremio 60, actividad 150, variedad 150 y tiempo 280
- AND el total es 2160

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
Toda victoria SHALL dar al menos 1 estrella; 2 estrellas con puntaje ≥ `umbral2` y 3 con puntaje ≥ `umbral3`. Los umbrales SHALL vivir en `config.ts` y calibrarse con el bot con criterio a 25 s de juego por día: `umbral2` es la mediana del bot y `umbral3` su percentil 90.

#### Scenario: Límites exactos
- WHEN el puntaje es `umbral2 − 1`, `umbral2` y `umbral3`
- THEN las estrellas son 1, 2 y 3

#### Scenario: Calibración
- WHEN `balance.test.ts` juega los 100 claros con el bot con criterio
- THEN `umbral2` coincide con la mediana redondeada y `umbral3` con el percentil 90

### Requirement: Resultado verificable
Al ganar, el juego SHALL armar un `ScoreResult` con `{ scoringVersion, mapId, wonDay, timeMs, total, breakdown, stars, actionLog }`. `actionLog` es la lista ordenada de acciones (miembro y casilla, hechizo, reclutar, fin del día). Rejugar el `actionLog` desde el claro de `mapId` SHALL producir el mismo estado final y el mismo total con el mismo `timeMs`.

#### Scenario: Rejugar
- WHEN se rejuega el `actionLog` de una victoria desde su `mapId`
- THEN el estado final y `score(final, timeMs).total` coinciden con el `ScoreResult`

### Requirement: Mejor resultado local
El juego SHALL guardar solo el mejor `ScoreResult` de cada claro en `localStorage`, con una clave versionada por `mapId` y `scoringVersion`. Si leer o escribir falla, el juego SHALL seguir sin récord. No hay nombres de jugador, cuentas ni llamadas de red.

#### Scenario: Nuevo récord
- WHEN una victoria supera el mejor resultado guardado de su claro
- THEN la carta de victoria dice "Nuevo récord" y se guarda el nuevo resultado

#### Scenario: Almacenamiento que falla
- WHEN `localStorage` lanza un error al leer o escribir
- THEN la carta de victoria se muestra completa, sin "Nuevo récord", y no hay errores sin manejar
