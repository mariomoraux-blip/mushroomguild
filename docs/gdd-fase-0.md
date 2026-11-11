# El Gremio de los Hongos · Fase 0

> Copia en Markdown del documento "El Gremio de los Hongos · Fase 0" (Claude Docs), versión del 1 de noviembre de 2026, por Mario Mora, con las decisiones posteriores del 2 de noviembre (cambios 005 y 006: nombres, Chispa la Mensajera, claros aleatorios, dificultad e interfaz). Pendiente: llevar estos cambios al documento original.
> El original es la fuente; si cambia, se actualiza este archivo. Las specs de `openspec/` son el contrato ejecutable: si este documento y una spec no coinciden, manda la spec hasta que un cambio de OpenSpec las alinee.

## Concept doc

**El Gremio de los Hongos** es un juego cozy de colocación de trabajadores para navegador. En 5 a 10 minutos, un gremio de hongos teje una red de micelio para revivir un bosque que se apaga.

**Pitch:** Everdell bajo tierra. No construyes una ciudad: tejes una red que le devuelve el color al bosque.

Ya existe una [prueba de concepto jugable](../poc/game.html) que validó el loop y el balance. La Fase 1 la reconstruye bien hecha en Claude Code.

### Pilares
1. **Cuidar, no conquistar.** No hay enemigos. El reto es el tiempo (12 meses) y los recursos. Perder no castiga: el bosque espera la próxima primavera.
2. **El mundo cuenta la historia.** El claro empieza gris y gana color con cada árbol revivido. El texto se limita a tres cartas de intro.
3. **Decisiones pequeñas, efecto en cadena.** Cada árbol revivido alimenta el motor con esporas y nutrientes, y extiende la red.

Cualquier idea nueva se evalúa contra estos tres pilares. Si no sirve a ninguno, va al backlog.

### Público
- **Principal:** adultos de 25 a 45 años que juegan títulos cozy y juegos de mesa ligeros, en sesiones cortas.
- **Secundario:** quien visita tu portafolio. Debe entender qué hacer en 30 segundos, sin tutorial.

### Referentes
| Referente | Qué tomamos |
| --- | --- |
| Everdell, Apiary | Colocación de trabajadores y motor económico que crece |
| Outlanders | Gestión cozy de personajes pequeños con roles |
| Overcooked | Roles complementarios: cada especie hace una sola cosa bien |
| Lost in Play, Hollow Knight | Historia ambiental, casi sin texto |
| Little Big Planet | Textura artesanal, mundo hecho a mano |

### Diferencial
La red de micelio es a la vez mecánica y progreso visible: define dónde puedes actuar y muestra cuánto has avanzado. Se apoya en algo real, las redes micorrícicas que conectan árboles.

### Alcance del vertical slice
- **Incluye:** 1 capítulo, claros aleatorios de 5×8 (un mapa nuevo en cada partida), 8 especies (3 iniciales, 4 que solo llegan reclutando y una maga única), 12 meses en 4 estaciones, intro y final. Se juega en navegador de teléfono y de escritorio.
- **Niveles de dificultad (019):** Brote, Bosque y Ancestral, elegidos al empezar (ver «Niveles»).
- **Fuera de alcance:** guardado, varios capítulos, IA rival, multijugador, monetización.

### Criterios de éxito
- Un jugador nuevo gana, o queda cerca, en su primer intento y en menos de 10 minutos.
- Entiende la regla de "solo actúas junto a la red" sin leer instrucciones.
- El proyecto sostiene un caso de estudio para la sección Lab del portafolio.

## GDD mínimo

La partida es un loop mensual de colocar, producir y expandir. Dura 12 meses y se gana despertando al Árbol Padre.

### Loop central
Cada mes eliges a un miembro del gremio y una casilla. La acción gasta o produce nutrientes, y la red crece o un árbol revive. Al cerrar el mes, los árboles vivos pagan esporas y nutrientes, y las esporas reclutan más gremio.

### Tablero
Cuadrícula vertical de 5 columnas por 8 filas, con el Hogar abajo y el Árbol Padre arriba. La red crece hacia el árbol y el tablero cabe en un teléfono en vertical. Solo se actúa sobre casillas que tocan la red (adyacencia ortogonal). Cada partida genera un claro distinto (7 árboles grises, 5 troncos, 6 rocas, Hogar abajo y Árbol Padre arriba). El generador solo acepta claros que un jugador que sigue las pistas gana entre el mes 8 y el 11. El mapa de la prueba de concepto, rotado, queda como "mapa clásico" para pruebas.

