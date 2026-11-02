# Delta · player-guidance

## ADDED Requirements

### Requirement: Avisos de la presión
En los niveles con escarcha o árboles que se apagan, la bitácora SHALL avisar, en todos esos niveles (también en Ancestral, porque no son pistas): al empezar una estación con escarcha, que tejer cuesta 2 nutrientes; al marcar un árbol, que se apagará al terminar el mes si nadie lo revive; y al apagarse, que revivirlo cuesta 5. Tocar un árbol marcado o apagado sin miembro seleccionado SHALL explicar su estado y su costo.

#### Scenario: Aviso del árbol marcado
- WHEN empieza el mes 6 en Bosque
- THEN la bitácora dice "Este árbol se apagará al terminar el mes si nadie lo revive."

#### Scenario: Aviso de escarcha
- WHEN empieza el mes 7 en Ancestral
- THEN la bitácora dice "Llegó la escarcha: tejer cuesta 2 nutrientes."

## MODIFIED Requirements

### Requirement: Pista y camino sugerido
El juego SHALL proponer un siguiente paso con `advise(state)`, con esta prioridad: despertar al Árbol Padre > revivir un árbol > hechizo de Maestra Bruma > pasar la voz a una Amanita > descomponer > pasar la voz a un Champiñón > tejer > pasar la voz a un Lactarius > reclutar > terminar el mes. Reclutar SHALL sugerirse solo en dos casos (ver "Cómo reclutar"): cuando ningún miembro listo tiene una acción útil, o cuando falta el rol que pide el siguiente paso sugerido. El miembro sugerido SHALL llevar una ★ en el dock; al seleccionarlo, la casilla sugerida SHALL llevar una ★ en el tablero. Tejer SHALL apuntar a la casilla válida más cercana al árbol gris más cercano a la red mientras haya menos de 3 árboles revividos, y al Árbol Padre después. En Ancestral no SHALL mostrarse ninguna pista: ni ★ en el dock o el tablero, ni «Pista:» en la bitácora (los bots siguen usando `advise`).

#### Scenario: Primer paso
- WHEN empieza una partida nueva en el mapa clásico
- THEN la bitácora dice "Pista: Bruno puede descomponer un tronco junto a la red (+2 nutrientes)."
- AND la tarjeta de Bruno lleva la ★

#### Scenario: Pasar la voz a la Sanadora
- WHEN Rubí ya revivió un árbol este mes, Chispa está disponible, hay esporas y Rubí podría revivir otro
- THEN la pista sugiere que Chispa le pase la voz a Rubí, con la ★ en la casilla donde Rubí trabajó

#### Scenario: Camino hacia un árbol
- WHEN Bruno ya descompuso el tronco el mes 1 y el jugador selecciona a Añil
- THEN la casilla con ★ es la tierra que acerca la red al árbol gris más cercano

#### Scenario: Nadie más puede trabajar
- WHEN ningún miembro disponible tiene una casilla válida y no se puede reclutar
- THEN la pista invita a terminar el mes y recuerda que cada árbol vivo dará 1 espora y 1 nutriente

#### Scenario: Ancestral sin pistas
- WHEN empieza una partida en Ancestral
- THEN ninguna tarjeta del dock lleva la ★ y la bitácora no dice «Pista:»
- AND al seleccionar a un miembro, ninguna casilla lleva la ★

### Requirement: Para qué sirve cada hongo
Cada tarjeta del dock SHALL mostrar el rol y la acción con su costo actual (con escarcha, tejer muestra 2 nutrientes). Tocar una casilla sin miembro seleccionado SHALL explicar en la bitácora qué es esa casilla y quién puede usarla.

#### Scenario: Tarjeta de el Tejedor
- WHEN empieza la partida
- THEN la tarjeta de Añil dice "Tejedor" y "Teje · −1 nutriente"

#### Scenario: Tejedor con escarcha
- WHEN hay escarcha
- THEN la tarjeta de Añil dice "Teje · −2 nutrientes"

#### Scenario: Tocar un tronco
- WHEN no hay miembro seleccionado y el jugador toca un tronco caído
- THEN la bitácora dice "Tronco caído: el Champiñón lo descompone (+2 nutrientes, 2 veces)."
