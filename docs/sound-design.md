# Dirección de sonido · v1 «El claro que despierta»

Auditoría para ponerle sonido al juego. Aquí está qué suena, cuándo, de dónde sale el disparo en el código, cuánto pesa y los prompts para generarlo con herramientas de IA gratuitas.

Este documento no cambia reglas ni código. La implementación nace de un cambio de OpenSpec (049 en adelante), igual que la dirección de arte.

## Principios

1. **El sonido es el progreso.** Igual que la luz (dirección de arte, principio 4): el claro empieza casi en silencio, con viento y pocos grillos. Cada árbol revivido suma vida al ambiente (hojas, pájaros, insectos). Al despertar el Árbol Ancestral, el claro suena entero.
2. **Dos materiales, dos timbres.** La **madera** suena a lo que se toca: golpes suaves de marimba y bloques de madera para botones, letreros y dock. El **pergamino** suena a lo que se lee: roce y desenrollar de papel para hojas, fichas y cartas.
3. **El micelio es luz que suena.** Toda la red (tejer, hilo dorado, esporas) usa timbres de cristal, celesta y campanitas. Es el sonido "mágico" del juego y no se usa para nada más.
4. **Una sola escala.** Todo sonido con altura va en **re mayor pentatónica** (re, mi, fa♯, la, si). Así dos sonidos que se pisan nunca desafinan, y tejer varias veces seguidas sube nota a nota.
5. **Cozy, nunca castigo.** Nada de zumbidos de error, alarmas ni graves amenazantes. La plaga, el frío y la derrota suenan apagados, lentos y en tono menor suave; avisan, no asustan.
6. **El sonido acompaña, no informa solo.** Todo lo que suena ya se ve. Jugar en silencio no quita información (accesibilidad y teléfonos en modo silencio).
7. **Corto y con aire.** Las microinteracciones duran entre 60 y 300 ms; las acciones del tablero, entre 300 y 900 ms (la animación de una jugada dura `MOTION.ms.standard`); las cartas, entre 2 y 4 s.

## Arquitectura propuesta (para el cambio que lo implemente)

- **Un módulo `src/audio.ts` con Web Audio API**, fuera de `src/rules/` y sin Phaser. La interfaz es casi toda DOM, así que un solo mezclador para DOM y escena es más simple que el sonido de Phaser.
- **Escucha, no decide.** Se suscribe al store igual que las escenas: reproduce según `diffEffects` (`src/effects.ts`), la acción despachada, los cambios de `ui.story`, `ui.sheet` y `ui.screen`, y las líneas de `MonthReport` (`src/rules/types.ts`). Nunca cambia el estado.
- **Cuatro buses:** ambiente, música, juego (tablero) e interfaz. Cada uno tiene su volumen y el ambiente baja (ducking de unos −6 dB) mientras suena una carta o un stinger.
- **Desbloqueo con el primer toque.** Los navegadores móviles no dejan sonar audio sin un gesto, así que el `AudioContext` se crea o reanuda en el primer `pointerdown` o `keydown` (en la portada: "Nueva partida" o "Cómo jugar"). Esto coincide con el GDD: «arranca tras la primera interacción».
- **Respeta el modo silencio de iOS:** donde exista, `navigator.audioSession.type = 'ambient'`. Así el juego se calla con el interruptor de silencio y se mezcla con la música del jugador en lugar de cortarla.
- **Se pausa al ocultar la pestaña** (`visibilitychange`), igual que el juego y el shader del fondo.
- **Controles:** «Sonido» (efectos y ambiente) y «Música», cada uno sí o no, en la portada y en la Libreta de campo, guardados en `localStorage` (`gremio.audio`). Las áreas táctiles son de 44 px o más. Por defecto los dos van encendidos, pero nada suena hasta el primer gesto.
- **Variedad sin peso:** cada reproducción varía la altura ±3 % y el volumen ±1,5 dB. Los sonidos frecuentes (tejer, tocar casilla, botón) tienen 2 o 3 variantes.
- **Límite de voces:** un máximo de 3 sonidos del mismo id a la vez; las esporas que llegan juntas se agrupan en un solo "puñado".
- **`prefers-reduced-motion`** no apaga el sonido, pero con movimiento reducido las animaciones duran menos, así que los sonidos se recortan al largo de la animación (fundido de 80 ms).

### Formato y peso

`public/assets/` tiene hoy **3,0 MB de los 4 MB** del presupuesto, así que quedan unos 1 MB.

