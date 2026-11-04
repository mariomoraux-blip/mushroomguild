# Delta · player-guidance

## MODIFIED Requirements

### Requirement: Libreta de campo
El HUD SHALL tener un botón "?" que abre "Cómo jugar" (`title-screens`), y desde ahí la Libreta de campo: la meta, cómo se juega en 4 pasos, para qué sirve cada una de las 5 especies, cada una con su retrato, su nombre, qué hace y su receta visual (ver «Recetas visuales») y la leyenda de casillas. La libreta no se abre sola; se cierra con "¡A jugar!", el botón de cerrar o Esc.

#### Scenario: Consultar la ayuda
- WHEN el jugador pulsa "?" durante la partida y luego "Libreta de campo"
- THEN se abre la Libreta de campo con las 5 especies, qué hace cada una y su receta visual con lo que gana o gasta

## ADDED Requirements

### Requirement: Recetas visuales
Cada especie SHALL tener una receta visual: una tira «antes → después» hecha con las piezas del tablero que muestra dónde trabaja, cómo queda y una pastilla con lo que gana o gasta, con los números de las reglas (`COST`, `GAIN`). La sección «Cómo usarlo» de la ficha SHALL mostrar la receta de su especie sobre el texto (Maestra Bruma muestra dos, cada una con el nombre de su hechizo arriba: Brote arcano y Lluvia de esporas). Cada receta SHALL tener una etiqueta accesible que diga el antes y el después. Al abrir la ficha o la Libreta, el «después» SHALL aparecer una sola vez con un saltito (`standard`, `springy`); con `prefers-reduced-motion: reduce`, la receta SHALL verse quieta.

| Especie | Antes | Después | Pastilla |
| --- | --- | --- | --- |
| Lactarius indigo | red y tierra resaltada | red y red | −1 nutriente |
| Champiñón | red y tronco resaltado | red y tronco usado | +2 nutrientes |
| Amanita muscaria | red y árbol gris resaltado | red y árbol vivo | −3 nutrientes |
| Gliophorus psittacinus | compañero cansado (Zz) | compañero listo | −1 espora |
| Maestra Bruma | red y roca resaltada (Brote arcano); árbol vivo resaltado (Lluvia de esporas) | red y red; árbol vivo | —; +esporas y +nutrientes |

#### Scenario: Ficha de Bruno
- WHEN el jugador abre la ficha de Bruno
- THEN «Cómo usarlo» muestra la red y un tronco resaltado, una flecha, la red y el tronco usado, y «+2» nutrientes
- AND el lector de pantalla lee el antes y el después de la receta

#### Scenario: Libreta con las cinco recetas
- WHEN el jugador abre la Libreta de campo
- THEN ve las cinco especies, cada una con su receta

#### Scenario: Movimiento reducido
- WHEN el sistema pide movimiento reducido y el jugador abre la ficha de Rubí
- THEN la receta se ve completa y quieta desde el principio
