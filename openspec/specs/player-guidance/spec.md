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
- WHEN el jugador selecciona a Añil por primera vez
- THEN se abre la ficha "Añil · Lactarius indigo" con la frase "«Si lo cortas, sangra tinta azul. Preferiría que no lo cortaras.»" y las secciones Habilidad, Cómo usarlo, Movimiento y Nutrientes
- AND al pulsar "Entendido" Añil sigue seleccionado y sus casillas válidas se ven resaltadas

#### Scenario: Segunda vez
- WHEN el jugador vuelve a seleccionar a Añil
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
El HUD SHALL tener un botón "?" que abre "Cómo jugar" (`title-screens`), y desde ahí la Libreta de campo: la meta, cómo se juega en 4 pasos, para qué sirve cada una de las 5 especies (con su costo) y la leyenda de casillas. La libreta no se abre sola; se cierra con "¡A jugar!", el botón de cerrar o Esc.

#### Scenario: Consultar la ayuda
- WHEN el jugador pulsa "?" durante la partida y luego "Libreta de campo"
- THEN se abre la Libreta de campo con las 5 especies, qué hace cada una y cuánto cuesta

### Requirement: Pista y camino sugerido
El juego SHALL proponer siempre un siguiente paso con `advise(state)`, con esta prioridad: despertar al Árbol Padre > revivir un árbol > hechizo de Maestra Bruma > pasar la voz a una Amanita > reclutar > descomponer > pasar la voz a un Champiñón > tejer > pasar la voz a un Lactarius > terminar el mes. El miembro sugerido SHALL llevar una ★ en el dock; al seleccionarlo, la casilla sugerida SHALL llevar una ★ en el tablero. Tejer SHALL apuntar a la casilla válida más cercana al árbol gris más cercano a la red mientras haya menos de 3 árboles revividos, y al Árbol Padre después. Reclutar sugiere un segundo Lactarius mientras la red no toque al Árbol Padre, después una Gliophorus y después otra Amanita.

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
- WHEN ningún miembro disponible tiene una casilla válida
- THEN la pista invita a terminar el mes y recuerda que cada árbol vivo dará 1 espora y 1 nutriente

### Requirement: Para qué sirve cada hongo
Cada tarjeta del dock SHALL mostrar el rol y la acción con su costo. Tocar una casilla sin miembro seleccionado SHALL explicar en la bitácora qué es esa casilla y quién puede usarla.

#### Scenario: Tarjeta de el Tejedor
- WHEN empieza la partida
- THEN la tarjeta de Añil dice "Tejedor" y "Teje · −1 nutriente"

#### Scenario: Tocar un tronco
- WHEN no hay miembro seleccionado y el jugador toca un tronco caído
- THEN la bitácora dice "Tronco caído: el Champiñón lo descompone (+2 nutrientes, 2 veces)."

### Requirement: Cómo reclutar
El chip de esporas del HUD SHALL abrir la hoja de reclutar. Cada fila de la hoja SHALL decir para qué sirve la especie. Con esporas suficientes y cupo, la pista SHALL sugerir reclutar y qué especie conviene: un segundo Lactarius mientras la red no toque al Árbol Padre; después, una Gliophorus; después, otra Amanita.

#### Scenario: Primeras esporas
- WHEN el jugador tiene 2 esporas, cupo en el gremio y ningún árbol por revivir ni Árbol Padre por despertar
- THEN la pista dice que puede reclutar y cuál especie conviene
- AND tocar el chip de esporas abre la hoja de reclutar

### Requirement: Meta visible
El Árbol Padre SHALL marcarse como meta en el tablero en todo momento, y las casillas de la red SHALL dibujarse con un contorno de micelio visible.

#### Scenario: Inicio
- WHEN empieza la partida
- THEN el Árbol Padre tiene el aro de meta y su etiqueta accesible dice que es la meta
