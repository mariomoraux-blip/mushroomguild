# Delta · player-guidance

## ADDED Requirements

### Requirement: Aviso de mes vacío
Cuando hay miembros listos, ninguno tiene una casilla válida y en el mes todavía nadie actuó (reclutar no cuenta), la bitácora SHALL decir que nadie tiene trabajo este mes y cuántos nutrientes traerá la hojarasca al terminarlo: «Nadie tiene trabajo este mes. Termina el mes: la hojarasca traerá N nutrientes.», o «Nadie tiene trabajo este mes. Termina el mes.» si no hay árboles vivos. El aviso SHALL mostrarse en todos los niveles, también en Ancestral, porque describe el estado y no sugiere ningún miembro ni casilla. Tocar un miembro SHALL seguir mostrando su motivo de inactividad.

#### Scenario: Mes vacío en Ancestral
- WHEN empieza el mes 4 en Ancestral con la semilla 745, la red en el Hogar, (2,7), (4,7), (4,6) y el árbol vivo (4,5), 2 nutrientes y el gremio inicial listo
- THEN la bitácora dice «Nadie tiene trabajo este mes. Termina el mes: la hojarasca traerá 1 nutriente.»
- AND no dice «Pista:»

#### Scenario: Final normal de un mes
- WHEN en el mes ya actuó algún miembro y a los que quedan listos no les queda ninguna casilla válida
- THEN no se muestra el aviso de mes vacío

## MODIFIED Requirements

### Requirement: Pista y camino sugerido
El juego SHALL proponer un siguiente paso con `advise(state)`, con esta prioridad: despertar al Árbol Padre > revivir un árbol > hechizo de Maestra Bruma > pasar la voz a una Amanita > descomponer > pasar la voz a un Champiñón > tejer > pasar la voz a un Lactarius > reclutar > terminar el mes. Reclutar SHALL sugerirse solo en dos casos (ver "Cómo reclutar"): cuando ningún miembro listo tiene una acción útil, o cuando falta el rol que pide el siguiente paso sugerido. El miembro sugerido SHALL llevar una ★ en el dock; al seleccionarlo, la casilla sugerida SHALL llevar una ★ en el tablero. Tejer SHALL apuntar a la casilla válida más cercana al árbol gris más cercano a la red mientras haya menos de 3 árboles revividos, y al Árbol Padre después. En Ancestral no SHALL mostrarse ninguna pista: ni ★ en el dock o el tablero, ni «Pista:» en la bitácora (los bots siguen usando `advise`). Los avisos de la presión y el aviso de mes vacío no son pistas.

#### Scenario: Ancestral sin pistas
- WHEN empieza una partida en Ancestral
- THEN ninguna tarjeta del dock lleva la ★ y la bitácora no dice «Pista:»
- AND al seleccionar a un miembro, ninguna casilla lleva la ★
