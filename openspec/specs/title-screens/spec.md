# title-screens

## Purpose
Pantallas fuera de la partida: portada, "Cómo jugar" (carrusel de 5 pasos) y "El gremio". Origen: cambio 012 (archivado); el 018 limpió la portada (sin personajes) y rehízo el recorte del logo. Implementadas en `src/store.ts` (`ui.screen`) y `src/ui/screens.ts`.

## Requirements

### Requirement: Portada
Al abrir el juego sin `?map`, `?seed`, `?nivel` ni `?debugState`, el juego SHALL mostrar la portada: el logo completo (sin recortes) y un menú con "Nueva partida" (principal), "Cómo jugar" y "El gremio". "Nueva partida" SHALL abrir "Elige tu claro" y, tras elegir el nivel, la intro o el tablero.

#### Scenario: Abrir el juego
- WHEN el jugador abre el sitio
- THEN ve la portada con el foco en "Nueva partida"
- AND la portada no muestra a los personajes
- AND al pulsarla ve "Elige tu claro"; al elegir Brote por primera vez ve la intro y después el tablero en el mes 1

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

### Requirement: Volver
"Volver" (‹) y Esc SHALL regresar a donde se abrió la pantalla (portada o tablero); si hay una hoja abierta encima, Esc la cierra primero. En la portada, Esc no hace nada. Ninguna pantalla SHALL obligar a desplazar la página a 390 × 844 ni a 844 × 390.

#### Scenario: Esc en Cómo jugar
- WHEN el jugador abre "Cómo jugar" desde la portada y pulsa Esc
- THEN vuelve a la portada

### Requirement: Elige tu claro
"Nueva partida" SHALL abrir la pantalla "Elige tu claro" con los tres niveles (Brote, Bosque y Ancestral), cada uno con su nombre, una línea que diga qué cambia y su multiplicador de puntaje. Cada nivel SHALL ser un botón de al menos 44 px de alto. El foco SHALL ir al último nivel elegido (Brote la primera vez), recordado entre visitas; si el almacenamiento falla, el foco va a Brote. Esc SHALL volver a la portada. Elegir un nivel SHALL abrir la intro la primera vez que se juega ese nivel y el tablero las demás. "Jugar de nuevo" SHALL conservar el nivel. `?nivel=brote|bosque|ancestral` SHALL entrar directo al tablero en ese nivel.

#### Scenario: Elegir Ancestral
- WHEN el jugador pulsa "Nueva partida" y elige Ancestral
- THEN empieza una partida en Ancestral
- AND la próxima vez que pulse "Nueva partida", el foco está en Ancestral

#### Scenario: Volver a la portada
- WHEN el jugador está en "Elige tu claro" y pulsa Esc
- THEN vuelve a la portada con el foco en "Nueva partida"

#### Scenario: Jugar de nuevo conserva el nivel
- WHEN el jugador termina una partida en Bosque y pulsa "Jugar de nuevo"
- THEN la partida nueva es en Bosque
