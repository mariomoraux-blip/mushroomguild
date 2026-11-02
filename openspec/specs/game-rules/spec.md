# game-rules

## Purpose
Reglas del juego del Capítulo 1 (El Claro Gris): tablero, especies del gremio, economía, tiempo, hechizos y victoria. Implementadas como lógica pura en `src/rules/`.

## Requirements

### Requirement: Tablero inicial
Cada partida nueva del juego SHALL generar un tablero vertical de 5 columnas por 8 filas con `newRandomGame(seed, level)`: el Hogar en la fila inferior y el Árbol Padre en la superior (columnas 2 a 4), un tronco junto al Hogar, 7 árboles grises a 2 o más casillas del Hogar, 5 troncos y las rocas del nivel (6 en Brote) en las filas intermedias. El Hogar es la única casilla con micelio. La semilla SHALL fijar el claro de Brote; Bosque y Ancestral le agregan rocas sobre casillas de tierra libres (nunca el Hogar, sus vecinas ni las vecinas del Árbol Padre), también según la semilla. En Brote, un mapa solo se acepta si la red puede llegar al Árbol Padre y a todos los árboles y si la política de las pistas lo gana entre el mes 8 y el 11; en Bosque y Ancestral, si la red puede llegar al Árbol Padre y a todos los árboles y si el bot experto (con su búsqueda) lo gana con las reglas del nivel; esa aceptación se precalcula para las semillas 0 a 1000 y las partidas nuevas de esos niveles eligen entre las aceptadas. Si no aparece ninguno, se usa el mapa clásico del Capítulo 1 (con las rocas del nivel). La misma semilla y el mismo nivel SHALL producir el mismo mapa.

#### Scenario: Partida nueva
- WHEN se inicia una partida
- THEN el mes es 1, hay 2 nutrientes y 0 esporas
- AND el gremio tiene un Lactarius indigo, un Champiñón y una Amanita muscaria, todos disponibles
- AND la maga no está en el gremio
- AND solo la casilla Hogar pertenece a la red

#### Scenario: Claros distintos
- WHEN se generan partidas con semillas distintas
- THEN los mapas cambian, y siempre tienen 7 árboles grises, el Hogar abajo y el Árbol Padre arriba

#### Scenario: Misma semilla
- WHEN se genera dos veces una partida con la misma semilla y el mismo nivel
- THEN el mapa es idéntico

#### Scenario: Más rocas, mismo claro
- WHEN se genera la semilla 1 en Brote y en Ancestral
- THEN el claro de Ancestral es el de Brote con 4 rocas más sobre casillas que en Brote eran tierra

### Requirement: Alcance de la red
Una acción SHALL aplicarse solo a casillas ortogonalmente adyacentes a una casilla de la red.

#### Scenario: Casilla lejana
- WHEN un miembro intenta actuar sobre una casilla que no toca la red
- THEN la acción se rechaza con el motivo "Muy lejos: … debe tocar la red."

### Requirement: Una acción por mes
Cada miembro SHALL actuar como máximo una vez por mes.

#### Scenario: Miembro cansado
- WHEN un miembro que ya actuó este mes intenta actuar de nuevo
- THEN la acción se rechaza indicando que descansa hasta el mes siguiente

### Requirement: Tejer micelio (Lactarius indigo)
El Lactarius indigo SHALL convertir una tierra adyacente a la red en parte de la red a cambio de 1 nutriente, o de 2 con escarcha.

#### Scenario: Tejer con nutrientes
- WHEN el Lactarius indigo teje sobre tierra adyacente sin escarcha y hay al menos 1 nutriente
- THEN la casilla pasa a la red y los nutrientes bajan en 1

#### Scenario: Tejer sin nutrientes
- WHEN hay 0 nutrientes
- THEN la acción se rechaza con "Falta 1 nutriente para tejer."

#### Scenario: Tejer con escarcha
- WHEN el Lactarius indigo teje con escarcha y hay al menos 2 nutrientes
- THEN la casilla pasa a la red y los nutrientes bajan en 2

### Requirement: Descomponer (Champiñón)
El Champiñón SHALL obtener 2 nutrientes de un tronco adyacente a la red; el tronco SHALL convertirse en tierra después de 2 usos.

#### Scenario: Segundo uso de un tronco
- WHEN un tronco con 1 uso se descompone de nuevo
- THEN se suman 2 nutrientes
- AND la casilla queda como tierra sin micelio

### Requirement: Revivir árboles (Amanita muscaria)
La Amanita muscaria SHALL revivir un árbol gris adyacente a la red por 3 nutrientes, o por 7 si el árbol está apagado; el árbol revivido SHALL entrar a la red.

#### Scenario: Revivir extiende la red
- WHEN la Amanita muscaria revive un árbol con 3 o más nutrientes
- THEN el árbol queda vivo y en la red, y los nutrientes bajan en 3

