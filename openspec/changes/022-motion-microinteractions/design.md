# Diseño · 022 · Movimiento y microinteracciones

## Inventario: lo que ya se anima (no duplicar)
| Qué | Dónde | Duración y curva | Movimiento reducido |
| --- | --- | --- | --- |
| Tejer: el pasto se desvanece y un hilo dorado crece desde la casilla vecina | `src/scenes/fx.ts` › `weave` (Phaser) | 400 ms `Quad.easeIn` + 320 ms `Cubic.easeOut` | Nada |
| Descomponer: el tronco se encoge y se hunde, con astillas | `fx.ts` › `decompose` + `burst` | 400 ms `Back.easeIn` | Nada |
| Revivir: estallido de hojas y luz | `fx.ts` › `burst` | 400 ms `Quad.easeOut` | Nada |
| Despertar: anillo de luz desde el Árbol Padre | `fx.ts` › `awaken` | 400 ms `Quad.easeOut` | Nada |
| Halo del Árbol Padre despierto | `fx.ts` › `fatherHalo` | Late 1600 ms `Sine.easeInOut`, en bucle | Quieto |
| Motas sobre árboles vivos (≤ 40) | `fx.ts` › `mote` | 1300 + 900 ms `Sine.easeOut` | Nada |
| Brote arcano | Reusa `weave` (de roca a red) | 400 ms | Nada |
| Esporas al contador (≤ 12, mes nuevo y Lluvia de esporas) | `src/ui/flyers.ts` (WAAPI) | 620 ms, 45 ms entre cada una, `cubic-bezier(.5,0,.5,1)` | Nada |
| Saltito del contador de esporas | `styles.css` › `.chip.is-bump` | 320 ms `ease-out` | Nada |
| Pose «feliz» del retrato (seleccionado o sugerido) | `styles.css` › `.portrait img` | Transición de `transform` 200 ms `ease-out` | Nada |
| Luz de la red por estación | `GameScene.ts` › `glowTween` | 600 ms `Sine.easeInOut` (`LIGHT_TRANSITION_MS`) | Inmediato |
| Árbol marcado (escarcha que late) | `GameScene.ts` › `frostTween` | 1600 ms en bucle (`FROST_PULSE_MS`) | Quieto a 0,5 |
| Fondo vivo (shader) | `src/ui/ambient.ts` (rAF) | Continuo; se pausa con la pestaña oculta | Quieto |

En el código no hay ninguna otra transición ni animación CSS. La regla global de `prefers-reduced-motion` anula todas (`animation: none; transition: none`).

## Auditoría (2 de noviembre, Playwright 1.64, Pixel 7 a 390 × 664 táctil)
- **Cómo se midió:** tras cada toque se cuentan `document.getAnimations()` (DOM) y los tweens de Phaser a los 16, 120, 300 y 700 ms.
- **Partida:** claro clásico en Brote, siguiendo la ★ hasta la carta de Maestra Bruma (mes 5).
- **Momentos tardíos:** hechizos, pasar la voz, victoria y fin del invierno se midieron con `?debugState=`.
- **Material:** video y capturas en el scratchpad de la sesión; no se versionan.

