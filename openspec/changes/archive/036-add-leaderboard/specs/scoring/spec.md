# Delta · scoring

## MODIFIED Requirements

### Requirement: Mejor resultado local
El juego SHALL guardar solo el mejor `ScoreResult` de cada claro en `localStorage`, con una clave versionada por `mapId` y `scoringVersion`: un solo récord por claro para los tres niveles, comparando totales ya multiplicados. Si leer o escribir falla, el juego SHALL seguir sin récord. El récord local no depende de la red ni del alias; el ranking global vive en `leaderboard`.

#### Scenario: Nuevo récord
- WHEN una victoria supera el mejor resultado guardado de su mismo `mapId`
- THEN la carta de victoria dice "Nuevo récord" y se guarda el nuevo resultado

#### Scenario: Récord entre niveles
- WHEN el récord de la semilla 1 es de Brote y se gana la semilla 1 en Ancestral con un total multiplicado mayor
- THEN la carta dice "Nuevo récord" y el récord guardado es el de Ancestral

#### Scenario: Primer resultado de un claro
- WHEN se gana un claro que no tiene resultado guardado
- THEN se guarda el resultado y la carta no dice "Nuevo récord"

#### Scenario: Estado de depuración
- WHEN se gana desde `?debugState`
- THEN no se lee ni se guarda récord

#### Scenario: Almacenamiento que falla
- WHEN `localStorage` lanza un error al leer o escribir
- THEN la carta de victoria se muestra completa, sin "Nuevo récord", y no hay errores sin manejar
