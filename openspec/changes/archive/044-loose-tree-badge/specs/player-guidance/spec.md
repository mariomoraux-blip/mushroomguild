## MODIFIED Requirements

### Requirement: Avisos de la presión
En los niveles con escarcha, árboles que se apagan, temporadas frías o plaga, la bitácora SHALL avisar, en todos esos niveles (también en Ancestral, porque no son pistas): al empezar una estación con escarcha, que tejer cuesta 2 nutrientes; al marcar un árbol, que se apagará al terminar el mes si nadie lo revive; al apagarse, que revivirlo cuesta 7; al terminar un mes de otoño o invierno, lo que comió el gremio o quién se quedó con hambre; al empezar una estación sin esporas, que los árboles ya no dan esporas; al marcar la plaga una casilla, que se marchitará al terminar el mes si ningún hongo trabaja a 2 casillas o menos (con más de una, cuántas y que la plaga crece) y, si marchitarlas dejaría árboles sueltos (ver `game-rules` › Red unida al Hogar), cuántos quedarían sueltos y que no darían nada; al terminar un mes con árboles sueltos (ver `game-rules` › Red unida al Hogar), cuántos no dieron nada porque la red no los une al Hogar; y al terminar un mes, que se marchitó y no se puede tejer hasta que un hongo trabaje a 2 casillas o menos, que los hongos la frenaron o que la limpiaron. Tocar un árbol marcado, apagado o suelto, o una casilla con plaga (tejida o marchita), sin miembro seleccionado SHALL explicar su estado y su costo. La casilla con plaga SHALL verse con su pieza pintada en vez de la red (`board/plague/blight`; `blight-winter` en invierno): bordes de podredumbre violeta con manchas y hilos que se secan, que se leen sin color. Pierde la luz de la red y lleva el contorno punteado que late, como el árbol marcado. Si la pieza no carga, se ve un velo violeta con tres manchas. Marchita, SHALL verse con la red muerta (`board/plague/withered`) y el mismo contorno, hasta que la limpien. Su etiqueta accesible SHALL decir «con plaga» o, marchita, «con plaga marchita». Un hongo con hambre SHALL decir «Con hambre» en el dock en vez de «Descansa». La meta y la etiqueta del Árbol Padre SHALL decir los árboles revividos y los nutrientes que pide en el nivel de la partida; la Libreta, la ficha de la Amanita y «Cómo jugar» SHALL decir los de Brote y Bosque y, entre paréntesis, los de Ancestral.

#### Scenario: Aviso del árbol marcado
- WHEN empieza el mes 6 en Bosque
- THEN la bitácora dice "Este árbol se apagará al terminar el mes si nadie lo revive."

#### Scenario: Aviso de escarcha
- WHEN empieza el mes 7 en Ancestral
- THEN la bitácora dice "Llegó la escarcha: tejer cuesta 2 nutrientes."

#### Scenario: Hongo con hambre
- WHEN un hongo se queda sin comer al terminar un mes de otoño
- THEN la bitácora lo nombra y su tarjeta del dock dice "Con hambre"

#### Scenario: Aviso de plaga
- WHEN empieza el mes 7 en Ancestral con casillas tejidas
- THEN la bitácora dice que la plaga llegó a la red y tocar la casilla marcada explica que se marchitará si ningún hongo trabaja a 2 casillas o menos

#### Scenario: Plaga marchita
- WHEN la plaga marchita una casilla en Ancestral
- THEN tocarla explica que no se puede tejer hasta que un hongo trabaje a 2 casillas o menos y su etiqueta dice «con plaga marchita»

#### Scenario: Árbol suelto
- WHEN termina un mes en Bosque con un árbol vivo que la red no une al Hogar
- THEN la bitácora dice "Un árbol no dio nada: la red no lo une al Hogar." y tocarlo explica que está suelto y que hay que tejer un camino de red hasta él

#### Scenario: Aviso previo del árbol suelto
- WHEN la plaga marca la única casilla de la red que une un árbol vivo con el Hogar en Bosque
- THEN la bitácora dice, después del aviso de la plaga, "Si se marchita, un árbol quedará suelto y no dará nada."