| # | Momento | Hoy | ¿Se entiende? |
| --- | --- | --- | --- |
| 1 | Portada, «Nueva partida», «Elige tu dificultad» | Corte seco en las tres pantallas (0 animaciones). Solo se mueve el fondo vivo | Sí, pero se siente estática |
| 2 | Intro: entrada, cambio de carta, «Saltar» | Corte seco en todo | Sí; el cambio de carta pasa desapercibido (los puntos son lo único que cambia de lugar) |
| 3 | Seleccionar miembro | Pose «feliz» (200 ms). Las casillas válidas y la ★ aparecen de golpe. **La primera vez por especie, la ficha tapa el tablero** | A medias: el jugador cree que tocó «ver ficha» (problema 2) |
| 4a | Tejer (Indi) | Animación del 004, hilo **dorado** (no hay destello índigo) | Sí |
| 4b | Descomponer (Bruno) | Animación del 004 | Sí |
| 4c | Revivir (Rubí) | Animación del 004 | Sí |
| 4d | Pasar la voz (Chispa) | **Nada** en el tablero; en el dock, la «Zz» del compañero desaparece de golpe | **No**: no se ve a quién se liberó |
| 4e | El retrato llega a la casilla | Aparece de golpe; la tarjeta del dock pasa a «Zz» de golpe | Sí, sin sensación de «ir a trabajar» |
| 5 | Casilla inválida, miembro cansado, sin recursos | Solo cambia el texto de la bitácora; nada en la casilla ni en la tarjeta | **A medias**: la bitácora está lejos del dedo |
| 6 | Contadores del HUD | Esporas: saltito al llegar el vuelo. Nutrientes, árboles y mes: corte seco. El «−1» de tejer y el «−3» de revivir no se ven | **A medias**: el costo de cada jugada es invisible |
| 7 | Fin del mes → mes nuevo | Vuelan las esporas y salta el contador. La hojarasca (nutrientes) no vuela. Los retratos dejan las casillas y la «Zz» se va de golpe | A medias: no se ve de dónde salen los nutrientes |
| 8 | Cambio de estación | La luz de la red cambia en 600 ms, pero el claro (pasto, rocas, árboles) **cambia de golpe** en el mismo cuadro; la corona de Chispa y la etiqueta del HUD también | Sí, pero el salto se nota |
| 9 | Llegada de Maestra Bruma y hechizos | Carta en corte seco; su tarjeta aparece de golpe en el dock. Lluvia: vuelo de esporas. Brote arcano: hilo de tejer. La hoja de hechizos entra de golpe | Sí; no se siente solemne |
| 10 | Reclutar | La hoja entra de golpe; el nuevo miembro aparece de golpe en el dock (ya cansado) | Sí |
| 11 | Fichas de criatura y hojas | Abrir y cerrar en corte seco. Esc funciona en escritorio. **En el teléfono, «atrás» saca de la partida** | A medias (problema 1) |
| 12 | Victoria y fin del invierno | El anillo y el halo corren 400 ms, pero **la carta ya está encima en el mismo cuadro**. La carta y su fondo entran en corte | **No se ve despertar al Árbol Padre** |

Con `reducedMotion: 'reduce'`, 0 animaciones y 0 tweens tras una jugada: la regla de hoy se cumple.

### Los 4 problemas reportados
| Problema | Resultado | Causa |
| --- | --- | --- |
| Esc no cierra la ficha | En escritorio sí. Con Maestra Bruma, el primer Esc cambia la ficha por la hoja de hechizos (hace falta un segundo Esc). En el teléfono, el gesto «atrás» navega fuera del juego | `afterSheet` (`store.ts`) y no hay entrada en el historial al abrir una capa |
| Tocar el avatar abre la ficha en vez de seleccionar | Reproducido la primera vez por especie. Selecciona, pero la hoja (y 93–664) tapa casi todo el tablero (y 70–526) | `withFirstCard` (`store.ts`), regla de `player-guidance` |
| Tocar una casilla con la ficha abierta solo la cierra | Reproducido: cierra y no actúa (la selección queda). Abajo, el toque cae en el panel y no cierra nada | El fondo de la hoja solo llama a `closeSheet` |
| La etiqueta accesible dice «Árbol Padre» | El grupo es «Tablero del claro»; la casilla meta, «Árbol Padre, columna 3, fila 1, la meta». Es el nombre de todas las specs | Decisión de nombre (pregunta abierta 1) |

## Principios de movimiento (van a `docs/art-direction.md` › Movimiento al aprobarse)
1. **Cozy:** suave y elástico, nunca agresivo.
   - El rebote pasa como máximo un 8 % del tamaño final.
   - Las sacudidas, como mucho ±3 px.
   - Nada de destellos blancos ni de pantalla completa.
2. **Causa y efecto:** el movimiento explica de dónde sale y adónde va cada cosa.
   - Los recursos viajan desde donde se ganan hasta su contador.
   - Los costos se ven en el contador que baja.
   - El rechazo se ve donde estaba el dedo.