- **Formato:** AAC en `.m4a` (lo decodifican Safari, Chrome y Firefox). Ambiente mono a 48 kbps, música estéreo a 64 kbps.
- **Sprite de audio:** los efectos cortos van en un solo archivo `audio/sfx.m4a` con su mapa de tiempos `audio/sfx.json`, para hacer una sola descarga.
- **Carga diferida:** el audio se descarga después del primer gesto, nunca antes de pintar el tablero. Igual que la portada y la victoria, la música se carga solo cuando suena.
- **Carpeta:** `public/assets/audio/` con `ambience/`, `music/`, `stingers/` y `sfx/` (el sprite). Los nombres van en inglés, en minúscula y con guiones, como el resto de los assets. Las fuentes originales (WAV a 48 kHz) van en `assets/audio/`.

| Fase | Qué entra | Peso estimado |
| --- | --- | --- |
| **P0** | Ambiente base, sprite con acciones del tablero e interfaz, victoria y derrota | ≈ 0,5 MB |
| **P1** | Capas por estación y de vida, voces de especie, eventos del mes, cartas de Maga y frío | + ≈ 0,8 MB |
| **P2** | Música de portada, cambio de estación, puntaje y ranking, tutorial | + ≈ 0,6 MB |

**Decisión pendiente (Mario):** P0 cabe en el presupuesto actual, pero P1 y P2 no (unos 1,9 MB en total). Hay dos caminos: subir el presupuesto a unos 5,5 MB contando solo lo que se carga al iniciar (el audio va diferido), o dejar el audio en P0 + P1 y recortar las capas por estación a 15 s.

### Mezcla

- **Efectos:** normalizar a −18 LUFS (momentáneo). **Ambiente:** −30 LUFS. **Música:** −26 LUFS. Picos ≤ −1 dBTP.
- Sin graves por debajo de 80 Hz (los parlantes de teléfono no los reproducen y solo ensucian); filtro paso alto en todo.
- Los loops cierran sin clic: cruce de 1 s entre el final y el inicio, y el corte en un cruce por cero.
- Todo se prueba en el parlante de un teléfono, no solo con audífonos.

## Catálogo

Prioridad: **P0** entra en la primera iteración, **P1** después, **P2** si alcanza. "Disparo" dice de dónde sale el evento en el código.

### A. Ambiente (loops)

| Id | Qué es | Disparo | Duración | Prio |
| --- | --- | --- | --- | --- |
| `amb-clearing` | Base del claro: brisa suave entre hojas, grillos lejanos espaciados y algún crujido de rama. Sin melodía. | Al entrar al tablero; sigue en portada y niveles a −6 dB | loop 40 s | P0 |
| `amb-life` | Capa de vida: pájaros pequeños, hojas que se mueven, zumbido de insectos. Su volumen sube con los árboles vivos (0 al empezar y 100 % con todos vivos). | Cambios en los árboles vivos (`revive`, `faded`) | loop 20 s | P1 |
| `amb-spring` | Primavera: gotas tras la lluvia, pájaros más agudos. | `month` entra en primavera | loop 20 s | P1 |
| `amb-summer` | Verano: grillos y chicharras suaves, aire caliente. | Verano | loop 20 s | P1 |
| `amb-autumn` | Otoño: viento con ráfagas, hojas secas que ruedan. | Otoño | loop 20 s | P1 |
| `amb-winter` | Invierno: viento apagado, silencio de nieve, un búho lejano de vez en cuando. | Invierno | loop 20 s | P1 |
| `amb-awake` | Claro despierto: todo el ambiente de vida al máximo con un pad dorado muy suave. | Tras `awaken`, debajo de la carta de victoria | loop 20 s | P2 |

Las capas por estación se cruzan durante 3 s al cambiar de estación. La base nunca se apaga durante la partida.

### B. Música y stingers

La partida no lleva música continua: el ambiente es la música. Así el jugador se concentra y el peso baja. Solo hay música en la portada, y cortinas cortas en los momentos de historia.

