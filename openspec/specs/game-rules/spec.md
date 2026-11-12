# game-rules

## Purpose
Reglas del juego del Capítulo 1 (El Claro Gris): tablero, especies del gremio, economía, tiempo, hechizos y victoria. Implementadas como lógica pura en `src/rules/`.

## Requirements

### Requirement: Tablero inicial
Cada partida nueva del juego SHALL generar un tablero vertical de 5 columnas por 8 filas con `newRandomGame(seed, level)`: el Hogar en la fila inferior y el Árbol Padre en la superior (columnas 2 a 4), un tronco junto al Hogar, 7 árboles grises a 2 o más casillas del Hogar, 5 troncos y las rocas del nivel (6 en Brote) en las filas intermedias. El Hogar es la única casilla con micelio. La semilla SHALL fijar el claro de Brote; Bosque y Ancestral le agregan rocas sobre casillas de tierra libres (nunca el Hogar, sus vecinas ni las vecinas del Árbol Padre), también según la semilla. En Brote, un mapa solo se acepta si la red puede llegar al Árbol Padre y a todos los árboles y si la política de las pistas lo gana entre el mes 8 y el 11; en Bosque y Ancestral, si la red puede llegar al Árbol Padre y a todos los árboles y si el bot experto (con su búsqueda) lo gana con las reglas del nivel; esa aceptación se precalcula para las semillas 0 a 1000 y las partidas nuevas de esos niveles eligen entre las aceptadas. Fuera de la tabla (`?seed=` mayor que 1000) se prueban hasta 10 intentos. Si no aparece ninguno, en Brote se usa el mapa clásico del Capítulo 1 y en Bosque y Ancestral el primer claro certificado del nivel (desde el 031 el clásico no se gana en Ancestral); la semilla 0 (`?map=clasico`) es el clásico, con las rocas certificadas del nivel si las hay. La misma semilla y el mismo nivel SHALL producir el mismo mapa.

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
- THEN el claro de Ancestral es el de Brote con 5 rocas más sobre casillas que en Brote eran tierra

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
Al terminar el mes, cada árbol vivo SHALL producir 1 espora y 1 nutriente (sin esporas si el mes nuevo es de una estación sin esporas del nivel), el gremio SHALL comer si el mes que terminó es de una estación en que come según el nivel, y todos los miembros SHALL quedar disponibles, menos el que se quedó sin comer.

#### Scenario: Dos árboles vivos
- WHEN termina el mes con 2 árboles vivos
- THEN se suman 2 esporas y 2 nutrientes, y el mes avanza en 1

### Requirement: Reclutar
El jugador SHALL poder reclutar una Gliophorus psittacinus, una Morchella esculenta, un Ganoderma lucidum o un Lycoperdon perlatum, una sola vez cada especie, hasta 7 miembros reclutables; el recluta SHALL trabajar desde el mes siguiente. El Lactarius indigo, el Champiñón y la Amanita muscaria solo están al empezar y no se reclutan. Los reclutas se llaman Chispa (Gliophorus), Panal (Morchella), Ámbar (Ganoderma) y Pompón (Lycoperdon). Si la especie ya está en el gremio, reclutar SHALL rechazarse con «Ya hay una Gliophorus en el gremio.» (o «una Morchella», «un Ganoderma», «un Lycoperdon»). El costo SHALL subir con cada recluta de la partida: el primero cuesta 3 esporas, el segundo 4, el tercero 6 y el cuarto 7 (`config.ts › RECRUIT_COSTS`). Los tres miembros iniciales no son reclutas y Maestra Bruma no se recluta ni cuenta en el cupo, así que hay a lo más cuatro reclutas por partida: una de cada especie reclutable. `recruitCost(estado)` SHALL devolver el costo del próximo recluta, o nada si el gremio está completo. Sin esporas suficientes, reclutar SHALL rechazarse con «Reclutar cuesta N esporas.», con N el costo del próximo.

#### Scenario: Cada recluta cuesta más
- WHEN el jugador recluta cuatro veces en la misma partida
- THEN paga 3 esporas por el primero, 4 por el segundo, 6 por el tercero y 7 por el cuarto

#### Scenario: No alcanza para el próximo
- WHEN el gremio ya tiene un recluta y el jugador tiene 3 esporas
- THEN reclutar se rechaza con "Reclutar cuesta 4 esporas."

