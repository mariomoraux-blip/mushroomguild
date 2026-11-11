## MODIFIED Requirements

### Requirement: Puntaje
Al ganar, el juego SHALL calcular un puntaje con `score(estadoFinal, timeMs)`, función pura que devuelve el total y el desglose: victoria 500; meses 80 × (12 − mes de victoria); árboles 120 × árboles revividos sin contar el Árbol Padre; reservas 10 × nutrientes + 20 × esporas; gremio eficiente 60 × (7 − miembros reclutables); actividad 5 × acciones con tope de 40 acciones; variedad si todas las especies del gremio al ganar actuaron al menos una vez (Maestra Bruma, si llegó, cuenta con un hechizo), que vale según las especies reclutables del gremio: 150 con ninguna o una, 250 con dos, 350 con tres y 450 con las cuatro; tiempo 1 punto por segundo por debajo de 8:00, con máximo de 480. La fila de variedad del desglose SHALL decir «Todo el gremio actuó» con ninguna o una especie reclutable, «2 especies reclutadas», «3 especies reclutadas» o «Las 4 especies reclutadas». El total SHALL multiplicarse por el multiplicador del nivel (×1 Brote, ×1,5 Bosque, ×2 Ancestral) y redondearse; el desglose SHALL incluir la fila del nivel. Los pesos, la escala de variedad y los topes SHALL vivir en `config.ts › SCORE` y los multiplicadores en `config.ts › LEVELS`.

#### Scenario: Victoria conocida
- WHEN se gana en Brote en el mes 8 con 5 árboles revividos, 4 nutrientes, 3 esporas, 5 miembros reclutables (2 especies reclutadas), 30 acciones, todas las especies de su gremio y 3:20 de juego
- THEN el desglose es victoria 500, meses 320, árboles 600, reservas 100, gremio 120, actividad 150, variedad 250 y tiempo 280
- AND el total es 2320

#### Scenario: Multiplicador del nivel
- WHEN se gana la misma partida en Bosque
- THEN el desglose suma 2320 y la fila del nivel dice ×1,5
- AND el total es 3480

#### Scenario: Tope de actividad
- WHEN se gana con 47 acciones
- THEN la actividad vale 200 (40 × 5), igual que con 40 acciones

#### Scenario: Variedad sin Gliophorus
- WHEN se gana con Chispa en el gremio sin que haya actuado
- THEN la variedad vale 0

#### Scenario: Derrota
- WHEN termina el invierno sin despertar al Árbol Padre
- THEN no se calcula puntaje y la carta de final no muestra puntaje ni estrellas

#### Scenario: Variedad con el gremio inicial
- WHEN se gana sin reclutar y sin que llegue Maestra Bruma, y Bruno, Indi y Rubí actuaron
- THEN la variedad vale 150 y su fila dice «Todo el gremio actuó»

#### Scenario: Variedad con las cuatro reclutadas
- WHEN se gana con Chispa, Panal, Ámbar y Pompón en el gremio y todas las especies del gremio actuaron
- THEN la variedad vale 450 y su fila dice «Las 4 especies reclutadas»
