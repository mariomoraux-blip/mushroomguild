## MODIFIED Requirements

### Requirement: Soplar esporas (Lycoperdon perlatum)
El Lycoperdon perlatum SHALL, sobre un árbol vivo (no el Árbol Padre), hacer uno de dos cambios a elección del jugador: «Soplar esporas», 1 nutriente por 2 esporas, o «Abonar el árbol», 2 esporas por 1 nutriente. El cambio elegido SHALL quedar en el registro de acciones para que la partida se pueda rejugar.

#### Scenario: Sopla
- WHEN hay 1 nutriente y Pompón toca un árbol vivo con «Soplar esporas»
- THEN los nutrientes bajan en 1 y las esporas suben en 2

#### Scenario: Sin árbol vivo
- WHEN Pompón toca una tierra
- THEN la acción se rechaza con "El Lycoperdon sopla esporas desde un árbol vivo."

#### Scenario: Sin nutriente
- WHEN hay 0 nutrientes y Pompón toca un árbol vivo con «Soplar esporas»
- THEN la acción se rechaza con "Falta 1 nutriente para soplar esporas."

#### Scenario: Abona
- WHEN hay 2 esporas y Pompón toca un árbol vivo con «Abonar el árbol»
- THEN las esporas bajan en 2 y los nutrientes suben en 1

#### Scenario: Sin esporas para abonar
- WHEN hay 1 espora y Pompón toca un árbol vivo con «Abonar el árbol»
- THEN la acción se rechaza con "Faltan 2 esporas para abonar."

#### Scenario: Ida y vuelta no gana nada
- WHEN Pompón sopla esporas y Chispa le pasa la voz para abonar el mismo mes
- THEN los nutrientes quedan como estaban y las esporas bajan en lo que costó pasar la voz

#### Scenario: Se elige como un hechizo
- WHEN el jugador toca a Pompón
- THEN se abre «¿Qué cambia Pompón?» con «Soplar esporas» y «Abonar el árbol», cada uno deshabilitado si no alcanza, y después se toca un árbol vivo
