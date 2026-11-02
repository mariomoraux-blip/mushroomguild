# Delta · title-screens

## MODIFIED Requirements

### Requirement: Portada
Al abrir el juego sin `?map`, `?seed` ni `?debugState`, el juego SHALL mostrar la portada: logo, los cinco personajes y un menú con "Nueva partida" (principal), "Cómo jugar" y "El gremio". "Nueva partida" SHALL abrir la intro y después el tablero.

#### Scenario: Abrir el juego
- WHEN el jugador abre el sitio
- THEN ve la portada con el foco en "Nueva partida"
- AND al pulsarla ve la intro y después el tablero en el mes 1

### Requirement: Cómo jugar
"Cómo jugar" SHALL mostrar 5 pasos (elige un hongo, trabaja junto a la red, una vez por mes, al empezar el mes, despierta al Árbol Padre) en un carrusel con anterior y siguiente, puntos que llevan a cada paso, flechas del teclado y deslizar con el dedo. El último paso no tiene "siguiente". Desde cualquier paso se puede abrir la Libreta de campo; "¡A jugar!" empieza la partida (desde la portada) o vuelve al tablero (desde el "?").

#### Scenario: Recorrer los pasos
- WHEN el jugador abre "Cómo jugar" y pulsa "Paso siguiente"
- THEN ve el paso 2 de 5, "Trabaja junto a la red"
- AND con el punto 5 llega a "Despierta al Árbol Padre", sin "siguiente"

### Requirement: El gremio
"El gremio" SHALL listar las cinco especies con su retrato, nombre, rol y qué hacen; tocar una SHALL abrir su ficha encima de la pantalla.

#### Scenario: Ver una ficha
- WHEN el jugador toca a Maestra Bruma en "El gremio"
- THEN se abre su ficha (Conocybe arcana) y al cerrarla sigue en "El gremio"
