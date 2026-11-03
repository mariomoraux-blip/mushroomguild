# Delta · player-guidance

## MODIFIED Requirements

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

### Requirement: Pista y camino sugerido
El juego SHALL proponer un siguiente paso con `advise(state)`, con esta prioridad: despertar al Árbol Padre > revivir un árbol > hechizo de Maestra Bruma > pasar la voz a una Amanita > descomponer > pasar la voz a un Champiñón > tejer > pasar la voz a un Lactarius > reclutar > terminar el mes. Reclutar SHALL sugerirse solo en dos casos (ver "Cómo reclutar"): cuando ningún miembro listo tiene una acción útil, o cuando falta el rol que pide el siguiente paso sugerido. El miembro sugerido SHALL llevar una ★ en el dock; al seleccionarlo, la casilla sugerida SHALL llevar una ★ en el tablero. Tejer SHALL apuntar a la casilla válida más cercana al árbol gris más cercano a la red mientras haya menos de 3 árboles revividos, y al Árbol Padre después. En Ancestral no SHALL mostrarse ninguna pista: ni ★ en el dock o el tablero, ni «Pista:» en la bitácora (los bots siguen usando `advise`). Los avisos de la presión y el aviso de mes vacío no son pistas.

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

