# audio

## Purpose
Sonido del juego: efectos y cortinas en Web Audio, fuera de `src/rules/`. Origen: cambio 049 (archivado); el 050 dejó la portada sin efectos el 051 llevó los controles a «Configuración» y el 052 quitó la música. Cues en `src/audio-cues.ts`, motor en `src/audio.ts`, interruptores en `src/ui/audio-toggles.ts`, tomas en `assets/audio/takes.json` y dirección en `docs/sound-design.md`.

## Requirements

### Requirement: El sonido acompaña
El juego SHALL tener sonido según `docs/sound-design.md` (P0): efectos para las acciones del tablero y la interfaz, y cortinas de victoria y derrota. Sin música ni ambiente (052). El sonido SHALL salir de `src/audio.ts`, que escucha al store y a `diffEffects` y nunca cambia el estado del juego; `src/rules/` no SHALL saber del audio. Todo lo que suena SHALL verse también: jugar en silencio no quita información.

#### Scenario: Tejer suena
- WHEN Indi teje una casilla junto a la red
- THEN suena `sfx-weave` junto con la animación del micelio
- AND si teje otro miembro en el mismo mes, el segundo `sfx-weave` suena un grado más agudo

#### Scenario: Toque que no se puede
- WHEN el jugador toca una casilla que el miembro elegido no puede trabajar
- THEN suena `sfx-invalid` (dos toques de madera), nunca un zumbido

#### Scenario: Victoria
- WHEN la Amanita despierta al Árbol Ancestral
- THEN suena `sfx-awaken` y, al abrirse la carta de victoria, `stg-victory`

### Requirement: Nada suena antes del primer gesto
El `AudioContext` SHALL crearse (o reanudarse) en el primer `pointerdown` o `keydown` del jugador, nunca antes, y los archivos de audio SHALL descargarse después de ese gesto. Donde exista `navigator.audioSession`, su tipo SHALL ser `ambient`, para que el interruptor de silencio de iOS calle el juego y no corte la música del jugador.

#### Scenario: Abrir sin tocar
- WHEN el jugador abre el juego y no toca nada
- THEN no se crea ningún `AudioContext`, no se descarga audio y no suena nada

#### Scenario: Primer toque
- WHEN el jugador pulsa "Nueva partida"
- THEN se crea el `AudioContext` y empieza la descarga de los efectos y las cortinas
- AND en «Elige tu dificultad» no suena ningún efecto

### Requirement: Pausa con la pestaña oculta
Al ocultarse la pestaña, el audio SHALL suspenderse; al volver, SHALL reanudarse si ya estaba desbloqueado.

#### Scenario: Cambiar de app
- WHEN el jugador cambia de pestaña mientras suena una cortina
- THEN la cortina se detiene y no suena ningún efecto
- AND al volver, el sonido sigue

### Requirement: Interruptores de sonido
«Sonido» (efectos, interfaz y cortinas de victoria y derrota) SHALL ser el único interruptor de sí o no, en «Configuración» (`title-screens`), con área táctil de 44 px o más, `aria-pressed` y foco visible (052: sin «Música»). SHALL guardarse en `localStorage` (`gremio.audio`) y empezar encendido; lo guardado antes del 052 se lee igual y solo cuenta `sound`. Si el almacenamiento falla, empieza encendido y el juego sigue. Apagado, no SHALL sonar ni descargarse nada.

#### Scenario: Apagar el sonido
- WHEN el jugador apaga «Sonido» en «Configuración» y empieza una partida
- THEN no suena ningún efecto ni cortina
- AND al volver a abrir el juego, «Sonido» sigue apagado

#### Scenario: Teclado
- WHEN el jugador llega con Tab a «Sonido» y pulsa Enter
- THEN el interruptor cambia y anuncia su estado

### Requirement: Mezcla y variedad
Cada reproducción SHALL variar la altura ±3 % y el volumen ±1,5 dB. No SHALL sonar más de 3 copias del mismo sonido a la vez. Los sonidos con altura van en re mayor pentatónica. Con `prefers-reduced-motion: reduce`, los efectos del tablero SHALL durar como mucho `MOTION.ms.standard` con un fundido de 80 ms; el sonido no se apaga.

#### Scenario: Movimiento reducido
- WHEN el jugador con movimiento reducido revive un árbol
- THEN `sfx-revive` suena y se funde antes de 280 ms

### Requirement: Atribución
Mientras los sonidos salgan del plan gratis de ElevenLabs, el juego SHALL decir «Efectos de sonido generados con ElevenLabs (elevenlabs.io)» en la sección «Créditos» de «Configuración» (`title-screens`). Si el juego se monetiza, los sonidos SHALL regenerarse con una licencia comercial antes de publicar esa versión.

#### Scenario: Crédito visible
- WHEN el jugador abre «Configuración»
- THEN ve el crédito de ElevenLabs en «Créditos»

### Requirement: Silencio fuera del tablero
Mientras se muestre una pantalla fuera del tablero (portada, «Elige tu dificultad», «El gremio» o el ranking), no SHALL sonar ningún efecto: ni botones, ni hojas, ni «Configuración». Los efectos SHALL empezar al entrar al tablero. El primer gesto en la portada sí desbloquea el audio y empieza la descarga, para que el tablero ya suene.

#### Scenario: Portada en silencio
- WHEN el jugador toca botones en la portada, abre «Configuración» y pulsa «Nueva partida»
- THEN no suena ningún efecto
- AND al elegir el nivel y elegir a Indi en el tablero, suena `ui-select`

