# Dirección de arte · v2 «Bosque pintado»

Un claro de bosque pintado a mano que **abraza** la pantalla: follaje, flores y hongos en los bordes, materiales de **madera y pergamino** para la interfaz, y la **luz** como medida del progreso (el claro pasa de gris y lila a verde y dorado). Mobile-first en vertical.

- **Fuente visual:** la propuesta [`docs/concept/propuesta-visual-v1.webp`](concept/propuesta-visual-v1.webp) (pantallas) y la hoja de piezas [`assets/ui/source/hoja-ui-v1.webp`](../assets/ui/source/hoja-ui-v1.webp), ambas de Mario (2 de noviembre). Son arte propio del proyecto, no referencias de terceros.
- **Recortes:** las 51 piezas de la hoja ya están en `public/assets/ui/*.webp` (≈ 415 KB, con transparencia). Sirven como **placeholders**: la mayoría está por debajo de 2× y algunas traen texto horneado (ver [Inventario](#inventario-de-piezas)).
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
- **Logo:** lettering ilustrado en madera (`logo.webp`, `logo-mini.webp`). Es imagen, no fuente; su nombre accesible es el título del juego.
- **Títulos, botones y números:** Fredoka 600–700, redondeada y gruesa. Títulos de hoja 22 px; nombres en tarjetas 14–15 px; números del HUD 17 px.
- **Texto:** Nunito 600–700, 13–15 px. Mínimo 12 px; las etiquetas pequeñas del HUD no bajan de 10 px.
- **Nada de texto horneado en imágenes**, salvo el logo. Todo texto visible vive en `src/copy/es.ts`: los nombres de los reclutas cambian (Pluma, Trina…), la bitácora cambia, y el texto horneado no se lee con lector de pantalla.

## Componentes
| Componente | Pieza | Estados / notas |
| --- | --- | --- |
| Logo | `logo`, `logo-mini` | Portada grande; mini en la esquina del juego |
| Letrero colgante | `letrero` | Títulos de hoja ("Cómo jugar", "El gremio"); 3 partes para estirarse |
| Pergamino | `pergamino` | Cuerpo de las hojas y cartas; 9 partes (esquinas fijas, centro repetible) |
| Cinta de pista | `cinta-pista` | Encabeza la bitácora ("Pista del día"); 3 partes, texto en vivo |
| Botón principal | `boton-jugar` | Pastilla amarilla con ícono: normal, pulsado (baja 2 px y pierde la sombra) y desactivado (60 % de opacidad) |
| Botón secundario | `boton-opciones` | Pastilla crema con ícono a la izquierda |
| Botón redondo | `boton-anterior`, `-siguiente`, `-cerrar`, `-ayuda` | 44 × 44 mínimo; madera con contorno |
| Paginación | `puntos-pagina` | 5 puntos del carrusel "Cómo jugar"; el activo en Sol |
| Tarjeta de personaje | `tarjeta-*` | Retrato sobre hojas + placa de nombre y rol. Dock: tarjeta vertical con acción y costo abajo; seleccionada con borde Sol; sugerida con ★; descansando desaturada |
| Pastilla de recurso | `icono-hoja`, `-esporas`, `-arbol` | Pergamino con ícono + número + etiqueta (HUD) |
| Íconos | `icono-*`, `estacion-*` | Pintados, con contorno café |
| Marco de bosque | `marco-bosque` | Envuelve todas las pantallas; 9 partes |
| Marco de raíces | `marco-raices-piezas` | Envuelve el tablero; 9 partes |

## Tablero
- **Casillas con relieve:** cada casilla es una losa de pasto con borde redondeado y sombra; alternar `casilla-pasto` y `casilla-pasto-b` para que el claro no se vea repetido (variación por hash de la casilla, como en el 008).
- **Red de micelio:** `casilla-red`/`-b`: grietas de luz dorada sobre el pasto. **Cambio respecto del 008:** el micelio pasa de verde menta a dorado; el turquesa queda para la selección y el Hogar.
- **Estados:** válida = brillo amarillo (`casilla-valida`); seleccionada / Hogar = brillo turquesa (`casilla-seleccion`); sugerida = ★ (`icono-estrella`) sobre la casilla. Se implementan como **capas** encima de la casilla, no como casillas distintas.
- **Objetos:** `arbol-gris` → `arbol-vivo` al revivir; `tronco` → `tronco-gastado` tras el primer uso; `casilla-roca`; `casilla-brote` para la tierra creada por el Brote arcano; `casa-hongo` en el Hogar.
- **Árbol Padre:** se dibuja grande (`arbol-padre-dormido` / `-despierto`, unas 3 casillas de ancho) y **sobresale por encima del tablero**, saliendo de su casilla en la fila superior. La regla no cambia: sigue siendo una casilla del tablero; solo su dibujo desborda. Las raíces bajan hacia la casilla.
- **Casilla ocupada (se mantiene del 008):** si un hongo trabajó hoy en una casilla, su sprite la ocupa y el objeto de abajo no se pinta.
- **Marco:** raíces trenzadas con hojas (`marco-raices-piezas`), y el marco de bosque alrededor de la pantalla.

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
- **Intro (003):** fondo `fondo-intro` (bosque lila apagado), letrero "El bosque se apaga", texto y "Comenzar".
- **Victoria (003):** fondo `fondo-victoria`, letrero "¡El bosque despertó!", el día y los árboles revividos; "Jugar otra vez" (principal) y "Ver el claro". El fin del invierno usa el mismo layout con `fondo-intro` y una pista. Tras "Ver el claro", la bitácora ofrece "Jugar otra vez".
- **Llegada de Maestra Bruna (003):** carta sobre el tablero con su retrato y sus dos hechizos, una línea cada uno.

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

### Dos familias de arte de personaje
- **Sprites de Blender** (`public/assets/characters/`): tablero y poses (reposo, trabajando, feliz). Se mantienen.
- **Retratos pintados** (`tarjeta-*` de la hoja): dock, fichas, "El gremio" y portada. Son de la misma familia que la propuesta, pero vienen con la placa de nombre horneada y a baja resolución.
- **Pendiente de decidir:** unificar en una sola familia. Una opción es renderizar retratos de Blender a 2× con la iluminación de la propuesta; la otra, repintar los cinco retratos 2D sin placa y con variantes (Chispa por estación).

## Luz por estación
Un solo juego de assets; cada estación es una **gradación de color** (filtro de color de Phaser) sobre el escenario. Personajes y UI no se gradúan, con una excepción intencional: la Gliophorus cambia de tono con la estación (una variante de sprite por estación, renderizada desde Blender; el tinte que multiplica no llega del verde a las demás).

| Estación | Días | Hora | Gradación | Micelio |
| --- | --- | --- | --- | --- |
| Primavera | 1–3 | Mañana | Fresca, verdes tiernos | Apenas visible |
| Verano | 4–6 | Mediodía | Dorada, sombras cortas | Sutil |
| Otoño | 7–9 | Atardecer | Naranja, sombras largas | Se nota |
| Invierno | 10–12 | Anochecer | Azul frío, nieve ligera | Brilla y alumbra el claro |

La saturación del progreso (gris → color según árboles revividos) se aplica además de la gradación.
- Íconos de estación: `estacion-primavera` (flor rosa), `-verano` (flor amarilla), `-otono` (hoja naranja), `-invierno` (copo). Van en la pastilla del día.

## Producción y entrega
- **Escala:** todo a **2× del tamaño en pantalla** a 390 px de ancho (columna "Objetivo 2×" del inventario). Los fondos se pintan en **vertical** (860 × 1860) con una zona segura central para el tablero o el pergamino.
- **Formato:** WebP con transparencia (calidad 85–90); PNG solo como fuente. Fuente en `assets/ui/source/`, publicado en `public/assets/ui/` con nombres en minúscula y guiones: `<pieza>[-variante][-estado].webp`.
- **Piezas estirables:** marcos, pergamino, letrero, cinta y botones se entregan **en partes** (9 o 3 partes, con márgenes indicados) para que se estiren sin deformarse. Se usan con `border-image` o como capas.
- **Estados por separado:** los brillos de casilla válida y seleccionada, y la ★, van como capas transparentes del mismo tamaño que la casilla.
- **Sin texto horneado** (salvo el logo).
- **Presupuesto:** propuesta de subir el límite de assets de 2 MB a **4 MB** en WebP, con carga diferida de portada, intro y victoria. Hoy hay ≈ 415 KB de UI y ≈ 400 KB de sprites.
- **Gradación por estación (003):** se aplica sobre el escenario (casillas, objetos y fondos), no sobre personajes ni interfaz.

## Inventario de piezas
Recortes de la hoja v1 en `public/assets/ui/`. "Listo" significa que el tamaño alcanza para 2×; "Placeholder" significa que sirve para maquetar pero hay que reexportarlo.

| Archivo | Uso | Tamaño actual | En pantalla (CSS) | Objetivo 2× | Estado |
| --- | --- | --- | --- | --- | --- |
| `logo.webp` | Portada (y cartel del juego) | 319 × 216 (27 KB) | ≈ 260 × 175 | 520 × 350 | Placeholder (baja resolución) |
| `logo-mini.webp` | HUD del juego, esquina superior izquierda | 147 × 133 (11 KB) | ≈ 96 × 86 | 192 × 172 | Placeholder (baja resolución) |
| `fondo-portada.webp` | Portada | 320 × 145 (20 KB) | 390 × 844 (vertical) | 860 × 1860 | Placeholder (baja resolución); Hoy es apaisado: hay que repintarlo en vertical |
| `fondo-intro.webp` | Carta "El bosque se apaga" y fin del invierno | 1672 × 941 (304 KB) | 390 × 844 (vertical) | 860 × 1860 | Repintado en alta resolución (fuente en `assets/ui/source/`); sigue apaisado: en vertical se recorta al centro (camino) |
| `fondo-victoria.webp` | Pantalla "¡El bosque despertó!" | 355 × 145 (24 KB) | 390 × 844 (vertical) | 860 × 1860 | Placeholder (baja resolución); Ídem |
| `marco-bosque.webp` | Marco de follaje alrededor de todas las pantallas | 281 × 255 (34 KB) | pantalla completa | 9 partes, esquinas de 240 px | Placeholder (rehacer como pieza) |
| `marco-raices.webp` | Referencia del marco del tablero | 241 × 241 (21 KB) | ≈ 380 × 600 | — | Placeholder (rehacer como pieza); Se usa partido en piezas |
| `marco-raices-piezas.webp` | Marco de raíces del tablero (9 partes) | 186 × 235 (17 KB) | esquinas ≈ 40 px | esquinas 96 px, tramos repetibles | Placeholder (rehacer como pieza) |
| `casilla-pasto.webp` | Casilla de pasto | 99 × 96 (5 KB) | 70 × 70 | 140 × 140 | Placeholder (baja resolución) |
| `casilla-pasto-b.webp` | Variante de pasto (alternar) | 91 × 87 (4 KB) | 70 × 70 | 140 × 140 | Placeholder (baja resolución) |
| `casilla-red.webp` | Casilla con micelio (red) | 100 × 96 (5 KB) | 70 × 70 | 140 × 140 | Placeholder (baja resolución) |
| `casilla-red-b.webp` | Variante de micelio | 89 × 87 (4 KB) | 70 × 70 | 140 × 140 | Placeholder (baja resolución) |
| `casilla-valida.webp` | Estado: casilla válida (brillo amarillo) | 96 × 92 (4 KB) | 70 × 70 | 140 × 140 | Placeholder (baja resolución); Mejor como capa de brillo aparte |
| `casilla-seleccion.webp` | Estado: casilla seleccionada / Hogar (brillo turquesa) | 96 × 92 (4 KB) | 70 × 70 | 140 × 140 | Placeholder (baja resolución); Ídem |
| `casilla-brote.webp` | Casilla creada por el Brote arcano | 89 × 96 (5 KB) | 70 × 70 | 140 × 140 | Placeholder (baja resolución) |
| `casilla-roca.webp` | Roca con musgo (sobre pasto) | 96 × 96 (5 KB) | 70 × 70 | 140 × 140 | Placeholder (baja resolución) |
| `casilla-roca-oscura.webp` | Roca (variante de invierno / sombra) | 90 × 87 (4 KB) | 70 × 70 | 140 × 140 | Placeholder (baja resolución) |
| `tronco.webp` | Tronco entero | 89 × 77 (4 KB) | ≈ 62 × 54 | 124 × 108 | Placeholder (baja resolución) |
| `tronco-gastado.webp` | Tronco tras el primer uso | 84 × 77 (4 KB) | ≈ 62 × 54 | 124 × 108 | Placeholder (baja resolución) |
| `arbol-gris.webp` | Árbol dormido | 86 × 91 (4 KB) | ≈ 64 × 68 | 128 × 136 | Placeholder (baja resolución) |
| `arbol-vivo.webp` | Árbol revivido | 92 × 92 (5 KB) | ≈ 64 × 68 | 128 × 136 | Placeholder (baja resolución) |
| `casa-hongo.webp` | Hogar del gremio | 124 × 131 (9 KB) | ≈ 66 × 70 | 132 × 140 | Listo |
| `arbol-padre-dormido.webp` | Árbol Padre dormido (sobresale arriba del tablero) | 239 × 180 (20 KB) | ≈ 190 × 140 | 380 × 280 | Placeholder (baja resolución) |
| `arbol-padre-despierto.webp` | Árbol Padre despierto | 279 × 206 (26 KB) | ≈ 200 × 150 | 400 × 300 | Placeholder (baja resolución) |
| `tarjeta-anil.webp` | Retrato de Añil con placa | 153 × 193 (13 KB) | ≈ 70 × 92 (dock) | 140 × 184 | Listo; Texto horneado: separar retrato y placa |
| `tarjeta-bruno.webp` | Retrato de Bruno con placa | 135 × 191 (11 KB) | ≈ 70 × 92 | 140 × 184 | Listo; Ídem; bordes de la vecina |
| `tarjeta-rubi.webp` | Retrato de Rubí con placa | 129 × 197 (12 KB) | ≈ 70 × 92 | 140 × 184 | Listo; Ídem; bordes de la vecina |
| `tarjeta-chispa.webp` | Retrato de Chispa con placa | 108 × 188 (9 KB) | ≈ 70 × 92 | 140 × 184 | Placeholder (baja resolución); Ídem; falta variante por estación |
| `tarjeta-bruna.webp` | Retrato de Maestra Bruna con placa | 136 × 209 (12 KB) | ≈ 70 × 92 | 140 × 184 | Listo; Ídem |
| `pergamino.webp` | Hojas: Cómo jugar, ficha, El gremio, cartas | 188 × 222 (11 KB) | ≈ 360 × 520 | 9 partes, esquinas de 120 px | Placeholder (rehacer como pieza) |
| `letrero.webp` | Letrero colgante (títulos de hoja, HUD) | 177 × 90 (8 KB) | ≈ 180 × 60 | 3 partes, tramo repetible | Placeholder (rehacer como pieza) |
| `cinta-pista.webp` | Cinta "Pista del día" de la bitácora | 199 × 77 (8 KB) | ≈ 170 × 40 | 3 partes sin texto | Placeholder (rehacer como pieza); Texto horneado |
| `boton-jugar.webp` | Botón principal (amarillo) | 235 × 52 (4 KB) | ≈ 240 × 52 | 3 partes sin texto | Placeholder (rehacer como pieza); Texto horneado |
| `boton-opciones.webp` | Botón secundario (crema) | 235 × 50 (4 KB) | ≈ 240 × 48 | 3 partes sin texto | Placeholder (rehacer como pieza); Texto horneado |
| `boton-anterior.webp` | Botón redondo ‹ | 49 × 49 (2 KB) | 44 × 44 | 88 × 88 | Placeholder (baja resolución) |
| `boton-siguiente.webp` | Botón redondo › | 50 × 49 (2 KB) | 44 × 44 | 88 × 88 | Placeholder (baja resolución) |
| `boton-cerrar.webp` | Botón redondo × | 49 × 49 (2 KB) | 44 × 44 | 88 × 88 | Placeholder (baja resolución) |
| `boton-ayuda.webp` | Botón redondo ? | 49 × 49 (2 KB) | 44 × 44 | 88 × 88 | Placeholder (baja resolución) |
| `puntos-pagina.webp` | Paginación del carrusel | 143 × 20 (3 KB) | ≈ 110 × 14 | — | Placeholder (rehacer como pieza); Mejor en CSS/SVG |
| `icono-hoja.webp` | Nutrientes | 57 × 59 (2 KB) | 24 × 24 | 64 × 64 | Placeholder (baja resolución) |
| `icono-esporas.webp` | Esporas | 58 × 56 (2 KB) | 24 × 24 | 64 × 64 | Listo |
| `icono-arbol.webp` | Árboles | 60 × 64 (2 KB) | 24 × 24 | 64 × 64 | Listo |
| `icono-calendario.webp` | Días (resumen) | 68 × 66 (3 KB) | 24 × 24 | 64 × 64 | Listo |
| `icono-libro.webp` | Cómo jugar | 70 × 53 (3 KB) | 24 × 24 | 64 × 64 | Listo |
| `icono-engranaje.webp` | Opciones | 64 × 65 (3 KB) | 24 × 24 | 64 × 64 | Listo |
| `icono-play.webp` | Jugar / Comenzar | 47 × 52 (2 KB) | 20 × 20 | 48 × 48 | Listo |
| `icono-estrella.webp` | Sugerencia ★ / Hechizo | 58 × 56 (2 KB) | 24 × 24 | 64 × 64 | Listo |
| `estacion-primavera.webp` | Estación | 51 × 50 (2 KB) | 20 × 20 | 48 × 48 | Listo |
| `estacion-verano.webp` | Estación | 45 × 52 (2 KB) | 20 × 20 | 48 × 48 | Listo |
| `estacion-otono.webp` | Estación | 50 × 57 (2 KB) | 20 × 20 | 48 × 48 | Listo |
| `estacion-invierno.webp` | Estación | 48 × 54 (2 KB) | 20 × 20 | 48 × 48 | Listo |

**Faltan en la hoja:** tarjeta vertical del dock sin placa (o la placa como pieza aparte), pastilla de recurso del HUD, ícono de luna para "Fin del día", sobre o botón de reclutar, variante de Chispa por estación en retrato, casilla de tierra sin pasto (tronco ya consumido), fin del invierno (si debe distinguirse de la intro) y retrato de Maestra Bruna sin placa.

## Qué se conserva del 008
- La regla de **casilla ocupada** y el pintor como respaldo si una imagen no carga.
- El **fondo vivo** (shader) queda solo detrás del marco de bosque y con la paleta v2; si compite con el follaje pintado, se apaga.
- Las piezas SVG del 008 (tablón, sello, papel rasgado) se retiran a medida que llegan las piezas pintadas.

## Sprites en el juego
- Los renders de Blender viven en `assets/sprites/` (fuente) y se copian a `public/assets/characters/` (lo que se publica): `<especie>-<pose>.png` con poses `reposo`, `trabajando` y `feliz`, a 176 × 128. Maestra Bruna, la más alta, va a 176 × 160 con la misma escala y el mismo suelo; su render `hechizo` se publica como `mago-trabajando.png`. La Gliophorus tiene una variante por estación (`gliophorus-<pose>-<estación>.png`).
- Uso: retrato en reposo en el dock (feliz cuando está seleccionado o sugerido), pose feliz grande en la ficha y pose de trabajo en el tablero, sobre la casilla donde ese miembro trabajó hoy.
- **Árbol Padre:** `assets/blender/arbol-padre.blend` (estados en `estados_arbol.py`), publicado en `public/assets/board/arbol-padre-{dormido,despierto}.png` a 176 × 192 con la misma escala. Dormido: tronco retorcido gris, raíces largas y ramas desnudas. Despierto: corteza cálida y copa dorada en paraguas (hojas `#F2BC45`, sombra `#C98A2B`, luz `#FFE08A`) con borde que brilla `#FFE27A`, aura `#FFF4C2`, luces cálidas y destellos. En el tablero mide 1,2 casillas de ancho y su copa asoma por encima del marco. Sustituye en el tablero a los recortes `public/assets/ui/arbol-padre-*.webp` (placeholders de baja resolución). La v2 plantea dibujarlo de unas 3 casillas de ancho; hoy mide 1,2 (`FATHER_SCALE` en `theme.ts`) y queda pendiente decidir el tamaño final.
- La silueta de cono de cada especie (`.hat--*` en `styles.css`) queda solo como respaldo si un sprite faltara.
- Presupuesto: los 24 sprites de personajes y los 2 del Árbol Padre pesan ≈ 470 KB (límite total de assets: 2 MB).

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
