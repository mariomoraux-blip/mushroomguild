# 005 · Guiar al jugador

## Por qué
En el primer playtest en teléfono (preview de Vercel del 002) la mecánica no se entendió: no queda claro **para qué sirve cada hongo**, **qué camino seguir** ni **cómo reclutar**. Es el riesgo principal del GDD ("la regla de adyacencia no se entiende sin explicación"), cuya mitigación prevista es resaltar la red y añadir pistas contextuales.

## Qué cambia
- **Ficha al seleccionar un hongo:** la primera vez que eliges a cada especie se abre su ficha (contexto, frase, habilidad, cómo usarlo, movimiento, nutrientes y, según la especie, qué árboles cura, para qué sirve la mensajera o sus poderes). Después se consulta con el botón "Ficha" de la bitácora.
- **Libreta de campo:** botón "?" en el HUD con la meta, cómo se juega, las especies y la leyenda de casillas, como referencia (no se abre sola).
- **Pista y camino sugerido:** una función pura `advise(state)` en `src/rules` propone el siguiente paso. El miembro sugerido lleva una ★ en el dock; al seleccionarlo, la casilla sugerida lleva una ★ en el tablero. La bitácora muestra la pista cuando no hay nada seleccionado. Tejer apunta al árbol gris más cercano hasta tener 2 revividos y luego al Árbol Madre.
- **Para qué sirve cada hongo:** las tarjetas del dock muestran la acción y su costo; tocar una casilla sin miembro elegido explica qué es.
- **Cómo reclutar:** el chip de esporas del HUD abre la hoja de reclutar; con esporas suficientes la pista sugiere reclutar y qué especie; cada fila de la hoja dice para qué sirve esa especie.
- **Meta visible:** el Árbol Madre se marca como meta en el tablero y la red se dibuja con más contraste.

## Fuera de alcance
Cartas de intro y finales (003), animaciones (004), cambios de reglas o balance.

## Impacto
Capacidad nueva: `player-guidance`. Depende de 001 y 002. Sesión estimada: 1.
