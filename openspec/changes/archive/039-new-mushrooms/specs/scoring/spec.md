## MODIFIED Requirements

### Requirement: Puntaje
Al ganar, el juego SHALL calcular un puntaje con `score(estadoFinal, timeMs)`, función pura que devuelve el total y el desglose: victoria 500; meses 80 × (12 − mes de victoria); árboles 120 × árboles revividos sin contar el Árbol Padre; reservas 10 × nutrientes + 20 × esporas; gremio eficiente 60 × (6 − miembros reclutables); actividad 5 × acciones con tope de 40 acciones; variedad 150 si todas las especies del gremio al ganar actuaron al menos una vez (Maestra Bruma, si llegó, cuenta con un hechizo); tiempo 1 punto por segundo por debajo de 8:00, con máximo de 480. El total SHALL multiplicarse por el multiplicador del nivel (×1 Brote, ×1,5 Bosque, ×2 Ancestral) y redondearse; el desglose SHALL incluir la fila del nivel. Los pesos y topes SHALL vivir en `config.ts › SCORE` y los multiplicadores en `config.ts › LEVELS`.

#### Scenario: Victoria conocida
- WHEN se gana en Brote en el mes 8 con 5 árboles revividos, 4 nutrientes, 3 esporas, 5 miembros reclutables, 30 acciones, todas las especies de su gremio y 3:20 de juego
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
- WHEN se gana con Chispa en el gremio sin que haya actuado
- THEN la variedad vale 0

#### Scenario: Derrota
- WHEN termina el invierno sin despertar al Árbol Padre
- THEN no se calcula puntaje y la carta de final no muestra puntaje ni estrellas

#### Scenario: Variedad con el gremio inicial
- WHEN se gana sin reclutar y sin que llegue Maestra Bruma, y Bruno, Indi y Rubí actuaron
- THEN la variedad vale 150
