# Delta · player-guidance

## MODIFIED Requirements

### Requirement: Ficha al seleccionar un hongo
Cada miembro SHALL tener una ficha: nombre del miembro y especie, rol, un contexto corto, su frase entre comillas y, según la especie, estas secciones:

| Sección | Especies |
| --- | --- |
| Habilidad | Todas |
| Cómo usarlo | Todas |
| Movimiento (cómo se mueve o desde dónde trabaja) | Todas |
| Nutrientes (cómo los consigue o cuánto gasta) | Todas |
| Qué árboles cura | Amanita muscaria |
| Para qué sirve la mensajera | Gliophorus psittacinus |
| Poderes y para qué sirven | Maestra Bruma |

Seleccionar a un miembro SHALL seleccionarlo siempre, sin abrir la ficha sola: el tablero queda visible con sus casillas resaltadas. La bitácora SHALL ofrecer un botón "Ficha" que la abre; para Maestra Bruma, el botón "Ver la ficha de Maestra Bruma" está en la hoja de hechizos, que tapa la bitácora. La primera vez que se selecciona cada especie, el botón SHALL llevar un punto «nuevo» y latir una vez, y la bitácora SHALL decir "Toca Ficha para conocer a <nombre>." en lugar de la pista. Al cerrar la ficha con "Entendido", el miembro SHALL seguir seleccionado con sus casillas resaltadas (para Maestra Bruma, se pide después el hechizo). Las especies ya vistas (con la ficha abierta al menos una vez) se recuerdan entre visitas.

#### Scenario: Primera vez con el Tejedor
- WHEN el jugador selecciona a Indi por primera vez
- THEN Indi queda seleccionado con sus casillas válidas resaltadas y no se abre ninguna ficha
- AND el botón "Ficha" lleva el punto «nuevo» y la bitácora dice "Toca Ficha para conocer a Indi."

#### Scenario: Abrir la ficha
- WHEN el jugador toca "Ficha" con Indi seleccionado
- THEN se abre la ficha "Indi · Lactarius indigo" con la frase "«Si lo cortas, sangra tinta azul. Preferiría que no lo cortaras.»" y las secciones Habilidad, Cómo usarlo, Movimiento y Nutrientes
- AND al pulsar "Entendido" Indi sigue seleccionado y sus casillas válidas se ven resaltadas

#### Scenario: Segunda vez
- WHEN el jugador vuelve a seleccionar a Indi después de haber visto su ficha
- THEN el botón "Ficha" no lleva el punto y la bitácora muestra la pista de siempre

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

#### Scenario: Primera vez con Maestra Bruma
- WHEN el jugador selecciona a Maestra Bruma por primera vez
- THEN se abre la hoja de hechizos con el botón "Ver la ficha de Maestra Bruma" marcado con el punto «nuevo»
