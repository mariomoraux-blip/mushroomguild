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
| Gliophorus psittacinus | Hay un compañero que ya trabajó este mes, pero menos esporas que el costo de pasar la voz | "falta 1 espora: pasar la voz cuesta 1." |
| Gliophorus psittacinus | Nadie ha trabajado todavía este mes | "nadie ha trabajado todavía este mes. Pasa la voz después de que trabaje un compañero." |
| Maestra Bruma | Ya lanzó un hechizo esta estación | "su magia vuelve con la próxima estación." |

Maestra Bruma no tiene otro motivo de inactividad: cuando llega siempre hay árboles vivos.

#### Scenario: Toque en una casilla no válida
- WHEN hay un miembro seleccionado y el jugador toca una casilla no resaltada
- THEN la bitácora muestra el motivo exacto de `check()` para esa casilla y el miembro sigue seleccionado

#### Scenario: Sin trabajo disponible (Champiñón)
- WHEN se selecciona a Bruno y no hay troncos junto a la red
- THEN la bitácora dice "Bruno: no hay troncos junto a la red. Teje hacia uno."

#### Scenario: Sin trabajo disponible (Lactarius indigo)
- WHEN se selecciona a Indi con 0 nutrientes
- THEN la bitácora dice "Indi: faltan nutrientes."

#### Scenario: Sin trabajo disponible (Amanita muscaria)
- WHEN se selecciona a Rubí con nutrientes suficientes y ningún árbol gris junto a la red
- THEN la bitácora dice "Rubí: no hay árboles grises junto a la red."

#### Scenario: Sin trabajo disponible (Gliophorus psittacinus)
- WHEN se selecciona a Chispa, Bruno ya trabajó este mes y hay 0 esporas
- THEN la bitácora dice "Chispa: falta 1 espora: pasar la voz cuesta 1."

#### Scenario: Sin trabajo disponible (Maestra Bruma)
- WHEN se selecciona a Maestra Bruma después de que ya lanzó un hechizo esta estación
- THEN la bitácora dice "Maestra Bruma: su magia vuelve con la próxima estación."

### Requirement: Retratos del gremio
El tablero, el dock y las fichas SHALL usar el retrato pintado de cada especie (`public/assets/characters/<personaje>/portrait`): en el dock, dentro de un medallón de madera, con un pequeño salto cuando el miembro está seleccionado o sugerido; en la ficha, grande; en el tablero, sobre la casilla donde ese miembro trabajó este mes. En la interfaz, la Gliophorus SHALL llevar la corona de su estación (`frame-<estación>`). Maestra Bruma SHALL conservar la proporción de su retrato, más alto que ancho, sin deformarse.

#### Scenario: Trabajó este mes
- WHEN Bruno descompone un tronco
- THEN el tablero muestra el retrato de Bruno sobre ese tronco hasta el mes siguiente

#### Scenario: Retratos en el dock
- WHEN empieza la partida
- THEN el dock muestra los medallones de Indi, Bruno y Rubí con sus retratos pintados y sus nombres

#### Scenario: La maga en el tablero
- WHEN Maestra Bruma lanza un hechizo
- THEN el tablero muestra su retrato sobre la casilla del hechizo, más alto que el de los demás miembros

