# Delta · board-interaction

## ADDED Requirements

### Requirement: Árbol marcado y apagado
El tablero SHALL distinguir el árbol marcado (se apagará al terminar el mes) y el árbol apagado de un árbol gris común, con un velo de escarcha del color `frost` de `theme.ts`. El árbol marcado SHALL latir suave, sin animarse con `prefers-reduced-motion`. La etiqueta accesible de la casilla SHALL decir el estado y el costo de revivirlo. Ninguno de los dos estados SHALL depender solo del color.

#### Scenario: Árbol marcado
- WHEN empieza el mes 6 en Bosque
- THEN el árbol marcado se ve con el velo de escarcha y su etiqueta dice que se apagará al terminar el mes

#### Scenario: Árbol apagado
- WHEN un árbol se apagó
- THEN se ve con el velo fijo y un copo, y su etiqueta dice que revivirlo cuesta 7 nutrientes

## MODIFIED Requirements

### Requirement: Estado visible
El HUD SHALL mostrar en todo momento mes (de 12), estación, nutrientes, esporas, árboles vivos (del total de árboles del claro) y el cronómetro de juego activo (`scoring` › Cronómetro). El cronómetro va en la segunda línea de la pastilla del mes, junto al ícono de la estación; el nombre de la estación y el nivel SHALL estar en la etiqueta accesible de la pastilla. Con escarcha activa, la pastilla SHALL mostrar un copo junto al ícono de la estación, y su etiqueta accesible lo SHALL decir.

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
