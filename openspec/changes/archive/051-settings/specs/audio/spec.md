## ADDED Requirements

### Requirement: Música
«Música» SHALL ser el ambiente del claro (`amb-clearing`) en loop, apagado por defecto. Con la música encendida, SHALL sonar a −6 dB en la portada y en «Elige tu dificultad» y entera en el tablero y lo demás, y SHALL bajar 6 dB mientras suena una cortina. El archivo del ambiente SHALL descargarse solo con «Música» encendida y después del primer gesto.

#### Scenario: Música apagada por defecto
- WHEN un jugador nuevo abre el juego y empieza una partida
- THEN no se descarga ni suena el ambiente

#### Scenario: Encender la música
- WHEN el jugador enciende «Música» en «Configuración» desde la portada
- THEN el ambiente se descarga y suena en loop, más bajito en la portada y entero al entrar al tablero

## MODIFIED Requirements

### Requirement: El sonido acompaña
El juego SHALL tener sonido según `docs/sound-design.md` (P0): efectos para las acciones del tablero y la interfaz, cortinas de victoria y derrota y, si el jugador la enciende, música (el ambiente del claro, 051). El sonido SHALL salir de `src/audio.ts`, que escucha al store y a `diffEffects` y nunca cambia el estado del juego; `src/rules/` no SHALL saber del audio. Todo lo que suena SHALL verse también: jugar en silencio no quita información.

#### Scenario: Tejer suena
- WHEN Indi teje una casilla junto a la red
- THEN suena `sfx-weave` junto con la animación del micelio
- AND si teje otro miembro en el mismo mes, el segundo `sfx-weave` suena un grado más agudo

#### Scenario: Toque que no se puede
- WHEN el jugador toca una casilla que el miembro elegido no puede trabajar
- THEN suena `sfx-invalid` (dos toques de madera), nunca un zumbido

#### Scenario: Victoria
- WHEN la Amanita despierta al Árbol Ancestral
- THEN suena `sfx-awaken` y, al abrirse la carta de victoria, `stg-victory`, con la música (si está encendida) 6 dB más baja mientras dura

### Requirement: Nada suena antes del primer gesto
El `AudioContext` SHALL crearse (o reanudarse) en el primer `pointerdown` o `keydown` del jugador, nunca antes, y los archivos de audio SHALL descargarse después de ese gesto. Donde exista `navigator.audioSession`, su tipo SHALL ser `ambient`, para que el interruptor de silencio de iOS calle el juego y no corte la música del jugador.

#### Scenario: Abrir sin tocar
- WHEN el jugador abre el juego y no toca nada
- THEN no se crea ningún `AudioContext`, no se descarga audio y no suena nada

#### Scenario: Primer toque
- WHEN el jugador pulsa "Nueva partida"
- THEN se crea el `AudioContext` y empieza la descarga de los efectos y las cortinas (la música, apagada por defecto, no)
- AND en «Elige tu dificultad» no suena ningún efecto

### Requirement: Interruptores de sonido
«Sonido» (efectos, interfaz y cortinas de victoria y derrota) y «Música» (el ambiente del claro) SHALL ser interruptores de sí o no en «Configuración» (`title-screens`), con áreas táctiles de 44 px o más, `aria-pressed` y foco visible. SHALL guardarse en `localStorage` (`gremio.audio`, con `v: 2` desde el 051); «Sonido» SHALL empezar encendido y «Música» apagada. Un `music` guardado antes del 051 (sin `v: 2`) no cuenta: hablaba de las cortinas. Si el almacenamiento falla, empiezan así y el juego sigue. Con un interruptor apagado, nada de su grupo SHALL sonar ni descargarse.

#### Scenario: Apagar el sonido
- WHEN el jugador apaga «Sonido» en «Configuración» y empieza una partida
- THEN no suena ningún efecto ni cortina
- AND al volver a abrir el juego, «Sonido» sigue apagado

#### Scenario: Teclado
- WHEN el jugador llega con Tab a «Música» y pulsa Enter
- THEN el interruptor cambia y anuncia su estado

### Requirement: Silencio fuera del tablero
Mientras se muestre una pantalla fuera del tablero (portada, «Elige tu dificultad», «El gremio» o el ranking), no SHALL sonar ningún efecto: ni botones, ni hojas, ni «Configuración». La música (si está encendida) sí suena, más bajita en la portada y en «Elige tu dificultad». Los efectos SHALL empezar al entrar al tablero. El primer gesto en la portada sí desbloquea el audio y empieza la descarga, para que el tablero ya suene.

#### Scenario: Portada en silencio
- WHEN el jugador toca botones en la portada, abre «Configuración» y pulsa «Nueva partida»
- THEN no suena ningún efecto
- AND al elegir el nivel y elegir a Indi en el tablero, suena `ui-select`

### Requirement: Atribución
Mientras los sonidos salgan del plan gratis de ElevenLabs, el juego SHALL decir «Efectos de sonido generados con ElevenLabs (elevenlabs.io)» en la sección «Créditos» de «Configuración» (`title-screens`). Si el juego se monetiza, los sonidos SHALL regenerarse con una licencia comercial antes de publicar esa versión.

#### Scenario: Crédito visible
- WHEN el jugador abre «Configuración»
- THEN ve el crédito de ElevenLabs en «Créditos»
