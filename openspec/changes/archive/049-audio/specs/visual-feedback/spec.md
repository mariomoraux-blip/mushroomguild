## MODIFIED Requirements

### Requirement: Peso de la página
El total de assets publicados (`public/assets/`) SHALL ser de 4 MB o menos, sin contar el JavaScript del juego, y las piezas de portada, intro y victoria SHALL cargarse solo al mostrarse esas pantallas. Lo publicado SHALL ser WebP, salvo el audio (049): `.m4a` y el mapa `sfx.json` dentro de `audio/`, que se descargan solo después del primer gesto del jugador.

#### Scenario: Build de producción
- WHEN se ejecuta `npm run test`
- THEN la suma de `public/assets/` no supera 4 MB

#### Scenario: Partida directa
- WHEN se abre `?map=clasico`
- THEN no se descargan el logo ni los fondos de intro y victoria

#### Scenario: Audio diferido
- WHEN se abre el juego y nadie toca la pantalla ni el teclado
- THEN no se descarga ningún archivo de `audio/`