#### Scenario: Revivir un árbol apagado
- WHEN la Amanita muscaria revive un árbol apagado con 7 o más nutrientes
- THEN el árbol queda vivo y en la red, y los nutrientes bajan en 7

### Requirement: Pasar la voz (Gliophorus psittacinus)
La Gliophorus psittacinus SHALL, por 1 espora, despertar a un compañero que ya trabajó este mes: se toca la casilla donde trabajó y ese compañero vuelve a estar disponible. No puede llamar a otra Gliophorus ni a Maestra Bruma. Su voz viaja por la red: la casilla puede estar en cualquier lugar del tablero.

#### Scenario: Llamar a un compañero
- WHEN Bruno ya descompuso un tronco este mes, hay al menos 1 espora y Chispa toca ese tronco
- THEN Bruno vuelve a estar disponible y las esporas bajan en 1

#### Scenario: Sin esporas
- WHEN hay 0 esporas
- THEN la acción se rechaza con "Falta 1 espora: pasar la voz cuesta 1."

#### Scenario: Casilla sin compañero
- WHEN Chispa toca una casilla donde nadie trabajó este mes
- THEN la acción se rechaza con "La Gliophorus pasa la voz donde un compañero ya trabajó este mes."

### Requirement: Llegada dla maga (Conocybe arcana)
Maestra Bruma SHALL unirse al gremio al empezar el mes siguiente a revivir el segundo árbol, una sola vez por partida. No se puede reclutar y no cuenta en el límite de 6. Si el segundo árbol revive el mes 12, Maestra Bruma no llega.

#### Scenario: Segundo árbol revivido
- WHEN se revive el segundo árbol durante el mes 4
- THEN al empezar el mes 5 Maestra Bruma está en el gremio y disponible

#### Scenario: Reclutar a la maga
- WHEN el jugador intenta reclutar un Conocybe arcana
- THEN la acción no está disponible

#### Scenario: Segundo árbol en el último mes
- WHEN se revive el segundo árbol durante el mes 12
- THEN Maestra Bruma no se une al gremio y la partida sigue su curso normal

### Requirement: Hechizos
Maestra Bruma SHALL lanzar como máximo un hechizo por estación, a elegir entre:
- Brote arcano: convierte una roca adyacente a la red en tierra con micelio. Esa casilla es, a todos los efectos, tierra tejida: pertenece a la red y extiende su alcance (por ejemplo, permite revivir árboles vecinos).
- Lluvia de esporas: sobre cualquier árbol vivo, suma de inmediato 1 espora y 1 nutriente por cada árbol vivo. Es un pago extra: el mes siguiente paga normal.

Lanzar un hechizo SHALL gastar la acción del mes de Maestra Bruma. No tiene otra acción: si ya lanzó en la estación, descansa hasta la próxima.

#### Scenario: Brote arcano
- WHEN Maestra Bruma actúa sobre una roca adyacente a la red
- THEN la roca pasa a ser tierra con micelio

#### Scenario: Brote arcano extiende la red
- WHEN un árbol gris solo toca la red a través de una casilla creada por el Brote arcano
- THEN la Amanita muscaria puede revivirlo

#### Scenario: Roca lejana
- WHEN Maestra Bruma intenta el Brote arcano sobre una roca que no toca la red
- THEN la acción se rechaza con "El Brote arcano solo despierta rocas que tocan la red."

#### Scenario: Lluvia de esporas es un pago extra
- WHEN Maestra Bruma lanza Lluvia de esporas sobre un árbol vivo con 3 árboles vivos
- THEN se suman de inmediato 3 esporas y 3 nutrientes
- AND al empezar el mes siguiente se suman otras 3 esporas y 3 nutrientes

#### Scenario: Lluvia fuera de un árbol vivo
- WHEN Maestra Bruma intenta la Lluvia de esporas sobre una casilla que no es un árbol vivo
- THEN la acción se rechaza con "La Lluvia de esporas se lanza sobre un árbol vivo."

#### Scenario: El hechizo gasta la acción del mes
- WHEN Maestra Bruma lanza un hechizo
- THEN queda cansada hasta el mes siguiente, como cualquier miembro que ya actuó

#### Scenario: Segundo hechizo en la misma estación
- WHEN Maestra Bruma ya lanzó un hechizo en Verano y lo intenta de nuevo en Verano
- THEN la acción se rechaza con "Maestra Bruma descansa: su magia vuelve con la próxima estación."
- AND esto ocurre aunque sea un mes nuevo de la misma estación

#### Scenario: Nueva estación
- WHEN empieza Otoño
- THEN Maestra Bruma puede lanzar un hechizo otra vez

### Requirement: Cambio de mes
Al terminar el mes, cada árbol vivo SHALL producir 1 espora y 1 nutriente, y todos los miembros SHALL quedar disponibles.

#### Scenario: Dos árboles vivos
- WHEN termina el mes con 2 árboles vivos
- THEN se suman 2 esporas y 2 nutrientes, y el mes avanza en 1

