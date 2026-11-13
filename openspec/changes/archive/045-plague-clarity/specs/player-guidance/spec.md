## ADDED Requirements

### Requirement: Resumen del mes
Al terminar un mes, la bitácora SHALL mostrar solo un resumen corto: «Mes N · » y una frase con lo más urgente y qué hacer, en este orden: la plaga que marcó casillas («La plaga marcó N casillas y amenaza M árboles. Trabaja a 2 o menos para frenarla.»), el árbol que se apagará, el hambre, la escarcha que empieza, el mes vacío, los árboles sueltos que no dieron nada («Teje la red hasta el Hogar.»), la plaga que marchitó casillas («Trabaja a 2 o menos para limpiarlas.») y, si no hay nada de eso, lo que dieron los árboles. Lo que pasó completo, una línea con su ícono por cada cosa, SHALL verse en la hoja «Ver el mes», que se abre con el botón «Ver el mes» de la bitácora mientras no hay un miembro seleccionado y se cierra con «Entendido», el botón de cerrar o Esc. Los avisos de la presión que pasan al cambiar de mes SHALL estar en «Ver el mes». Las casillas que la plaga marchita, frena o limpia en un mismo cambio de mes SHALL contarse en una sola línea («La plaga marchitó 2 casillas de la red…»).

#### Scenario: Mes con plaga
- WHEN empieza el mes 10 en Bosque y la plaga marca una casilla
- THEN la bitácora dice «Mes 10 · La plaga marcó una casilla. Trabaja a 2 o menos para frenarla.»
- AND «Ver el mes» lista lo que dieron los árboles, la estación, la escarcha y la plaga, cada una con su ícono

#### Scenario: Varias casillas marchitas
- WHEN termina un mes y la plaga marchita dos casillas
- THEN «Ver el mes» dice una sola vez «La plaga marchitó 2 casillas de la red…»

#### Scenario: Mes tranquilo
- WHEN termina un mes sin avisos y los árboles dieron esporas y nutrientes
- THEN la bitácora dice «Mes N · » y lo que dieron los árboles
