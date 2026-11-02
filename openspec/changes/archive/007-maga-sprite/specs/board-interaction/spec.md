# Delta · board-interaction

## MODIFIED Requirements

### Requirement: Retratos del gremio
El dock, las fichas y el tablero SHALL usar los sprites de Blender de cada especie (`public/assets/characters/`): en el dock, el retrato en reposo; en la ficha, la pose feliz; en el tablero, la pose de trabajo sobre la casilla donde ese miembro trabajó hoy. La Gliophorus SHALL usar la variante de su estación. Maestra Bruna SHALL usar su propio sprite, más alto que el resto y sin deformarse.

#### Scenario: Trabajó hoy
- WHEN Bruno descompone un tronco
- THEN el tablero muestra a Bruno trabajando sobre ese tronco hasta el amanecer

#### Scenario: Retratos en el dock
- WHEN empieza la partida
- THEN las tarjetas de Añil, Bruno y Rubí muestran sus retratos

#### Scenario: La maga en el tablero
- WHEN Maestra Bruna lanza un hechizo
- THEN el tablero la muestra con el bastón en alto sobre la casilla del hechizo, más alta que los demás miembros
