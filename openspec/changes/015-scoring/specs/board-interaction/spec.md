# Delta · board-interaction

## MODIFIED Requirements

### Requirement: Estado visible
El HUD SHALL mostrar en todo momento mes (de 12), estación, nutrientes, esporas, árboles vivos (del total de árboles del claro) y el cronómetro de juego activo (`scoring` › Cronómetro). El cronómetro va en la segunda línea de la pastilla del mes, junto al ícono de la estación; el nombre de la estación SHALL estar en la etiqueta accesible de la pastilla.

#### Scenario: Tras una acción
- WHEN el Champiñón descompone un tronco
- THEN el HUD muestra los nutrientes actualizados sin recargar la página

#### Scenario: Cronómetro en el HUD
- WHEN pasan 75 segundos de juego activo en primavera
- THEN la pastilla del mes muestra "Mes 1/12" y, debajo, el ícono de la estación y 01:15 con números tabulares
- AND su etiqueta accesible nombra la estación ("Primavera")