#### Scenario: Maestra Bruma no cuenta
- WHEN Maestra Bruma ya llegó y el gremio tiene un recluta
- THEN el próximo recluta cuesta 4 esporas

#### Scenario: Gremio completo
- WHEN el gremio tiene 7 miembros
- THEN reclutar se rechaza con "El gremio está completo."

#### Scenario: Una de cada especie
- WHEN el gremio ya tiene a Panal y el jugador intenta reclutar otra Morchella
- THEN la acción se rechaza con "Ya hay una Morchella en el gremio."

#### Scenario: Los del inicio no se reclutan
- WHEN el jugador abre la hoja de reclutar
- THEN puede elegir entre Gliophorus, Morchella, Ganoderma y Lycoperdon, y no entre Lactarius, Champiñón ni Amanita

#### Scenario: Las cuatro especies
- WHEN el jugador recluta a Chispa, Panal, Ámbar y Pompón en la misma partida
- THEN los cuatro entran al gremio y el gremio queda completo

### Requirement: Estaciones
El juego SHALL tener 12 meses agrupados en 4 estaciones de 3 meses: Primavera, Verano, Otoño, Invierno.

#### Scenario: Cambio de estación
- WHEN termina el mes 3
- THEN el mes 4 pertenece a Verano

### Requirement: Final suave
Si termina el mes 12 sin victoria, la partida SHALL terminar en estado `lost` sin penalización, permitiendo reiniciar.

#### Scenario: Fin del invierno
- WHEN el jugador termina el mes 12 sin haber ganado
- THEN el estado es `lost`

### Requirement: Dificultad medida
El balance SHALL verificarse por simulación en 100 mapas generados por nivel, con semillas fijas (en Bosque y Ancestral, las certificadas de la tabla precalculada):
- **Brote:** la política de las pistas gana el 100 % de los mapas aceptados con un mes medio entre 8 y 10, y un bot que juega al azar gana entre el 5 % y el 30 %.
- **Bosque:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 35 % y el 50 %, y el bot al azar gana como máximo el 10 %.
- **Ancestral:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 10 % y el 20 %, y el bot al azar gana como máximo el 5 %.

Generar un claro de Bosque o Ancestral de la tabla certificada SHALL tardar menos de 300 ms en un teléfono de gama media; uno fuera de la tabla (solo con `?seed=` mayor que 1000) SHALL tardar menos de 800 ms.

#### Scenario: Balance
- WHEN `balance.test.ts` juega 100 mapas generados por nivel con semillas fijas
- THEN en Brote las pistas ganan todos entre el mes 8 y el 11, con mes medio entre 8 y 10, y el bot al azar gana entre el 5 % y el 30 %
- AND en Bosque y Ancestral el bot experto gana todos, y la política de las pistas y el bot al azar quedan en sus rangos

### Requirement: Niveles de dificultad
Cada partida SHALL jugarse en uno de tres niveles: Brote, Bosque o Ancestral. El nivel SHALL definir las rocas del claro, las estaciones con escarcha, los meses al final de los cuales se apaga un árbol, las estaciones en que come el gremio, las estaciones sin esporas, las estaciones con plaga, los árboles revividos y los nutrientes que pide el Árbol Padre, si hay pistas y el multiplicador de puntaje, todo en `config.ts › LEVELS`:

| | Brote | Bosque | Ancestral |
| --- | --- | --- | --- |
| Rocas | 6 | 9 | 11 |
| Escarcha | — | Otoño e Invierno | Otoño e Invierno |
| Se apaga un árbol al final del mes | — | 4 y 6 | 2, 3, 5, 7, 9 y 11 |
| El gremio come 1 nutriente al terminar el mes | — | Otoño e Invierno | Otoño e Invierno |
| Los árboles no dan esporas | — | Invierno | Invierno |
| Plaga (una casilla tejida por estación) | — | Invierno | Otoño e Invierno |
| Árboles revividos que pide el Árbol Padre | 3 | 3 | 4 |
| Nutrientes del Árbol Padre | 10 | 11 | 13 |
| Pistas | sí | sí | no |
| Multiplicador | ×1 | ×1,5 | ×2 |

Ninguna regla de nivel SHALL quitar árboles vivos. La red solo cambia por las acciones del jugador y por la plaga de Bosque y Ancestral, que quita a lo más una casilla tejida al terminar un mes. Las esporas y los nutrientes solo cambian por las acciones del jugador, la producción de los árboles y lo que come el gremio en otoño e invierno.