| Id | Qué es | Disparo | Duración | Prio |
| --- | --- | --- | --- | --- |
| `mus-title` | Tema del gremio: caja de música, marimba y cuerdas pulsadas, cálido, en re mayor, 80 BPM. Se repite sin cortes. | `ui.screen.kind` = `title` o `level` (con «Música» encendida) | loop 60 s | P2 |
| `stg-intro` | Bajo las 3 cartas de intro: el bosque se apaga, pad lila que desciende suave. | `story.kind` = `intro` | 6 s, sostenido | P1 |
| `stg-victory` | El Árbol Ancestral despierta: arpegio de celesta que sube, acorde mayor luminoso y un coro de hojas. | `awaken` + `story.kind` = `won` | 4 s | **P0** |
| `stg-defeat` | Fin del invierno sin despertar: frase de caja de música lenta, menor suave, que termina en esperanza (última nota mayor). | `story.kind` = `lost` | 3,5 s | **P0** |
| `stg-mage` | Llega Maestra Bruma: brillo arcano, campanita grave y un "whoosh" de niebla. | `story.kind` = `mage` | 3 s | P1 |
| `stg-cold` | Llega el frío: ráfaga de viento con cristales finos y una nota baja de flauta. | `story.kind` = `cold` | 3 s | P1 |
| `stg-loose` | Árboles sueltos (044): un hilo que se corta (pizzicato apagado) y la red que pierde brillo. | `story.kind` = `loose` | 2 s | P1 |
| `stg-season` | Cambio de estación: campanas de viento que barren la escala. Hay una variante por estación (primavera brillante, invierno grave). | Línea `season` del `MonthReport` | 2 s | P2 |
| `stg-tutorial-done` | «¡Ya sabes jugar!»: fanfarria mínima de marimba y aplauso de hojas. | `story.kind` = `tutorial` | 2,5 s | P2 |

### C. Acciones del tablero (efectos de juego)

Salen casi todas de `diffEffects` (`src/effects.ts`): suenan cuando se ve la animación, no cuando se toca.

| Id | Qué es | Disparo | Duración | Prio |
| --- | --- | --- | --- | --- |
| `sfx-weave` (×3) | Micelio que crece: destello de cristal ascendente con un crujido fino de tierra. Cada tejido seguido en el mismo mes sube un grado de la escala. | Effect `weave` | 500 ms | **P0** |
| `sfx-decompose` (×2) | Tronco que se descompone: madera húmeda que se desmorona, suave y orgánica, con un "plop" de hongo al final. | Effect `decompose` | 600 ms | **P0** |
| `sfx-revive` | Árbol que revive: hojas que brotan de golpe y un acorde cálido de campanas (re-fa♯-la-si). Es el sonido más satisfactorio del tablero. | Effect `revive` | 900 ms | **P0** |
| `sfx-awaken` | Árbol Ancestral: raíz profunda que vibra, luz que sube y destellos. Enlaza con `stg-victory`. | Effect `awaken` | 1,5 s | **P0** |
| `sfx-crumble` | Panal rompe una roca: piedra que se parte en trozos chicos, seca pero sin estruendo, con polvo que cae. | Effect `crumble` | 600 ms | P1 |
| `sfx-thread` | Ámbar cura a distancia: hilo dorado que viaja (glissando de arpa) y aterriza con una campanita. | Effect `thread` | 700 ms | P1 |
| `sfx-cleanse` | Limpiar la plaga: respiro de aire limpio y un brillo que sube. | Effect `cleanse` | 600 ms | P1 |
| `sfx-wither` | La plaga marchita una casilla: chisporroteo que se apaga, grave y apagado. Triste, no amenazante. | Effect `wither` | 700 ms | P1 |
| `sfx-spores` | Esporas que llegan: "pops" pequeños y burbujeantes, como semillas que saltan. Uno por puñado, no por espora. | Effect `spores` | 400–800 ms | **P0** |
| `sfx-leaves` | Nutrientes de hojarasca que llegan al contador: roce de hojas secas y un tic de madera. | Effect `spores` con `leaves` > 0 | 300 ms | P1 |
| `sfx-call` | Chispa pasa la voz: silbido de pájaro de dos notas, ascendente. | Effect `call` | 400 ms | P1 |
| `sfx-puff-spores` | Pompón sopla esporas: soplido de aire ("fff") y una lluvia de pops. | Acción `chooseSpell` con «Soplar esporas» | 600 ms | P1 |
| `sfx-puff-compost` | Pompón abona el árbol: golpe de tierra blanda y raíces que absorben. | Acción `chooseSpell` con «Abonar el árbol» | 600 ms | P1 |
| `sfx-spell-sprout` | Brote arcano: magia que sube, roca que se ablanda y micelio que aparece. | Acción `chooseSpell` con `sprout` | 1,2 s | P1 |
| `sfx-spell-rain` | Lluvia de esporas: llovizna mágica corta con campanitas que caen. | Acción `chooseSpell` con `rain` | 1,5 s | P1 |
| `sfx-recruit` | Reclutar: jingle de bienvenida de 3 notas y un pop de hongo que asoma. | Acción `recruit` aceptada | 700 ms | **P0** |
| `sfx-month-end` | Terminar el mes: el día se apaga, con un bloque de madera grave y un grillo que se queda. | Acción `endMonth` | 900 ms | **P0** |
| `sfx-month-start` | Empieza el mes: amanecer corto, con un barrido suave y un pájaro. | Tras `endMonth`, al llegar el `MonthReport` | 700 ms | P1 |
| `sfx-invalid` | Acción que no se puede: dos toques de madera apagados ("tok-tok"), descendentes. Nunca un zumbido. | `CheckResult.ok` = false en `tapTile` | 200 ms | **P0** |

