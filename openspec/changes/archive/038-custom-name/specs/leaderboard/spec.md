# Delta · leaderboard

## REMOVED Requirements

### Requirement: Alias generado
**Reason:** el 038 permite también escribir un nombre propio.
**Migration:** lo reemplaza «Nombre en el gremio»; los alias generados siguen siendo válidos.

## ADDED Requirements

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
