## REMOVED Requirements

### Requirement: Victoria
**Reason**: el Árbol Padre pide 10 nutrientes en los tres niveles; la regla pasa a «Despertar al Árbol Padre».
**Migration**: ninguna; las partidas guardadas siguen valiendo y `SCORE_VERSION` sube a 5.

### Requirement: Invierno duro
**Reason**: el gremio come también en otoño; la regla pasa a «Temporadas frías».
**Migration**: ninguna; `LEVELS › upkeep` incluye el otoño.

## MODIFIED Requirements

### Requirement: Niveles de dificultad
Cada partida SHALL jugarse en uno de tres niveles: Brote, Bosque o Ancestral. El nivel SHALL definir las rocas del claro, las estaciones con escarcha, los meses al final de los cuales se apaga un árbol, las estaciones en que come el gremio, las estaciones sin esporas, los nutrientes del Árbol Padre, si hay pistas y el multiplicador de puntaje, todo en `config.ts › LEVELS`:

| | Brote | Bosque | Ancestral |
| --- | --- | --- | --- |
| Rocas | 6 | 8 | 10 |
| Escarcha | — | Otoño | Otoño e Invierno |
| Se apaga un árbol al final del mes | — | 6 | 3, 6 y 9 |
| El gremio come 1 nutriente al terminar el mes | — | Otoño e Invierno | Otoño e Invierno |
| Los árboles no dan esporas | — | Invierno | Invierno |
| Nutrientes del Árbol Padre | 10 | 10 | 10 |
| Pistas | sí | sí | no |
| Multiplicador | ×1 | ×1,5 | ×2 |

Ninguna regla de nivel SHALL quitar progreso del tablero: la red y los árboles vivos solo cambian por las acciones del jugador. Las esporas y los nutrientes solo cambian por las acciones del jugador, la producción de los árboles y lo que come el gremio en otoño e invierno.

#### Scenario: Brote es el juego de siempre
- WHEN se juega en Brote
- THEN el claro tiene 6 rocas, tejer cuesta siempre 1 nutriente, ningún árbol se apaga, el gremio no come y el Árbol Padre pide 10 nutrientes

#### Scenario: Nada se pierde
- WHEN termina cualquier mes en cualquier nivel
- THEN las casillas de la red y los árboles vivos son al menos los mismos que antes de terminarlo

## ADDED Requirements

### Requirement: Despertar al Árbol Padre
La Amanita muscaria SHALL despertar al Árbol Padre si este toca la red, hay al menos 3 árboles revividos y los nutrientes del nivel (10 en los tres niveles, `LEVELS › mother`); eso SHALL terminar la partida con victoria.

#### Scenario: Bosque que aún no habla
- WHEN la Amanita muscaria intenta despertar al Árbol Padre con 2 árboles revividos
- THEN la acción se rechaza pidiendo revivir al menos 3 árboles

#### Scenario: Diez nutrientes en Ancestral
- WHEN en Ancestral la Amanita muscaria intenta despertar al Árbol Padre con 3 árboles revividos y 9 nutrientes
- THEN la acción se rechaza con "El Árbol Padre necesita 10 nutrientes."

### Requirement: Temporadas frías
En Bosque y Ancestral, al terminar cada mes de Otoño e Invierno el gremio SHALL comer 1 nutriente en total, después de sumar lo que dan los árboles. Si no hay, el primer miembro en llegar al gremio que no sea Maestra Bruma SHALL empezar el mes siguiente descansando, con hambre; los nutrientes nunca bajan de 0. Terminar el mes 12 no hace comer al gremio. En Invierno, lo que dan los árboles al empezar el mes SHALL ser solo nutrientes; la Lluvia de esporas sigue dando esporas.

#### Scenario: El gremio come en otoño
- WHEN termina el mes 7 en Bosque con 1 árbol vivo y 3 nutrientes
- THEN el gremio suma 1 nutriente y come 1: quedan 3 y nadie tiene hambre

#### Scenario: No hay nutrientes
- WHEN termina el mes 8 en Ancestral sin árboles vivos y sin nutrientes
- THEN quedan 0 nutrientes y el primero en llegar al gremio empieza el mes 9 descansando con hambre

#### Scenario: Invierno sin esporas
- WHEN termina el mes 9 en Bosque con 2 árboles vivos
- THEN se suman 2 nutrientes y ninguna espora

#### Scenario: Otoño con esporas
- WHEN termina el mes 6 en Bosque con 2 árboles vivos
- THEN se suman 2 nutrientes y 2 esporas

#### Scenario: El verano no hace comer
- WHEN termina el mes 6 en Ancestral
- THEN el gremio no come

#### Scenario: Brote no come
- WHEN termina el mes 11 en Brote
- THEN el gremio no come y los árboles dan esporas y nutrientes como siempre
