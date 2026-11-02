# Delta · board-interaction

## MODIFIED Requirements

### Requirement: Feedback de acción inválida
La interfaz SHALL mostrar en la bitácora el motivo exacto que devuelve `check()` cuando una acción no es posible.
Cuando el miembro seleccionado no tiene ninguna casilla válida, la bitácora SHALL mostrar "Nombre: motivo", donde el motivo sale de `idleReason(state, memberId)` (lógica en `src/rules`, devuelve una clave) y su texto vive en `src/copy/es.ts`:

| Especie | Condición | Texto |
| --- | --- | --- |
| Champiñón | No hay troncos junto a la red | "no hay troncos junto a la red. Teje hacia uno." |
| Lactarius indigo | Menos nutrientes que el costo de tejer | "faltan nutrientes." |
| Lactarius indigo | No hay tierra libre junto a la red | "no hay tierra junto a la red." |
| Amanita muscaria | Menos nutrientes que el costo de revivir | "faltan nutrientes." |
| Amanita muscaria | No hay árboles grises junto a la red | "no hay árboles grises junto a la red." |
| Gliophorus psittacinus | Hay un compañero que ya trabajó hoy, pero menos esporas que el costo de pasar la voz | "falta 1 espora: pasar la voz cuesta 1." |
| Gliophorus psittacinus | Nadie ha trabajado todavía hoy | "nadie ha trabajado todavía hoy. Pasa la voz después de que trabaje un compañero." |
| Maestra Bruna | Ya lanzó un hechizo esta estación | "su magia vuelve con la próxima estación." |

Maestra Bruna no tiene otro motivo de inactividad: cuando llega siempre hay árboles vivos.

#### Scenario: Toque en una casilla no válida
- WHEN hay un miembro seleccionado y el jugador toca una casilla no resaltada
- THEN la bitácora muestra el motivo exacto de `check()` para esa casilla y el miembro sigue seleccionado

#### Scenario: Sin trabajo disponible (Champiñón)
- WHEN se selecciona a Bruno y no hay troncos junto a la red
- THEN la bitácora dice "Bruno: no hay troncos junto a la red. Teje hacia uno."

#### Scenario: Sin trabajo disponible (Lactarius indigo)
- WHEN se selecciona a Añil con 0 nutrientes
- THEN la bitácora dice "Añil: faltan nutrientes."

#### Scenario: Sin trabajo disponible (Amanita muscaria)
- WHEN se selecciona a Rubí con nutrientes suficientes y ningún árbol gris junto a la red
- THEN la bitácora dice "Rubí: no hay árboles grises junto a la red."

#### Scenario: Sin trabajo disponible (Gliophorus psittacinus)
- WHEN se selecciona a Chispa, Bruno ya trabajó hoy y hay 0 esporas
- THEN la bitácora dice "Chispa: falta 1 espora: pasar la voz cuesta 1."

#### Scenario: Sin trabajo disponible (Maestra Bruna)
- WHEN se selecciona a Maestra Bruna después de que ya lanzó un hechizo esta estación
- THEN la bitácora dice "Maestra Bruna: su magia vuelve con la próxima estación."

### Requirement: Estado visible
El HUD SHALL mostrar en todo momento día (de 12), estación, nutrientes, esporas y árboles vivos (del total de árboles del claro).

#### Scenario: Tras una acción
- WHEN el Champiñón descompone un tronco
- THEN el HUD muestra los nutrientes actualizados sin recargar la página

## ADDED Requirements

### Requirement: Retratos del gremio
El dock, las fichas y el tablero SHALL usar los sprites de Blender de cada especie (`public/assets/characters/`): en el dock, el retrato en reposo; en la ficha, la pose feliz; en el tablero, la pose de trabajo sobre la casilla donde ese miembro trabajó hoy. La Gliophorus SHALL usar la variante de su estación. Maestra Bruna, sin modelo todavía, usa un placeholder de silueta.

#### Scenario: Trabajó hoy
- WHEN Bruno descompone un tronco
- THEN el tablero muestra a Bruno trabajando sobre ese tronco hasta el amanecer

#### Scenario: Retratos en el dock
- WHEN empieza la partida
- THEN las tarjetas de Añil, Bruno y Rubí muestran sus retratos

### Requirement: Estilo cozy
La interfaz SHALL seguir la libreta de campo con un acabado más moderno: fondo de papel crema, cintas verdes de título, chips con íconos para día, nutrientes, esporas y árboles, tarjetas redondeadas con sombra suave, botón principal amarillo y tablero con marco de madera. Todos los colores y tipografías SHALL venir de `src/theme.ts`.

#### Scenario: Pantalla de juego
- WHEN se abre el juego a 390 × 844
- THEN el HUD es una cinta verde con el día y la estación y chips con íconos, y "Fin del día" es un botón amarillo
