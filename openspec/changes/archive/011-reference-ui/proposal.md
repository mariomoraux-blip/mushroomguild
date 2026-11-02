# 011 · Interfaz de juego al lenguaje del referente

## Por qué
Con el 010 el tablero ya usa las piezas pintadas, pero el marco de la pantalla seguía siendo papel crema, tablón SVG y tarjetas con texto. En la prueba (2 de noviembre) se sintió lejos del referente visual ("Bosque pintado", `docs/concept/`): bosque saturado detrás del tablero, pastillas redondeadas, medallones de madera y botón principal amarillo.

## Decisiones (2 de noviembre)
- **Fondo:** `backgrounds/menu` detrás de la partida (`menu-landscape` en pantallas apaisadas), con un velo arriba y abajo. Lo reemplazará un fondo de partida propio cuando exista.
- **Dock:** medallones de madera con retrato, cinta con el nombre e insignia (★ sugerido, Zz descansa). La acción del miembro elegido se lee en la bitácora, como ya pasaba.
- **Sistemas del referente** (misiones, estrellas, enciclopedia, logros, potenciadores): no se agregan; solo se toma el lenguaje visual. Quedan anotados como propuesta para el GDD.
- **Logo:** solo en la portada, no en el HUD.

## Qué cambia
- **HUD:** pastilla verde del día con el ícono de la estación; tres pastillas de crema con ícono pintado, valor grande y etiqueta debajo; "?" pintado amarillo. Sin tablón ni etiqueta SVG.
- **Fondo vivo:** el shader pasa a ser una capa transparente de esporas y luciérnagas sobre el bosque pintado.
- **Marco del tablero:** raíces con brillo cálido y sombra.
- **Bitácora:** pergamino con el libro de campo pintado (`ui/icons/book`).
- **Dock:** medallones (ver arriba), reclutar con el sobre pintado y una insignia "+", y "Fin del día" como píldora amarilla con la luna.

## Fuera de alcance
Reglas, pistas y textos no cambian. Portada, "Cómo jugar", intro y victoria; hojas (fichas, ayuda, reclutar); misiones, enciclopedia, logros, moneda y potenciadores.

## Impacto
Modifica `board-interaction` (Retratos del gremio, Estilo cozy, Fondo vivo).
