# Dirección de arte · v2 «Bosque pintado»

Un claro de bosque pintado a mano que **abraza** la pantalla: follaje, flores y hongos en los bordes, materiales de **madera y pergamino** para la interfaz, y la **luz** como medida del progreso (el claro pasa de gris y lila a verde y dorado). Mobile-first en vertical.

- **Fuente visual:** la propuesta [`docs/concept/propuesta-visual-v1.webp`](concept/propuesta-visual-v1.webp) (pantallas) y las hojas de piezas en [`assets/ui/source/`](../assets/ui/source/), todas de Mario (2 de noviembre). Son arte propio del proyecto, no referencias de terceros.
- **Recortes:** las piezas de las seis hojas (v1, UI v2, tablero HD, tablero por estaciones, tablero v3, logo y fondos) están en `public/assets/` según la [organización de assets](#organización-de-assets): 119 archivos, 2.2 MB, con transparencia. Sirven como **placeholders**: la mayoría está por debajo de 2× y algunas traen texto horneado (ver [Inventario](#inventario-de-piezas)).
- **Estado del juego:** hasta integrar estas piezas, el juego usa el bosque ilustrado procedural del cambio 008 (Canvas2D + SVG + shader). Esta dirección lo reemplaza pieza por pieza; lo que se conserva del 008 está en [Qué se conserva](#qué-se-conserva-del-008).

## Principios
1. **El bosque enmarca, el tablero manda.** Los bordes van cargados (follaje, flores, hongos); el centro se mantiene limpio y legible. Nada decorativo invade una casilla ni un control.
2. **Dos materiales, siempre los mismos.** Madera para lo que se toca y señala (letreros, botones redondos, marcos); pergamino para lo que se lee (hojas, pistas, fichas). Botón principal: pastilla amarilla.
3. **Relieve suave, contorno café.** Cada pieza tiene volumen pintado (luz arriba a la izquierda, sombra abajo), contorno café oscuro de grosor constante (nunca negro) y una sombra sólida corta.
4. **La luz es el progreso.** Gris y lila al inicio; verde vivo al revivir; dorado al despertar al Árbol Ancestral. La red de micelio es luz dorada que corre por el suelo.
5. **Los personajes son la marca.** Aparecen grandes en portada, fichas y "El gremio", y siempre a la vista en el dock.

## Paleta v2
Medida sobre la hoja de piezas (color dominante de cada material). Los tokens nuevos se agregan a `src/theme.ts` al implementar; los del 006/008 que no aparecen aquí se retiran entonces.

| Token | Hex | Material / uso |
| --- | --- | --- |
| Pergamino | `#FBE7C2` | Hojas, pistas, fichas |
| Pergamino sombra | `#EBCB8E` | Bordes y dobleces del pergamino |
| Crema botón | `#FCE6C3` | Botón secundario, placas de nombre |
| Sol | `#FCB800` | Botón principal, ★, iconos de acento |
| Sol profundo | `#F39A0B` | Borde inferior del botón principal |
| Madera | `#B4621C` | Letreros, botones redondos |
| Madera oscura | `#6B3A14` | Vetas, bordes de madera |
| Raíz | `#C8782A` | Marco del tablero |
| Tinta | `#3A1F0E` | Contornos y texto (nunca negro) |
| Pasto | `#A9B21A` | Casillas |
| Pasto claro | `#C9C33A` | Luz de las casillas |
| Pasto sombra | `#6F8A1E` | Juntas y sombra de casillas |
| Micelio | `#FFE27A` | Red: grietas de luz dorada en el suelo |
| Válida | `#E6E84A` | Brillo de casilla válida |
| Selección | `#6EF0D8` | Brillo de casilla seleccionada y del Hogar |
| Hoja viva | `#B9D23A` | Copas revividas |
| Gris dormido | `#A99C92` | Copas y troncos dormidos |
| Oro | `#FFD21A` | Árbol Ancestral despierto, destellos |
| Lila | `#A994AE` | Bosque apagado (intro, fin del invierno) |
| Hongo naranja | `#F2902A` | Sombrero de la casa-hongo, flores |

Contraste mínimo de texto: Tinta sobre Pergamino, Crema o Sol (todos ≥ 7:1). Nunca texto blanco sobre Sol.

## Tipografía
- **Logo:** lettering ilustrado en madera (`ui/hud/logo.webp`, `ui/hud/logo-small.webp`). Es imagen, no fuente; su nombre accesible es el título del juego.
- **Títulos, botones y números:** Fredoka 600–700, redondeada y gruesa. Títulos de hoja 22 px; nombres en tarjetas 14–15 px; números del HUD 17 px.
- **Texto:** Nunito 600–700, 13–15 px. Mínimo 12 px; las etiquetas pequeñas del HUD no bajan de 10 px.
- **Nada de texto horneado en imágenes**, salvo el logo. Todo texto visible vive en `src/copy/es.ts`: los nombres de los reclutas cambian (Pluma, Trina…), la bitácora cambia, y el texto horneado no se lee con lector de pantalla.

## Componentes
| Componente | Pieza | Estados / notas |
| --- | --- | --- |
| Logo | `ui/hud/logo`, `ui/hud/logo-small` | Solo en la portada (decisión del 011: no va en el HUD de la partida) |
| Letrero colgante | `ui/panels/sign` | Títulos de hoja ("El gremio", "Ranking"); 3 partes para estirarse |
| Pergamino | `ui/panels/parchment` | Cuerpo de las hojas y cartas; 9 partes (esquinas fijas, centro repetible) |
| Bitácora | CSS + `ui/icons/book` | Pergamino con el libro de campo a la izquierda y texto en vivo (011) |
| Botón principal | `ui/buttons/primary` | Pastilla amarilla con ícono: normal, pulsado (baja 2 px y pierde la sombra) y desactivado (60 % de opacidad) |
| Botón secundario | `ui/buttons/secondary` | Pastilla crema con ícono a la izquierda |
| Botón redondo | `ui/buttons/prev`, `-siguiente`, `-cerrar`, `-ayuda` | 44 × 44 mínimo; madera con contorno |
| Paginación | `ui/buttons/page-dots` | 5 puntos del carrusel "Cómo jugar" (sin uso desde el 048, que lo reemplazó por el tutorial); el activo en Sol |
| Medallón del gremio | CSS + `characters/<personaje>/portrait` | Dock (011): aro de madera con el retrato, cinta con el nombre e insignia (★ sugerido, Zz descansa); seleccionado con aro Sol y halo; descansando desaturado. La acción se lee en la bitácora |
| Pastilla de recurso | CSS + `ui/icons/nutrients`, `spores`, `trees` | Crema con contorno café: ícono + número arriba y etiqueta abajo (HUD, 011). El mes va en una pastilla verde con el ícono de la estación |
| Fin del mes | CSS + `ui/icons/moon` | Píldora amarilla con la luna, a la derecha del dock (011) |
| Fondo de la partida y portada | `backgrounds/menu`, `menu-landscape` | Claro con camino, montaña y hongos (hoja `fondo-claro-v2`, 2 de noviembre): completo en apaisado y corte vertical centrado en el teléfono, con un velo arriba y abajo |
| Íconos | `ui/icons/*` | Pintados, con contorno café |
| Marco de bosque | `ui/frames/forest` | Envuelve todas las pantallas; 9 partes |
| Marco de raíces | `ui/frames/roots-pieces` | Envuelve el tablero; 9 partes |

## Tablero
- **Casillas con relieve:** cada casilla es una losa de pasto con borde redondeado y sombra; en primavera y verano se alternan `grass`, `grass-b` y `grass-c` (variación por hash de la casilla, como en el 008); en otoño `grass-autumn` y en invierno `grass-winter`. Implementado en el 010 (`src/scenes/paint.ts`, tabla `BOARD_ART` de `theme.ts`).
- **Red de micelio:** `board/mycelium/net`/`-b`: grietas de luz dorada sobre el pasto, una casilla entera por casilla de la red (decisión del 010: tile completo, no conectores). **Cambio respecto del 008:** el micelio pasa de verde menta a dorado; el turquesa queda para la selección y el Hogar.
- **Estados:** válida = brillo amarillo; seleccionada / Hogar = brillo turquesa; sugerida = ★ (`ui/icons/star`, en uso) sobre la casilla. Se implementan como **capas** encima de la casilla, no como casillas distintas. `state-valid` y `state-selected` traen el pasto horneado, así que no sirven de capa sobre un objeto: hasta tener la capa transparente, el brillo de casilla válida es el trazo vectorial del 008.
- **Objetos:** `board/trees/grey` (dormido) → `board/trees/waking` cuando la red lo alcanza → `alive` al revivir (`autumn` y `winter` en esas estaciones); `board/logs/log` → `board/logs/log-used` tras el primer uso; `board/rocks/rock` (`rock-winter` en invierno); `board/terrain/home` es la casilla del Hogar (con alguien encima queda la red). `board/terrain/sprout` para la tierra creada por el Brote arcano queda pendiente.
- **Árbol Ancestral:** se dibuja grande (`board/father-tree/asleep-painted` / `awake-painted`, desde el 010) y **sobresale por encima del tablero**, saliendo de su casilla en la fila superior. La regla no cambia: sigue siendo una casilla del tablero; solo su dibujo desborda. Las raíces bajan hacia la casilla.
- **Casilla ocupada (se mantiene del 008):** si un hongo trabajó este mes en una casilla, su retrato la ocupa y el objeto de abajo no se pinta.
- **Árbol marcado y apagado (019):** sin pieza nueva. Un velo de escarcha del token `frost` (`#CFE8F5`) sobre la casilla del árbol gris: el marcado lleva además un contorno punteado de tinta y un copo chico, y late suave (alfa 0,35–0,6 cada 1,6 s; fijo en 0,5 con movimiento reducido); el apagado lleva el velo fijo y un copo con contorno en la esquina superior. La pastilla del mes muestra un copo `frost` junto a la estación mientras hay escarcha.
- **Casilla con plaga (032, 033, 035, Ancestral):** la casilla tejida marcada se pinta con `board/plague/blight` (`blight-winter` en invierno) en vez de la red: bordes de podredumbre violeta con manchas y garras de hilo seco, y el centro crema con los hilos dorados todavía vivos. Pierde la luz de la red y lleva el contorno punteado que late, como el árbol marcado. Al marchitarse, la plaga viva se funde sobre `board/plague/withered` (la red muerta), que se queda con el mismo contorno hasta que un hongo la limpie; entonces vuelve el pasto (035). Mientras hay una casilla con plaga, tejida o marchita, la pastilla del mes muestra `ui/icons/plague` (una hoja podrida) junto a la estación. Si una pieza no carga, se dibuja un velo del token `blight` (`#7E5A86`) con tres manchas de corteza ([piezas](#piezas-de-la-plaga-032)).
- **Árbol suelto (043, 044, Bosque y Ancestral):** el árbol vivo conserva su pieza y su color, y lleva encima la insignia `board/trees/loose-badge` (160 × 160, fuente `assets/ui/source/insignia-suelto.webp`) en la esquina superior derecha, a 0,42 de la casilla: un disco de pergamino con un hilo de micelio dorado y vivo a la izquierda, gris y seco a la derecha, y un hueco con astillas en el medio. Una sola pieza para las cuatro estaciones; va sobre la saturación del claro, así que siempre se ve a color. Se descartaron el árbol desaturado (se confundía con el gris dormido), la placa con una barra (parecía «prohibido») y la raíz cortada pintada en el árbol (no se lee a 56–64 px). La carta «Un árbol suelto» la muestra a 80 px. Si no carga, un disco de papel con dos trazos de corteza separados.
- **Red cortada y frenar la plaga (045):** sin piezas nuevas. La red que ya no llega al Hogar pierde el color (modo «saturation» con `neutral` 0,9 y un velo `ink` 0,12) y su luz; el árbol suelto conserva su color y su insignia, sin luz. Al seleccionar un hongo, sus casillas válidas a 2 o menos de una plaga llevan un escudo de hoja vectorial (`leaf`, contorno `ink`, nervio `paper`) en la esquina superior izquierda. «Ver el mes» usa los íconos de `ui/icons` (plaga, nutrientes, esporas, estaciones, estrella) y la insignia del árbol suelto.
- **Marco:** raíces trenzadas con hojas (`ui/frames/roots`, como `border-image` de 12 px por lado, en uso), y el marco de bosque alrededor de la pantalla (pendiente).

## Pantallas (390 × 844)
- **Elige tu dificultad (019):** tres tarjetas de pergamino como las filas de «El gremio» (≥ 76 px de alto), con el nombre del nivel en Fredoka musgo, una línea de qué cambia y el multiplicador en una pastilla Sol. Bosque tiñe el degradé con pradera y Ancestral con escarcha. Capturas en `docs/screenshots/019-*`.
```
JUEGO                          PORTADA                        CÓMO JUGAR (carrusel de 5)
┌────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐
│[logo] [Mes][🍃][✳][🌳][?]│     │      [   LOGO   ]      │     │ (letrero) Cómo jugar  × │
│      (Árbol Ancestral)      │     │  Indi Bruno Rubí Chispa│     │ pergamino:              │
│  ┌ marco de raíces ┐    │     │        Bruma           │     │ ① Elige un miembro      │
│  │ tablero 5 × 8    │   │     │ [▶ Nueva partida ]     │     │ ② Toca junto a la red   │
│  │                  │   │     │ [📖 Cómo jugar   ]     │     │ ③ Cada especie, 1 acción│
│  └──────────────────┘   │     │ [🍄 El gremio    ]     │     │ ④ Cada mes, esporas     │
│ (cinta) Pista del mes…  │     │ [⚙ Opciones     ]     │     │ ⑤ Despierta al Árbol    │
│ [Indi][Bruno][Rubí]…    │     │  (marco de bosque)     │     │   ● ○ ○ ○ ○        [›]  │
│ [ ☾  Fin del mes     ]  │     └────────────────────────┘     └────────────────────────┘
└────────────────────────┘
FICHA                          EL GREMIO                      INTRO / VICTORIA
┌────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐
│ ×   (retrato grande)    │     │ (letrero) El gremio   × │     │  fondo pintado          │
│       Bruno             │     │ [retrato] Indi·Tejedor ›│     │  (letrero) título       │
│ Agaricus · Descompositor│     │ [retrato] Bruno·…      ›│     │  pergamino: texto       │
│ contexto · «frase»      │     │ [retrato] Rubí·…       ›│     │  [Mes][Árboles]…        │
│ [Habilidad] [Movimiento]│     │ [retrato] Chispa·…     ›│     │  [Ver resumen][Jugar ↻] │
│ [Nutrientes]            │     │ [retrato] Bruma·…      ›│     │  (marco de bosque)      │
└────────────────────────┘     └────────────────────────┘     └────────────────────────┘
```
- **Juego:** HUD con logo mini, pastilla del mes y estación, tres pastillas de recurso y ayuda redonda. Árbol Ancestral grande sobre el tablero. Bitácora con la cinta "Pista del mes". Dock con tarjetas verticales y "Fin del mes" como pastilla amarilla a todo lo ancho, con ícono de luna.
  - **Pendiente de decidir:** el dock más alto y el logo restan alto al tablero. A 390 × 664 las casillas bajarían de 56 a unos 48 px (el mínimo de la spec es 56). Opciones: aceptar 48 en ese tamaño, ocultar el logo por debajo de 700 px de alto, o tarjetas más bajas.
- **Portada (012, hecho):** logo y menú sobre el claro (los personajes se sacaron en el 018 para dejarla más limpia): Nueva partida (pastilla amarilla con ▶), Cómo jugar y El gremio (madera). "Opciones" se sacó hasta que haya algo que ajustar. En apaisado, logo a la izquierda y menú a la derecha.
- **Cómo jugar (012, reemplazado en el 048):** carrusel de 5 pasos en pergamino, cada uno con una ilustración de piezas publicadas, ‹ › (`ui/buttons/prev`, `next`), puntos y deslizar. Desde el 048 lo reemplaza el tutorial jugable (la portada lo empieza) y el "?" de la partida abre directo la Libreta de campo; `prev` sigue como flecha de «Volver».
- **Ficha:** retrato grande, nombre, nombre científico y rol, contexto, frase entre comillas y secciones con etiqueta verde (Habilidad, Movimiento, Nutrientes…), como la ficha actual.
- **El gremio (012, hecho):** lista de las cinco especies, cada fila con su medallón, nombre, rol y una línea; abre la ficha encima.
- **Intro (003, hecho):** fondo `backgrounds/intro` (hoja `fondo-intro-v2`: camino del bosque al atardecer lila, con hongos de colores), tres cartas de pergamino con letrero de madera ("El bosque se apaga", "Un gremio despierta", "Antes del invierno"), puntos de progreso, "Saltar" y "Siguiente"/"Comenzar". La llegada de Maestra Bruma usa la misma carta con su retrato.
- **Victoria (003, hecho):** fondo `backgrounds/victory`, letrero "¡El bosque despertó!", texto y resumen (mes, árboles, nutrientes, esporas); "Ver el claro" y "Jugar de nuevo" ("Ver resumen" se descartó: el resumen ya está en la carta). El fin del invierno usa el mismo layout con `backgrounds/intro`. En apaisado, el intro usa `intro-landscape` (la misma hoja completa, 16:9); la victoria usa `victory-landscape` (hoja `fondo-victoria-v2`: Árbol Ancestral dorado en el claro) con la carta a un costado para que el árbol se vea entero.

## Personajes
- Cuerpo-tallo redondo, sombrero ≈ 55 % de la altura, cara mínima (ojos de punto, rubor, boca pequeña).
- Contorno café oscuro (`--ink`), nunca negro. Grosor constante.
- Cada especie se reconoce por **silueta**, no solo por color:

| Especie (nombre) | Rol | Silueta | Color | Accesorio | Rasgo especial |
| --- | --- | --- | --- | --- | --- |
| Champiñón ("Bruno") | Descompositor | Domo bajo y ancho | Café claro | Canasta | — |
| *Lactarius indigo* ("Indi") | Tejedor | Embudo poco profundo con anillos concéntricos | Índigo, láminas azules | Carrete de hilo índigo | Gotitas de látex azul; el micelio que teje tiene destellos índigo |
| *Amanita muscaria* ("Rubí") | Sanadora | Domo alto con verrugas y falda en el tallo | Rojo y crema | Bolso con hojas que curan | — |
| *Gliophorus psittacinus* ("Chispa") | Mensajera | Campana pequeña, viscosa y brillante | Verde loro | Saquito de cartas | Cambia de color con la estación: verde, amarillo, naranja, rosa |
| *Morchella esculenta* ("Panal") | Rompe-rocas | Huevo alto, sin ala, con alvéolos que rompen el contorno en bultitos | Crestas miel, alvéolos café | Pico de ramita y guijarro | Solo llega reclutando (039) |
| *Ganoderma lucidum* ("Ámbar") | Boticaria | Repisa ancha y baja en forma de riñón, de lado, con pie lateral: el único sombrero asimétrico | Laca roja a ámbar, borde crema, muy brillante | Gotero de vidrio ámbar | Cura de lejos con un hilo dorado (en el juego, un efecto) · solo reclutando (039) |
| *Lycoperdon perlatum* ("Pompón") | Soplador | Bola en forma de pera sin sombrero, cubierta de perlitas | Crema que se entibia a beige | Hoja como abanico | Suelta una nube de esporas por el poro de arriba · solo reclutando (039) |
| *Conocybe arcana* ("Maestra Bruma") | Maga | Cono alto con la punta doblada en rizo, como sombrero de hechicera; túnica larga; la más alta | Sombrero rojo amanita que degrada a blanco, punta naranja; túnica color tallo; motas doradas que brillan como estrellas | Bastón de ramita con una espora luminosa | Cabello rubio de hilos de micelio; brilla siempre un poco |

Prueba de silueta: domo bajo, embudo, domo alto con falda, campana pequeña, huevo alveolado, repisa de lado, bola de perlitas y cono alto deben distinguirse en negro sobre blanco a 56 px.
*Conocybe* es un género real de sombrero cónico; *arcana* es inventado: la maga es el único personaje fantástico.

- Antes de Blender: una hoja de personaje por especie (frente, perfil, ¾ espalda, paleta, escala), formato de `references/mushie-character-sheet.jpg`.
- Tamaño en pantalla: ~56 px de alto en un teléfono de 390 px. Render a 2× (≈ 128 px).

### Una sola familia: retratos pintados (decisión del 010)
- **Retratos pintados** (`characters/<personaje>/portrait`, sin placa) en todas partes: tablero, dock, fichas y "El gremio". Chispa lleva en la interfaz su corona de la estación (`frame-<estación>`); en el tablero, su retrato.
- La pose ya no cambia de imagen: "feliz" (seleccionado o sugerido) es un pequeño salto en CSS (`data-pose`), y "trabajando" es estar sobre la casilla.
- Los sprites de Blender (`rest`, `work`, `happy`) salieron de `public/assets/` y quedan como fuente en `assets/sprites/webp/`.

## Luz por estación
**Decisión del 010:** cada estación usa sus **variantes pintadas** donde existen (pasto, rocas, árboles vivos) y la pieza de primavera donde no. Reemplaza el principio anterior de "un solo juego de assets + gradación". Personajes y UI no cambian, salvo Chispa (corona de la estación). **Decisión del 003:** la gradación de color de la tabla se descartó; queda como referencia del ánimo de cada estación para futuras piezas pintadas.

| Estación | Meses | Hora | Gradación | Micelio |
| --- | --- | --- | --- | --- |
| Primavera | 1–3 | Mañana | Fresca, verdes tiernos | Apenas visible |
| Verano | 4–6 | Mediodía | Dorada, sombras cortas | Sutil |
| Otoño | 7–9 | Atardecer | Naranja, sombras largas | Se nota |
| Invierno | 10–12 | Anochecer | Azul frío, nieve ligera | Brilla y alumbra el claro |

La saturación del progreso (003, hecho) va de apagado (40 % de color) a color pleno según los árboles revividos; solo afecta al claro pintado.

**Luz de la red (016, hecho):** la columna Micelio se cumple con una capa aditiva propia, encima del claro y debajo del Árbol Ancestral y los retratos, que no recibe la saturación. Intensidad 0,2 / 0,4 / 0,65 / 1,0 (`theme.ts` › `MYCELIUM_GLOW`), con 600 ms de transición entre estaciones. Sobre árboles, troncos y la casa la luz los rodea sin taparlos. El fondo vivo no se oscurece en invierno (pregunta abierta del 016).
- Íconos de estación: `ui/icons/season-spring` (flor rosa), `-verano` (flor amarilla), `-otono` (hoja naranja), `-invierno` (copo). Van en la pastilla del mes.

## Movimiento (004)
- **Cada jugada responde en ≤ 400 ms**, encima del estado ya pintado: tejer = el pasto se desvanece y un hilo dorado crece desde la red; descomponer = el tronco se encoge con astillas; revivir = estallido de hojas y luz; despertar = anillo de luz y halo que late detrás del Árbol Ancestral.
- **Esporas al contador** al empezar el mes (una por árbol vivo, hasta 12) y saltito del contador.
- **Motas** de luz sobre los árboles vivos, como máximo 40 partículas en pantalla; una sola textura de punto con mezcla aditiva, sin desenfoques por cuadro.
- **Movimiento reducido:** nada se mueve; solo el estado final y el halo quieto.

## Producción y entrega
- **Escala:** todo a **2× del tamaño en pantalla** a 390 px de ancho (columna "Objetivo 2×" del inventario). Los fondos se pintan en **vertical** (860 × 1860) con una zona segura central para el tablero o el pergamino.
- **Formato:** WebP con transparencia (calidad 85–90); PNG solo como fuente. Fuente en `assets/` (Blender, renders, `assets/ui/source/`), publicado en `public/assets/` según la [organización de assets](#organización-de-assets), con nombres en inglés, minúscula y guiones: `<pieza>[-variante][-estado].webp`.
- **Piezas estirables:** marcos, pergamino, letrero, cinta y botones se entregan **en partes** (9 o 3 partes, con márgenes indicados) para que se estiren sin deformarse. Se usan con `border-image` o como capas.
- **Estados por separado:** los brillos de casilla válida y seleccionada, y la ★, van como capas transparentes del mismo tamaño que la casilla.
- **Sin texto horneado** (salvo el logo).
- **Presupuesto:** `public/assets/` ≤ **4 MB** (decisión del 2 de noviembre; antes 2 MB). Hoy hay 2.95 MB (con las piezas de la plaga, 033). El JavaScript del juego no cuenta en este límite. Los fondos y piezas de portada, intro y victoria se cargan de forma diferida, cuando se muestra esa pantalla; la primera carga solo trae lo del tablero, los personajes y el HUD.
- **Estaciones (010):** variantes pintadas por estación, sin gradación de color (descartada en el 003).
- **Luz de la red (016):** capa aditiva del micelio que crece con la estación; en invierno es lo más brillante del tablero.

## Organización de assets
Lo que se publica vive en `public/assets/` (WebP). La fuente (Blender, renders a tamaño completo, hojas originales) vive en `assets/`; las hojas pintadas están en `assets/ui/source/`. Nombres en inglés, minúscula y guiones, como el código.

```
public/assets/
├── backgrounds/        menu, intro, victory (verticales) · menu-landscape, intro-landscape,
│                       victory-landscape (16:9) · menu-wide (panorámica ≈ 5,4:1)
├── board/
│   ├── terrain/        grass, grass-b, grass-c, grass-autumn, grass-winter, dirt, sprout, sprout-seedling,
│   │                   blocked, home, state-valid, state-selected
│   ├── trees/          grey, waking, alive, autumn, winter
│   ├── logs/           log, log-used, log-rotten
│   ├── rocks/          rock, rock-tile, rock-winter
│   ├── mycelium/       net, net-b, net-dirt · conectores node, straight-h, straight-v, corner, cross, cross-b, burst
│   │                   · trazos thread-a, thread-b, thread-c, sparkles
│   └── father-tree/    asleep-, awake-painted (en uso) · green-, spring-, summer-, autumn-, winter-painted
├── characters/
│   ├── indi/ bruno/ rubi/ maestra-bruma/   portrait (pintado, sin placa)
│   ├── panal/ ambar/ pompon/   portrait (039; reclutas nuevos)
│   └── chispa/         portrait ·
│                       frame-{spring,summer,autumn,winter} (retrato con marco de estación)
├── ui/
│   ├── panels/         parchment, sign, ribbon (sin texto)
│   ├── buttons/        primary, secondary (sin texto), prev, next, close, help, dot, dot-active
│   ├── hud/            logo, logo-small, pill-nutrients, pill-spores, pill-trees
│   ├── icons/          nutrients, spores, trees, calendar, book, gear, play, star, moon, recruit, season-*
│   └── frames/         forest, roots, roots-pieces
└── atlas/              atlas generados (PNG/WebP + JSON de Phaser); no se editan a mano
```
- **Personajes:** la carpeta lleva el nombre del primer miembro de la especie (Indi = *Lactarius indigo*, Bruno = Champiñón, Rubí = *Amanita*, Chispa = *Gliophorus*, Panal = *Morchella*, Ámbar = *Ganoderma*, Pompón = *Lycoperdon*, Maestra Bruma = *Conocybe arcana*); los reclutas de la misma especie usan el mismo arte. `portrait` es el retrato pintado para tablero, dock, fichas y "El gremio"; los sprites de Blender son fuente (`assets/sprites/webp/`).
- **Micelio:** se dibuja con el tile completo `net`/`net-b` (decisión del 010). Los conectores (`straight-h`, `straight-v`, `corner`, `cross`…) sobre `dirt` quedan publicados para un efecto futuro (p. ej. el hilo que se teje); falta la pieza en T.
- **Estaciones:** pasto (`grass-autumn`, `grass-winter`), rocas (`rock-winter`) y árboles (`autumn`, `winter`) cambian por estación (010). El Árbol Ancestral por estación (`spring-`…`winter-painted`) muestra un árbol vivo y verde, que se confunde con "despierto": por ahora el Árbol Ancestral usa solo `asleep-painted` y `awake-painted`.
- **Fondos por orientación:** vertical en el teléfono (`menu`, `intro`, `victory`); en horizontal y escritorio, los 16:9 a pantalla completa (`menu-landscape` en la portada y la partida, `intro-landscape` en la intro, `victory-landscape` en la victoria). La panorámica `menu-wide` solo tiene 310 px de alto: estirada a pantalla completa se ve borrosa, así que solo sirve como franja.
- **Fuera del árbol propuesto:** el Hogar, los estados de casilla y `blocked` van en `board/terrain/`, y los logos y pastillas en `ui/hud/`.
- **Código:** `src/theme.ts` arma las rutas (`assetUrl`, `portraitKey`, `uiPortraitKey`, `CHARACTER_DIR`, `fatherKey`, `BOARD_ART`, y las variables CSS `--art-*` de la interfaz); ningún otro archivo escribe rutas de assets a mano.

## Inventario de piezas
94 archivos publicados, 2.82 MB en total (el 010 sacó los sprites de Blender a `assets/sprites/webp/`). "Listo" significa que el ancho alcanza para 2× a 390 px; los demás sirven para maquetar y hay que reexportarlos. Retirados en la v2 por traer texto horneado o baja resolución: las tarjetas con placa (`card`), `ribbon-hint`, `page-dots` y `rock-dark`.

| Archivo | Origen | Tamaño | Peso | Estado |
| --- | --- | --- | --- | --- |
| `backgrounds/menu-landscape.webp` | fondo-claro-v2 | 1671 × 941 | 406 KB | Listo |
| `backgrounds/victory-landscape.webp` | fondo-victoria-v2 | 1672 × 941 | 407 KB | Listo |
| `backgrounds/menu-wide.webp` | panorámicas | 1670 × 310 | 162 KB | Listo como franja (310 px de alto); para pantalla completa haría falta ≥ 1080 px de alto |
| `backgrounds/intro-landscape.webp` | fondo-intro-v2 | 1672 × 941 | 386 KB | Listo |
| `backgrounds/intro.webp` | fondo-intro-v2 (corte vertical, hacia los hongos) | 527 × 941 | 89 KB | Usable; para 2× a 390 px haría falta ≥ 780 px de ancho |
| `backgrounds/menu.webp` | fondo-claro-v2 (corte vertical) | 527 × 941 | 110 KB | Usable; para 2× a 390 px haría falta ≥ 780 px de ancho |
| `backgrounds/victory.webp` | fondo-victoria-v2 (corte vertical) | 527 × 941 | 119 KB | Usable; para 2× a 390 px haría falta ≥ 780 px de ancho |
| `board/father-tree/asleep-painted.webp` | tablero HD | 590 × 450 | 79 KB | Listo |
| `board/father-tree/autumn-painted.webp` | tablero v3 | 254 × 180 | 28 KB | Baja resolución (objetivo 380 px de ancho) |
| `board/father-tree/awake-painted.webp` | tablero HD | 598 × 456 | 77 KB | Listo |
| `board/father-tree/green-painted.webp` | tablero estaciones | 314 × 247 | 38 KB | Baja resolución (objetivo 380 px de ancho) |
| `board/father-tree/spring-painted.webp` | tablero v3 | 256 × 180 | 29 KB | Baja resolución (objetivo 380 px de ancho) |
| `board/father-tree/summer-painted.webp` | tablero v3 | 249 × 180 | 27 KB | Baja resolución (objetivo 380 px de ancho) |
| `board/father-tree/winter-painted.webp` | tablero v3 | 269 × 184 | 28 KB | Baja resolución (objetivo 380 px de ancho) |
| `board/logs/log-rotten.webp` | tablero estaciones | 144 × 107 | 9 KB | Listo |
| `board/logs/log-used.webp` | tablero HD | 226 × 159 | 16 KB | Listo |
| `board/logs/log.webp` | tablero HD | 229 × 193 | 18 KB | Listo |
| `board/mycelium/burst.webp` | tablero estaciones | 106 × 95 | 7 KB | Baja resolución (objetivo 140 px de ancho) |
| `board/mycelium/corner.webp` | tablero estaciones | 118 × 91 | 6 KB | Baja resolución (objetivo 140 px de ancho) |
| `board/mycelium/cross-b.webp` | tablero estaciones | 121 × 103 | 7 KB | Baja resolución (objetivo 140 px de ancho) |
| `board/mycelium/cross.webp` | tablero estaciones | 118 × 102 | 7 KB | Baja resolución (objetivo 140 px de ancho) |
| `board/mycelium/net-b.webp` | tablero estaciones | 132 × 126 | 10 KB | Listo |
| `board/mycelium/net-dirt.webp` | tablero estaciones | 124 × 104 | 8 KB | Baja resolución (objetivo 140 px de ancho) |
| `board/mycelium/net.webp` | tablero HD | 226 × 234 | 17 KB | Listo |
| `board/mycelium/node.webp` | tablero estaciones | 112 × 95 | 6 KB | Baja resolución (objetivo 140 px de ancho) |
| `board/mycelium/sparkles.webp` | UI v2 | 62 × 68 | 2 KB | Baja resolución (objetivo 140 px de ancho) |
| `board/mycelium/straight-h.webp` | tablero estaciones | 121 × 69 | 6 KB | Baja resolución (objetivo 140 px de ancho) |
| `board/mycelium/straight-v.webp` | tablero estaciones | 80 × 103 | 5 KB | Baja resolución (objetivo 140 px de ancho) |
| `board/mycelium/thread-a.webp` | UI v2 | 86 × 133 | 4 KB | Baja resolución (objetivo 140 px de ancho) |
| `board/mycelium/thread-b.webp` | UI v2 | 141 × 125 | 7 KB | Listo |
| `board/mycelium/thread-c.webp` | UI v2 | 133 × 118 | 6 KB | Listo |
| `board/rocks/rock-tile.webp` | tablero HD | 219 × 232 | 18 KB | Listo |
| `board/rocks/rock-winter.webp` | tablero estaciones | 124 × 114 | 7 KB | Baja resolución (objetivo 140 px de ancho) |
| `board/rocks/rock.webp` | tablero HD | 249 × 201 | 15 KB | Listo |
| `board/terrain/blocked.webp` | tablero v3 | 156 × 151 | 13 KB | Listo |
| `board/terrain/dirt.webp` | tablero estaciones | 126 × 106 | 8 KB | Listo |
| `board/terrain/grass-autumn.webp` | tablero estaciones | 132 × 126 | 10 KB | Listo |
| `board/terrain/grass-b.webp` | tablero estaciones | 128 × 119 | 9 KB | Listo |
| `board/terrain/grass-c.webp` | tablero estaciones | 130 × 120 | 9 KB | Listo |
| `board/terrain/grass-winter.webp` | tablero estaciones | 129 × 126 | 10 KB | Listo |
| `board/terrain/grass.webp` | tablero HD | 230 × 229 | 20 KB | Listo |
| `board/terrain/home.webp` | tablero HD | 253 × 243 | 21 KB | Listo |
| `board/terrain/sprout-seedling.webp` | tablero v3 | 137 × 152 | 12 KB | Listo |
| `board/terrain/sprout.webp` | tablero HD | 225 × 239 | 21 KB | Listo |
| `board/terrain/state-selected.webp` | tablero HD | 234 × 232 | 18 KB | Listo |
| `board/terrain/state-valid.webp` | tablero HD | 231 × 236 | 16 KB | Listo |
| `board/trees/alive.webp` | tablero HD | 239 × 236 | 21 KB | Listo |
| `board/trees/autumn.webp` | tablero estaciones | 169 × 144 | 11 KB | Listo |
| `board/trees/grey.webp` | tablero HD | 230 × 239 | 19 KB | Listo |
| `board/trees/waking.webp` | tablero estaciones | 164 × 147 | 11 KB | Listo |
| `board/trees/winter.webp` | tablero estaciones | 166 × 147 | 13 KB | Listo |
| `characters/indi/portrait.webp` | UI v2 | 143 × 135 | 9 KB | Listo |
| `characters/bruno/portrait.webp` | UI v2 | 143 × 133 | 7 KB | Listo |
| `characters/chispa/frame-autumn.webp` | UI v2 | 102 × 108 | 7 KB | Baja resolución (objetivo 140 px de ancho) |
| `characters/chispa/frame-spring.webp` | UI v2 | 105 × 111 | 7 KB | Baja resolución (objetivo 140 px de ancho) |
| `characters/chispa/frame-summer.webp` | UI v2 | 103 × 112 | 7 KB | Baja resolución (objetivo 140 px de ancho) |
| `characters/chispa/frame-winter.webp` | UI v2 | 102 × 111 | 7 KB | Baja resolución (objetivo 140 px de ancho) |
| `characters/chispa/portrait.webp` | UI v2 | 116 × 128 | 6 KB | Baja resolución (objetivo 140 px de ancho) |
| `characters/ambar/portrait.webp` | Mario (039) | 280 × 293 | 18 KB | Listo; recortado a mano de la hoja (sin pasto, piedras ni hilo dorado) |
| `characters/panal/portrait.webp` | Mario (039) | 280 × 308 | 16 KB | Listo; recortado a mano de la hoja |
| `characters/pompon/portrait.webp` | Mario (039) | 280 × 308 | 20 KB | Listo; recortado a mano de la hoja |
| `characters/maestra-bruma/portrait.webp` | UI v2 | 119 × 141 | 8 KB | Baja resolución (objetivo 140 px de ancho) |
| `characters/rubi/portrait.webp` | UI v2 | 136 × 133 | 8 KB | Listo |
| `ui/buttons/close.webp` | UI v2 | 57 × 52 | 2 KB | Baja resolución (objetivo 88 px de ancho) |
| `ui/buttons/dot-active.webp` | UI v2 | 19 × 20 | 1 KB | Baja resolución (objetivo 24 px de ancho) |
| `ui/buttons/dot.webp` | UI v2 | 18 × 18 | 1 KB | Baja resolución (objetivo 24 px de ancho) |
| `ui/buttons/help.webp` | UI v2 | 56 × 52 | 2 KB | Baja resolución (objetivo 88 px de ancho) |
| `ui/buttons/next.webp` | UI v2 | 57 × 52 | 2 KB | Baja resolución (objetivo 88 px de ancho) |
| `ui/buttons/prev.webp` | UI v2 | 57 × 52 | 2 KB | Baja resolución (objetivo 88 px de ancho) |
| `ui/buttons/primary.webp` | UI v2 | 189 × 51 | 3 KB | Baja resolución (objetivo 480 px de ancho) |
| `ui/buttons/secondary.webp` | UI v2 | 181 × 51 | 3 KB | Baja resolución (objetivo 480 px de ancho) |
| `ui/frames/forest.webp` | UI v1 | 281 × 255 | 34 KB | Baja resolución (objetivo 400 px de ancho) |
| `ui/frames/roots-pieces.webp` | UI v1 | 186 × 235 | 17 KB | Baja resolución (objetivo 400 px de ancho) |
| `ui/frames/roots.webp` | UI v2 | 205 × 215 | 17 KB | Baja resolución (objetivo 400 px de ancho) |
| `ui/hud/logo-small.webp` | logo y fondos (recorte completo, 018) | 327 × 282 | 40 KB | Listo |
| `ui/hud/logo.webp` | logo y fondos (recorte completo, 018) | 616 × 373 | 89 KB | Listo |
| `ui/hud/pill-nutrients.webp` | UI v2 | 112 × 58 | 3 KB | Baja resolución (objetivo 220 px de ancho) |
| `ui/hud/pill-spores.webp` | UI v2 | 118 × 58 | 3 KB | Baja resolución (objetivo 220 px de ancho) |
| `ui/hud/pill-trees.webp` | UI v2 | 117 × 58 | 3 KB | Baja resolución (objetivo 220 px de ancho) |
| `ui/icons/book.webp` | UI v2 | 54 × 45 | 2 KB | Listo |
| `ui/icons/calendar.webp` | UI v2 | 50 × 48 | 2 KB | Listo |
| `ui/icons/gear.webp` | UI v2 | 55 × 54 | 3 KB | Listo |
| `ui/icons/moon.webp` | UI v2 | 55 × 57 | 2 KB | Listo |
| `ui/icons/nutrients.webp` | UI v2 | 46 × 47 | 2 KB | Listo |
| `ui/icons/play.webp` | UI v2 | 42 × 49 | 2 KB | Baja resolución (objetivo 48 px de ancho) |
| `ui/icons/recruit.webp` | UI v2 | 105 × 71 | 5 KB | Listo |
| `ui/icons/season-autumn.webp` | UI v1 | 50 × 57 | 2 KB | Listo |
| `ui/icons/season-spring.webp` | UI v1 | 51 × 50 | 2 KB | Listo |
| `ui/icons/season-summer.webp` | UI v1 | 45 × 52 | 2 KB | Listo |
| `ui/icons/season-winter.webp` | UI v1 | 48 × 54 | 2 KB | Listo |
| `ui/icons/spores.webp` | UI v2 | 51 × 46 | 2 KB | Listo |
| `ui/icons/star.webp` | UI v2 | 50 × 49 | 2 KB | Listo |
| `ui/icons/trees.webp` | UI v2 | 50 × 54 | 2 KB | Listo |
| `ui/panels/parchment.webp` | UI v2 | 189 × 210 | 12 KB | Baja resolución (objetivo 360 px de ancho) |
| `ui/panels/ribbon.webp` | UI v2 | 178 × 73 | 6 KB | Baja resolución (objetivo 360 px de ancho) |
| `ui/panels/sign.webp` | UI v2 | 180 × 83 | 8 KB | Baja resolución (objetivo 360 px de ancho) |

**Faltan:** fondos verticales a 860 × 1860 (hoy 465 × 631), panorámicas más altas si se quieren a pantalla completa en horizontal, conector de micelio en T, retratos a 280 px para la ficha grande, Chispa `portrait` por estación sin marco el fin del invierno si debe distinguirse de la intro.

### Piezas de la plaga (032)
Entregadas el 5 de noviembre en una hoja (`assets/ui/source/hoja-plaga.webp`) y cortadas en el 033. Tamaños a la escala del tablero HD (`board/mycelium/net` mide 226 × 234).

| Archivo | Uso | Tamaño | Peso | Estado |
| --- | --- | --- | --- | --- |
| `board/plague/blight.webp` | Casilla tejida marcada (reemplaza la pieza de la red): podredumbre violeta desde los bordes, manchas y garras de hilo seco; centro crema con los hilos dorados | 232 × 225 | 22 KB | Listo |
| `board/plague/withered.webp` | Casilla marchita con plaga: red muerta gris violácea; se queda hasta que la limpien (035) | 232 × 230 | 22 KB | Listo |
| `ui/icons/plague.webp` | Hoja violeta podrida: en la pastilla del mes mientras hay casilla marcada (como el copo de la escarcha) | 96 × 114 (se ve a ~12 px) | 4 KB | Listo |
| `board/plague/blight-winter.webp` | `blight` con nieve en los bordes, para el invierno | 232 × 226 | 22 KB | Listo |

Reglas para todas: contorno café oscuro de grosor constante (nunca negro), luz arriba a la izquierda, sin texto, colores `blight` (`#7E5A86`) y `bark` (`#5E3B22`). Lo marcado no puede depender solo del color: manchas y garras que se leen en gris. Las cuatro suman 70 KB del presupuesto de 4 MB.

## Qué se conserva del 008
- La regla de **casilla ocupada** y el pintor como respaldo si una imagen no carga.
- El **fondo vivo** (shader) queda solo detrás del marco de bosque y con la paleta v2; si compite con el follaje pintado, se apaga.
- Las piezas SVG del 008 (`src/ui/art.ts`: tablón, etiqueta, sello, luna, sobre, enredaderas, montículo, ramita y papel rasgado) se retiraron con el 011–013; las reemplazan las piezas pintadas y el CSS del referente.

## Sprites en el juego
- **Desde el 010** el juego usa los retratos pintados (`characters/<personaje>/portrait`): en el dock (con un salto "feliz" cuando está seleccionado o sugerido), grande en la ficha y en el tablero sobre la casilla donde ese miembro trabajó este mes, a 0,92 casillas de ancho y con su alto propio (Maestra Bruma, más alta).
- Los renders de Blender viven en `assets/sprites/` (PNG) y sus WebP de 176 × 128 (Maestra Bruma 176 × 160) en `assets/sprites/webp/`, como fuente.
- **Árbol Ancestral:** desde el 010 el tablero usa `asleep-painted` / `awake-painted` a 1,35 casillas de ancho (`FATHER_SCALE`). El de Blender, `assets/blender/arbol-padre.blend` (estados en `estados_arbol.py`), queda como fuente en `assets/sprites/webp/board/father-tree/{asleep,awake}.webp` (176 × 192). Dormido: tronco retorcido gris, raíces largas y ramas desnudas. Despierto: corteza cálida y copa dorada en paraguas (hojas `#F2BC45`, sombra `#C98A2B`, luz `#FFE08A`) con borde que brilla `#FFE27A`, aura `#FFF4C2`, luces cálidas y destellos. En el tablero mide 1,2 casillas de ancho y su copa asoma por encima del marco. Sustituye en el tablero a los recortes `public/assets/ui/arbol-padre-*.webp` (placeholders de baja resolución). La v2 plantea dibujarlo de unas 3 casillas de ancho; este mes mide 1,2 (`FATHER_SCALE` en `theme.ts`) y queda pendiente decidir el tamaño final.
- La silueta de cono de cada especie (`.hat--*` en `styles.css`) queda solo como respaldo si un retrato faltara.
- Peso: todo `public/assets/` suma 2.82 MB en WebP (límite 4 MB).

## Referencias (`references/`)
| Archivo | Tomamos | Dejamos |
| --- | --- | --- |
| mushie-character-sheet.jpg | Formato de hoja, proporciones, paleta corta | — |
| chanterelles-species.jpg | Silueta derivada de la especie real | Acabado acuarela |
| chanterelle-creature-sheet.jpg | Fichas de criatura con humor | — |
| pixel-mushrooms.jpg | Variedad de siluetas para especies futuras | El pixel art |
| dine-together-characters.jpg | Elenco coherente, calidez | Densidad de escena |
| fablevale-ui.jpg | UI de papel, globos de diálogo, ítems | — |
| wood-paper-ui-kit.jpg | Lenguaje de botones, paneles, barras | El kit en sí |
| chunky-monsters.jpg | Copas estilizadas, contraste figura-fondo, ícono | Paleta neón |
| mood-diary-mobile-ui.jpg | UI vertical, dock inferior, mapa de camino | — |
| ux-flow-core-meta.jpg | Documentar flujos de pantallas para el caso de estudio | Sistemas meta (ligas, tienda) |

**Licencia:** son obras de terceros, solo para inspiración interna. No se copian, no se usan como assets y la carpeta no se publica si el repo es público.

## Blender (personajes)
- Low-poly, shader toon de 2–3 bandas, contorno café por casco invertido (o Line Art).
- Cámara ortográfica a ¾, fondo transparente, PNG a 2×.
- Validar primero un personaje a 56 px en un teléfono real; luego producir los demás y sus poses (reposo, trabajando, feliz).
- Para la v2: renderizar retratos y objetos del tablero (árboles, troncos, rocas, casa-hongo, Árbol Ancestral) con la iluminación cálida de la propuesta, a 2×, si se elige Blender como fuente única.
