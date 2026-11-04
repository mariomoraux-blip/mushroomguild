# Delta · player-guidance

## MODIFIED Requirements

### Requirement: Cómo reclutar
El chip de esporas del HUD SHALL abrir la hoja de reclutar. Cada fila de la hoja SHALL decir para qué sirve la especie. La hoja SHALL decir cuánto cuesta el próximo recluta y que cada uno cuesta más (3, 5 y 7), o que el gremio está completo; los botones de reclutar SHALL habilitarse solo si alcanza para el próximo. El medallón «Reclutar» del dock SHALL atenuarse si no alcanza o no hay cupo, y su etiqueta accesible SHALL decir el costo del próximo (o «gremio completo»); la del chip de esporas también. «Cómo jugar» y la Libreta de campo SHALL decir la curva: «Con esporas reclutas otro hongo: cuesta 3, luego 5 y luego 7.» Con esporas suficientes para el próximo recluta y cupo, la pista SHALL sugerir reclutar solo en dos casos: (1) ningún miembro listo tiene una acción útil; entonces sugiere un segundo Lactarius mientras la red no toque al Árbol Padre, después una Gliophorus y después otra Amanita; (2) falta el rol que pide el siguiente paso sugerido: un compañero que ya trabajó este mes (Amanita o Champiñón) tendría trabajo útil si le pasaran la voz y el gremio no tiene Gliophorus; entonces sugiere una Gliophorus. Mientras haya miembros listos con acciones útiles y no falte un rol, la pista no SHALL sugerir reclutar.

#### Scenario: Nadie tiene una acción útil
- WHEN el jugador tiene 3 esporas, cupo en el gremio y ningún miembro listo tiene una casilla válida
- THEN la pista sugiere reclutar y dice cuál especie conviene
- AND tocar el chip de esporas abre la hoja de reclutar

#### Scenario: No alcanza para el próximo
- WHEN el gremio ya tiene un recluta, el jugador tiene 4 esporas y ningún miembro listo tiene una casilla válida
- THEN la pista no sugiere reclutar
- AND la hoja de reclutar dice "El próximo recluta cuesta 5 esporas" y sus botones están deshabilitados

#### Scenario: Falta la Mensajera
- WHEN Rubí ya revivió un árbol este mes y podría revivir otro, hay 3 esporas y cupo, y el gremio no tiene Gliophorus
- THEN la pista sugiere reclutar una Gliophorus

#### Scenario: Hay trabajo útil
- WHEN el jugador tiene 3 esporas y cupo, y Bruno puede descomponer un tronco
- THEN la pista sugiere a Bruno y no sugiere reclutar
