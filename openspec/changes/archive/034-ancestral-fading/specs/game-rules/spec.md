## MODIFIED Requirements

### Requirement: Dificultad medida
El balance SHALL verificarse por simulación en 100 mapas generados por nivel, con semillas fijas (en Bosque y Ancestral, las certificadas de la tabla precalculada):
- **Brote:** la política de las pistas gana el 100 % de los mapas aceptados con un mes medio entre 8 y 10, y un bot que juega al azar gana entre el 5 % y el 30 %.
- **Bosque:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 55 % y el 70 %, y el bot al azar gana como máximo el 10 %.
- **Ancestral:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 10 % y el 25 %, y el bot al azar gana como máximo el 5 %.

Generar un claro de Bosque o Ancestral de la tabla certificada SHALL tardar menos de 300 ms en un teléfono de gama media; uno fuera de la tabla (solo con `?seed=` mayor que 1000) SHALL tardar menos de 800 ms.

#### Scenario: Balance
- WHEN `balance.test.ts` juega 100 mapas generados por nivel con semillas fijas
- THEN en Brote las pistas ganan todos entre el mes 8 y el 11, con mes medio entre 8 y 10, y el bot al azar gana entre el 5 % y el 30 %
- AND en Bosque y Ancestral el bot experto gana todos, y la política de las pistas y el bot al azar quedan en sus rangos

### Requirement: Niveles de dificultad
Cada partida SHALL jugarse en uno de tres niveles: Brote, Bosque o Ancestral. El nivel SHALL definir las rocas del claro, las estaciones con escarcha, los meses al final de los cuales se apaga un árbol, las estaciones en que come el gremio, las estaciones sin esporas, las estaciones con plaga, los árboles revividos y los nutrientes que pide el Árbol Padre, si hay pistas y el multiplicador de puntaje, todo en `config.ts › LEVELS`:

| | Brote | Bosque | Ancestral |
| --- | --- | --- | --- |
| Rocas | 6 | 8 | 10 |
| Escarcha | — | Otoño | Otoño e Invierno |
| Se apaga un árbol al final del mes | — | 6 | 3, 5, 7, 9 y 11 |
| El gremio come 1 nutriente al terminar el mes | — | Otoño e Invierno | Otoño e Invierno |
| Los árboles no dan esporas | — | Invierno | Invierno |
| Plaga (una casilla tejida por estación) | — | — | Otoño e Invierno |
| Árboles revividos que pide el Árbol Padre | 3 | 3 | 4 |
| Nutrientes del Árbol Padre | 10 | 10 | 12 |
| Pistas | sí | sí | no |
| Multiplicador | ×1 | ×1,5 | ×2 |

Ninguna regla de nivel SHALL quitar árboles vivos. La red solo cambia por las acciones del jugador y por la plaga de Ancestral, que quita a lo más una casilla tejida al terminar un mes. Las esporas y los nutrientes solo cambian por las acciones del jugador, la producción de los árboles y lo que come el gremio en otoño e invierno.

#### Scenario: Brote es el juego de siempre
- WHEN se juega en Brote
- THEN el claro tiene 6 rocas, tejer cuesta siempre 1 nutriente, ningún árbol se apaga, el gremio no come y el Árbol Padre pide 3 árboles revividos y 10 nutrientes

#### Scenario: Nada se pierde
- WHEN termina cualquier mes en cualquier nivel
- THEN los árboles vivos son al menos los mismos que antes de terminarlo, y las casillas de la red también, salvo a lo más la casilla con plaga

## REMOVED Requirements

### Requirement: Árboles que se apagan
**Reason**: Ancestral pasa a apagar un árbol cada dos meses; se reescribe como «Árboles marcados».
**Migration**: ninguna; `SCORE_VERSION` sube a 8.

## ADDED Requirements

### Requirement: Árboles marcados
Al empezar un mes en el que el nivel apaga un árbol, el juego SHALL marcar el árbol gris (ni vivo ni apagado) más lejano de la red: el de mayor distancia en pasos ortogonales desde la red sin atravesar rocas; si hay empate, el de la fila más alta y después el de la columna menor. Si al terminar ese mes el árbol marcado sigue gris, SHALL apagarse. Revivirlo durante ese mes lo salva. Revivir un árbol apagado SHALL costar 7 nutrientes. Si no queda ningún árbol gris sin apagar, no se marca ninguno.

#### Scenario: Se marca el más lejano
- WHEN empieza el mes 6 en Bosque
- THEN el árbol gris más lejano de la red queda marcado

#### Scenario: Se apaga
- WHEN termina el mes 6 en Bosque y el árbol marcado sigue gris
- THEN el árbol queda apagado y revivirlo cuesta 7 nutrientes

#### Scenario: Se salva
- WHEN la Amanita revive el árbol marcado durante el mes 6
- THEN el árbol queda vivo y no se apaga ningún otro al terminar el mes

#### Scenario: Ancestral, cinco veces
- WHEN se juega Ancestral sin revivir los árboles marcados
- THEN al terminar los meses 3, 5, 7, 9 y 11 se apaga un árbol cada vez