3. **Nunca bloquea:** el estado ya cambió cuando empieza la animación, que solo se dibuja encima.
   - Se pueden encadenar jugadas sin esperar.
   - Una animación nueva interrumpe a la anterior del mismo objeto, no se encola.
   - Las cartas narrativas se pueden saltar con un toque.
4. **Cada especie se mueve como es.** La firma se aplica al llegar a la casilla y en la selección.
5. **Una sola cosa de deleite por momento.**
6. **Móvil primero:**
   - 60 fps en Android de gama media.
   - Solo se animan `transform` y `opacity` en el DOM; nada de `filter` ni `box-shadow` animados.
   - ≤ 40 partículas en pantalla, sumando todas las fuentes; ≤ 12 vuelos a la vez.

### Tokens (`src/theme.ts` › `MOTION`, espejados como variables CSS `--motion-*`)
| Token | Valor | Uso |
| --- | --- | --- |
| `instant` | 90 ms | Respuesta al toque (presionado, color) |
| `fast` | 180 ms | Rechazo, saltito de contador, salidas, selección |
| `standard` | 280 ms | Jugadas en el tablero, hojas, tarjetas que entran |
| `narrative` | 600 ms | Solo cartas, estaciones, vuelos al HUD, Maestra Bruma y victoria |

| Curva | CSS | Phaser | Uso |
| --- | --- | --- | --- |
| `settle` | `cubic-bezier(.2,.8,.2,1)` | `Cubic.easeOut` | Entradas: algo llega y se acomoda |
| `springy` | `cubic-bezier(.34,1.45,.64,1)` | `Back.easeOut` (sobrepaso 1,2) | Saltitos, tarjetas, firmas alegres |
| `soft` | `cubic-bezier(.45,0,.55,1)` | `Sine.easeInOut` | Fundidos, estaciones, luz, Maestra Bruma |
| `leave` | `cubic-bezier(.4,0,1,1)` | `Quad.easeIn` | Salidas: algo se va |

- **Bucles de ambiente:** el halo, la escarcha, las motas y el fondo vivo no usan la escala; se quedan en ≥ 900 ms.
- **Migración:**
  - Las jugadas del 004 pasan de 400 ms a `standard` (despertar, a `narrative`).
  - El vuelo de esporas, de 620 ms a `narrative`.
  - El saltito del contador, de 320 ms a `fast`.
  - `LIGHT_TRANSITION_MS` queda como `narrative`.

### Movimiento reducido
- **Se conserva:** cambios de color y de opacidad de `fast` o menos (aparecer, fundir, teñir), el halo quieto y el estado final de todo.
- **Se quita:** desplazamiento, escala, rotación, vuelos, partículas, rebotes y bucles.
- **Cartas:** aparecen sin esperar, salvo la pausa de victoria, que baja a `standard` (280 ms) con el halo quieto para que se vea el árbol despierto.
- **En CSS:** la regla global pasa a anular `transform` y las animaciones con nombre, pero deja `opacity` con `--motion-fast`. Cada animación nueva declara su versión reducida al lado.

### Vibración (opcional, P2)
- `navigator.vibrate(12)` en cada jugada válida y `20` al despertar al Árbol Padre.
- Solo si el navegador la soporta (Android) y el interruptor está encendido; apagado por defecto.
- Nunca en rechazos ni en toques repetidos.

### Firma por especie
| Especie | Carácter | Llegada a la casilla | Seleccionada en el dock |
| --- | --- | --- | --- |
| Bruno · Champiñón | Trabajador | Cae 6 px y aplasta una vez, firme (`standard`, `springy`) | Doble saltito corto (2 × `fast`) |
| Indi · Lactarius indigo | Delicado | Se funde y baja flotando (`standard`, `soft`); el hilo de tejer nace con un **destello índigo** (`color.indigo`) que se vuelve dorado | Se mece ±2° una vez (`standard`, `soft`) |
| Rubí · Amanita muscaria | Cuidadosa | Se agacha un 5 % (`instant`) y se acomoda (`standard`, `settle`) | Asoma 4 px y se queda (`fast`, `settle`) |
| Chispa · Gliophorus psittacinus | Parlanchina | Doble meneo ±4° (2 × `fast`, `springy`) | Meneo rápido y su corona brilla |
| Maestra Bruma | Solemne | Aparece en un fundido con halo `arcane` suave, sin rebote (`narrative`, `soft`) | Sube 3 px despacio (`standard`, `soft`) |

