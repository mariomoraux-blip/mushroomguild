# Delta · title-screens

## ADDED Requirements

### Requirement: Crédito del autor
La portada SHALL mostrar abajo, en letra pequeña (12 px), la línea «By Mario Mora for BerryLab». El texto SHALL tener un contraste de al menos 4,5:1 con su fondo inmediato, que es sólido (no depende del fondo pintado), y no SHALL tapar el logo ni el menú en vertical ni en horizontal. La línea no es un control: no recibe el foco.

#### Scenario: Ver el crédito
- WHEN el jugador abre el sitio
- THEN la portada muestra «By Mario Mora for BerryLab» debajo del menú
- AND el contraste entre el texto y su fondo es de al menos 4,5:1

#### Scenario: Portada en horizontal
- WHEN se abre la portada a 844 × 390
- THEN el crédito se ve completo y no se superpone al logo ni al menú, y la página no hace scroll
