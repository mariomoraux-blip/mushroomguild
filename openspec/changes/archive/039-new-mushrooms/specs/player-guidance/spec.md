## MODIFIED Requirements

### Requirement: Cómo reclutar
El chip de esporas del HUD SHALL abrir la hoja de reclutar. Cada fila de la hoja SHALL decir para qué sirve la especie. La hoja SHALL decir cuánto cuesta el próximo recluta y que cada uno cuesta más (3, 5 y 7), o que el gremio está completo; los botones de reclutar SHALL habilitarse solo si alcanza para el próximo. El medallón «Reclutar» del dock SHALL atenuarse si no alcanza o no hay cupo, y su etiqueta accesible SHALL decir el costo del próximo (o «gremio completo»); la del chip de esporas también. «Cómo jugar» y la Libreta de campo SHALL decir la curva: «Con esporas reclutas otro hongo: cuesta 3, luego 5 y luego 7.» Con esporas suficientes para el próximo recluta y cupo, la pista SHALL sugerir reclutar solo en dos casos: (1) ningún miembro listo tiene una acción útil; entonces sugiere la primera especie que falte en el gremio, en este orden: Gliophorus, Morchella, Ganoderma y Lycoperdon; (2) falta el rol que pide el siguiente paso sugerido: un compañero que ya trabajó este mes (Amanita o Champiñón) tendría trabajo útil si le pasaran la voz y el gremio no tiene Gliophorus; entonces sugiere una Gliophorus. Mientras haya miembros listos con acciones útiles y no falte un rol, la pista no SHALL sugerir reclutar.

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

#### Scenario: Una sola de cada especie en la hoja
- WHEN el gremio ya tiene a Chispa y el jugador abre la hoja de reclutar
- THEN la fila de la Gliophorus está deshabilitada y dice que ya está en el gremio

### Requirement: Recetas visuales
Cada especie SHALL tener una receta visual: una tira «antes → después» hecha con las piezas del tablero que muestra dónde trabaja, cómo queda y una pastilla con lo que gana o gasta, con los números de las reglas (`COST`, `GAIN`). La sección «Cómo usarlo» de la ficha SHALL mostrar la receta de su especie sobre el texto (Maestra Bruma muestra dos, cada una con el nombre de su hechizo arriba: Brote arcano y Lluvia de esporas). Cada receta SHALL tener una etiqueta accesible que diga el antes y el después. Al abrir la ficha o la Libreta, el «después» SHALL aparecer una sola vez con un saltito (`standard`, `springy`); con `prefers-reduced-motion: reduce`, la receta SHALL verse quieta.

| Especie | Antes | Después | Pastilla |
| --- | --- | --- | --- |
| Lactarius indigo | red y tierra resaltada | red y red | −1 nutriente |
| Champiñón | red y tronco resaltado | red y tronco usado | +2 nutrientes |
| Amanita muscaria | red y árbol gris resaltado | red y árbol vivo | −3 nutrientes |
| Gliophorus psittacinus | compañero cansado (Zz) | compañero listo | −1 espora |
| Morchella esculenta | red y roca resaltada | red y tierra | −2 nutrientes |
| Ganoderma lucidum | red, una tierra y árbol gris resaltado | red, la tierra y árbol vivo | −3 nutrientes, −1 espora |
| Lycoperdon perlatum | árbol vivo resaltado | árbol vivo y esporas | −1 nutriente, +2 esporas |
| Maestra Bruma | red y roca resaltada (Brote arcano); árbol vivo resaltado (Lluvia de esporas) | red y red; árbol vivo | —; +esporas y +nutrientes |

#### Scenario: Ficha de Bruno
- WHEN el jugador abre la ficha de Bruno
- THEN «Cómo usarlo» muestra la red y un tronco resaltado, una flecha, la red y el tronco usado, y «+2» nutrientes
- AND el lector de pantalla lee el antes y el después de la receta

#### Scenario: Libreta con las cinco recetas
- WHEN el jugador abre la Libreta de campo
- THEN ve las ocho especies, cada una con su receta

#### Scenario: Movimiento reducido
- WHEN el sistema pide movimiento reducido y el jugador abre la ficha de Rubí
- THEN la receta se ve completa y quieta desde el principio