#### Scenario: Brote es el juego de siempre
- WHEN se juega en Brote
- THEN el claro tiene 6 rocas, tejer cuesta siempre 1 nutriente, ningún árbol se apaga, el gremio no come y el Árbol Padre pide 3 árboles revividos y 10 nutrientes

#### Scenario: Nada se pierde
- WHEN termina cualquier mes en cualquier nivel
- THEN los árboles vivos son al menos los mismos que antes de terminarlo, y las casillas de la red también, salvo a lo más la casilla con plaga

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
- THEN tejer sigue costando 2 nutrientes
- AND WHEN empieza el mes 4 (Verano) THEN tejer cuesta 1 nutriente

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

### Requirement: Plaga
En las estaciones con plaga del nivel (Bosque: invierno; Ancestral: otoño e invierno), al empezar la estación (mes 7 o 10) la plaga SHALL marcar una casilla tejida de la red (tierra de la red; nunca el Hogar, un árbol ni el Árbol Padre): una de las más cercanas al Árbol Padre en pasos en cruz, elegida al azar con el claro y el mes (la misma partida marca siempre la misma). La casilla SHALL seguir con plaga hasta que termine un mes en que algún hongo trabajó a 2 casillas o menos de ella (pasos en cruz; cualquier miembro, también Maestra Bruma). Al terminar un mes sin hongos cerca, una casilla con plaga aún tejida SHALL marchitarse: sale de la red y sigue con plaga; una ya marchita sigue igual. Mientras tenga plaga, el Lactarius no SHALL poder tejerla. Al terminar un mes con un hongo cerca, la plaga se va: si la casilla seguía tejida sigue en la red (los hongos la frenaron) y si estaba marchita vuelve a ser tierra, que se puede tejer otra vez a su costo (los hongos la limpiaron). La plaga del otoño SHALL poder seguir cuando el invierno marca otra casilla; la nueva se elige entre las casillas tejidas sin plaga. Sin casillas tejidas, no se marca ninguna. Brote no tiene plaga.

#### Scenario: La plaga marca
- WHEN empieza el mes 7 en Ancestral con la red tejida en (2,6), (2,5), (2,4) y (2,3) del mapa clásico
- THEN se marca (2,3), la casilla tejida más cercana al Árbol Padre
- AND la bitácora dice que se marchitará al terminar el mes si ningún hongo trabaja a 2 casillas o menos

#### Scenario: Se marchita
- WHEN termina el mes con la casilla marcada y ningún hongo trabajó a 2 casillas o menos
- THEN la casilla sale de la red, sigue con plaga y la bitácora dice que no se puede tejer hasta que un hongo trabaje a 2 casillas o menos

#### Scenario: Los hongos la frenan
- WHEN termina el mes y un hongo trabajó a 2 casillas de la casilla marcada
- THEN la casilla sigue en la red y la bitácora dice "Los hongos frenaron la plaga."

#### Scenario: Bosque sin plaga
- WHEN empieza el mes 7 en Bosque o cualquier mes en Brote
- THEN no se marca ninguna casilla

#### Scenario: Plaga del invierno en Bosque
- WHEN empieza el mes 10 en Bosque con casillas tejidas
- THEN la plaga marca una casilla tejida, como en Ancestral

#### Scenario: No se puede tejer
- WHEN el Lactarius intenta tejer una casilla marchita con plaga
- THEN la acción se rechaza con "La plaga no deja tejer aquí: se va al terminar un mes en que un hongo trabaje a 2 casillas o menos."

#### Scenario: Se queda
- WHEN termina otro mes sin hongos a 2 casillas o menos de la casilla marchita
- THEN la casilla sigue fuera de la red y con plaga

#### Scenario: Los hongos la limpian
- WHEN termina un mes en que un hongo trabajó a 2 casillas de la casilla marchita
- THEN la casilla vuelve a ser tierra sin plaga, se puede tejer otra vez y la bitácora dice "Los hongos limpiaron la plaga: la casilla volvió a ser tierra."

#### Scenario: Dos plagas
- WHEN empieza el mes 10 en Ancestral y la casilla que marcó el otoño sigue marchita
- THEN la plaga marca otra casilla tejida y las dos tienen plaga

### Requirement: Romper rocas (Morchella esculenta)
La Morchella esculenta SHALL, por 2 nutrientes, convertir en tierra sin tejer una roca vecina a la red. La casilla queda fuera de la red y después se puede tejer. La escarcha no cambia su costo.

