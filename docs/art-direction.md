# Dirección de arte · v2 «Bosque pintado»

Un claro de bosque pintado a mano que **abraza** la pantalla: follaje, flores y hongos en los bordes, materiales de **madera y pergamino** para la interfaz, y la **luz** como medida del progreso (el claro pasa de gris y lila a verde y dorado). Mobile-first en vertical.

- **Fuente visual:** la propuesta [`docs/concept/propuesta-visual-v1.webp`](concept/propuesta-visual-v1.webp) (pantallas) y las hojas de piezas en [`assets/ui/source/`](../assets/ui/source/), todas de Mario (2 de noviembre). Son arte propio del proyecto, no referencias de terceros.
- **Recortes:** las piezas de las seis hojas (v1, UI v2, tablero HD, tablero por estaciones, tablero v3, logo y fondos) están en `public/assets/` según la [organización de assets](#organización-de-assets): 119 archivos, 2.2 MB, con transparencia. Sirven como **placeholders**: la mayoría está por debajo de 2× y algunas traen texto horneado (ver [Inventario](#inventario-de-piezas)).
- **Estado del juego:** hasta integrar estas piezas, el juego usa el bosque ilustrado procedural del cambio 008 (Canvas2D + SVG + shader). Esta dirección lo reemplaza pieza por pieza; lo que se conserva del 008 está en [Qué se conserva](#qué-se-conserva-del-008).

## Principios
1. **El bosque enmarca, el tablero manda.** Los bordes van cargados (follaje, flores, hongos); el centro se mantiene limpio y legible. Nada decorativo invade una casilla ni un control.
2. **Dos materiales, siempre los mismos.** Madera para lo que se toca y señala (letreros, botones redondos, marcos); pergamino para lo que se lee (hojas, pistas, fichas). Botón principal: pastilla amarilla.
3. **Relieve suave, contorno café.** Cada pieza tiene volumen pintado (luz arriba a la izquierda, sombra abajo), contorno café oscuro de grosor constante (nunca negro) y una sombra sólida corta.
4. **La luz es el progreso.** Gris y lila al inicio; verde vivo al revivir; dorado al despertar al Árbol Padre. La red de micelio es luz dorada que corre por el suelo.
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
| Oro | `#FFD21A` | Árbol Padre despierto, destellos |
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
| Logo | `ui/hud/logo`, `ui/hud/logo-small` | Portada grande; mini en la esquina del juego |
| Letrero colgante | `ui/panels/sign` | Títulos de hoja ("Cómo jugar", "El gremio"); 3 partes para estirarse |
| Pergamino | `ui/panels/parchment` | Cuerpo de las hojas y cartas; 9 partes (esquinas fijas, centro repetible) |
| Cinta de pista | `ui/panels/ribbon-hint` | Encabeza la bitácora ("Pista del día"); 3 partes, texto en vivo |
| Botón principal | `ui/buttons/primary` | Pastilla amarilla con ícono: normal, pulsado (baja 2 px y pierde la sombra) y desactivado (60 % de opacidad) |
| Botón secundario | `ui/buttons/secondary` | Pastilla crema con ícono a la izquierda |
| Botón redondo | `ui/buttons/prev`, `-siguiente`, `-cerrar`, `-ayuda` | 44 × 44 mínimo; madera con contorno |
| Paginación | `ui/buttons/page-dots` | 5 puntos del carrusel "Cómo jugar"; el activo en Sol |
| Tarjeta de personaje | `characters/<personaje>/card` | Retrato sobre hojas + placa de nombre y rol. Dock: tarjeta vertical con acción y costo abajo; seleccionada con borde Sol; sugerida con ★; descansando desaturada |
| Pastilla de recurso | `ui/icons/nutrients`, `-esporas`, `-arbol` | Pergamino con ícono + número + etiqueta (HUD) |
| Íconos | `ui/icons/*` | Pintados, con contorno café |
| Marco de bosque | `ui/frames/forest` | Envuelve todas las pantallas; 9 partes |
| Marco de raíces | `ui/frames/roots-pieces` | Envuelve el tablero; 9 partes |

## Tablero
- **Casillas con relieve:** cada casilla es una losa de pasto con borde redondeado y sombra; en primavera y verano se alternan `grass`, `grass-b` y `grass-c` (variación por hash de la casilla, como en el 008); en otoño `grass-autumn` y en invierno `grass-winter`. Implementado en el 010 (`src/scenes/paint.ts`, tabla `BOARD_ART` de `theme.ts`).
- **Red de micelio:** `board/mycelium/net`/`-b`: grietas de luz dorada sobre el pasto, una casilla entera por casilla de la red (decisión del 010: tile completo, no conectores). **Cambio respecto del 008:** el micelio pasa de verde menta a dorado; el turquesa queda para la selección y el Hogar.
- **Estados:** válida = brillo amarillo; seleccionada / Hogar = brillo turquesa; sugerida = ★ (`ui/icons/star`, en uso) sobre la casilla. Se implementan como **capas** encima de la casilla, no como casillas distintas. `state-valid` y `state-selected` traen el pasto horneado, así que no sirven de capa sobre un objeto: hasta tener la capa transparente, el brillo de casilla válida es el trazo vectorial del 008.
- **Objetos:** `board/trees/grey` (dormido) → `board/trees/waking` cuando la red lo alcanza → `alive` al revivir (`autumn` y `winter` en esas estaciones); `board/logs/log` → `board/logs/log-used` tras el primer uso; `board/rocks/rock` (`rock-winter` en invierno); `board/terrain/home` es la casilla del Hogar (con alguien encima queda la red). `board/terrain/sprout` para la tierra creada por el Brote arcano queda pendiente.
- **Árbol Padre:** se dibuja grande (`board/father-tree/asleep-painted` / `awake-painted`, desde el 010) y **sobresale por encima del tablero**, saliendo de su casilla en la fila superior. La regla no cambia: sigue siendo una casilla del tablero; solo su dibujo desborda. Las raíces bajan hacia la casilla.
- **Casilla ocupada (se mantiene del 008):** si un hongo trabajó hoy en una casilla, su retrato la ocupa y el objeto de abajo no se pinta.
- **Marco:** raíces trenzadas con hojas (`ui/frames/roots`, como `border-image` de 12 px por lado, en uso), y el marco de bosque alrededor de la pantalla (pendiente).

## Pantallas (390 × 844)
```
JUEGO                          PORTADA                        CÓMO JUGAR (carrusel de 5)
┌────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐
│[logo] [Día][🍃][✳][🌳][?]│     │      [   LOGO   ]      │     │ (letrero) Cómo jugar  × │
│      (Árbol Padre)      │     │  Añil Bruno Rubí Chispa│     │ pergamino:              │
│  ┌ marco de raíces ┐    │     │        Bruna           │     │ ① Elige un miembro      │
│  │ tablero 5 × 8    │   │     │ [▶ Nueva partida ]     │     │ ② Toca junto a la red   │
│  │                  │   │     │ [📖 Cómo jugar   ]     │     │ ③ Cada especie, 1 acción│
│  └──────────────────┘   │     │ [🍄 El gremio    ]     │     │ ④ Al amanecer, esporas  │
│ (cinta) Pista del día…  │     │ [⚙ Opciones     ]     │     │ ⑤ Despierta al Árbol    │
│ [Añil][Bruno][Rubí]…    │     │  (marco de bosque)     │     │   ● ○ ○ ○ ○        [›]  │
│ [ ☾  Fin del día     ]  │     └────────────────────────┘     └────────────────────────┘
└────────────────────────┘
FICHA                          EL GREMIO                      INTRO / VICTORIA
┌────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐
│ ×   (retrato grande)    │     │ (letrero) El gremio   × │     │  fondo pintado          │
│       Bruno             │     │ [retrato] Añil·Tejedor ›│     │  (letrero) título       │
│ Agaricus · Descompositor│     │ [retrato] Bruno·…      ›│     │  pergamino: texto       │
│ contexto · «frase»      │     │ [retrato] Rubí·…       ›│     │  [Días][Árboles]…       │
│ [Habilidad] [Movimiento]│     │ [retrato] Chispa·…     ›│     │  [Ver resumen][Jugar ↻] │
│ [Nutrientes]            │     │ [retrato] Bruna·…      ›│     │  (marco de bosque)      │
└────────────────────────┘     └────────────────────────┘     └────────────────────────┘
```
- **Juego:** HUD con logo mini, pastilla del día y estación, tres pastillas de recurso y ayuda redonda. Árbol Padre grande sobre el tablero. Bitácora con la cinta "Pista del día". Dock con tarjetas verticales y "Fin del día" como pastilla amarilla a todo lo ancho, con ícono de luna.
  - **Pendiente de decidir:** el dock más alto y el logo restan alto al tablero. A 390 × 664 las casillas bajarían de 56 a unos 48 px (el mínimo de la spec es 56). Opciones: aceptar 48 en ese tamaño, ocultar el logo por debajo de 700 px de alto, o tarjetas más bajas.
- **Portada** (cambio por definir): logo, los cinco personajes sobre el claro y menú: Nueva partida (principal), Cómo jugar, El gremio y Opciones (secundarios).
- **Cómo jugar:** carrusel de 5 pasos en pergamino, con ‹ › y puntos. Reemplaza a la Libreta de campo como ayuda principal.
- **Ficha:** retrato grande, nombre, nombre científico y rol, contexto, frase entre comillas y secciones con etiqueta verde (Habilidad, Movimiento, Nutrientes…), como la ficha actual.
- **El gremio:** lista de las cinco especies, cada fila con retrato, nombre, rol y una línea; abre la ficha.
- **Intro (003):** fondo `backgrounds/intro` (bosque lila apagado), letrero "El bosque se apaga", texto y "Comenzar".
- **Victoria (003):** fondo `backgrounds/victory`, letrero "¡El bosque despertó!", texto y resumen (días, árboles, nutrientes, esporas); "Ver resumen" y "Jugar de nuevo". El fin del invierno usa el mismo layout con `backgrounds/intro`.

## Personajes
- Cuerpo-tallo redondo, sombrero ≈ 55 % de la altura, cara mínima (ojos de punto, rubor, boca pequeña).
- Contorno café oscuro (`--ink`), nunca negro. Grosor constante.
- Cada especie se reconoce por **silueta**, no solo por color:

| Especie (nombre) | Rol | Silueta | Color | Accesorio | Rasgo especial |
| --- | --- | --- | --- | --- | --- |
| Champiñón ("Bruno") | Descompositor | Domo bajo y ancho | Café claro | Canasta | — |
| *Lactarius indigo* ("Añil") | Tejedor | Embudo poco profundo con anillos concéntricos | Índigo, láminas azules | Carrete de hilo índigo | Gotitas de látex azul; el micelio que teje tiene destellos índigo |
| *Amanita muscaria* ("Rubí") | Sanadora | Domo alto con verrugas y falda en el tallo | Rojo y crema | Bolso con hojas que curan | — |
| *Gliophorus psittacinus* ("Chispa") | Mensajera | Campana pequeña, viscosa y brillante | Verde loro | Saquito de cartas | Cambia de color con la estación: verde, amarillo, naranja, rosa |
| *Conocybe arcana* ("Maestra Bruna") | Maga | Cono alto con la punta doblada en rizo, como sombrero de hechicera; túnica larga; la más alta | Sombrero rojo amanita que degrada a blanco, punta naranja; túnica color tallo; motas doradas que brillan como estrellas | Bastón de ramita con una espora luminosa | Cabello rubio de hilos de micelio; brilla siempre un poco |

Prueba de silueta: domo bajo, embudo, domo alto con falda, campana pequeña y cono alto deben distinguirse en negro sobre blanco a 56 px.
*Conocybe* es un género real de sombrero cónico; *arcana* es inventado: la maga es el único personaje fantástico.

- Antes de Blender: una hoja de personaje por especie (frente, perfil, ¾ espalda, paleta, escala), formato de `references/mushie-character-sheet.jpg`.
- Tamaño en pantalla: ~56 px de alto en un teléfono de 390 px. Render a 2× (≈ 128 px).

### Una sola familia: retratos pintados (decisión del 010)
- **Retratos pintados** (`characters/<personaje>/portrait`, sin placa) en todas partes: tablero, dock, fichas y "El gremio". Chispa lleva en la interfaz su corona de la estación (`frame-<estación>`); en el tablero, su retrato.
- La pose ya no cambia de imagen: "feliz" (seleccionado o sugerido) es un pequeño salto en CSS (`data-pose`), y "trabajando" es estar sobre la casilla.
- Los sprites de Blender (`rest`, `work`, `happy`) salieron de `public/assets/` y quedan como fuente en `assets/sprites/webp/`.

## Luz por estación
**Decisión del 010:** cada estación usa sus **variantes pintadas** donde existen (pasto, rocas, árboles vivos) y la pieza de primavera donde no. Reemplaza el principio anterior de "un solo juego de assets + gradación". La gradación de la tabla queda como luz ambiental opcional encima (cambio 003), suave, para no ensuciar las piezas pintadas. Personajes y UI no cambian, salvo Chispa (corona de la estación).

| Estación | Días | Hora | Gradación | Micelio |
| --- | --- | --- | --- | --- |
| Primavera | 1–3 | Mañana | Fresca, verdes tiernos | Apenas visible |
| Verano | 4–6 | Mediodía | Dorada, sombras cortas | Sutil |
| Otoño | 7–9 | Atardecer | Naranja, sombras largas | Se nota |
| Invierno | 10–12 | Anochecer | Azul frío, nieve ligera | Brilla y alumbra el claro |

La saturación del progreso (gris → color según árboles revividos) se aplica además de la gradación.
- Íconos de estación: `ui/icons/season-spring` (flor rosa), `-verano` (flor amarilla), `-otono` (hoja naranja), `-invierno` (copo). Van en la pastilla del día.

## Producción y entrega
- **Escala:** todo a **2× del tamaño en pantalla** a 390 px de ancho (columna "Objetivo 2×" del inventario). Los fondos se pintan en **vertical** (860 × 1860) con una zona segura central para el tablero o el pergamino.
- **Formato:** WebP con transparencia (calidad 85–90); PNG solo como fuente. Fuente en `assets/` (Blender, renders, `assets/ui/source/`), publicado en `public/assets/` según la [organización de assets](#organización-de-assets), con nombres en inglés, minúscula y guiones: `<pieza>[-variante][-estado].webp`.
- **Piezas estirables:** marcos, pergamino, letrero, cinta y botones se entregan **en partes** (9 o 3 partes, con márgenes indicados) para que se estiren sin deformarse. Se usan con `border-image` o como capas.
- **Estados por separado:** los brillos de casilla válida y seleccionada, y la ★, van como capas transparentes del mismo tamaño que la casilla.
- **Sin texto horneado** (salvo el logo).
- **Presupuesto:** `public/assets/` ≤ **4 MB** (decisión del 2 de noviembre; antes 2 MB). Hoy hay 2.19 MB. El JavaScript del juego no cuenta en este límite. Los fondos y piezas de portada, intro y victoria se cargan de forma diferida, cuando se muestra esa pantalla; la primera carga solo trae lo del tablero, los personajes y el HUD.
- **Estaciones (010):** variantes pintadas por estación; la gradación del 003, si se hace, es solo una luz suave encima del escenario.

## Organización de assets
Lo que se publica vive en `public/assets/` (WebP). La fuente (Blender, renders a tamaño completo, hojas originales) vive en `assets/`; las hojas pintadas están en `assets/ui/source/`. Nombres en inglés, minúscula y guiones, como el código.

```
public/assets/
├── backgrounds/        menu, intro, victory (verticales) · menu-landscape (16:9) ·
│                       menu-wide, intro-wide, victory-wide (panorámicas ≈ 5,4:1)
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
│   ├── anil/ bruno/ rubi/ maestra-bruna/   portrait (pintado, sin placa)
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
- **Personajes:** la carpeta lleva el nombre del primer miembro de la especie (Añil = *Lactarius indigo*, Bruno = Champiñón, Rubí = *Amanita*, Chispa = *Gliophorus*, Maestra Bruna = *Conocybe arcana*); los reclutas de la misma especie usan el mismo arte. `portrait` es el retrato pintado para tablero, dock, fichas y "El gremio"; los sprites de Blender son fuente (`assets/sprites/webp/`).
- **Micelio:** se dibuja con el tile completo `net`/`net-b` (decisión del 010). Los conectores (`straight-h`, `straight-v`, `corner`, `cross`…) sobre `dirt` quedan publicados para un efecto futuro (p. ej. el hilo que se teje); falta la pieza en T.
- **Estaciones:** pasto (`grass-autumn`, `grass-winter`), rocas (`rock-winter`) y árboles (`autumn`, `winter`) cambian por estación (010). El Árbol Padre por estación (`spring-`…`winter-painted`) muestra un árbol vivo y verde, que se confunde con "despierto": por ahora el Padre usa solo `asleep-painted` y `awake-painted`.
- **Fondos por orientación:** vertical en el teléfono (`menu`, `intro`, `victory`); en horizontal y escritorio, `menu-landscape` (16:9) para la portada y las panorámicas `*-wide` como franja superior o inferior detrás del tablero, la intro y la victoria. Las panorámicas solo tienen 310 px de alto: estiradas a pantalla completa se ven borrosas, así que van como franja y no como fondo completo.
- **Fuera del árbol propuesto:** el Hogar, los estados de casilla y `blocked` van en `board/terrain/`, y los logos y pastillas en `ui/hud/`.
- **Código:** `src/theme.ts` arma las rutas (`assetUrl`, `portraitKey`, `uiPortraitKey`, `CHARACTER_DIR`, `fatherKey`, `BOARD_ART`, y las variables CSS `--art-*` de la interfaz); ningún otro archivo escribe rutas de assets a mano.

## Inventario de piezas
93 archivos publicados, 2.19 MB en total (el 010 sacó los sprites de Blender a `assets/sprites/webp/`). "Listo" significa que el ancho alcanza para 2× a 390 px; los demás sirven para maquetar y hay que reexportarlos. Retirados en la v2 por traer texto horneado o baja resolución: las tarjetas con placa (`card`), `ribbon-hint`, `page-dots` y `rock-dark`.

| Archivo | Origen | Tamaño | Peso | Estado |
| --- | --- | --- | --- | --- |
| `backgrounds/menu-landscape.webp` | fondo apaisado | 1672 × 941 | 415 KB | Listo |
| `backgrounds/menu-wide.webp` | panorámicas | 1670 × 310 | 162 KB | Listo como franja (310 px de alto); para pantalla completa haría falta ≥ 1080 px de alto |
| `backgrounds/intro-wide.webp` | panorámicas | 1670 × 307 | 124 KB | Listo como franja (310 px de alto); para pantalla completa haría falta ≥ 1080 px de alto |
| `backgrounds/victory-wide.webp` | panorámicas | 1670 × 312 | 157 KB | Listo como franja (310 px de alto); para pantalla completa haría falta ≥ 1080 px de alto |
| `backgrounds/intro.webp` | logo y fondos | 465 × 631 | 55 KB | Baja resolución (objetivo 860 px de ancho) |
| `backgrounds/menu.webp` | logo y fondos | 463 × 631 | 87 KB | Baja resolución (objetivo 860 px de ancho) |
| `backgrounds/victory.webp` | logo y fondos | 466 × 631 | 93 KB | Baja resolución (objetivo 860 px de ancho) |
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
| `characters/anil/portrait.webp` | UI v2 | 143 × 135 | 9 KB | Listo |
| `characters/bruno/portrait.webp` | UI v2 | 143 × 133 | 7 KB | Listo |
| `characters/chispa/frame-autumn.webp` | UI v2 | 102 × 108 | 7 KB | Baja resolución (objetivo 140 px de ancho) |
| `characters/chispa/frame-spring.webp` | UI v2 | 105 × 111 | 7 KB | Baja resolución (objetivo 140 px de ancho) |
| `characters/chispa/frame-summer.webp` | UI v2 | 103 × 112 | 7 KB | Baja resolución (objetivo 140 px de ancho) |
| `characters/chispa/frame-winter.webp` | UI v2 | 102 × 111 | 7 KB | Baja resolución (objetivo 140 px de ancho) |
| `characters/chispa/portrait.webp` | UI v2 | 116 × 128 | 6 KB | Baja resolución (objetivo 140 px de ancho) |
| `characters/maestra-bruna/portrait.webp` | UI v2 | 119 × 141 | 8 KB | Baja resolución (objetivo 140 px de ancho) |
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
| `ui/hud/logo-small.webp` | logo y fondos | 319 × 252 | 31 KB | Listo |
| `ui/hud/logo.webp` | logo y fondos | 608 × 354 | 69 KB | Listo |
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

**Faltan:** fondos verticales a 860 × 1860 (hoy 465 × 631), panorámicas más altas si se quieren a pantalla completa en horizontal, conector de micelio en T, retratos a 280 px para la ficha grande, Chispa `portrait` por estación sin marco y el fin del invierno si debe distinguirse de la intro.

## Qué se conserva del 008
- La regla de **casilla ocupada** y el pintor como respaldo si una imagen no carga.
- El **fondo vivo** (shader) queda solo detrás del marco de bosque y con la paleta v2; si compite con el follaje pintado, se apaga.
- Las piezas SVG del 008 (tablón, sello, papel rasgado) se retiran a medida que llegan las piezas pintadas.

## Sprites en el juego
- **Desde el 010** el juego usa los retratos pintados (`characters/<personaje>/portrait`): en el dock (con un salto "feliz" cuando está seleccionado o sugerido), grande en la ficha y en el tablero sobre la casilla donde ese miembro trabajó hoy, a 0,92 casillas de ancho y con su alto propio (Maestra Bruna, más alta).
- Los renders de Blender viven en `assets/sprites/` (PNG) y sus WebP de 176 × 128 (Maestra Bruna 176 × 160) en `assets/sprites/webp/`, como fuente.
- **Árbol Padre:** desde el 010 el tablero usa `asleep-painted` / `awake-painted` a 1,35 casillas de ancho (`FATHER_SCALE`). El de Blender, `assets/blender/arbol-padre.blend` (estados en `estados_arbol.py`), queda como fuente en `assets/sprites/webp/board/father-tree/{asleep,awake}.webp` (176 × 192). Dormido: tronco retorcido gris, raíces largas y ramas desnudas. Despierto: corteza cálida y copa dorada en paraguas (hojas `#F2BC45`, sombra `#C98A2B`, luz `#FFE08A`) con borde que brilla `#FFE27A`, aura `#FFF4C2`, luces cálidas y destellos. En el tablero mide 1,2 casillas de ancho y su copa asoma por encima del marco. Sustituye en el tablero a los recortes `public/assets/ui/arbol-padre-*.webp` (placeholders de baja resolución). La v2 plantea dibujarlo de unas 3 casillas de ancho; hoy mide 1,2 (`FATHER_SCALE` en `theme.ts`) y queda pendiente decidir el tamaño final.
- La silueta de cono de cada especie (`.hat--*` en `styles.css`) queda solo como respaldo si un retrato faltara.
- Peso: todo `public/assets/` suma 2.19 MB en WebP (límite 4 MB).

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
- Para la v2: renderizar retratos y objetos del tablero (árboles, troncos, rocas, casa-hongo, Árbol Padre) con la iluminación cálida de la propuesta, a 2×, si se elige Blender como fuente única.