### Requirement: Reclutar
Con 2 esporas el jugador SHALL poder reclutar un Champiñón, un Lactarius indigo, una Amanita muscaria o una Gliophorus psittacinus, hasta 6 miembros reclutables; el recluta SHALL trabajar desde el mes siguiente. Los nombres de la Gliophorus son Chispa, Pluma, Trina y Gota.

#### Scenario: Gremio completo
- WHEN el gremio tiene 6 miembros
- THEN reclutar se rechaza con "El gremio está completo."

### Requirement: Estaciones
El juego SHALL tener 12 meses agrupados en 4 estaciones de 3 meses: Primavera, Verano, Otoño, Invierno.

#### Scenario: Cambio de estación
- WHEN termina el mes 3
- THEN el mes 4 pertenece a Verano

### Requirement: Victoria
La Amanita muscaria SHALL despertar al Árbol Padre si este toca la red, hay 10 nutrientes y al menos 3 árboles revividos; eso SHALL terminar la partida con victoria.

#### Scenario: Bosque que aún no habla
- WHEN la Amanita muscaria intenta despertar al Árbol Padre con 2 árboles revividos
- THEN la acción se rechaza pidiendo revivir al menos 3 árboles

### Requirement: Final suave
Si termina el mes 12 sin victoria, la partida SHALL terminar en estado `lost` sin penalización, permitiendo reiniciar.

#### Scenario: Fin del invierno
- WHEN el jugador termina el mes 12 sin haber ganado
- THEN el estado es `lost`

### Requirement: Dificultad medida
El balance SHALL verificarse por simulación en 100 mapas generados por nivel, con semillas fijas (en Bosque y Ancestral, las certificadas de la tabla precalculada):
- **Brote:** la política de las pistas gana el 100 % de los mapas aceptados con un mes medio entre 8 y 10, y un bot que juega al azar gana entre el 5 % y el 30 %.
- **Bosque:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 75 % y el 90 %, y el bot al azar gana como máximo el 10 %.
- **Ancestral:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 40 % y el 60 %, y el bot al azar gana como máximo el 5 %.

Generar un claro de Bosque o Ancestral SHALL tardar menos de 300 ms en un teléfono de gama media.

#### Scenario: Balance
- WHEN `balance.test.ts` juega 100 mapas generados por nivel con semillas fijas
- THEN en Brote las pistas ganan todos entre el mes 8 y el 11, con mes medio entre 8 y 10, y el bot al azar gana entre el 5 % y el 30 %
- AND en Bosque y Ancestral el bot experto gana todos, y la política de las pistas y el bot al azar quedan en sus rangos

### Requirement: Niveles de dificultad
Cada partida SHALL jugarse en uno de tres niveles: Brote, Bosque o Ancestral. El nivel SHALL definir las rocas del claro, las estaciones con escarcha, los meses al final de los cuales se apaga un árbol, si hay pistas y el multiplicador de puntaje, todo en `config.ts › LEVELS`:

| | Brote | Bosque | Ancestral |
| --- | --- | --- | --- |
| Rocas | 6 | 8 | 10 |
| Escarcha | — | Otoño | Otoño e Invierno |
| Se apaga un árbol al final del mes | — | 6 | 3, 6 y 9 |
| Pistas | sí | sí | no |
| Multiplicador | ×1 | ×1,5 | ×2 |

Ninguna regla de nivel SHALL quitar progreso: la red, los árboles vivos, los nutrientes y las esporas solo cambian por las acciones del jugador y la producción de los árboles.

#### Scenario: Brote es el juego de siempre
- WHEN se juega en Brote
- THEN el claro tiene 6 rocas, tejer cuesta siempre 1 nutriente y ningún árbol se apaga

#### Scenario: Nada se pierde
- WHEN termina cualquier mes en cualquier nivel
- THEN las casillas de la red y los árboles vivos son al menos los mismos que antes de terminarlo

### Requirement: Escarcha
En las estaciones con escarcha del nivel, tejer SHALL costar 2 nutrientes en vez de 1. La escarcha no SHALL cambiar la producción de los árboles ni ninguna otra acción.

#### Scenario: Llega la escarcha
- WHEN empieza el mes 7 (Otoño) en Bosque
- THEN tejer cuesta 2 nutrientes
- AND cada árbol vivo sigue produciendo 1 espora y 1 nutriente al terminar el mes

#### Scenario: Tejer sin nutrientes suficientes con escarcha
- WHEN hay 1 nutriente y hay escarcha
- THEN tejer se rechaza con "Faltan 2 nutrientes para tejer con escarcha."

#### Scenario: Invierno en Bosque
- WHEN empieza el mes 10 (Invierno) en Bosque
- THEN tejer vuelve a costar 1 nutriente

### Requirement: Árboles que se apagan
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

#### Scenario: Ancestral, tres veces
- WHEN se juega Ancestral sin revivir los árboles marcados
- THEN al terminar los meses 3, 6 y 9 se apaga un árbol cada vez