| Casilla | Comportamiento |
| --- | --- |
| Hogar del gremio | Origen de la red |
| Tierra | Se puede tejer micelio sobre ella |
| Tronco caído | Da nutrientes; aguanta 2 usos y queda tierra libre |
| Árbol gris | Se puede revivir; al revivir entra en la red |
| Roca | Bloquea la red |
| Árbol Padre | Objetivo final, en el extremo opuesto al Hogar |

### Especies
| Especie | Rol | Disponibilidad | Acción | Efecto |
| --- | --- | --- | --- | --- |
| Champiñón | Descompositor | Inicial | Descompone un tronco | +2 nutrientes |
| *Lactarius indigo* | Tejedor | Inicial | Teje micelio en tierra | −1 nutriente, la red crece |
| *Amanita muscaria* | Sanadora | Inicial | Revive un árbol gris | −3 nutrientes; −6 en el Árbol Padre |
| *Gliophorus psittacinus* | Mensajera | Reclutable | "Pasa la voz" a un compañero que ya trabajó este mes | −1 espora; ese compañero trabaja otra vez |
| *Morchella esculenta* "Panal" | Rompe-rocas | Reclutable | Rompe una roca vecina a la red | −2 nutrientes; queda tierra sin tejer |
| *Ganoderma lucidum* "Ámbar" | Boticaria | Reclutable | Revive un árbol gris a 2 casillas o menos de la red; en Ancestral, también limpia la plaga | −3 nutrientes y −1 espora (apagado, −7 y −1); el árbol entra a la red · limpiar, −1 espora |
| *Lycoperdon perlatum* "Pompón" | Soplador | Reclutable | Desde un árbol vivo, elige: soplar esporas o abonar el árbol | Soplar: −1 nutriente, +2 esporas · Abonar: −2 esporas, +1 nutriente |
| *Conocybe arcana* (ficticio) | Maga | Única; llega sola | Un hechizo por estación | Ver hechizos |

Cada miembro actúa una vez por mes. El gremio llega a 7 reclutables como máximo, y un recluta trabaja desde el mes siguiente. Desde el 039 se recluta **una de cada especie** y solo las que no están al empezar; desde el 041 hay 4 cupos, uno por especie.

**Maestra Bruma, la maga.** No se recluta: llega al empezar el mes siguiente a revivir el segundo árbol ("el bosque volvió a hablar y alguien escuchó") y no cuenta en el límite de 7. Lanza un hechizo por estación, a elegir:
- **Brote arcano:** convierte una roca vecina a la red en tierra con micelio. Abre atajos en el mapa.
- **Lluvia de esporas:** sobre un árbol vivo, todos los árboles vivos dan ya la espora y el nutriente que darían al empezar el mes.

La Mensajera, **Chispa**, convierte esporas en una segunda jugada: despierta a la Amanita para revivir otro árbol el mismo mes o al Champiñón para descomponer otra vez. Agrega la decisión de gastar esporas en crecer el gremio o en repetir la mejor jugada.

### Economía
| Recurso | Se gana | Se gasta |
| --- | --- | --- |
| Nutrientes | Tronco: +2 por uso · árbol vivo: +1 al empezar el mes · Lluvia de esporas · Lycoperdon abona +1 | Tejer 1 · revivir 3 · romper una roca 2 · soplar esporas 1 · Árbol Padre 10 (12 en Ancestral) · en Bosque y Ancestral, el gremio come 1 al terminar cada mes de otoño e invierno |
| Esporas | Árbol vivo: +1 al empezar el mes (en Bosque y Ancestral, nada en invierno) · Lluvia de esporas · Lycoperdon +2 | Reclutar 3, 4, 6 y 7 (sube con cada recluta) · Mensajera 1 · Ganoderma 1 · abonar 2 |

Inicio: 3 miembros (uno de cada especie), 2 nutrientes, 0 esporas. Los troncos son finitos; los árboles vivos son la fuente renovable. Esa tensión es el corazón del juego.