#### Scenario: Rompe una roca
- WHEN hay 2 nutrientes y Panal toca una roca vecina a la red
- THEN la roca queda como tierra fuera de la red y los nutrientes bajan en 2

#### Scenario: Roca lejos
- WHEN Panal toca una roca que no toca la red
- THEN la acción se rechaza con "Muy lejos: la roca debe tocar la red."

#### Scenario: Sin nutrientes
- WHEN hay 1 nutriente y Panal toca una roca vecina a la red
- THEN la acción se rechaza con "Faltan nutrientes: romper una roca cuesta 2."

### Requirement: Curar a distancia (Ganoderma lucidum)
El Ganoderma lucidum SHALL revivir un árbol gris a 2 casillas o menos de la red (pasos en cruz desde la casilla tejida más cercana, sin importar las rocas), aunque la red no lo toque, por 3 nutrientes y 1 espora; un árbol apagado cuesta 7 nutrientes y 1 espora. El árbol revivido SHALL quedar vivo y entrar a la red, como con la Amanita, y cuenta para la llegada de Maestra Bruma y para el Árbol Padre. No SHALL despertar al Árbol Padre. En los niveles con plaga, SHALL poder también quitar la plaga de una casilla a 2 casillas o menos de la red, por 1 espora: si seguía tejida sigue en la red y si estaba marchita vuelve a ser tierra. La escarcha no cambia sus costos.

#### Scenario: Cura sin que la red lo toque
- WHEN hay 3 nutrientes y 1 espora, y un árbol gris está a 2 pasos de la red
- THEN Ámbar lo revive, el árbol entra a la red y bajan 3 nutrientes y 1 espora

#### Scenario: Demasiado lejos
- WHEN Ámbar toca un árbol gris a 3 pasos de la red
- THEN la acción se rechaza con "Muy lejos: el Ganoderma cura árboles a 2 casillas o menos de la red."

#### Scenario: Sin espora
- WHEN hay 3 nutrientes y 0 esporas
- THEN curar se rechaza con "Falta 1 espora: curar a distancia cuesta 1."

#### Scenario: Limpia la plaga
- WHEN en Ancestral hay 1 espora y una casilla marchita con plaga junto a la red
- THEN Ámbar la limpia: vuelve a ser tierra sin plaga y baja 1 espora

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

### Requirement: Victoria por nivel
La Amanita muscaria SHALL despertar al Árbol Padre si este toca la red y hay los árboles revividos y los nutrientes del nivel (`LEVELS › motherTrees` y `mother`): 3 árboles y 10 nutrientes en Brote, 3 árboles y 11 nutrientes en Bosque, 4 árboles y 13 nutrientes en Ancestral; eso SHALL terminar la partida con victoria.

#### Scenario: Bosque que aún no habla
- WHEN la Amanita muscaria intenta despertar al Árbol Padre con 2 árboles revividos
- THEN la acción se rechaza pidiendo revivir al menos 3 árboles

#### Scenario: Once nutrientes en Bosque
- WHEN en Bosque la Amanita muscaria intenta despertar al Árbol Padre con 3 árboles revividos y 10 nutrientes
- THEN la acción se rechaza con "El Árbol Padre necesita 11 nutrientes."
- AND con 11 nutrientes lo despierta y gana

#### Scenario: Ancestral pide cuatro árboles
- WHEN en Ancestral la Amanita muscaria intenta despertar al Árbol Padre con 3 árboles revividos y 13 nutrientes
- THEN la acción se rechaza con "El bosque aún no habla: revive al menos 4 árboles primero."

#### Scenario: Trece nutrientes en Ancestral
- WHEN en Ancestral la Amanita muscaria intenta despertar al Árbol Padre con 4 árboles revividos y 12 nutrientes
- THEN la acción se rechaza con "El Árbol Padre necesita 13 nutrientes."
- AND con 13 nutrientes lo despierta y gana

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

#### Scenario: Bosque, dos veces
- WHEN se juega Bosque sin revivir los árboles marcados
- THEN al terminar los meses 4 y 6 se apaga un árbol cada vez

#### Scenario: Ancestral, seis veces
- WHEN se juega Ancestral sin revivir los árboles marcados
- THEN al terminar los meses 2, 3, 5, 7, 9 y 11 se apaga un árbol cada vez
