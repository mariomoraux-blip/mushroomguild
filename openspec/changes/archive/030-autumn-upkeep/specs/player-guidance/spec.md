## MODIFIED Requirements

### Requirement: Avisos de la presión
En los niveles con escarcha, árboles que se apagan o temporadas frías, la bitácora SHALL avisar, en todos esos niveles (también en Ancestral, porque no son pistas): al empezar una estación con escarcha, que tejer cuesta 2 nutrientes; al marcar un árbol, que se apagará al terminar el mes si nadie lo revive; al apagarse, que revivirlo cuesta 7; al terminar un mes de otoño o invierno, lo que comió el gremio o quién se quedó con hambre; y al empezar una estación sin esporas, que los árboles ya no dan esporas. Tocar un árbol marcado o apagado sin miembro seleccionado SHALL explicar su estado y su costo. Un hongo con hambre SHALL decir «Con hambre» en el dock en vez de «Descansa». La meta, la Libreta y la ficha de la Amanita SHALL decir los nutrientes del Árbol Padre del nivel.

#### Scenario: Aviso del árbol marcado
- WHEN empieza el mes 6 en Bosque
- THEN la bitácora dice "Este árbol se apagará al terminar el mes si nadie lo revive."

#### Scenario: Aviso de escarcha
- WHEN empieza el mes 7 en Ancestral
- THEN la bitácora dice "Llegó la escarcha: tejer cuesta 2 nutrientes."

#### Scenario: Hongo con hambre
- WHEN un hongo se queda sin comer al terminar un mes de otoño
- THEN la bitácora lo nombra y su tarjeta del dock dice "Con hambre"