**Eventos del mes** (líneas de `MonthReport`, suenan en cola al abrir el mes, con 150 ms entre una y otra y un máximo de 3):

| Id | Línea | Qué es | Prio |
| --- | --- | --- | --- |
| `sfx-frost` | `frost` | Escarcha que cubre: cristalitos que se forman | P1 |
| `sfx-fading` | `fading`, `atRisk` | Árbol que se apaga: soplo frío y una campanita que se desafina hacia abajo | P1 |
| `sfx-faded` | `faded` | Árbol apagado: hojas que caen y un silencio | P1 |
| `sfx-plague` | `plague` | La plaga marca casillas: crujido orgánico grave, corto, como algo que se pudre despacio | P1 |
| `sfx-hungry` | `ate`, `hungry` | El gremio come o tiene hambre: un "mmm" de hongo y una pancita que suena (tierno) | P2 |
| `sfx-unrooted` | `unrooted`, `stopped` | Árboles sueltos o que dejan de dar: hilo que vibra y se apaga | P2 |

### D. Voces de especie (seleccionar un miembro)

Cada especie tiene un timbre propio que suena al elegirla en el dock. Es su "voz", sin palabras. Suenan en la misma nota (re) para que se reconozcan por el timbre.

| Id | Especie (nombre inicial) | Timbre | Prio |
| --- | --- | --- | --- |
| `vox-champi` | Champiñón (Bruno), descompositor | Golpe de marimba grave y "bup" redondo | P1 |
| `vox-lactarius` | Lactarius (Indi), tejedor | Pulsación de arpa de cristal | P1 |
| `vox-amanita` | Amanita (Rubí), sanadora | Campana cálida de celesta | P1 |
| `vox-gliophorus` | Gliophorus (Chispa), mensajera | Trino corto de pájaro | P1 |
| `vox-morchella` | Morchella (Panal), rompe-rocas | Toque seco de kalimba sobre piedra | P1 |
| `vox-ganoderma` | Ganoderma (Ámbar), boticaria | Frasco de vidrio que tintinea | P1 |
| `vox-lycoperdon` | Lycoperdon (Pompón), soplador | "Pff" de aire con una burbuja | P1 |
| `vox-mago` | Conocybe (Maestra Bruma), maga | Brillo arcano con zumbido grave | P1 |

Mientras no existan las voces, el dock usa `ui-select` (P0).

### E. Microinteracciones de interfaz

