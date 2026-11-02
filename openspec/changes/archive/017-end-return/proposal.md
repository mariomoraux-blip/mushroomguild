# 017 · Salida tras ver el claro

## Por qué
Al terminar la partida (victoria o fin del invierno), "Ver el claro" cierra la carta de final y deja el tablero sin ningún control activo: el gremio y "Fin del mes" quedan desactivados. No hay forma de volver a jugar ni de rever el puntaje sin recargar la página (reporte del playtest).

## Qué cambia
- Con la partida terminada, el botón de fin de mes dice "Ver final" (nombre accesible "Ver el final de la partida") y vuelve a abrir la carta de final, que ya tiene "Jugar de nuevo".
- Acción nueva del store `showEnd`; sin cambios en `src/rules/`.

## Fuera de alcance
- Un botón "Volver a la portada" desde la partida.
