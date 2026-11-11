# 038 · Escribir tu nombre en el gremio

## Por qué
Mario pidió el 10 de noviembre de 2026 que, además de los alias generados (que le gustan), el jugador pueda escribir el nombre que quiera para el ranking. El 036 lo había dejado fuera a propósito porque el ranking es público. Este cambio lo abre con un filtro.

## Decisiones (Mario, 10 de noviembre de 2026)
- **Moderación:** lista negra compartida por el cliente y el servidor (`src/rules/blocklist.ts`). El nombre se normaliza (sin tildes, minúsculas, sin espacios, sin letras repetidas) y se rechaza si contiene una palabra de la lista en español o inglés. Sin servicios externos.
- **Formato:** de 3 a 16 caracteres, solo letras latinas (con tildes, ñ y ü) y espacios. Se recortan los espacios de los extremos y los repetidos. Sin números ni signos: así no hay trucos como «p3nd3j0».
- **Duplicados:** dos jugadores pueden usar el mismo nombre, como con los alias. El nombre no identifica; la clave del dispositivo sí.

## Qué cambia
- **Hoja «Tu nombre en el gremio»:** junto a «Otro nombre», un botón **«Escribir el mío»** cambia el alias por un campo de texto con su ayuda («De 3 a 16 letras…»). **«Elegir uno del gremio»** vuelve a los alias. «Registrar» (o «Guardar») valida en el momento y explica el error junto al campo, sin cerrar la hoja ni borrar lo escrito. Enter registra y Esc cierra.
- **Reglas (`src/rules/alias.ts`):** `checkName` (formato y lista negra) y `cleanName`. `isValidAlias` acepta un alias generado o un nombre escrito válido y ya limpio.
- **Servidor:** sin cambios de rutas. `/api/player` y `/api/scores` usan el nuevo `isValidAlias`, así que un nombre que no pasa el filtro recibe 400.
- **Cliente:** `saveAlias` primero avisa al servidor y solo guarda el nombre en el dispositivo si el servidor no lo rechaza. Sin conexión lo guarda igual, porque el cliente ya lo validó con las mismas reglas.

No cambian la puntuación, las temporadas ni el resto del ranking.
