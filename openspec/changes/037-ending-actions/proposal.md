# 037 · Acciones de la carta de final

## Por qué
Mario pidió el 10 de noviembre de 2026 mejorar la posición de los botones de la carta de victoria. Con el ranking (036) quedaron cuatro botones del mismo tamaño compitiendo, dos de ellos dorados («Registra tu puntaje» y «Jugar de nuevo»), y no se sabía cuál era la acción principal. Una primera versión (franja con enlace) seguía haciendo competir los botones. Mario definió el orden final.

## Qué cambia (presentación y un texto)
- **«Jugar de nuevo» sale de la carta:** va debajo de ella, grande y con el icono de jugar, como «Nueva partida» en la portada. En horizontal bajo (≤ 540 px de alto) va a la izquierda de la carta, abajo, para que todo entre sin scroll.
- **«Ver el claro» pasa a llamarse «Ver tablero»** y es un enlace de texto debajo de las estrellas y el puntaje (en la derrota, debajo del resumen). Hace lo mismo: cierra la carta y deja ver el claro terminado.
- **Caja del ranking** dentro de la carta, con el fondo suave del desglose: el estado arriba («Puesto N de M», «Enviando…» o el aviso) y dos botones, **«Registra tu puntaje»** como principal (dorado) y **«Ver ranking»** como secundario (madera). Ya registrado, queda solo «Ver ranking».
- **Foco inicial:** «Registra tu puntaje» si está, y si no «Jugar de nuevo». La carta y el botón de fuera forman un solo diálogo (`role="dialog"`).
- **Horizontal bajo:** estrellas y puntaje van en una fila para que la carta quepa entera.

No cambian las reglas ni el comportamiento de «Ver final».