### Tiempo y victoria
- 4 estaciones de 3 meses. La estación cambia el color del follaje.
- **Victoria:** la Amanita despierta al Árbol Padre. Requiere que toque la red, 10 nutrientes y al menos 3 árboles revividos (11 nutrientes en Bosque; 13 nutrientes y 4 árboles en Ancestral, desde el 031 y el 041).
- **Final suave:** si se acaba el invierno, el bosque espera la próxima primavera y se reintenta.

### Narrativa
Tres cartas de intro, una frase cada una: el bosque se apaga; un gremio despierta; lleva la red al Árbol Padre antes del invierno. Una carta a mitad de partida, cuando llega Maestra Bruma. Dos cartas de final. Todo lo demás lo cuenta el mundo: color que vuelve, esporas flotando, el Árbol Padre que se ilumina.

### Dirección de arte
Estilo ilustrado con contorno café, formas redondas y rubor. La luz del mundo avanza con las estaciones, de una mañana de primavera a un anochecer de invierno.

#### Personajes
- **Proporciones:** cuerpo-tallo redondo, sombrero grande (cerca del 55 % de la altura), cara mínima con ojos de punto, rubor y boca pequeña.
- **Contorno:** café oscuro, nunca negro.
- **Hoja de personaje antes de Blender:** frente, perfil, ¾ de espalda, paleta y escala, con el formato de la ficha de Mushie.

Cada especie se reconoce por su silueta, sin depender del color: domo bajo, embudo, domo alto con falda, campana pequeña y cono alto.

| Especie | Silueta | Color | Accesorio | Rasgo especial |
| --- | --- | --- | --- | --- |
| Champiñón "Bruno" | Domo bajo y ancho | Café claro | Canasta | — |
| *Lactarius indigo* "Indi" | Embudo poco profundo con anillos concéntricos | Índigo, láminas azules | Carrete de hilo índigo | Suelta gotitas de látex azul; el micelio que teje brilla con destellos índigo |
| *Amanita muscaria* "Rubí" | Domo alto con verrugas y falda en el tallo | Rojo y crema | Bolso con hojas que curan | — |
| *Gliophorus psittacinus* "Chispa" | Campana pequeña, viscosa y brillante | Verde loro que cambia | Saquito de cartas | Cambia de color con la estación: verde, amarillo, naranja, rosa |
| *Morchella esculenta* "Panal" | Huevo alto con alvéolos, sin ala | Miel y café | Pico de ramita y guijarro | Solo llega reclutando |
| *Ganoderma lucidum* "Ámbar" | Repisa ancha de lado, con pie lateral | Laca roja a ámbar | Gotero ámbar | Cura de lejos con un hilo dorado |
| *Lycoperdon perlatum* "Pompón" | Bola de perlitas sin sombrero | Crema a beige | Hoja como abanico | Sopla nubes de esporas |
| *Conocybe arcana* "Maestra Bruma" | Cono alto y puntiagudo, doblado en la punta como sombrero de hechicera; la más alta | Violeta profundo con motas que brillan como estrellas | Bastón de ramita con una espora luminosa | Melena de hilos de micelio; brilla siempre un poco |

*Conocybe* es un género real de sombrero cónico; *arcana* es inventado. La maga es el único personaje fantástico del elenco.

#### Luz por estación
| Estación | Hora | Sensación | Micelio |
| --- | --- | --- | --- |
| Primavera | Mañana | Luz fresca, verdes tiernos | Apenas visible |
| Verano | Mediodía | Dorado, sombras cortas | Sutil |
| Otoño | Atardecer | Naranjas, sombras largas | Se nota |
| Invierno | Anochecer | Azul frío, nieve ligera | Brilla: la red que construiste ilumina el claro |

El invierno es el clímax emocional: cuando la luz se va, la red que tejiste es lo que alumbra. Cada estación usa sus piezas pintadas (pasto, rocas y árboles cambian; decisiones del 010 y del 003, que reemplazan la idea original de una gradación de color). La saturación del progreso (de apagado a color pleno) va encima. La red tiene su propia luz, que crece de primavera a invierno (016).

