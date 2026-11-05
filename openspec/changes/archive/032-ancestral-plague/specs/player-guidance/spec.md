## MODIFIED Requirements

### Requirement: Avisos de la presión
En los niveles con escarcha, árboles que se apagan, temporadas frías o plaga, la bitácora SHALL avisar, en todos esos niveles (también en Ancestral, porque no son pistas): al empezar una estación con escarcha, que tejer cuesta 2 nutrientes; al marcar un árbol, que se apagará al terminar el mes si nadie lo revive; al apagarse, que revivirlo cuesta 7; al terminar un mes de otoño o invierno, lo que comió el gremio o quién se quedó con hambre; al empezar una estación sin esporas, que los árboles ya no dan esporas; al marcar la plaga una casilla, que se marchitará al terminar el mes si ningún hongo trabaja a 2 casillas o menos; y al terminar ese mes, que se marchitó o que los hongos la frenaron. Tocar un árbol marcado o apagado, o una casilla con plaga, sin miembro seleccionado SHALL explicar su estado y su costo. La casilla con plaga SHALL verse con un velo violeta, contorno punteado y tres manchas (no solo color), y su etiqueta accesible SHALL decir «con plaga». Un hongo con hambre SHALL decir «Con hambre» en el dock en vez de «Descansa». La meta y la etiqueta del Árbol Padre SHALL decir los árboles revividos y los nutrientes que pide en el nivel de la partida; la Libreta, la ficha de la Amanita y «Cómo jugar» SHALL decir los de Brote y Bosque y, entre paréntesis, los de Ancestral.

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
