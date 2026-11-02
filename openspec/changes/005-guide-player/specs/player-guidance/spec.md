# Delta · player-guidance

## ADDED Requirements

### Requirement: Libreta de campo
El HUD SHALL tener un botón "?" que abre la Libreta de campo: la meta, cómo se juega en 4 pasos, para qué sirve cada una de las 5 especies (con su costo) y la leyenda de casillas. La libreta SHALL abrirse sola en la primera visita y cerrarse con "¡A jugar!", el botón de cerrar o Esc.

#### Scenario: Primera visita
- WHEN el jugador abre el juego por primera vez en ese navegador
- THEN se muestra la Libreta de campo con la meta "Despierta al Árbol Madre antes de que acabe el invierno"
- AND al cerrarla no vuelve a abrirse sola en las visitas siguientes

#### Scenario: Consultar la ayuda
- WHEN el jugador pulsa "?" durante la partida
- THEN se abre la Libreta de campo con las 5 especies, qué hace cada una y cuánto cuesta

### Requirement: Pista y camino sugerido
El juego SHALL proponer siempre un siguiente paso con `advise(state)` (lógica pura en `src/rules`), con esta prioridad: despertar al Árbol Madre > revivir un árbol > reclutar (con esporas suficientes y cupo) > descomponer > tejer > pasar la voz > hechizo > terminar el día. El miembro sugerido SHALL llevar una ★ en el dock; al seleccionarlo, la casilla sugerida SHALL llevar una ★ en el tablero. Con nada seleccionado, la bitácora SHALL mostrar la pista. Tejer SHALL apuntar a la casilla válida más cercana al árbol gris más cercano a la red mientras haya menos de 2 árboles revividos, y al Árbol Madre después.

#### Scenario: Primer paso
- WHEN empieza una partida nueva
- THEN la bitácora dice "Pista: Bruno puede descomponer un tronco junto a la red (+3 nutrientes)."
- AND la tarjeta de Bruno lleva la ★

#### Scenario: Camino hacia un árbol
- WHEN Bruno ya descompuso el tronco el día 1 y el jugador selecciona a Añil
- THEN la casilla con ★ es la tierra que acerca la red al árbol gris más cercano

#### Scenario: Nadie más puede trabajar
- WHEN ningún miembro disponible tiene una casilla válida
- THEN la pista invita a terminar el día y recuerda que cada árbol vivo dará 1 espora y 1 nutriente

### Requirement: Para qué sirve cada hongo
Cada tarjeta del dock SHALL mostrar el rol y la acción con su costo. Tocar una casilla sin miembro seleccionado SHALL explicar en la bitácora qué es esa casilla y quién puede usarla.

#### Scenario: Tarjeta del Tejedor
- WHEN empieza la partida
- THEN la tarjeta de Añil dice "Tejedor" y "Teje · −1 nutriente"

#### Scenario: Tocar un tronco
- WHEN no hay miembro seleccionado y el jugador toca un tronco caído
- THEN la bitácora dice "Tronco caído: el Champiñón lo descompone (+3 nutrientes, 2 veces)."

### Requirement: Cómo reclutar
El chip de esporas del HUD SHALL abrir la hoja de reclutar. Cada fila de la hoja SHALL decir para qué sirve la especie. Con esporas suficientes y cupo, la pista SHALL sugerir reclutar y qué especie conviene: Gliophorus si faltan nutrientes y ningún tronco toca la red; si no, Lactarius mientras la red no toque al Árbol Madre; después, Amanita.

#### Scenario: Primeras esporas
- WHEN el jugador tiene 2 esporas, cupo en el gremio y ningún árbol por revivir ni Árbol Madre por despertar
- THEN la pista dice que puede reclutar y cuál especie conviene
- AND tocar el chip de esporas abre la hoja de reclutar

### Requirement: Meta visible
El Árbol Madre SHALL marcarse como meta en el tablero en todo momento, y las casillas de la red SHALL dibujarse con un contorno de micelio visible.

#### Scenario: Inicio
- WHEN empieza la partida
- THEN el Árbol Madre tiene el aro de meta y su etiqueta accesible dice que es la meta
