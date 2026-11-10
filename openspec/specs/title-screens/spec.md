# title-screens

## Purpose
Pantallas fuera de la partida: portada, "Cómo jugar" (carrusel de 5 pasos), "El gremio" y el acceso al ranking (`leaderboard`, 036). Origen: cambio 012 (archivado); el 018 limpió la portada (sin personajes) y rehízo el recorte del logo. Implementadas en `src/store.ts` (`ui.screen`) y `src/ui/screens.ts`.

## Requirements

### Requirement: Portada
Al abrir el juego sin `?map`, `?seed`, `?nivel` ni `?debugState`, el juego SHALL mostrar la portada: el logo completo (sin recortes) y un menú con "Nueva partida" (principal), "Cómo jugar", "El gremio" y "Ranking". "Nueva partida" SHALL abrir "Elige tu dificultad" y, tras elegir el nivel, la intro o el tablero. "Ranking" SHALL abrir la pantalla del ranking (`leaderboard`). Si el dispositivo tiene un jugador registrado, la portada SHALL saludarlo por su alias en una línea que no es un control.

#### Scenario: Abrir el juego
- WHEN el jugador abre el sitio
- THEN ve la portada con el foco en "Nueva partida"
- AND la portada no muestra a los personajes
- AND al pulsarla ve "Elige tu dificultad"; al elegir Brote por primera vez ve la intro y después el tablero en el mes 1

#### Scenario: Abrir el ranking
- WHEN el jugador pulsa "Ranking" en la portada
- THEN ve el ranking y con Esc vuelve a la portada con el foco en "Ranking"

#### Scenario: Portada en horizontal con saludo
- WHEN un jugador registrado abre la portada a 844 × 390
- THEN el menú de cuatro opciones, el saludo y el crédito se ven completos y la página no hace scroll

### Requirement: Cómo jugar
"Cómo jugar" SHALL mostrar 5 pasos (elige un hongo, trabaja junto a la red, una vez por mes, al empezar el mes, despierta al Árbol Padre) en un carrusel con anterior y siguiente, puntos que llevan a cada paso, flechas del teclado y deslizar con el dedo. El último paso no tiene "siguiente". Desde cualquier paso se puede abrir la Libreta de campo; "¡A jugar!" empieza la partida (desde la portada) o vuelve al tablero (desde el "?"). Cada paso SHALL ilustrarse con una miniatura de la interfaz del juego hecha con sus mismos componentes, decorativa (no se toca ni se enfoca): tarjetas del dock con la ★ (paso 1), casillas de red y casillas resaltadas (paso 2), una tarjeta que descansa y el botón «Fin del mes» (paso 3), un árbol vivo con lo que da y el medallón «Reclutar» (paso 4), y el Árbol Padre con las pastillas de árboles y nutrientes del HUD (paso 5).

#### Scenario: Recorrer los pasos
- WHEN el jugador abre "Cómo jugar" y pulsa "Paso siguiente"
- THEN ve el paso 2 de 5, "Trabaja junto a la red"
- AND con el punto 5 llega a "Despierta al Árbol Padre", sin "siguiente"

#### Scenario: El paso se parece a la partida
- WHEN el jugador está en el paso 3 de "Cómo jugar"
- THEN ve una tarjeta del dock con «Zz» y el botón «Fin del mes» como en el tablero, y ninguno recibe el foco

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

### Requirement: Crédito del autor
La portada SHALL mostrar, fija al borde inferior de la pantalla y centrada, con un margen pequeño (8 px, o el área segura del teléfono si es mayor), en letra pequeña (12 px), la línea «By Mario Mora for BerryLab». El texto SHALL tener un contraste de al menos 4,5:1 con su fondo inmediato, que es sólido (no depende del fondo pintado), y no SHALL tapar el logo ni el menú en vertical ni en horizontal. La línea no es un control: no recibe el foco.

#### Scenario: Ver el crédito
- WHEN el jugador abre el sitio
- THEN la portada muestra «By Mario Mora for BerryLab» centrada y a 8 px del borde inferior
- AND el contraste entre el texto y su fondo es de al menos 4,5:1

#### Scenario: Portada en horizontal
- WHEN se abre la portada a 844 × 390
- THEN el crédito sigue fijo abajo y centrado, se ve completo y no se superpone al logo ni al menú, y la página no hace scroll

### Requirement: Elige tu dificultad
"Nueva partida" SHALL abrir la pantalla "Elige tu dificultad" con los tres niveles (Brote, Bosque y Ancestral), cada uno con su nombre, una línea que diga qué cambia y su multiplicador de puntaje. Cada nivel SHALL ser un botón de al menos 44 px de alto. El foco SHALL ir al último nivel elegido (Brote la primera vez), recordado entre visitas; si el almacenamiento falla, el foco va a Brote. Esc SHALL volver a la portada. Elegir un nivel SHALL abrir la intro la primera vez que se juega ese nivel y el tablero las demás. "Jugar de nuevo" SHALL conservar el nivel. `?nivel=brote|bosque|ancestral` SHALL entrar directo al tablero en ese nivel.

#### Scenario: Elegir Ancestral
- WHEN el jugador pulsa "Nueva partida" y elige Ancestral
- THEN empieza una partida en Ancestral
- AND la próxima vez que pulse "Nueva partida", el foco está en Ancestral

#### Scenario: Volver a la portada
- WHEN el jugador está en "Elige tu dificultad" y pulsa Esc
- THEN vuelve a la portada con el foco en "Nueva partida"

#### Scenario: Jugar de nuevo conserva el nivel
- WHEN el jugador termina una partida en Bosque y pulsa "Jugar de nuevo"
- THEN la partida nueva es en Bosque
