# Delta · visual-feedback

## MODIFIED Requirements

### Requirement: Respuesta a cada acción
Cada acción válida SHALL tener una animación de `standard` (280 ms) o menos que muestre su efecto en el tablero, dibujada encima del estado final y que se limpia al terminar; despertar al Árbol Padre y los hechizos de Maestra Bruma usan `narrative` (600 ms). El retrato del miembro SHALL llegar a la casilla con la firma de su especie (`design.md` › Firma por especie) y su tarjeta del dock SHALL pasar a «Zz» con un fundido. Pasar la voz SHALL mostrar a quién se liberó.

#### Scenario: Tejer
- WHEN el Lactarius indigo teje micelio
- THEN la línea de micelio crece desde la casilla vecina hacia la nueva, nace con un destello índigo y termina dorada

#### Scenario: Descomponer
- WHEN el Champiñón descompone un tronco
- THEN el tronco se encoge y desaparece con astillas en 280 ms o menos
- AND Bruno cae sobre la casilla y aplasta una vez

#### Scenario: Revivir
- WHEN la Amanita muscaria revive un árbol
- THEN estalla un brote de hojas y luz, y Rubí se agacha y se acomoda en la casilla

#### Scenario: Despertar
- WHEN la Amanita despierta al Árbol Padre
- THEN un anillo de luz se abre desde el árbol y queda un halo cálido detrás de él

#### Scenario: Pasar la voz
- WHEN Chispa pasa la voz a Bruno
- THEN tres notitas salen de Chispa en arco hacia la tarjeta de Bruno en el dock
- AND la tarjeta de Bruno da un saltito con un aro de luz y su «Zz» desaparece

#### Scenario: Jugadas encadenadas
- WHEN el jugador selecciona otro miembro mientras corre la animación de la jugada anterior
- THEN la selección responde de inmediato y la animación anterior termina encima sin bloquearla

### Requirement: Esporas al contador
Al empezar el mes, por cada árbol vivo (hasta 12 vuelos en total) SHALL volar una espora al contador de esporas y una hoja al contador de nutrientes (hojarasca); cada contador da un saltito al recibirlas. Con la Lluvia de esporas, las esporas y las hojas salen del árbol del hechizo. Los vuelos duran `narrative`.

#### Scenario: Mes nuevo con árboles vivos
- WHEN termina el mes con dos árboles vivos
- THEN dos esporas vuelan desde esos árboles hasta el contador de esporas y dos hojas hasta el de nutrientes

#### Scenario: Muchos árboles
- WHEN termina el mes con 10 árboles vivos
- THEN vuelan como máximo 12 piezas entre esporas y hojas, y los contadores muestran el total

### Requirement: Movimiento reducido
Con `prefers-reduced-motion: reduce`, el juego SHALL omitir desplazamientos, escalas, rotaciones, vuelos, partículas, rebotes y bucles, y SHALL conservar solo los cambios de color y opacidad de `fast` (180 ms) o menos y el estado final. La carta de victoria espera `standard` (280 ms) con el halo quieto.

#### Scenario: Usuario con movimiento reducido
- WHEN el sistema pide movimiento reducido y la Amanita muscaria revive un árbol
- THEN el árbol aparece vivo sin animación de brote y el retrato aparece en la casilla con un fundido, sin moverse

#### Scenario: Rechazo con movimiento reducido
- WHEN el sistema pide movimiento reducido y el jugador toca una casilla inválida
- THEN la casilla muestra el aro de rechazo en un fundido, sin vaivén

## ADDED Requirements

### Requirement: Tokens de movimiento
Toda duración y curva de animación nueva SHALL salir de `MOTION` en `src/theme.ts`, espejado en las variables CSS `--motion-*`. Las duraciones son `instant` 90 ms, `fast` 180 ms, `standard` 280 ms y `narrative` 600 ms; las curvas, `settle`, `springy`, `soft` y `leave`. `narrative` solo se usa en cartas, estaciones, vuelos al HUD, Maestra Bruma y victoria. Los bucles de ambiente (halo, escarcha, motas, fondo vivo) quedan fuera de la escala.

#### Scenario: Sin duraciones sueltas
- WHEN se ejecuta `npm run test`
- THEN ninguna escena ni archivo de `src/ui/` declara una duración de animación en milisegundos fuera de `MOTION` o de los bucles de ambiente

### Requirement: Rechazo en el lugar del toque
Cuando una acción no es posible, además del motivo en la bitácora, la interfaz SHALL marcar el lugar del toque:
- **Casilla inválida:** un aro `berry` que aparece y se va con un vaivén de 2 px.
- **Miembro cansado:** su «Zz» se mece.
- **Sin recursos:** el contador que falta se tiñe `berry`.

El rechazo nunca vibra, nunca sacude más de 3 px y, si se repite, reinicia la animación sin acumularla.

#### Scenario: Casilla inválida
- WHEN el jugador tiene a Indi seleccionado y toca una tierra lejos de la red
- THEN la casilla tocada muestra el aro de rechazo y la bitácora dice "Muy lejos: la tierra debe tocar la red."

#### Scenario: Miembro cansado
- WHEN el jugador toca a Bruno después de que trabajó este mes
- THEN la «Zz» de su tarjeta se mece y la bitácora dice que descansa

