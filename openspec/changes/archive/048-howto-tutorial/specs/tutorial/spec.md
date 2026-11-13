## MODIFIED Requirements

### Requirement: Nivel Primeros pasos
El juego SHALL tener un tutorial (`tutorial`, «Cómo jugar» desde el 048) que se juega en un claro fijo, con un Árbol Ancestral que pide 2 árboles revividos, sin escarcha, árboles que se apagan, hambre ni plaga. Maestra Bruma SHALL llegar como en los demás niveles, al empezar el mes siguiente al segundo árbol revivido. El tutorial no SHALL dar puntaje ni entrar al ranking. Se empieza con «Cómo jugar» en la portada (siempre) o en «Elige tu dificultad» (solo mientras no se haya completado ni saltado). `?nivel=tutorial` SHALL entrar directo al tutorial.

#### Scenario: Se gana siguiendo el guion
- WHEN el jugador hace cada paso del guion
- THEN despierta al Árbol Ancestral en el mes 6

#### Scenario: Sin puntaje
- WHEN el jugador gana el tutorial
- THEN no se muestra puntaje ni se ofrece registrarlo en el ranking

### Requirement: Saltar el tutorial
«Saltar tutorial» SHALL pedir confirmación en el mismo globo. Al confirmar, el juego SHALL volver a «Elige tu dificultad» con el foco en Brote, y el tutorial SHALL contar como visto.

#### Scenario: Saltar
- WHEN el jugador pulsa «Saltar tutorial» y confirma
- THEN vuelve a «Elige tu dificultad» y «Cómo jugar» ya no aparece ahí
