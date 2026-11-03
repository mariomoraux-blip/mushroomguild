# Delta · board-interaction

## ADDED Requirements

### Requirement: Cerrar capas
Toda hoja, ficha o carta abierta sobre el tablero SHALL cerrarse con Esc, con el gesto o botón «atrás» del teléfono, con su botón de cerrar y al tocar fuera de ella, sin salir nunca del juego. Cada capa abierta SHALL agregar una sola entrada al historial del navegador, que se consume al cerrarla. Si una ficha de miembro está abierta y el toque cae sobre una casilla visible del tablero, la ficha SHALL cerrarse y el toque SHALL contar como un toque en esa casilla. Esc o «atrás» sobre la ficha de Maestra Bruma SHALL cerrarla y deseleccionarla; solo "Entendido" pide el hechizo.

#### Scenario: Atrás en el teléfono
- WHEN el jugador abre la ficha de Bruno y hace el gesto «atrás»
- THEN la ficha se cierra, Bruno sigue seleccionado y el juego sigue en la misma partida

#### Scenario: Esc en una ficha
- WHEN el jugador abre la ficha de criatura desde «Reclutar» y pulsa Esc
- THEN la ficha se cierra y no queda ninguna capa abierta

#### Scenario: Tocar una casilla con la ficha abierta
- WHEN Bruno está seleccionado, su ficha abierta y el jugador toca un tronco válido visible
- THEN la ficha se cierra y Bruno descompone ese tronco con un solo toque

#### Scenario: Maestra Bruma con Esc
- WHEN la ficha de Maestra Bruma está abierta y el jugador pulsa Esc
- THEN la ficha se cierra, Maestra Bruma queda sin seleccionar y no se abre la hoja de hechizos

