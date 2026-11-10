# player-guidance

## Purpose
Guía al jugador sin tutorial obligatorio: pistas con ★, fichas de cada hongo al seleccionarlo, Libreta de campo, explicación de casillas y reclutamiento visible. Lógica en `src/rules/advice.ts`; interfaz en `src/store.ts` y `src/ui/`.

## Requirements

### Requirement: Ficha al seleccionar un hongo
La primera vez que el jugador selecciona a un miembro de cada especie, el juego SHALL mostrar su ficha: nombre del miembro y especie, rol, un contexto corto, su frase entre comillas y, según la especie, estas secciones:

| Sección | Especies |
| --- | --- |
| Habilidad | Todas |
| Cómo usarlo | Todas |
| Movimiento (cómo se mueve o desde dónde trabaja) | Todas |
| Nutrientes (cómo los consigue o cuánto gasta) | Todas |
| Qué árboles cura | Amanita muscaria |
| Para qué sirve la mensajera | Gliophorus psittacinus |
| Poderes y para qué sirven | Maestra Bruma |

Al cerrar la ficha con "Entendido", el miembro SHALL seguir seleccionado con sus casillas resaltadas (para Maestra Bruma, se pide después el hechizo). Las siguientes selecciones de esa especie no SHALL abrir la ficha sola: la bitácora SHALL ofrecer un botón "Ficha" para volver a verla. Las especies ya vistas se recuerdan entre visitas.

#### Scenario: Primera vez con el Tejedor
- WHEN el jugador selecciona a Indi por primera vez
- THEN se abre la ficha "Indi · Lactarius indigo" con la frase "«Si lo cortas, sangra tinta azul. Preferiría que no lo cortaras.»" y las secciones Habilidad, Cómo usarlo, Movimiento y Nutrientes
- AND al pulsar "Entendido" Indi sigue seleccionado y sus casillas válidas se ven resaltadas

#### Scenario: Segunda vez
- WHEN el jugador vuelve a seleccionar a Indi
- THEN la ficha no se abre sola y la bitácora tiene el botón "Ficha" que la muestra

#### Scenario: La Sanadora explica qué árboles cura
- WHEN se abre la ficha de Rubí
- THEN la sección "Qué árboles cura" nombra los árboles grises y el Árbol Padre con sus costos

#### Scenario: La Mensajera
- WHEN se abre la ficha de Chispa
- THEN la sección "Para qué sirve la mensajera" explica que pasar la voz es una segunda jugada que convierte esporas en trabajo extra, cuánto cuesta y que no puede llamar a otra Gliophorus ni a Maestra Bruma

#### Scenario: Poderes de Maestra Bruma
- WHEN se abre la ficha de Maestra Bruma
- THEN la sección "Poderes" explica el Brote arcano y la Lluvia de esporas y para qué sirve cada uno
- AND al pulsar "Entendido" se pide elegir el hechizo

### Requirement: Libreta de campo
El HUD SHALL tener un botón "?" que abre "Cómo jugar" (`title-screens`), y desde ahí la Libreta de campo: la meta, cómo se juega en 4 pasos, para qué sirve cada una de las 5 especies, cada una con su retrato, su nombre, qué hace y su receta visual (ver «Recetas visuales») y la leyenda de casillas. La libreta no se abre sola; se cierra con "¡A jugar!", el botón de cerrar o Esc.

#### Scenario: Consultar la ayuda
- WHEN el jugador pulsa "?" durante la partida y luego "Libreta de campo"
- THEN se abre la Libreta de campo con las 5 especies, qué hace cada una y su receta visual con lo que gana o gasta

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

### Requirement: Para qué sirve cada hongo
Cada tarjeta del dock SHALL mostrar el rol y la acción con su costo actual (con escarcha, tejer muestra 2 nutrientes). Tocar una casilla sin miembro seleccionado SHALL explicar en la bitácora qué es esa casilla y quién puede usarla.

#### Scenario: Tarjeta de el Tejedor
- WHEN empieza la partida
- THEN la tarjeta de Indi dice "Tejedor" y "Teje · −1 nutriente"

#### Scenario: Tejedor con escarcha
- WHEN hay escarcha
- THEN la tarjeta de Indi dice "Teje · −2 nutrientes"

#### Scenario: Tocar un tronco
- WHEN no hay miembro seleccionado y el jugador toca un tronco caído
- THEN la bitácora dice "Tronco caído: el Champiñón lo descompone (+2 nutrientes, 2 veces)."

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

### Requirement: Meta visible
El Árbol Padre SHALL marcarse como meta en el tablero en todo momento, y las casillas de la red SHALL dibujarse con un contorno de micelio visible.

