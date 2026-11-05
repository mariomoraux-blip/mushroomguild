## MODIFIED Requirements

### Requirement: Estado visible
El HUD SHALL mostrar en todo momento mes (de 12), estación, nutrientes, esporas, árboles vivos (del total de árboles del claro) y el cronómetro de juego activo (`scoring` › Cronómetro). El cronómetro va en la segunda línea de la pastilla del mes, junto al ícono de la estación; el nombre de la estación y el nivel SHALL estar en la etiqueta accesible de la pastilla. Con escarcha activa, la pastilla SHALL mostrar un copo junto al ícono de la estación, y su etiqueta accesible lo SHALL decir. Mientras haya una casilla con plaga, la pastilla SHALL mostrar la hoja podrida (`ui/icons/plague`) junto a la estación, y su etiqueta accesible SHALL decir «con plaga».

#### Scenario: Tras una acción
- WHEN el Champiñón descompone un tronco
- THEN el HUD muestra los nutrientes actualizados sin recargar la página

#### Scenario: Cronómetro en el HUD
- WHEN pasan 75 segundos de juego activo en primavera
- THEN la pastilla del mes muestra "Mes 1/12" y, debajo, el ícono de la estación y 01:15 con números tabulares
- AND su etiqueta accesible nombra la estación ("Primavera") y el nivel

#### Scenario: Escarcha en el HUD
- WHEN empieza el mes 7 en Bosque
- THEN la pastilla del mes muestra un copo junto al ícono del otoño
- AND su etiqueta accesible dice "Otoño, con escarcha"

#### Scenario: Pastilla con plaga
- WHEN la plaga marca una casilla en Ancestral
- THEN la pastilla del mes muestra la hoja podrida junto a la estación y su etiqueta dice «con plaga»
- AND cuando la casilla se marchita o se salva, la hoja desaparece
