# Delta · game-rules

## MODIFIED Requirements

### Requirement: Cambio de mes
Al terminar el mes, cada árbol vivo SHALL producir 1 espora y 1 nutriente (sin esporas si el mes nuevo es de una estación sin esporas del nivel), el gremio SHALL comer si el mes que terminó es de una estación en que come según el nivel, y todos los miembros SHALL quedar disponibles, menos el que se quedó sin comer.

#### Scenario: Dos árboles vivos
- WHEN termina el mes con 2 árboles vivos
- THEN se suman 2 esporas y 2 nutrientes, y el mes avanza en 1

### Requirement: Victoria
La Amanita muscaria SHALL despertar al Árbol Padre si este toca la red, hay al menos 3 árboles revividos y los nutrientes del nivel (10 en Brote, 12 en Bosque y Ancestral, `LEVELS › mother`); eso SHALL terminar la partida con victoria.

#### Scenario: Bosque que aún no habla
- WHEN la Amanita muscaria intenta despertar al Árbol Padre con 2 árboles revividos
- THEN la acción se rechaza pidiendo revivir al menos 3 árboles

#### Scenario: Doce nutrientes en Bosque
- WHEN en Bosque la Amanita muscaria intenta despertar al Árbol Padre con 3 árboles revividos y 11 nutrientes
- THEN la acción se rechaza con "El Árbol Padre necesita 12 nutrientes."

### Requirement: Niveles de dificultad
Cada partida SHALL jugarse en uno de tres niveles: Brote, Bosque o Ancestral. El nivel SHALL definir las rocas del claro, las estaciones con escarcha, los meses al final de los cuales se apaga un árbol, las estaciones en que come el gremio, las estaciones sin esporas, los nutrientes del Árbol Padre, si hay pistas y el multiplicador de puntaje, todo en `config.ts › LEVELS`:

| | Brote | Bosque | Ancestral |
| --- | --- | --- | --- |
| Rocas | 6 | 8 | 10 |
| Escarcha | — | Otoño | Otoño e Invierno |
| Se apaga un árbol al final del mes | — | 6 | 3, 6 y 9 |
| El gremio come 1 nutriente al terminar el mes | — | Invierno | Invierno |
| Los árboles no dan esporas | — | Invierno | Invierno |
| Nutrientes del Árbol Padre | 10 | 12 | 12 |
| Pistas | sí | sí | no |
| Multiplicador | ×1 | ×1,5 | ×2 |

Ninguna regla de nivel SHALL quitar progreso del tablero: la red y los árboles vivos solo cambian por las acciones del jugador. Las esporas y los nutrientes solo cambian por las acciones del jugador, la producción de los árboles y lo que come el gremio en invierno.

#### Scenario: Brote es el juego de siempre
- WHEN se juega en Brote
- THEN el claro tiene 6 rocas, tejer cuesta siempre 1 nutriente, ningún árbol se apaga, el gremio no come y el Árbol Padre pide 10 nutrientes

#### Scenario: Nada se pierde
- WHEN termina cualquier mes en cualquier nivel
- THEN las casillas de la red y los árboles vivos son al menos los mismos que antes de terminarlo

### Requirement: Dificultad medida
El balance SHALL verificarse por simulación en 100 mapas generados por nivel, con semillas fijas (en Bosque y Ancestral, las certificadas de la tabla precalculada):
- **Brote:** la política de las pistas gana el 100 % de los mapas aceptados con un mes medio entre 8 y 10, y un bot que juega al azar gana entre el 5 % y el 30 %.
- **Bosque:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 55 % y el 70 %, y el bot al azar gana como máximo el 10 %.
- **Ancestral:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 20 % y el 35 %, y el bot al azar gana como máximo el 5 %.

Generar un claro de Bosque o Ancestral de la tabla certificada SHALL tardar menos de 300 ms en un teléfono de gama media; uno fuera de la tabla (solo con `?seed=` mayor que 1000) SHALL tardar menos de 800 ms.

#### Scenario: Balance
- WHEN `balance.test.ts` juega 100 mapas generados por nivel con semillas fijas
- THEN en Brote las pistas ganan todos entre el mes 8 y el 11, con mes medio entre 8 y 10, y el bot al azar gana entre el 5 % y el 30 %
- AND en Bosque y Ancestral el bot experto gana todos, y la política de las pistas y el bot al azar quedan en sus rangos

## ADDED Requirements

### Requirement: Invierno duro
En Bosque y Ancestral, al terminar cada mes de Invierno el gremio SHALL comer 1 nutriente en total, después de sumar lo que dan los árboles. Si no hay, el primer miembro en llegar al gremio que no sea Maestra Bruma SHALL empezar el mes siguiente descansando, con hambre; los nutrientes nunca bajan de 0. Terminar el mes 12 no hace comer al gremio. En esas estaciones, lo que dan los árboles al empezar el mes SHALL ser solo nutrientes; la Lluvia de esporas sigue dando esporas.

#### Scenario: El gremio come en invierno
- WHEN termina el mes 10 en Bosque con 1 árbol vivo y 3 nutrientes
- THEN el gremio suma 1 nutriente y come 1: quedan 3 y nadie tiene hambre

#### Scenario: No hay nutrientes
- WHEN termina el mes 11 en Ancestral sin árboles vivos y sin nutrientes
- THEN quedan 0 nutrientes y el primero en llegar al gremio empieza el mes 12 descansando con hambre

#### Scenario: Invierno sin esporas
- WHEN termina el mes 9 en Bosque con 2 árboles vivos
- THEN se suman 2 nutrientes y ninguna espora

#### Scenario: El otoño no hace comer
- WHEN termina el mes 8 en Ancestral
- THEN el gremio no come

#### Scenario: Brote no come
- WHEN termina el mes 11 en Brote
- THEN el gremio no come y los árboles dan esporas y nutrientes como siempre