## Recomendaciones
Capa: **CSS** = DOM (HUD, dock, bitácora, hojas, cartas, pantallas, vuelos WAAPI); **Phaser** = canvas del tablero.

| # | Momento | Disparador | Animación propuesta | Duración y curva | Le comunica al jugador | Movimiento reducido | Prioridad | Costo | Capa |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | Base | — | Tokens `MOTION` y variables `--motion-*`; regla reducida selectiva; ayudante `motion()` que respeta el reducido y cancela la animación anterior del mismo objeto | — | — | Es la regla | P0 | S | CSS + Phaser |
| 1 | Portada | Se muestra la portada | El logo baja 8 px y se funde; los botones entran de a uno (60 ms). Deleite: el hongo del logo da un saltito | `narrative` `settle`; botones `fast` | Bienvenida tranquila | Solo fundido `fast` | P2 | S | CSS |
| 2 | Intro y «Elige tu dificultad» | Siguiente, Saltar, elegir nivel | La carta sale a la izquierda y la siguiente entra desde la derecha 12 px con fundido; el punto activo se desliza; «Saltar» funde la carta y aparece el tablero | `standard` `settle`, salida `fast` `leave` | Avance en una secuencia | Fundido cruzado `fast` | P1 | S | CSS |
| 3a | Primera selección (problemas 2 y 3) | Seleccionar una especie nueva | La ficha no se abre sola. El botón «Ficha» lleva un punto «nuevo» y late una vez; la bitácora dice «Toca Ficha para conocer a Bruno» | Latido `standard` `springy`, 1 vez | Seleccioné, y hay info si la quiero | Punto sin latido | P0 | S | CSS |
| 3b | Seleccionar | Tocar una tarjeta | La tarjeta sube 4 px con el aro de selección. Las casillas válidas aparecen en fundido escalonado desde el miembro (≤ 180 ms en total); la ★ late una sola vez al aparecer. Firma de la especie en el dock | Tarjeta `fast` `settle`; casillas `fast` `soft`; ★ `standard` `springy` | Dónde puede trabajar y cuál conviene | Casillas en fundido `fast`; sin subida ni latido | P1 | M | CSS + Phaser |
| 4a | Jugada válida | `act` | El retrato llega a la casilla con la firma de su especie; la tarjeta se apaga a «Zz» con un fundido. Destello índigo al tejer. Las jugadas del 004 se quedan, con los tokens | `standard` (Maestra Bruma `narrative`) | Quién trabajó y dónde | Retrato y «Zz» en fundido `fast` | P1 | M | Phaser + CSS |
| 4b | Pasar la voz | Chispa actúa | Tres notitas salen de Chispa en arco hasta la tarjeta del llamado en el dock, que da un saltito con un aro de luz; su «Zz» se va | Notas `standard` `settle` (40 ms entre cada una); tarjeta `fast` `springy` | A quién se liberó para trabajar otra vez | Aro de luz en la tarjeta del llamado, en fundido; sin notas | P0 | M | CSS (WAAPI, como las esporas) |
| 5 | Rechazo | Casilla inválida, miembro cansado, sin recursos | En la casilla tocada, un aro `berry` que aparece y se va con un vaivén de 2 px. En la tarjeta cansada, la «Zz» se mece. Sin recursos: el contador que falta se tiñe `berry`. La bitácora entra en fundido. Sin vibración | Aro `fast` entra, `standard` sale, `soft`; vaivén 2 × `fast` | Por qué no, justo donde tocó | Aro y tinte sin vaivén | P0 | S | CSS (capa de botones del tablero) |
| 6 | Contadores del HUD | Cambia nutrientes, esporas, árboles o mes | El contador que cambia da su saltito; nutrientes, esporas y árboles sueltan una etiqueta «+2» o «−1» que sube 8 px y se funde, con el número teñido. Los costos de tejer y revivir se ven al instante | Saltito `fast` `settle`; etiqueta `fast` + 2 × `standard`, `settle` | Qué ganó y qué gastó cada jugada | El número se tiñe (`leaf` si sube, `berry` si baja) y aparece la etiqueta sin subir | P0 | S | CSS |
| 7 | Fin del mes → mes nuevo | «Fin del mes» | La luna del botón gira media vuelta. Esporas **y hojas** (hojarasca) vuelan de los árboles vivos a sus contadores (≤ 12 en total). Los retratos dejan las casillas en fundido y las tarjetas despiertan de a una (40 ms) con un saltito | Vuelos `narrative`; tarjetas `fast` `springy` | El bosque devolvió recursos y el gremio está listo | Sin vuelos ni saltitos; contadores teñidos, «Zz» en fundido | P1 | M | CSS + Phaser |
| 8 | Cambio de estación | Primer mes de la estación | El claro anterior se funde sobre el nuevo, junto con la luz de la red. La etiqueta del HUD cambia en fundido. La corona de Chispa se funde a la nueva. Deleite: cae una ráfaga corta (≤ 12) de pétalos, hojas o copos según la estación | `narrative` `soft` | Pasó el tiempo, cambió la estación | Fundido `fast`, sin ráfaga | P1 | M | Phaser + CSS |
| 9 | Llegada de Maestra Bruma y hechizos | Carta de llegada, hechizos | La carta sube y se funde; al cerrarla, su tarjeta entra al dock con un fundido y un halo `arcane`. La hoja de hechizos sube como las otras. Brote arcano: un aro `arcane` lento en la roca antes del hilo. Lluvia de esporas: vuelo de esporas y hojas desde el árbol | `narrative` `soft` | Llegó alguien importante; su magia es distinta | Fundidos `fast`, sin aro | P1 | M | CSS + Phaser |
| 10 | Reclutar | Reclutar en la hoja | La hoja se cierra y el nuevo miembro entra al dock creciendo de 0,8 a 1 (ya con «Zz»); el dock se desplaza para mostrarlo si no cabe | `standard` `springy` | Quién se sumó y que trabaja desde el mes siguiente | Fundido `fast` | P1 | S | CSS |
| 11a | Cerrar capas (problemas 1 y 3) | Esc, gesto «atrás», tocar fuera, tocar una casilla | Abrir una hoja, ficha o carta agrega una entrada al historial. «Atrás» y Esc cierran la capa de arriba, sin salir del juego. Tocar una casilla visible con una ficha abierta la cierra y hace la jugada | — | Siempre hay salida, y un toque basta | Igual | P0 | M | CSS (DOM) + `store.ts` |
| 11b | Hojas, fichas y cartas | Abrir o cerrar | La hoja sube 24 px y se funde, y el fondo se oscurece; al cerrar, baja y sale. Ficha desde «Reclutar»: se desliza sobre la hoja | Entra `standard` `settle`; sale `fast` `leave` | De dónde viene la capa y que se puede cerrar | Fundido `fast` | P1 | S | CSS |
| 12 | Victoria y fin del invierno | Despertar al Árbol Padre; terminar el mes 12 | Victoria: la carta espera 600 ms. Mientras, el anillo del despertar, el halo y una ola dorada recorren la red desde el árbol; después la carta sube. Cualquier toque la trae antes. Fin del invierno: el claro baja la luz y después entra la carta | Ola `narrative` `soft`; carta `standard` `settle` | Lo logró, y se ve **cómo** despertó el bosque | Pausa `standard` (280 ms) con el halo quieto; carta en fundido | P1 | M | Phaser + CSS + `store.ts` |
| 13 | Vibración | Jugada válida, despertar | Vibra 12 ms (20 al despertar), con interruptor (pregunta abierta 3) | — | Confirmación física | Igual (no es movimiento) | P2 | M | DOM |
| 14 | Nombre del Árbol Padre (problema 4) | — | Decidido: se queda «Árbol Padre»; sin cambio | — | — | — | P0 | — | — |

