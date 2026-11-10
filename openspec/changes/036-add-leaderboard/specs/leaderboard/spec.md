# Delta · leaderboard

## ADDED Requirements

### Requirement: Jugador del dispositivo
El juego SHALL reconocer al jugador por una clave anónima creada en el dispositivo y guardada en `localStorage` junto a su alias. La clave no SHALL aparecer en ninguna URL ni en el ranking; el servidor SHALL guardar solo su hash. Si el almacenamiento falla, el juego SHALL seguir completo, sin ofrecer registro y con el ranking visible sin fila propia.

#### Scenario: Jugador que vuelve
- WHEN un jugador registrado como «Bruno del Musgo» vuelve a abrir el sitio en el mismo navegador
- THEN la portada dice «Hola de nuevo, Bruno del Musgo»
- AND su próxima victoria se asocia a la misma fila del ranking

#### Scenario: Datos borrados
- WHEN el jugador borra los datos del sitio y gana
- THEN el juego le ofrece registrarse como jugador nuevo

#### Scenario: Almacenamiento que falla
- WHEN `localStorage` lanza un error
- THEN la carta de victoria no ofrece «Registra tu puntaje» y no hay errores sin manejar

### Requirement: Alias generado
El nombre del jugador SHALL ser un alias generado de la forma «<nombre> del/de la <lugar>», con las listas en `src/copy/es.ts`. «Otro nombre» SHALL sortear otro. El jugador no SHALL poder escribir texto libre; el servidor SHALL rechazar un alias que no salga de las listas. Dos jugadores pueden compartir alias. El alias se puede cambiar desde el ranking sin perder el puntaje.

#### Scenario: Sortear
- WHEN el jugador abre «Tu nombre en el gremio» y pulsa «Otro nombre»
- THEN ve un alias distinto, formado con las listas del juego

#### Scenario: Alias inventado
- WHEN llega al servidor el alias «xXx»
- THEN la respuesta es 400 y no se guarda nada

### Requirement: Registrar un puntaje
Al ganar una partida que cuenta (`proposal.md` › pregunta 3), un jugador sin alias SHALL ver «Registra tu puntaje», que abre «Tu nombre en el gremio»; «Registrar» guarda el alias y envía el resultado, «Ahora no» cierra la hoja sin enviar. Un jugador registrado SHALL enviar sus victorias según la pregunta 2. El ranking SHALL guardar solo el mejor total de cada jugador por temporada.

#### Scenario: Primer registro
- WHEN un jugador sin alias gana con 3240 y pulsa «Registra tu puntaje» y luego «Registrar»
- THEN la carta muestra su puesto («Puesto N de M») y «Ver ranking»

#### Scenario: Sin mejora
- WHEN un jugador con mejor total de 3240 gana con 2900
- THEN su fila sigue en 3240 y la carta dice «Tu mejor: 3240»

#### Scenario: Partida que no cuenta
- WHEN se gana desde `?map=clasico` o `?debugState`
- THEN no se envía nada y la carta no ofrece registrar

### Requirement: Verificación en el servidor
El servidor SHALL aceptar un resultado solo si su `scoringVersion` es la vigente, su claro existe para su nivel, rejugar su `actionLog` con `src/rules` termina en victoria en el mismo mes, su `timeMs` está entre las cotas de `config.ts › LEADERBOARD` y el total y las estrellas recalculados coinciden. SHALL guardar los números que recalcula. SHALL limitar los envíos por dispositivo y por IP en una ventana de una hora.

#### Scenario: Victoria real
- WHEN llega el `ScoreResult` de una victoria del bot con criterio
- THEN el servidor lo acepta y responde el puesto

#### Scenario: Total alterado
- WHEN llega un resultado cuyo `total` es 100 puntos mayor que el que da rejugarlo
- THEN la respuesta es 422 y el ranking no cambia

#### Scenario: Tiempo imposible
- WHEN llega una victoria de 40 acciones con `timeMs` menor que 40 × `minMsPerAction`
- THEN la respuesta es 422

#### Scenario: Demasiados envíos
- WHEN un dispositivo supera el límite de envíos de la hora
- THEN la respuesta es 429 y el cliente lo trata como sin conexión

### Requirement: Pantalla Ranking
La pantalla «Ranking» SHALL mostrar la temporada, el número de jugadores y los primeros `LEADERBOARD.topSize` (puesto, alias, total, nivel y estrellas), con los empates en el mismo puesto. La fila del jugador SHALL resaltarse con «(tú)» y, si queda fuera de los primeros, fijarse al final. SHALL ofrecer «Cambiar nombre» a un jugador registrado y decir en una línea qué datos se guardan. Se abre desde la portada y desde las cartas de final; «Volver» y Esc regresan a donde se abrió. La página no SHALL hacer scroll a 390 × 844 ni a 844 × 390: la lista se desplaza dentro de su panel. Cada fila SHALL tener ≥ 44 px y un nombre accesible con puesto, alias, puntos, nivel y estrellas.

#### Scenario: Fuera del top
- WHEN el jugador está en el puesto 27 de 340
- THEN ve los 10 primeros y, al final, su fila «27 · Bruno del Musgo (tú)»

#### Scenario: Ranking vacío
- WHEN la temporada no tiene puntajes
- THEN la pantalla dice «Aún no hay puntajes. ¡Sé el primero!»

#### Scenario: Esc
- WHEN el jugador abre el ranking desde la carta de victoria y pulsa Esc
- THEN vuelve a la carta de victoria

### Requirement: Sin conexión
Si la red o el servidor fallan, el juego SHALL seguir completo. Un envío fallido SHALL quedar pendiente en el dispositivo (solo el mejor) y reintentarse al abrir el ranking o al ganar otra vez. La carta y el ranking SHALL decirlo en una línea, sin bloquear.

#### Scenario: Ganar sin red
- WHEN un jugador registrado gana sin conexión
- THEN la carta muestra su puntaje completo y «No pudimos llegar al bosque. Tu puntaje quedó guardado y lo enviaremos después.»
- AND al abrir el ranking con conexión, el puntaje se envía y aparece su fila

### Requirement: Temporadas
Cada `SCORE_VERSION` SHALL tener su propio ranking (temporada), según `proposal.md` › pregunta 1. Un resultado de otra versión SHALL rechazarse con `outdated` y descartarse del envío pendiente.

#### Scenario: Nueva versión
- WHEN sube `SCORE_VERSION` de 8 a 9
- THEN el ranking muestra «Temporada 9» vacía y los puntajes de la 8 ya no se muestran