| Id | Qué es | Disparo | Duración | Prio |
| --- | --- | --- | --- | --- |
| `ui-tap` (×3) | Botón de madera: toque suave de bloque de madera. | Botones secundarios y redondos | 80 ms | **P0** |
| `ui-tap-primary` | Pastilla amarilla: toque de madera más brillante con una campanita. | Botón principal (Nueva partida, ¡A jugar!); «Fin del mes» usa `sfx-month-end` en su lugar | 150 ms | **P0** |
| `ui-select` | Elegir un miembro o una casilla: "tic" de marimba agudo. | Acción `select` y `tapTile` con selección | 80 ms | **P0** |
| `ui-deselect` | Soltar la selección: el mismo tic una tercera abajo. | `cancel` con selección | 80 ms | P1 |
| `ui-sheet-open` | Hoja de pergamino que se abre: desenrollar de papel. | `openSheet` | 250 ms | **P0** |
| `ui-sheet-close` | Hoja que se cierra: papel que se dobla. | `closeSheet` | 200 ms | **P0** |
| `ui-card-flip` | Carta de historia: papel grueso que se da vuelta. | `storyNext`, `closeStory` | 250 ms | P1 |
| `ui-screen` | Cambio de pantalla (portada, niveles, El gremio): letrero de madera que se balancea. | `openScreen`, `closeScreen` | 300 ms | P1 |
| `ui-counter-up` | Contador de nutrientes o esporas que sube: tic brillante y corto. | Cambio de recursos en el HUD | 60 ms | P1 |
| `ui-counter-down` | Contador que baja (pagar): tic de madera apagado. | Gasto en una acción | 60 ms | P2 |
| `ui-hint` | Aparece la ★ de pista: destello mínimo. | Pista nueva en la bitácora | 150 ms | P2 |
| `ui-coach` | Globo del tutorial: "pop" de burbuja de papel. | `ui.tutorial.step` cambia | 150 ms | P2 |
| `ui-stars` (1–3) | Estrellas de la victoria: tres campanitas que suben (re, fa♯, la). Cada una suena al llenarse. | Carta de victoria | 3 × 200 ms | P1 |
| `ui-score-tick` | Desglose del puntaje que cuenta: tic suave muy corto que se repite. | Animación del desglose | 30 ms | P2 |
| `ui-record` | «Nuevo récord»: brillo con dos campanas. | Carta con nuevo récord | 600 ms | P2 |
| `ui-dice` | Sortear otro alias: dados de madera que ruedan. | `rename` en el ranking | 400 ms | P2 |
| `ui-submit` | Puntaje enviado al ranking: sello sobre papel. | `submission` correcto | 300 ms | P2 |

Lo que **no** suena, para no saturar: el foco con Tab, el scroll, las pistas que se repiten, el cronómetro y las animaciones decorativas del fondo.

## Herramientas gratuitas (sin tarjeta)

Revisado el 13 de noviembre de 2026. Los términos cambian seguido, así que hay que confirmar la licencia en la página de cada herramienta antes de publicar.

| Herramienta | Para qué | Gratis | Licencia del plan gratis |
| --- | --- | --- | --- |
| **ElevenLabs Sound Effects** (elevenlabs.io) | Efectos, microinteracciones, ambientes cortos | 10.000 créditos al mes, sin tarjeta | **No comercial** y pide atribución. El plan Starter (6 USD por un mes) da uso comercial a lo generado mientras dura. |
| **Suno** (suno.com) | Música: `mus-title` y stingers | 50 créditos al día (unas 10 canciones), sin tarjeta | **No comercial.** Desde septiembre de 2026 limita las descargas del plan gratis. |
| **Stable Audio Open Small** (Hugging Face) | Efectos y ambientes (es mejor en efectos y grabaciones de campo que en música) | Modelo abierto; hay Spaces de la comunidad | Stability AI Community License: uso comercial gratis por debajo de 1 M USD al año. Pide aceptar la licencia en Hugging Face. |
| **ACE-Step 1.5** (Hugging Face Space) | Música: tema y stingers | Modelo abierto, Space gratis (cuenta de Hugging Face, sin tarjeta) | **MIT:** uso comercial permitido |
| **Freesound** (freesound.org) | Respaldo de ambientes reales (filtrar por CC0) | Gratis con cuenta | CC0 o CC-BY según el sonido |

**Recomendación:**
- **Para iterar** el carácter de cada sonido: ElevenLabs (efectos) y Suno (música), que son los que mejor siguen los prompts.
- **Para lo que se publica:** Stable Audio Open o ACE-Step, porque su licencia permite publicar sin pagar.
- **Alternativa:** pagar un mes de ElevenLabs Starter al final y regenerar ahí los efectos elegidos.

**Decisión pendiente (Mario):** el juego es gratis pero es público y tiene ranking. Hay que decidir si cuenta como uso comercial. Ante la duda, lo publicado debería salir de una herramienta con licencia comercial.

### Cómo iterar

1. **Primero el ancla de estilo** (abajo): se pega al inicio de cada prompt para que todo suene a la misma familia.
2. **Genera de 3 a 4 tomas por sonido** y elige una. Si ninguna sirve, cambia una sola cosa del prompt por vez: material, duración o intensidad.
3. **Pide más largo de lo que necesitas** (las herramientas cortan mal al inicio) y recorta en un editor como Audacity, que es gratis: quita el silencio, aplica un fundido de 10 ms en cada extremo, normaliza y exporta WAV.
4. **Loops:** genera 30 s o más. Si la herramienta tiene opción de loop, actívala. Si no, cruza el final con el inicio durante 1 s en Audacity.
5. **Las tomas se guardan** en `assets/audio/source/<id>/` con el prompt usado, en `prompt.txt` al lado.
6. **Pruébalo en contexto:** reproduce el sonido junto a la animación (por ejemplo, con la captura de pantalla o en el juego) antes de darlo por bueno.