#### Interfaz
- **Libreta de campo:** paneles de papel crema con bordes suaves, botones y marcos de madera, etiquetas tipo cinta.
- **Tipografía:** Fredoka (display redondeada y gruesa) para títulos y números; Nunito para el resto.
- **Acabado (006):** fondo de papel crema, cintas verdes de título, chips con íconos, tarjetas redondeadas con sombra suave y botón principal amarillo, con *All About Poppy* y *Dine Together* como referentes.
- **Fichas de criatura:** cada especie tiene una ficha con humor, al estilo de las chanterelles ("comestible: sí, si logras atraparla").
- **Intro y finales:** globo de diálogo sobre papel, como en Fablevale.

#### Referencias
| Referencia | Qué tomamos | Qué dejamos |
| --- | --- | --- |
| Mushie, ficha de personaje | Formato de hoja de personaje, proporciones, paleta corta | — |
| Chanterelles (Rihnlin) | Silueta derivada de la especie real, fichas de criatura con humor | Acabado acuarela, difícil desde Blender |
| Hongos en pixel art | Variedad de siluetas para especies futuras | El pixel art |
| Dine Together | Elenco con rasgos coherentes, ambiente cálido | Densidad de escena |
| Fablevale | UI de papel, globo de diálogo, estilo de los ítems | — |
| Kit de UI de madera y papel | Lenguaje de botones, paneles y barras | El kit mismo: solo inspiración |
| Chunky Monsters | Copas estilizadas, contraste figura-fondo, ícono de app | Paleta neón |
| Mood Diary | UI móvil vertical, dock inferior, mapa de camino | — |
| UX Flow core y meta | Documentar el flujo de pantallas para el caso de estudio | Sistemas meta (ligas, tienda diaria): rompen el pilar cozy |

Las referencias son de terceros: guían el estilo, pero no se copian ni se publican con el juego.

### UI y controles
El juego es mobile-first en vertical. El escritorio usa el mismo layout con más aire.

1. **Arriba:** HUD compacto con mes y estación, nutrientes, esporas y árboles vivos.
2. **Centro:** el tablero vertical; cada casilla mide al menos 64 px en un teléfono de 390 px.
3. **Abajo:** dock del gremio al alcance del pulgar, con el botón de terminar el mes.
4. **Bitácora:** un aviso breve sobre el dock, no una lista larga.

Interacción: tocar un miembro resalta las casillas válidas; tocar una casilla ejecuta la acción. Nada depende de hover ni de gestos largos. Una acción inválida explica el motivo en lenguaje claro.

#### Requisitos móviles
- Objetivo principal: 360 a 430 px en vertical. En horizontal, el tablero va a la izquierda y el dock a la derecha.
- Áreas táctiles de 44 px o más; sin zoom por doble toque.
- La página no hace scroll durante la partida: layout a la altura visible del navegador, respetando las áreas seguras del teléfono.
- 60 fps en un Android de gama media; densidad de píxeles limitada a 2×; el juego se pausa al cambiar de pestaña.
- Playtest en un teléfono real con el link de preview de cada pull request.

En escritorio también se juega con teclado: Tab y Enter para elegir, Esc para cancelar.

### Audio
Fuera del slice inicial. Primera iteración: ambiente de bosque nocturno y un tono suave por acción, que arranca tras la primera interacción.

### Balance
Medido por simulación (`tests/balance.test.ts`, 100 claros generados con semillas fijas):

| Escenario | Resultado |
| --- | --- |
| Jugador que sigue las pistas (`playAdvised`) | Gana el 100 % de los claros aceptados, mes medio ≈ 8,9 (entre el 8 y el 11) |
| Bot que juega al azar (1.000 partidas) | Gana ≈ 17 % |

Con las reglas de la prueba de concepto, un jugador atento ganaba hacia el mes 5–7 y el playtest lo confirmó: se sentía demasiado fácil. Desde el cambio 006 el Árbol Padre pide 3 árboles revividos y 10 nutrientes, cada tronco da +2 y el generador descarta claros regalados.

Palancas de ajuste: coste de tejer, ganancia por tronco, número de troncos, meses totales y nutriente mensual por árbol.

### Niveles (019)
Una vez aprendido, Brote ya no era un reto. «Nueva partida» abre «Elige tu claro» con tres niveles; nada quita los árboles vivos y solo la plaga de Ancestral quita red (desde el 030, en Bosque y Ancestral el gremio come en otoño e invierno):

