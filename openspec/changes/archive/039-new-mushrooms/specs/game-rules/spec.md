## MODIFIED Requirements

### Requirement: Reclutar
El jugador SHALL poder reclutar una Gliophorus psittacinus, una Morchella esculenta, un Ganoderma lucidum o un Lycoperdon perlatum, una sola vez cada especie, hasta 6 miembros reclutables; el recluta SHALL trabajar desde el mes siguiente. El Lactarius indigo, el Champiñón y la Amanita muscaria solo están al empezar y no se reclutan. Los reclutas se llaman Chispa (Gliophorus), Panal (Morchella), Ámbar (Ganoderma) y Pompón (Lycoperdon). Si la especie ya está en el gremio, reclutar SHALL rechazarse con «Ya hay una Gliophorus en el gremio.» (o «una Morchella», «un Ganoderma», «un Lycoperdon»). El costo SHALL subir con cada recluta de la partida: el primero cuesta 3 esporas, el segundo 5 y el tercero 7 (`config.ts › RECRUIT_COSTS`). Los tres miembros iniciales no son reclutas y Maestra Bruma no se recluta ni cuenta en el cupo, así que hay exactamente tres reclutas por partida. `recruitCost(estado)` SHALL devolver el costo del próximo recluta, o nada si el gremio está completo. Sin esporas suficientes, reclutar SHALL rechazarse con «Reclutar cuesta N esporas.», con N el costo del próximo.

#### Scenario: Cada recluta cuesta más
- WHEN el jugador recluta tres veces en la misma partida
- THEN paga 3 esporas por el primero, 5 por el segundo y 7 por el tercero

#### Scenario: No alcanza para el próximo
- WHEN el gremio ya tiene un recluta y el jugador tiene 4 esporas
- THEN reclutar se rechaza con "Reclutar cuesta 5 esporas."

#### Scenario: Maestra Bruma no cuenta
- WHEN Maestra Bruma ya llegó y el gremio tiene un recluta
- THEN el próximo recluta cuesta 5 esporas

#### Scenario: Gremio completo
- WHEN el gremio tiene 6 miembros
- THEN reclutar se rechaza con "El gremio está completo."

#### Scenario: Una de cada especie
- WHEN el gremio ya tiene a Panal y el jugador intenta reclutar otra Morchella
- THEN la acción se rechaza con "Ya hay una Morchella en el gremio."

#### Scenario: Los del inicio no se reclutan
- WHEN el jugador abre la hoja de reclutar
- THEN puede elegir entre Gliophorus, Morchella, Ganoderma y Lycoperdon, y no entre Lactarius, Champiñón ni Amanita

### Requirement: Dificultad medida
El balance SHALL verificarse por simulación en 100 mapas generados por nivel, con semillas fijas (en Bosque y Ancestral, las certificadas de la tabla precalculada):
- **Brote:** la política de las pistas gana el 100 % de los mapas aceptados con un mes medio entre 8 y 10, y un bot que juega al azar gana entre el 5 % y el 30 %.
- **Bosque:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 55 % y el 75 %, y el bot al azar gana como máximo el 10 %.
- **Ancestral:** el bot experto gana el 100 % de los mapas aceptados, la política de las pistas gana entre el 10 % y el 35 %, y el bot al azar gana como máximo el 5 %.

Generar un claro de Bosque o Ancestral de la tabla certificada SHALL tardar menos de 300 ms en un teléfono de gama media; uno fuera de la tabla (solo con `?seed=` mayor que 1000) SHALL tardar menos de 800 ms.

#### Scenario: Balance
- WHEN `balance.test.ts` juega 100 mapas generados por nivel con semillas fijas
- THEN en Brote las pistas ganan todos entre el mes 8 y el 11, con mes medio entre 8 y 10, y el bot al azar gana entre el 5 % y el 30 %
- AND en Bosque y Ancestral el bot experto gana todos, y la política de las pistas y el bot al azar quedan en sus rangos

## ADDED Requirements

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
El Lycoperdon perlatum SHALL, sobre un árbol vivo (no el Árbol Padre), cambiar 1 nutriente por 2 esporas. Nunca da nutrientes.

#### Scenario: Sopla
- WHEN hay 1 nutriente y Pompón toca un árbol vivo
- THEN los nutrientes bajan en 1 y las esporas suben en 2

#### Scenario: Sin árbol vivo
- WHEN Pompón toca una tierra
- THEN la acción se rechaza con "El Lycoperdon sopla esporas desde un árbol vivo."

#### Scenario: Sin nutriente
- WHEN hay 0 nutrientes y Pompón toca un árbol vivo
- THEN la acción se rechaza con "Falta 1 nutriente para soplar esporas."