## Prompts

Los prompts van en inglés porque las herramientas los siguen mejor; las notas van en español. En ElevenLabs, "Duration" es la duración pedida y "Prompt influence" va alto (0,6–0,8) para que siga el texto. En Stable Audio Open, pon la duración en segundos.

### Ancla de estilo (pegar al inicio de cada prompt de efectos y ambiente)

```
Cozy hand-crafted fantasy forest game, soft and warm, gentle, organic, high quality foley, close and intimate, no harsh transients, no distortion, no voices, no music unless asked, clean recording.
```

Para sonidos con altura, agrega: `tuned to D major pentatonic`.

### A. Ambiente

**`amb-clearing`** · 40 s, loop
```
[ancla] Ambient loop of a quiet forest clearing at dusk: very soft breeze through leaves, sparse distant crickets with long gaps, an occasional tiny twig creak, calm and spacious, no birds, no melody, no wind gusts, seamless loop.
```

**`amb-life`** · 20 s, loop
```
[ancla] Ambient loop layer of forest life waking up: small songbirds chirping softly at a distance, leaves rustling gently, faint buzzing of tiny insects, cheerful but calm, no wind, no music, seamless loop.
```

**`amb-spring`** · 20 s, loop
```
[ancla] Ambient loop of a forest in spring after rain: soft water drops falling from leaves, a few bright high birds, fresh air, calm, no thunder, no music, seamless loop.
```

**`amb-summer`** · 20 s, loop
```
[ancla] Ambient loop of a warm summer forest evening: gentle crickets and soft distant cicadas, warm still air, peaceful, not loud, no music, seamless loop.
```

**`amb-autumn`** · 20 s, loop
```
[ancla] Ambient loop of an autumn forest: soft wind with gentle gusts, dry leaves rolling on the ground, branches swaying, cozy and slightly melancholic, no rain, no music, seamless loop.
```

**`amb-winter`** · 20 s, loop
```
[ancla] Ambient loop of a snowy winter forest: muffled soft wind, deep quiet of snow, a very distant owl hoot once, calm and cold but cozy, no storm, no music, seamless loop.
```

**`amb-awake`** · 20 s, loop
```
[ancla] Ambient loop of a magical forest fully alive: birds, leaves, insects, a very soft warm golden synth pad underneath in D major, joyful and peaceful, seamless loop.
```

### B. Música y stingers (Suno o ACE-Step)

En Suno: activa **Instrumental**, deja la letra vacía y pega el texto en **Style**. En ACE-Step: el texto va en "tags" y la letra va como `[instrumental]`. No nombres artistas.

**`mus-title`** · 60 s, loop
```
cozy fantasy game main menu theme, instrumental, music box, soft marimba, plucked strings, light flute, warm felt piano, D major, 80 bpm, gentle and whimsical, forest guild of mushrooms, seamless loop, no drums, no vocals
```

**`stg-intro`** · 6 s
```
short sad cozy cinematic sting, instrumental, soft lilac synth pad slowly descending, distant music box notes fading, the forest falls asleep, gentle, no drums, no vocals, 6 seconds
```

**`stg-victory`** · 4 s
```
short triumphant cozy fantasy sting, instrumental, rising celesta arpeggio into a bright warm D major chord, shimmering bells, soft choir of rustling leaves, magical ancient tree awakens, joyful, no drums, no vocals, 4 seconds
```

**`stg-defeat`** · 3,5 s
```
short gentle game over sting, instrumental, slow music box phrase in soft minor key that resolves to a hopeful major final note, tender and calm, not dramatic, no drums, no vocals, 3 seconds
```

**`stg-mage`** · 3 s
```
short mystical arrival sting, instrumental, arcane shimmer, low soft bell, misty whoosh, a wise forest witch appears, cozy and magical, no vocals, 3 seconds
```

**`stg-cold`** · 3 s
```
short winter arrival sting, instrumental, gust of wind with fine ice crystals tinkling, one low soft flute note, cold but cozy, no vocals, 3 seconds
```

**`stg-loose`** · 2 s (en ElevenLabs funciona mejor como efecto)
```
[ancla] A glowing magical thread snapping softly: muted pizzicato pluck followed by a dimming shimmer, gentle and slightly sad, 2 seconds.
```