| | Brote | Bosque | Ancestral |
| --- | --- | --- | --- |
| Rocas | 6 | 9 | 11 |
| Escarcha (tejer cuesta 2) | — | otoño | otoño e invierno |
| Árbol que se apaga al final del mes | — | 6 | 3, 5, 7, 9 y 11 |
| El gremio come 1 nutriente al terminar el mes | — | otoño e invierno | otoño e invierno |
| Los árboles no dan esporas | — | invierno | invierno |
| Plaga (una casilla tejida por estación) | — | — | otoño e invierno |
| Árboles revividos que pide el Árbol Padre | 3 | 3 | 4 |
| Nutrientes del Árbol Padre | 10 | 11 | 13 |
| Pistas (★) | sí | sí | no |
| Puntaje | ×1 | ×1,5 | ×2 |

- **Árbol que se apaga:** al empezar ese mes, el árbol gris más lejano de la red se cubre de escarcha; si nadie lo revive ese mes, se apaga y revivirlo cuesta 7 nutrientes en vez de 3.
- **Temporadas frías (028, 030):** al empezar el otoño, una carta («Llega el frío») avisa que al terminar cada mes el gremio come 1 nutriente, después de lo que dan los árboles; si no hay, el primero en llegar al gremio descansa el mes siguiente con hambre. En invierno, los árboles solo dan nutrientes; la Lluvia de esporas sigue dando esporas. Una primera versión (cada hongo come en otoño e invierno) dejaba el juego casi imposible: 1 % de victorias con pistas en Bosque. En el 028 el gremio comía solo en invierno y el Árbol Padre pedía 12; desde el 030 come desde el otoño y el Árbol Padre vuelve a 10.
- **Plaga (032, 035):** en Ancestral, al empezar el otoño y el invierno se marca una casilla tejida, al azar entre las más cercanas al Árbol Padre. Al terminar un mes sin hongos a 2 casillas o menos se marchita: sale de la red y la plaga se queda, sin poder tejerla, hasta que termine un mes con un hongo así de cerca; entonces vuelve a ser tierra y se puede tejer otra vez. La del otoño puede seguir cuando llega la del invierno. Da tensión más que dificultad: las pistas pasaron del 21 % al 22 % sobre los claros del 031. Que se quede (035) las deja en 16 % (antes 17 %), así que mantiene la dificultad del 034.
- **Claros justos:** Bosque y Ancestral son el claro de Brote de la misma semilla con rocas extra, y solo se juegan los que un bot experto con búsqueda puede ganar (tabla precalculada de 1000 semillas por nivel).
- **Medido** (100 claros por nivel): hasta el 027 las pistas ganaban el 83 % en Bosque y el 50 % en Ancestral (la meta para Ancestral era «el jugador con experiencia pierde seguido, ~50 %»). Con el invierno duro (028) ganan el 65 % y el 32 %; los rangos de la prueba bajan a 55–70 % y 20–35 %. Con el gremio comiendo desde el otoño y el Árbol Padre en 10 (030), el 63 % y el 28 %. Con el Árbol Padre de Ancestral en 4 árboles y 12 nutrientes (031), Ancestral baja al 21 % y certifica 905 de 1000 claros (el clásico ya no se gana ahí). Con un árbol que se apaga cada dos meses en Ancestral (034: meses 3, 5, 7, 9 y 11), las pistas ganan el 17 % y se certifican 861 de 1000 claros; el rango de la prueba baja a 10–25 %. Con los hongos nuevos (039) las pistas ganan el 74 % en Bosque y el 28–32 % en Ancestral: el Ganoderma funciona como segundo sanador y encarecerlo casi no cambia nada. Mario eligió ensanchar los rangos a 55–75 % y 10–35 %. La búsqueda gana Ancestral algo más tarde (mes 10,45 frente a 10,0). Con cuatro reclutas (041) los rangos vuelven a 55–70 % y 10–25 %: las rocas solas casi no movían las pistas, así que Bosque pasa a 9 rocas y Árbol Padre de 11 (61 %) y Ancestral a 11 rocas y 13 (21 %, con 77 de 100 claros certificados; el piso baja a 75).
- **Puntaje:** un récord por claro con el total ya multiplicado; las estrellas usan la referencia de Brote, así que en Bosque y Ancestral se consiguen más fácil (premio por el riesgo, a revisar en playtest).