#### Scenario: Inicio
- WHEN empieza la partida
- THEN el Árbol Padre tiene el aro de meta y su etiqueta accesible dice que es la meta

### Requirement: Avisos de la presión
En los niveles con escarcha, árboles que se apagan, temporadas frías o plaga, la bitácora SHALL avisar, en todos esos niveles (también en Ancestral, porque no son pistas): al empezar una estación con escarcha, que tejer cuesta 2 nutrientes; al marcar un árbol, que se apagará al terminar el mes si nadie lo revive; al apagarse, que revivirlo cuesta 7; al terminar un mes de otoño o invierno, lo que comió el gremio o quién se quedó con hambre; al empezar una estación sin esporas, que los árboles ya no dan esporas; al marcar la plaga una casilla, que se marchitará al terminar el mes si ningún hongo trabaja a 2 casillas o menos; y al terminar un mes, que se marchitó y no se puede tejer hasta que un hongo trabaje a 2 casillas o menos, que los hongos la frenaron o que la limpiaron. Tocar un árbol marcado o apagado, o una casilla con plaga (tejida o marchita), sin miembro seleccionado SHALL explicar su estado y su costo. La casilla con plaga SHALL verse con su pieza pintada en vez de la red (`board/plague/blight`; `blight-winter` en invierno): bordes de podredumbre violeta con manchas y hilos que se secan, que se leen sin color. Pierde la luz de la red y lleva el contorno punteado que late, como el árbol marcado. Si la pieza no carga, se ve un velo violeta con tres manchas. Marchita, SHALL verse con la red muerta (`board/plague/withered`) y el mismo contorno, hasta que la limpien. Su etiqueta accesible SHALL decir «con plaga» o, marchita, «con plaga marchita». Un hongo con hambre SHALL decir «Con hambre» en el dock en vez de «Descansa». La meta y la etiqueta del Árbol Padre SHALL decir los árboles revividos y los nutrientes que pide en el nivel de la partida; la Libreta, la ficha de la Amanita y «Cómo jugar» SHALL decir los de Brote y Bosque y, entre paréntesis, los de Ancestral.

#### Scenario: Aviso del árbol marcado
- WHEN empieza el mes 6 en Bosque
- THEN la bitácora dice "Este árbol se apagará al terminar el mes si nadie lo revive."

#### Scenario: Aviso de escarcha
- WHEN empieza el mes 7 en Ancestral
- THEN la bitácora dice "Llegó la escarcha: tejer cuesta 2 nutrientes."

#### Scenario: Hongo con hambre
- WHEN un hongo se queda sin comer al terminar un mes de otoño
- THEN la bitácora lo nombra y su tarjeta del dock dice "Con hambre"

#### Scenario: Aviso de plaga
- WHEN empieza el mes 7 en Ancestral con casillas tejidas
- THEN la bitácora dice que la plaga llegó a la red y tocar la casilla marcada explica que se marchitará si ningún hongo trabaja a 2 casillas o menos

#### Scenario: Plaga marchita
- WHEN la plaga marchita una casilla en Ancestral
- THEN tocarla explica que no se puede tejer hasta que un hongo trabaje a 2 casillas o menos y su etiqueta dice «con plaga marchita»

### Requirement: Aviso de mes vacío
Cuando hay miembros listos, ninguno tiene una casilla válida y en el mes todavía nadie actuó (reclutar no cuenta), la bitácora SHALL decir que nadie tiene trabajo este mes y cuántos nutrientes traerá la hojarasca al terminarlo: «Nadie tiene trabajo este mes. Termina el mes: la hojarasca traerá N nutrientes.», o «Nadie tiene trabajo este mes. Termina el mes.» si no hay árboles vivos. El aviso SHALL mostrarse en todos los niveles, también en Ancestral, porque describe el estado y no sugiere ningún miembro ni casilla. Tocar un miembro SHALL seguir mostrando su motivo de inactividad.

#### Scenario: Mes vacío en Ancestral
- WHEN empieza el mes 4 en Ancestral con la semilla 745, la red en el Hogar, (2,7), (4,7), (4,6) y el árbol vivo (4,5), 2 nutrientes y el gremio inicial listo
- THEN la bitácora dice «Nadie tiene trabajo este mes. Termina el mes: la hojarasca traerá 1 nutriente.»
- AND no dice «Pista:»

#### Scenario: Final normal de un mes
- WHEN en el mes ya actuó algún miembro y a los que quedan listos no les queda ninguna casilla válida
- THEN no se muestra el aviso de mes vacío

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