**`stg-season`** · 2 s, 4 variantes
```
[ancla] Wind chimes sweeping up through a D major pentatonic scale, airy transition, [spring: bright and sparkling | summer: warm and lazy | autumn: woody and rustling | winter: low, slow and icy], 2 seconds.
```

**`stg-tutorial-done`** · 2,5 s
```
short happy level complete jingle, instrumental, playful marimba fanfare in D major, light applause of rustling leaves, cozy, no vocals, 2 seconds
```

### C. Acciones del tablero (ElevenLabs o Stable Audio Open)

**`sfx-weave`** · 0,5 s
```
[ancla] Magical mycelium growing through soil: a short rising glassy shimmer with a fine soft crackle of earth, golden light, tuned to D major pentatonic, 0.5 seconds.
```
*Nota: genera una sola toma buena y deriva las notas en el código (subir la altura por grados) o en Audacity.*

**`sfx-decompose`** · 0,6 s
```
[ancla] Soft damp rotten wood log crumbling gently into soil, organic and moist, ending with a tiny cute mushroom pop, 0.6 seconds.
```

**`sfx-revive`** · 0,9 s
```
[ancla] A grey tree comes back to life: burst of fresh leaves unfurling and rustling, followed by a warm chord of soft bells, D F# A B, satisfying and joyful, 0.9 seconds.
```

**`sfx-awaken`** · 1,5 s
```
[ancla] An ancient giant tree awakens: deep soft root rumble that rises into bright golden sparkles and a magical shimmer, epic but gentle, 1.5 seconds.
```

**`sfx-crumble`** · 0,6 s
```
[ancla] A small rock breaking into little pieces, dry but soft, no loud impact, light dust and pebbles falling, cozy cartoon foley, 0.6 seconds.
```

**`sfx-thread`** · 0,7 s
```
[ancla] A golden magical thread travelling through the air: quick soft harp glissando upwards that lands on a tiny bell, 0.7 seconds.
```

**`sfx-cleanse`** · 0,6 s
```
[ancla] Purifying magic: a soft breath of clean fresh air with a rising sparkle, relief, 0.6 seconds.
```

**`sfx-wither`** · 0,7 s
```
[ancla] A small patch of glowing moss withering: soft fizzle that fades out, low and muted, sad but not scary, 0.7 seconds.
```

**`sfx-spores`** · 0,8 s
```
[ancla] A handful of tiny bubbly pops like magical seeds jumping out, light and sparkly, playful, 0.8 seconds.
```

**`sfx-leaves`** · 0,3 s
```
[ancla] A quick rustle of dry leaves ending with a tiny wooden tick, 0.3 seconds.
```

**`sfx-call`** · 0,4 s
```
[ancla] A small cute bird whistle with two rising notes, friendly call, 0.4 seconds.
```

**`sfx-puff-spores`** · 0,6 s
```
[ancla] A puffball mushroom blowing: soft airy puff followed by a light shower of tiny pops, 0.6 seconds.
```

**`sfx-puff-compost`** · 0,6 s
```
[ancla] A soft thud on moist earth, then roots gently absorbing with a subtle gurgle, 0.6 seconds.
```

**`sfx-spell-sprout`** · 1,2 s
```
[ancla] A rising arcane magic spell: shimmering sparkles going up, a stone softening with a low creak, then a glowing bloom, 1.2 seconds.
```

**`sfx-spell-rain`** · 1,5 s
```
[ancla] Short magical drizzle: gentle rain drops mixed with tiny falling bells, 1.5 seconds.
```

**`sfx-recruit`** · 0,7 s
```
[ancla] Welcome jingle: three rising soft marimba notes D F# A, followed by a cute mushroom popping out of the ground, 0.7 seconds.
```

**`sfx-month-end`** · 0,9 s
```
[ancla] Day ending in a forest: one deep soft wooden block hit, a gentle fading whoosh, a single cricket remains, 0.9 seconds.
```

**`sfx-month-start`** · 0,7 s
```
[ancla] Dawn in a forest: a gentle soft rising swell of air and one small morning bird chirp, 0.7 seconds.
```

**`sfx-invalid`** · 0,2 s
```
[ancla] Two muted soft wooden knocks, descending, gentle "not here" feedback, no buzz, 0.2 seconds.
```