### Costo total por prioridad
Escala: **S** ≈ medio día y **M** ≈ un día, contando pruebas, humo y capturas de la definición de terminado.

| Prioridad | Filas | Costo | Estimado |
| --- | --- | --- | --- |
| P0 | 0, 3a, 4b, 5, 6, 11a, 14 | 5 S + 2 M | ≈ 4,5 días |
| P1 | 2, 3b, 4a, 7, 8, 9, 10, 11b, 12 | 3 S + 6 M | ≈ 7,5 días |
| P2 | 1, 13 | 1 S + 1 M | ≈ 1,5 días |
| **Total** | 17 filas | 9 S + 9 M | **≈ 13,5 días** |

## Decisiones técnicas
- **Efecto nuevo `call`:** `diffEffects` lo emite cuando un miembro pasa de usado a listo sin cambio de mes (pasar la voz). Lleva `at` (la casilla de Chispa, que es donde trabajó el llamado) y `memberId` (el llamado). Las notitas van de esa casilla a la tarjeta del dock (`flyers.ts`). Es lógica pura y va con prueba.
- **Recurso que falta:** `check()` y `RuleError` dicen qué recurso faltó (`short`), y `idleShort` lo deduce del motivo de inactividad; la bitácora lo lleva en `Notice.short` y el HUD tiñe ese contador. Las reglas no cambian.
- **Rechazo en la casilla y en la tarjeta:** lo decide la capa que recibió el toque (`board.ts`, `dock.ts`): si el juego no cambió y la bitácora dio un aviso, se reinicia la clase `is-reject` (o `is-tired`).
- **Contadores:** `hud.ts` compara el estado anterior con el nuevo y emite la etiqueta «±n». No anima si el cambio viene de cargar una partida o de `?debugState`.
- **Fundido de estación:** antes de repintar, `GameScene` copia el claro anterior a una `RenderTexture` y la funde. Así no se carga arte extra ni se guarda una textura más que la del claro.
- **Retraso de la carta final:** `store` sigue poniendo `story` al ganar; `story.ts` solo retrasa mostrarla. Un toque o una tecla la muestran ya. Las pruebas de humo usan movimiento reducido (280 ms).
- **Historial:** se agrega una sola entrada (`history.pushState`) por capa abierta. `popstate` despacha `cancel`. Al cerrar con la X o con Esc, se hace `history.back()` para no dejar entradas sueltas. La portada no agrega entrada: atrás desde la portada sale del sitio, como hoy.
- **Paso del toque:** el fondo de la hoja calcula si el toque cayó sobre una casilla visible del tablero. Si cayó, cierra la hoja y despacha `tapTile`.

## Riesgos
- **Fundido de estación:** una `RenderTexture` del tamaño del claro a 2× pesa unos 7 MB en GPU, solo durante 600 ms. Si un Android de gama media baja de 60 fps, se reemplaza por un fundido de la luz y un cambio seco del claro.
- **Historial y pantallas:** el historial no debe pelearse con portada, «Elige tu dificultad» ni «Cómo jugar». Se prueba en humo con `page.goBack()` en cada capa.
- **Ficha opción B:** menos jugadores verán las fichas. El botón con punto y la línea de la bitácora mitigan; se observa en el playtest.

## Colores
- **Rechazo y costo:** `berry`, cálido y nunca rojo de alarma, siempre a baja opacidad (≤ 0,6).
- **Ganancia:** `leaf`.
- **Selección:** `accent`, como hoy.
- **Tejer:** `indigo`, que ya existe en `theme.ts` para este destello pero nunca se usó.
- **Maestra Bruma:** token nuevo `arcane`, `#80E6E5`: el cian de la punta de su bastón. Se había propuesto un violeta (`#A99BE6`), pero su retrato no tiene ningún violeta; el único tono frío es ese brillo (muestreo de `characters/maestra-bruma/portrait.webp`).