#### Scenario: Sin nutrientes
- WHEN el jugador selecciona a Indi con menos nutrientes que el costo de tejer
- THEN el contador de nutrientes se tiñe `berry` un momento

### Requirement: Cambios en el HUD
Cada vez que una jugada, un hechizo o el mes nuevo cambia nutrientes, esporas, árboles o el mes, ese contador SHALL dar un saltito (`fast`). Nutrientes, esporas y árboles SHALL mostrar además una etiqueta con la diferencia («+2», «−1»): entra en `fast`, se lee y sube 8 px mientras se funde (`fast` + 2 × `standard` en total), y el número se tiñe `leaf` si sube o `berry` si baja. Las esporas que vuelan ponen su etiqueta al llegar la primera. Empezar o cargar una partida no anima los contadores.

#### Scenario: Costo de tejer
- WHEN Indi teje micelio
- THEN el contador de nutrientes salta y muestra «−1» (o «−2» con escarcha)

#### Scenario: Ganancia de descomponer
- WHEN Bruno descompone un tronco
- THEN el contador de nutrientes salta y muestra «+2»

#### Scenario: Árbol revivido
- WHEN Rubí revive un árbol
- THEN el contador de nutrientes muestra «−3» y el de árboles salta y muestra «+1»

### Requirement: Selección visible
Al seleccionar un miembro, su tarjeta SHALL subir 4 px con el aro de selección y la firma de su especie. Las casillas válidas SHALL aparecer en un fundido escalonado desde el miembro, en 180 ms o menos en total, y la ★ late una sola vez al aparecer.

#### Scenario: Seleccionar a Rubí
- WHEN el jugador toca la tarjeta de Rubí
- THEN la tarjeta sube y se acomoda, los árboles grises junto a la red aparecen resaltados en menos de 180 ms y la ★ late una vez

### Requirement: Capas que entran y salen
Las hojas, fichas y cartas de historia SHALL entrar subiendo 24 px con un fundido y el fondo oscureciéndose (`standard`, `settle`), y salir bajando (`fast`, `leave`). En la intro, cada carta nueva entra desde la derecha 12 px con un fundido cruzado y el punto activo se desliza. Un miembro recién reclutado SHALL entrar al dock creciendo de 0,8 a 1 (`standard`, `springy`), y el dock se desplaza para mostrarlo si no cabe.

#### Scenario: Abrir la hoja de reclutar
- WHEN el jugador toca «Reclutar»
- THEN la hoja sube desde abajo con un fundido y el tablero se oscurece detrás

#### Scenario: Siguiente carta de la intro
- WHEN el jugador pulsa «Siguiente» en la primera carta de la intro
- THEN la carta sale y la segunda entra desde la derecha con un fundido cruzado

#### Scenario: Nuevo miembro
- WHEN el jugador recluta un Champiñón
- THEN su tarjeta entra al dock creciendo, ya con «Zz»

### Requirement: Mes nuevo visible
Al pulsar «Fin del mes», la luna del botón SHALL girar media vuelta, los retratos SHALL dejar sus casillas con un fundido y las tarjetas del gremio SHALL despertar de a una, con 40 ms entre cada una (la «Zz» se va con un saltito).

#### Scenario: Gremio listo
- WHEN termina el mes con Indi, Bruno y Rubí cansados
- THEN los tres retratos dejan el tablero y sus tarjetas despiertan una tras otra

### Requirement: Cambio de estación visible
Al empezar una estación, el claro anterior SHALL fundirse sobre el nuevo en `narrative` (`soft`), junto con la luz de la red; la etiqueta de estación del HUD y la corona de Chispa también cambian con un fundido.

#### Scenario: Llega el otoño
- WHEN termina el mes 6
- THEN el pasto y los árboles de verano se funden en los de otoño en 600 ms, al mismo tiempo que sube la luz de la red

### Requirement: Llegada de Maestra Bruma
La carta de llegada de Maestra Bruma SHALL entrar con un fundido solemne (`narrative`, `soft`). Al cerrarla, su tarjeta SHALL entrar al dock con un fundido y un halo `arcane`, sin rebote. El Brote arcano SHALL mostrar un aro `arcane` lento en la roca antes del hilo de micelio.

#### Scenario: Llega Maestra Bruma
- WHEN empieza el mes siguiente al segundo árbol revivido y el jugador cierra su carta
- THEN su tarjeta aparece en el dock con un fundido y un halo, sin rebote

#### Scenario: Brote arcano
- WHEN Maestra Bruma lanza el Brote arcano sobre una roca
- THEN un aro `arcane` se abre lento en la roca y después la roca se vuelve micelio

### Requirement: Victoria visible
Al despertar al Árbol Padre, la carta de victoria SHALL esperar 600 ms para que se vean el anillo del despertar, el halo y una ola dorada que recorre la red desde el árbol; después, la carta sube. Cualquier toque o tecla durante la espera SHALL mostrar la carta de inmediato. Al terminar el invierno sin ganar, la luz del claro baja (`standard`) antes de la carta.

#### Scenario: El bosque despierta
- WHEN Rubí despierta al Árbol Padre
- THEN durante 600 ms se ven el anillo y la ola dorada sobre el tablero, y después entra la carta «¡El bosque despertó!»

#### Scenario: Saltar la espera
- WHEN el jugador toca la pantalla durante la espera de la victoria
- THEN la carta aparece de inmediato
