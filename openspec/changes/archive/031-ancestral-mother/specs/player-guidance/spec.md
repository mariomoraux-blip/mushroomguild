## MODIFIED Requirements

### Requirement: Pista y camino sugerido
El juego SHALL proponer un siguiente paso con `advise(state)`, con esta prioridad: despertar al Árbol Padre > revivir un árbol > hechizo de Maestra Bruma > pasar la voz a una Amanita > descomponer > pasar la voz a un Champiñón > tejer > pasar la voz a un Lactarius > reclutar > terminar el mes. Reclutar SHALL sugerirse solo en dos casos (ver "Cómo reclutar"): cuando ningún miembro listo tiene una acción útil, o cuando falta el rol que pide el siguiente paso sugerido. El miembro sugerido SHALL llevar una ★ en el dock; al seleccionarlo, la casilla sugerida SHALL llevar una ★ en el tablero. Tejer SHALL apuntar a la casilla válida más cercana al árbol gris más cercano a la red mientras haya menos árboles revividos de los que pide el Árbol Padre del nivel (3, o 4 en Ancestral), y al Árbol Padre después. En Ancestral no SHALL mostrarse ninguna pista: ni ★ en el dock o el tablero, ni «Pista:» en la bitácora (los bots siguen usando `advise`). Los avisos de la presión y el aviso de mes vacío no son pistas.

#### Scenario: Primer paso
- WHEN empieza una partida nueva en el mapa clásico
- THEN la bitácora dice "Pista: Bruno puede descomponer un tronco junto a la red (+2 nutrientes)."
- AND la tarjeta de Bruno lleva la ★

#### Scenario: Pasar la voz a la Sanadora
- WHEN Rubí ya revivió un árbol este mes, Chispa está disponible, hay esporas y Rubí podría revivir otro
- THEN la pista sugiere que Chispa le pase la voz a Rubí, con la ★ en la casilla donde Rubí trabajó

#### Scenario: Camino hacia un árbol
- WHEN Bruno ya descompuso el tronco el mes 1 y el jugador selecciona a Indi
- THEN la casilla con ★ es la tierra que acerca la red al árbol gris más cercano

#### Scenario: Nadie más puede trabajar
- WHEN ningún miembro disponible tiene una casilla válida y no se puede reclutar
- THEN la pista invita a terminar el mes y recuerda que cada árbol vivo dará 1 espora y 1 nutriente

#### Scenario: Ancestral sin pistas
- WHEN empieza una partida en Ancestral
- THEN ninguna tarjeta del dock lleva la ★ y la bitácora no dice «Pista:»
- AND al seleccionar a un miembro, ninguna casilla lleva la ★

### Requirement: Avisos de la presión
En los niveles con escarcha, árboles que se apagan o temporadas frías, la bitácora SHALL avisar, en todos esos niveles (también en Ancestral, porque no son pistas): al empezar una estación con escarcha, que tejer cuesta 2 nutrientes; al marcar un árbol, que se apagará al terminar el mes si nadie lo revive; al apagarse, que revivirlo cuesta 7; al terminar un mes de otoño o invierno, lo que comió el gremio o quién se quedó con hambre; y al empezar una estación sin esporas, que los árboles ya no dan esporas. Tocar un árbol marcado o apagado sin miembro seleccionado SHALL explicar su estado y su costo. Un hongo con hambre SHALL decir «Con hambre» en el dock en vez de «Descansa». La meta y la etiqueta del Árbol Padre SHALL decir los árboles revividos y los nutrientes que pide en el nivel de la partida; la Libreta, la ficha de la Amanita y «Cómo jugar» SHALL decir los de Brote y Bosque y, entre paréntesis, los de Ancestral.

#### Scenario: Aviso del árbol marcado
- WHEN empieza el mes 6 en Bosque
- THEN la bitácora dice "Este árbol se apagará al terminar el mes si nadie lo revive."

#### Scenario: Aviso de escarcha
- WHEN empieza el mes 7 en Ancestral
- THEN la bitácora dice "Llegó la escarcha: tejer cuesta 2 nutrientes."

#### Scenario: Hongo con hambre
- WHEN un hongo se queda sin comer al terminar un mes de otoño
- THEN la bitácora lo nombra y su tarjeta del dock dice "Con hambre"

