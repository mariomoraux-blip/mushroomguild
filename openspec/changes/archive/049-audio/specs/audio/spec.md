## ADDED Requirements

### Requirement: El sonido acompaña
El juego SHALL tener sonido según `docs/sound-design.md` (P0): un ambiente en loop, efectos para las acciones del tablero y la interfaz, y cortinas de victoria y derrota. El sonido SHALL salir de `src/audio.ts`, que escucha al store y a `diffEffects` y nunca cambia el estado del juego; `src/rules/` no SHALL saber del audio. Todo lo que suena SHALL verse también: jugar en silencio no quita información.

#### Scenario: Tejer suena
- WHEN Indi teje una casilla junto a la red
- THEN suena `sfx-weave` junto con la animación del micelio
- AND si teje otro miembro en el mismo mes, el segundo `sfx-weave` suena un grado más agudo

#### Scenario: Toque que no se puede
- WHEN el jugador toca una casilla que el miembro elegido no puede trabajar
- THEN suena `sfx-invalid` (dos toques de madera), nunca un zumbido

#### Scenario: Victoria
- WHEN la Amanita despierta al Árbol Ancestral
- THEN suena `sfx-awaken` y, al abrirse la carta de victoria, `stg-victory`, con el ambiente 6 dB más bajo mientras dura

### Requirement: Nada suena antes del primer gesto
El `AudioContext` SHALL crearse (o reanudarse) en el primer `pointerdown` o `keydown` del jugador, nunca antes, y los archivos de audio SHALL descargarse después de ese gesto. Donde exista `navigator.audioSession`, su tipo SHALL ser `ambient`, para que el interruptor de silencio de iOS calle el juego y no corte la música del jugador.

#### Scenario: Abrir sin tocar
- WHEN el jugador abre el juego y no toca nada
- THEN no se crea ningún `AudioContext`, no se descarga audio y no suena nada

#### Scenario: Primer toque
- WHEN el jugador pulsa "Nueva partida"
- THEN se crea el `AudioContext`, empieza la descarga del audio y el ambiente entra a −6 dB en «Elige tu dificultad»

### Requirement: Pausa con la pestaña oculta
Al ocultarse la pestaña, el audio SHALL suspenderse; al volver, SHALL reanudarse si ya estaba desbloqueado.

#### Scenario: Cambiar de app
- WHEN el jugador cambia de pestaña en plena partida
- THEN el ambiente y los efectos se detienen
- AND al volver, el ambiente sigue

### Requirement: Interruptores de sonido
«Sonido» (ambiente, efectos e interfaz) y «Música» (cortinas de victoria y derrota y, cuando exista, el tema de portada) SHALL ser interruptores de sí o no en la portada y en la Libreta de campo, con áreas táctiles de 44 px o más, `aria-pressed` y foco visible. SHALL guardarse en `localStorage` (`gremio.audio`) y empezar encendidos; si el almacenamiento falla, empiezan encendidos y el juego sigue. Con un interruptor apagado, nada de su grupo SHALL sonar ni descargarse.

#### Scenario: Apagar el sonido
- WHEN el jugador apaga «Sonido» en la portada y empieza una partida
- THEN no suena el ambiente ni ningún efecto
- AND al volver a abrir el juego, «Sonido» sigue apagado

#### Scenario: Teclado
- WHEN el jugador llega con Tab a «Música» y pulsa Enter
- THEN el interruptor cambia y anuncia su estado

### Requirement: Mezcla y variedad
Cada reproducción SHALL variar la altura ±3 % y el volumen ±1,5 dB. No SHALL sonar más de 3 copias del mismo sonido a la vez. Los sonidos con altura van en re mayor pentatónica. Con `prefers-reduced-motion: reduce`, los efectos del tablero SHALL durar como mucho `MOTION.ms.standard` con un fundido de 80 ms; el sonido no se apaga.

#### Scenario: Movimiento reducido
- WHEN el jugador con movimiento reducido revive un árbol
- THEN `sfx-revive` suena y se funde antes de 280 ms

### Requirement: Atribución
Mientras los sonidos salgan del plan gratis de ElevenLabs, el juego SHALL decir «Efectos de sonido generados con ElevenLabs (elevenlabs.io)» en la modal «Atribuciones» de la portada (`title-screens`). Si el juego se monetiza, los sonidos SHALL regenerarse con una licencia comercial antes de publicar esa versión.

#### Scenario: Crédito visible
- WHEN el jugador pulsa «Atribuciones» en la portada
- THEN ve el crédito de ElevenLabs