### Puntaje y estrellas (015)
Solo la victoria da puntaje; la derrota sigue siendo suave, sin puntaje ni estrellas.
- **Componentes:** victoria 500 · 80 por mes de sobra · 120 por árbol revivido · reservas (10 por nutriente y 20 por espora) · 60 por cupo libre del gremio (de 7) · 5 por acción (tope 40) · variedad si todas las especies del gremio final actuaron (desde el 039; Maestra Bruma, si llegó, con un hechizo), que crece con las especies reclutables del gremio (041): 150 con ninguna o una, 250 con dos, 350 con tres y 450 con las cuatro · 1 por segundo por debajo de 8:00. Pesos en `config.ts › SCORE`.
- **Estrellas por claro:** el bot con criterio juega cada claro al generarlo (25 s por mes); 2 estrellas desde el 90 % de su puntaje y 3 desde el 110 %.
- **Cronómetro:** cuenta solo el juego activo (se pausa con cualquier hoja o carta) desde la primera acción.
- **Récord local** por claro y `ScoreResult` con el registro de acciones, para rejugar y verificar.
- **Pesos y 25 s por mes** se recalibran con datos de playtest.

### Ranking del gremio (036)
- **Una tabla general** con el mejor total de cada jugador (ya multiplicado por el nivel). Cada `SCORE_VERSION` abre una temporada nueva.
- **Sin cuentas:** el dispositivo guarda una clave anónima y un alias generado («Bruno del Musgo»), que se puede volver a sortear. Desde el 038 también se puede escribir un nombre propio: de 3 a 16 letras y espacios, filtrado con una lista negra compartida por el cliente y el servidor.
- **Verificado:** el servidor (funciones de Vercel + Upstash Redis) rejuega el registro de acciones con las mismas reglas antes de aceptar un puntaje; el tiempo solo se acota.
- **Solo cuentan** las partidas que empiezan desde «Nueva partida». Tras registrarse, las victorias se envían solas; sin conexión, quedan pendientes.
- **Idea para después:** el "claro del día", una semilla por fecha igual para todos, con su propia tabla.

### Ideas del referente visual (sin decidir)
El referente "Bosque pintado" muestra sistemas que el vertical slice no tiene: misiones con recompensas, estrellas como moneda, enciclopedia del bosque (hongos, plantas, aliados, lugares), logros y potenciadores con cargas (martillo, cambio, bolsa). El cambio 011 solo tomó su lenguaje visual. Si alguno entra al juego, necesita su propio cambio de OpenSpec con reglas y balance.

## Supuestos y riesgos

El mayor riesgo no es técnico: es que la regla de adyacencia no se entienda sin explicación. Se valida con personas antes de invertir en arte.

| Supuesto o riesgo | Cómo se valida | Si falla |
| --- | --- | --- |
| La regla "solo actúas junto a la red" se entiende sola | Playtest con 3 personas; observar el primer minuto sin ayudar | Resaltar la red al inicio y añadir una pista contextual |
| Los créditos alcanzan antes del 5 de noviembre | Una tarea pequeña por sesión, con criterio de aceptación | Recortar audio y animaciones; proteger el loop jugable |
| Los sprites de Blender se leen bien a 44 px | Render de prueba de un solo personaje antes de producir los tres | Volver a SVG para personajes; Blender solo para escenario |
| Claude Code en la nube no ve ni juega el juego | Tests de reglas en Node y capturas automáticas con navegador sin interfaz | Tú haces el playtest manual al cerrar cada tarea |
| El balance se rompe al agregar contenido | La simulación queda como test de regresión: bot al azar ≥ 20 % de victorias, partida guiada gana antes del mes 9 | Ajustar las palancas del GDD, no reescribir reglas |
| Un mapa fijo no invita a repetir | Resuelto en 006: cada partida es un claro aleatorio y justo | Ajustar `MAP_GEN` (árboles, troncos, rocas, meses) |
| La página pesa demasiado para el portafolio | Presupuesto de assets ≤ 4 MB (desde el 2 de noviembre; antes 2 MB), carga diferida de portada, intro y victoria, y carga < 3 s | Comprimir sprites o bajar resolución |

## Decisiones técnicas

Fase 1 se construye con Phaser y TypeScript en Claude Code en la nube, guiada por OpenSpec. Los gráficos se producen en Blender en tu computador y entran al repo como sprites.

