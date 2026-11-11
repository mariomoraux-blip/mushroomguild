# leaderboard

## Purpose
Ranking global: jugador reconocido por el dispositivo, nombre en el gremio (alias generado o escrito), registro y envío de victorias, verificación en el servidor rejugando el `ScoreResult`, pantalla «Ranking», sin conexión y temporadas por `SCORE_VERSION`. Origen: cambio 036 (archivado); el 038 agregó el nombre escrito. Implementado en `src/rules/verify.ts`, `src/rules/alias.ts`, `src/rules/blocklist.ts`, `src/leaderboard.ts`, `src/api-types.ts`, `src/store.ts`, `src/ui/screens.ts`, `src/ui/story.ts`, `src/ui/sheet.ts` y `server/` (publicado en `/api` por `scripts/build-vercel.mjs`, con Upstash Redis).

## Requirements

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

### Requirement: Nombre en el gremio
El nombre del jugador SHALL ser un alias generado de la forma «<nombre> del/de la <lugar>», con las listas de `src/copy/es.ts`, o un nombre que el jugador escribe. «Otro nombre» SHALL sortear otro alias; «Escribir el mío» SHALL mostrar un campo de texto y «Elegir uno del gremio» SHALL volver a los alias. Un nombre escrito SHALL tener de 3 a 16 caracteres, solo letras latinas (con tildes, ñ y ü) y espacios. Se recortan los espacios de los extremos y los repetidos. No SHALL contener ninguna palabra de la lista negra (`src/rules/blocklist.ts`), comparada sin tildes, mayúsculas, espacios ni letras repetidas. La hoja SHALL explicar el error junto al campo sin borrar lo escrito. El servidor SHALL rechazar con 400 un nombre que no sea un alias generado ni un nombre escrito válido. Dos jugadores pueden compartir nombre. El nombre se puede cambiar desde el ranking sin perder el puntaje.

#### Scenario: Sortear
- WHEN el jugador abre «Tu nombre en el gremio» y pulsa «Otro nombre»
- THEN ve un alias distinto, formado con las listas del juego

#### Scenario: Escribir el nombre
- WHEN el jugador pulsa «Escribir el mío», escribe «  Ana   Lucía » y pulsa «Registrar»
- THEN su nombre en el ranking es «Ana Lucía»

#### Scenario: Formato inválido
- WHEN el jugador escribe «Ana92» o «Al»
- THEN la hoja dice qué falta, sigue abierta con lo escrito y no se envía nada

#### Scenario: Nombre no permitido
- WHEN el jugador escribe un nombre que contiene una palabra de la lista negra, aunque sea con tildes, mayúsculas, espacios o letras repetidas
- THEN la hoja dice «Ese nombre no está permitido en el gremio. Prueba con otro.»

#### Scenario: Nombre inválido en el servidor
- WHEN llega al servidor el nombre «Ana92» o uno de la lista negra
- THEN la respuesta es 400 y no se guarda nada

### Requirement: Registrar un puntaje
Al ganar una partida que cuenta (empezó desde «Nueva partida» en la portada o desde «Jugar de nuevo» después; `?seed`, `?nivel`, `?map` y `?debugState` no cuentan), un jugador sin alias SHALL ver «Registra tu puntaje», que abre «Tu nombre en el gremio»; «Registrar» guarda el alias y envía el resultado, «Ahora no» cierra la hoja sin enviar. Un jugador registrado SHALL enviar sus victorias solo, sin pedir confirmación. El ranking SHALL guardar solo el mejor total de cada jugador por temporada.

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
Cada `SCORE_VERSION` SHALL tener su propio ranking (temporada); el de la versión anterior deja de mostrarse. Un resultado de otra versión SHALL rechazarse con `outdated` y descartarse del envío pendiente.

#### Scenario: Nueva versión
- WHEN sube `SCORE_VERSION` de 8 a 9
- THEN el ranking muestra «Temporada 9» vacía y los puntajes de la 8 ya no se muestran
