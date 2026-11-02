# Delta · player-guidance

## MODIFIED Requirements

### Requirement: Pista y camino sugerido
El juego SHALL proponer siempre un siguiente paso con `advise(state)`, con esta prioridad: despertar al Árbol Padre > revivir un árbol > hechizo de Maestra Bruma > pasar la voz a una Amanita > descomponer > pasar la voz a un Champiñón > tejer > pasar la voz a un Lactarius > reclutar > terminar el mes. Reclutar SHALL sugerirse solo en dos casos (ver "Cómo reclutar"): cuando ningún miembro listo tiene una acción útil, o cuando falta el rol que pide el siguiente paso sugerido. El miembro sugerido SHALL llevar una ★ en el dock; al seleccionarlo, la casilla sugerida SHALL llevar una ★ en el tablero. Tejer SHALL apuntar a la casilla válida más cercana al árbol gris más cercano a la red mientras haya menos de 3 árboles revividos, y al Árbol Padre después.

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

### Requirement: Cómo reclutar
El chip de esporas del HUD SHALL abrir la hoja de reclutar. Cada fila de la hoja SHALL decir para qué sirve la especie. Con esporas suficientes y cupo, la pista SHALL sugerir reclutar solo en dos casos: (1) ningún miembro listo tiene una acción útil; entonces sugiere un segundo Lactarius mientras la red no toque al Árbol Padre, después una Gliophorus y después otra Amanita; (2) falta el rol que pide el siguiente paso sugerido: un compañero que ya trabajó este mes (Amanita o Champiñón) tendría trabajo útil si le pasaran la voz y el gremio no tiene Gliophorus; entonces sugiere una Gliophorus. Mientras haya miembros listos con acciones útiles y no falte un rol, la pista no SHALL sugerir reclutar.

#### Scenario: Nadie tiene una acción útil
- WHEN el jugador tiene 2 esporas, cupo en el gremio y ningún miembro listo tiene una casilla válida
- THEN la pista sugiere reclutar y dice cuál especie conviene
- AND tocar el chip de esporas abre la hoja de reclutar

#### Scenario: Falta la Mensajera
- WHEN Rubí ya revivió un árbol este mes y podría revivir otro, hay 2 esporas y cupo, y el gremio no tiene Gliophorus
- THEN la pista sugiere reclutar una Gliophorus

#### Scenario: Hay trabajo útil
- WHEN el jugador tiene 2 esporas y cupo, y Bruno puede descomponer un tronco
- THEN la pista sugiere a Bruno y no sugiere reclutar