### Metodología: SDD, adaptado al desarrollo de juegos
SDD sirve aquí, pero no puro. En un juego hay dos tipos de trabajo y cada uno pide un método distinto:

| Tipo de trabajo | Método | Por qué |
| --- | --- | --- |
| Reglas, economía, estados, UI | SDD con OpenSpec | Son verificables: cada regla se vuelve un escenario y un test |
| Sensación (animación, ritmo, "juiciness") | Prototipo y playtest | La diversión se descubre jugando; no se puede especificar de antemano |

En la práctica: la spec define el qué y los criterios; el playtest decide el cómo se siente. Cada sesión de Claude Code implementa un solo cambio de OpenSpec, pequeño y con tests. La spec no busca predecir la diversión; busca que la IA no rompa lo que ya funciona.

### Motor: por qué web con Phaser y no Unity
| Criterio | Phaser (web, TypeScript) | Unity |
| --- | --- | --- |
| Trabajo con agentes de IA | Todo es código de texto; el agente lee, escribe y prueba todo | Escenas y prefabs viven en el editor; el agente trabaja a ciegas |
| Claude Code en la nube | Corre completo: instala, compila, prueba y toma capturas | Requiere el editor y su licencia; no corre en el contenedor |
| Portafolio | Un link que abre al instante | Exporte WebGL que suele ser pesado y lento de cargar |
| Ajuste al juego | Por turnos, 2D, cuadrícula: Phaser sobra | Su fuerza (3D, física, consolas) no se usa |
| Curva para ti | JavaScript/TypeScript, cerca de lo que ya haces en front-end | C# y el editor de Unity: otra disciplina |

Unity sería la opción correcta para un juego 3D, con física o para consolas. Godot es el término medio si algún día quieres un editor: es gratuito y sus escenas son archivos de texto que la IA puede editar.

**Phaser frente a Kaplay:** Kaplay es más simple y brilla en juegos arcade pequeños. Phaser es más maduro y trae lo que este juego necesita: escenas, tweens, partículas, atlas de sprites (para los renders de Blender) y audio. Además tiene mucha más documentación y ejemplos, así que Claude lo escribe con menos errores.

### Arte: sí a Blender, en tu computador
Blender MCP corre en tu máquina, así que el arte se hace en una sesión local y el código en la nube. El repo de GitHub es el punto de encuentro.

1. Modelar los tres hongos en low-poly con shader toon y cámara ortográfica.
2. Renderizar PNG con fondo transparente, a 2× del tamaño en pantalla (unos 128 px por personaje).
3. Validar un personaje primero (riesgo de legibilidad), luego producir el resto y las poses.
4. Empacar en un atlas de sprites y subir a `assets/` en el repo.
5. Claude Code en la nube los integra en Phaser.

El escenario (tierra, micelio, troncos) puede seguir en vectores o shaders simples: Blender se reserva para lo que más luce, los personajes y el Árbol Padre.

### Flujo de trabajo en Claude Code en la nube
1. Crear un repo en GitHub con `CLAUDE.md`, la carpeta `openspec/` y las reglas de la prueba de concepto.
2. Abrir una sesión en Claude Code apuntando al repo.
3. Pedir que implemente un cambio de OpenSpec: primero el plan, luego el código y los tests.
4. Claude abre un pull request; tú juegas la versión, comentas y apruebas.
5. Una sesión por cambio. Las sesiones largas y sin rumbo son las que más créditos consumen.

```
 Tu computador                    Repo en GitHub                 Claude Code en la nube
┌──────────────┐                ┌─────────────────┐   spec     ┌──────────────────┐
│ Blender MCP  │                │ openspec/       │──────────▶ │ Lee el cambio    │
│      ↓       │   sprites      │ CLAUDE.md       │            │      ↓           │
│ Sprites y    │──────────────▶ │ src/ · assets/  │            │ Código + tests   │
│ atlas        │                └─────────────────┘            │      ↓           │
└──────────────┘                        ▲                      │ Pull request     │
                                        │ aprueba y fusiona    └────────┬─────────┘
                                 ┌──────┴──────┐                        │
                                 │ Tu playtest │ ◀──────────────────────┘
                                 └─────────────┘
```

Nada pasa a la rama principal sin que hayas jugado la versión del pull request.
