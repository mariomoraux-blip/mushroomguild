# Delta · game-rules

## MODIFIED Requirements

### Requirement: Reclutar
El jugador SHALL poder reclutar un Champiñón, un Lactarius indigo, una Amanita muscaria o una Gliophorus psittacinus, hasta 6 miembros reclutables; el recluta SHALL trabajar desde el mes siguiente. Los nombres de la Gliophorus son Chispa, Pluma, Trina y Gota. El costo SHALL subir con cada recluta de la partida: el primero cuesta 3 esporas, el segundo 5 y el tercero 7 (`config.ts › RECRUIT_COSTS`). Los tres miembros iniciales no son reclutas y Maestra Bruma no se recluta ni cuenta en el cupo, así que hay exactamente tres reclutas por partida. `recruitCost(estado)` SHALL devolver el costo del próximo recluta, o nada si el gremio está completo. Sin esporas suficientes, reclutar SHALL rechazarse con «Reclutar cuesta N esporas.», con N el costo del próximo.

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
