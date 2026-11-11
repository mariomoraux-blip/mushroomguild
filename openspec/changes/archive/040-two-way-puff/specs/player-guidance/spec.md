## MODIFIED Requirements

### Requirement: Recetas visuales
Cada especie SHALL tener una receta visual: una tira «antes → después» hecha con las piezas del tablero que muestra dónde trabaja, cómo queda y una pastilla con lo que gana o gasta, con los números de las reglas (`COST`, `GAIN`). La sección «Cómo usarlo» de la ficha SHALL mostrar la receta de su especie sobre el texto (Maestra Bruma y Pompón muestran dos, cada una con su nombre arriba: Brote arcano y Lluvia de esporas; Soplar esporas y Abonar el árbol). Cada receta SHALL tener una etiqueta accesible que diga el antes y el después. Al abrir la ficha o la Libreta, el «después» SHALL aparecer una sola vez con un saltito (`standard`, `springy`); con `prefers-reduced-motion: reduce`, la receta SHALL verse quieta.

| Especie | Antes | Después | Pastilla |
| --- | --- | --- | --- |
| Lactarius indigo | red y tierra resaltada | red y red | −1 nutriente |
| Champiñón | red y tronco resaltado | red y tronco usado | +2 nutrientes |
| Amanita muscaria | red y árbol gris resaltado | red y árbol vivo | −3 nutrientes |
| Gliophorus psittacinus | compañero cansado (Zz) | compañero listo | −1 espora |
| Morchella esculenta | red y roca resaltada | red y tierra | −2 nutrientes |
| Ganoderma lucidum | red, una tierra y árbol gris resaltado | árbol vivo | −3 nutrientes, −1 espora |
| Lycoperdon perlatum | árbol vivo resaltado (Soplar esporas; Abonar el árbol) | árbol vivo; árbol vivo | −1 nutriente, +2 esporas; −2 esporas, +1 nutriente |
| Maestra Bruma | red y roca resaltada (Brote arcano); árbol vivo resaltado (Lluvia de esporas) | red y red; árbol vivo | —; +esporas y +nutrientes |

#### Scenario: Ficha de Bruno
- WHEN el jugador abre la ficha de Bruno
- THEN «Cómo usarlo» muestra la red y un tronco resaltado, una flecha, la red y el tronco usado, y «+2» nutrientes
- AND el lector de pantalla lee el antes y el después de la receta

#### Scenario: Libreta con las cinco recetas
- WHEN el jugador abre la Libreta de campo
- THEN ve las ocho especies, cada una con su receta (Maestra Bruma y Pompón, con dos)

#### Scenario: Movimiento reducido
- WHEN el sistema pide movimiento reducido y el jugador abre la ficha de Rubí
- THEN la receta se ve completa y quieta desde el principio