**Eventos del mes**
```
sfx-frost (0.6 s): [ancla] Thin ice crystals forming on leaves, delicate tinkling crackle, 0.6 seconds.
sfx-fading (0.8 s): [ancla] A cold breath of wind and a small bell detuning downwards, a tree losing its light, 0.8 seconds.
sfx-faded (0.8 s): [ancla] A few last leaves falling softly to the ground, then silence, 0.8 seconds.
sfx-plague (0.7 s): [ancla] Low soft organic creak like something slowly rotting, short and muted, ominous but cozy, 0.7 seconds.
sfx-hungry (0.6 s): [ancla] A cute tiny tummy rumble followed by a small "mmm" hum, cartoon, 0.6 seconds.
sfx-unrooted (0.6 s): [ancla] A glowing thread vibrating and fading out, soft and slightly sad, 0.6 seconds.
```

### D. Voces de especie · 0,3 s cada una, en re

```
vox-champi: [ancla] A round low marimba note D with a soft cute "bup", 0.3 seconds.
vox-lactarius: [ancla] A single crystal harp pluck on D, clear and watery, 0.3 seconds.
vox-amanita: [ancla] A warm celesta bell note on D, healing and kind, 0.3 seconds.
vox-gliophorus: [ancla] A short tiny bird trill, bright and quick, 0.3 seconds.
vox-morchella: [ancla] A dry kalimba thumb note on D tapped against a stone, 0.3 seconds.
vox-ganoderma: [ancla] A small glass potion jar clinking softly, amber and warm, 0.3 seconds.
vox-lycoperdon: [ancla] A soft airy "pff" puff with one tiny bubble pop, 0.3 seconds.
vox-mago: [ancla] An arcane shimmer with a low soft magical hum on D, wise, 0.4 seconds.
```

### E. Microinteracciones

```
ui-tap (0.08 s): [ancla] A very short soft wooden block tap, UI button click, warm, 0.1 seconds.
ui-tap-primary (0.15 s): [ancla] A short bright wooden tap with a tiny bell on top, confirm button, 0.15 seconds.
ui-select (0.08 s): [ancla] A tiny high marimba tick, selection, 0.1 seconds.
ui-deselect (0.08 s): [ancla] A tiny marimba tick slightly lower in pitch, deselect, 0.1 seconds.
ui-sheet-open (0.25 s): [ancla] Parchment paper scroll unrolling quickly, soft, 0.3 seconds.
ui-sheet-close (0.2 s): [ancla] Parchment paper folding closed, soft, 0.2 seconds.
ui-card-flip (0.25 s): [ancla] A thick paper card flipping over, soft, 0.3 seconds.
ui-screen (0.3 s): [ancla] A small wooden sign swinging on a rope with a gentle creak, 0.3 seconds.
ui-counter-up (0.06 s): [ancla] A tiny bright sparkle tick, coin-like but soft and organic, 0.1 seconds.
ui-counter-down (0.06 s): [ancla] A tiny muted wooden tick, 0.1 seconds.
ui-hint (0.15 s): [ancla] A minimal star twinkle, 0.2 seconds.
ui-coach (0.15 s): [ancla] A soft paper bubble pop, tooltip appearing, 0.2 seconds.
ui-stars (3 × 0.2 s): [ancla] Three small bells rising D, F#, A, one after another with short gaps, rewarding, 1 second.
ui-score-tick (0.03 s): [ancla] An extremely short soft tick, 0.05 seconds.
ui-record (0.6 s): [ancla] A bright sparkle with two happy bells, new record, 0.6 seconds.
ui-dice (0.4 s): [ancla] Small wooden dice rolling on a table, 0.4 seconds.
ui-submit (0.3 s): [ancla] A rubber stamp pressed on paper, satisfying, 0.3 seconds.
```

*Nota: muchas herramientas no generan menos de 0,5 s. Pide 0,5–1 s y recorta.*

## Próximos pasos

1. Decidir el presupuesto (P0 solo o subirlo) y la licencia de lo publicado.
2. Generar P0 (16 sonidos) con estos prompts y escucharlos juntos sobre una captura de la partida.
3. Abrir el cambio de OpenSpec del audio: `src/audio.ts`, controles «Sonido» y «Música», carga diferida, pruebas (que nada suene antes del primer gesto, que se pause con la pestaña oculta y que respete el interruptor), y el presupuesto actualizado en `CLAUDE.md`.
4. Playtest en teléfono real con el parlante: ¿algún sonido cansa a los 5 minutos?
