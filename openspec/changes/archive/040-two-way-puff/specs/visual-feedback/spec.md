## MODIFIED Requirements

### Requirement: Respuesta a cada acción
Cada acción válida SHALL tener una animación de 400 ms o menos que muestre su efecto en el tablero, dibujada encima del estado final y que se limpia al terminar.

#### Scenario: Tejer
- WHEN el Lactarius indigo teje micelio
- THEN la línea de micelio crece desde la casilla vecina hacia la nueva

#### Scenario: Descomponer
- WHEN el Champiñón descompone un tronco
- THEN el tronco se encoge y desaparece con astillas en menos de 400 ms

#### Scenario: Despertar
- WHEN la Amanita despierta al Árbol Padre
- THEN un anillo de luz se abre desde el árbol y queda un halo cálido detrás de él

#### Scenario: Romper una roca
- WHEN la Morchella rompe una roca
- THEN la roca se parte en piedras que caen y queda la tierra, en menos de 400 ms

#### Scenario: Curar a distancia
- WHEN el Ganoderma revive un árbol que la red no tocaba
- THEN un hilo dorado va de la red al árbol y el árbol revive como con la Amanita

#### Scenario: Soplar esporas
- WHEN el Lycoperdon sopla esporas
- THEN una nube de esporas sale del árbol y vuela al contador de esporas

#### Scenario: Abonar el árbol
- WHEN el Lycoperdon abona un árbol
- THEN unas hojas salen del árbol y vuelan al contador de nutrientes

