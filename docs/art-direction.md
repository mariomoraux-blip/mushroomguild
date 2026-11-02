# Dirección de arte

Estilo **ilustrado con contorno café**, formas redondas y rubor. La **luz cambia con las estaciones**: mañana de primavera → anochecer de invierno. Mobile-first en vertical.

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

## Luz por estación
Un solo juego de assets; cada estación es una **gradación de color** (filtro de color de Phaser) sobre el escenario. Personajes y UI no se gradúan, con una excepción intencional: la Gliophorus cambia de tono con la estación (una variante de sprite por estación, renderizada desde Blender; el tinte que multiplica no llega del verde a las demás).

| Estación | Días | Hora | Gradación | Micelio |
| --- | --- | --- | --- | --- |
| Primavera | 1–3 | Mañana | Fresca, verdes tiernos | Apenas visible |
| Verano | 4–6 | Mediodía | Dorada, sombras cortas | Sutil |
| Otoño | 7–9 | Atardecer | Naranja, sombras largas | Se nota |
| Invierno | 10–12 | Anochecer | Azul frío, nieve ligera | Brilla y alumbra el claro |

La saturación del progreso (gris → color según árboles revividos) se aplica además de la gradación.

## Interfaz: libreta de campo
- Paneles de papel crema con bordes suaves; botones y marcos de madera; etiquetas tipo cinta.
- Display redondeada y gruesa para títulos y números (**Fredoka**); cuerpo de alta legibilidad (**Nunito**). Se cargan de Google Fonts con respaldo de sistema.
- Acabado cozy (006): fondo de papel crema, **cintas verdes** de título (HUD y hojas), **chips** con íconos de trazo, tarjetas redondeadas con sombra suave, **botón principal amarillo** y tablero con **marco de madera**. Referentes: *All About Poppy* (cintas, chips, tarjetas) y *Dine Together* (papel cálido, tinta café).
- Fichas de criatura con humor para cada especie (ver `references/chanterelle-creature-sheet.jpg`).
- Intro y finales con globo de diálogo sobre papel (ver `references/fablevale-ui.jpg`).

## Paleta base
Valores de día; la gradación por estación (003) los oscurece hacia el invierno. Viven en `src/theme.ts`.

| Token | Hex | Uso |
| --- | --- | --- |
| Papel | `#F3E9D2` | Paneles, fichas, HUD |
| Madera | `#8B5E3C` | Botones, marcos, dock |
| Tinta café | `#3B2A1E` | Contornos y texto (nunca negro) |
| Acento | `#E8A33D` | Selección, foco, casillas válidas |
| Micelio | `#B9F0D6` | Red y líneas de micelio |
| Destello índigo | `#4B5FD6` | Micelio tejido por el Lactarius indigo |
| Tierra base | `#7A5C3E` | Juntas entre casillas del tablero (de día) |
| Crema | `#FBF5E6` | Fondo de página y de las hojas |
| Musgo | `#6E8B3D` | Cintas de título y HUD |
| Musgo oscuro | `#55702C` | Borde de las cintas |
| Sol | `#F4C64E` | Botón principal, casillas válidas y ★ |
| Hoja | `#8DB255` | Follaje vivo y briznas |
| Pradera | `#B5C285` | Casillas del tablero |
| Piedra | `#9A9183` | Rocas y copas de los árboles dormidos |

## Layout móvil (vertical)
```
┌──────────────────────┐
│ HUD: día · estación  │  ← chips compactos
│ nutrientes · esporas │
├──────────────────────┤
│                      │
│   Tablero 5 × 8      │  ← Árbol Padre arriba
│   casillas ≥ 64 px   │     Hogar abajo
│   (≥ 56 a 390×664)   │
├──────────────────────┤
│ aviso de bitácora    │
│ [Añil][Bruno][Ru│ ▶  │  ← dock del gremio (pulgar): scroll horizontal;
└──────────────────────┘     "Terminar el día" (▶) fijo en la misma fila
```
- Vertical: casillas ≥ 64 px a 390 × 844, ≥ 56 px a 390 × 664 (Safari con barras) y nunca < 48 px. Sin dock plegable.
- El dock es una sola fila: las tarjetas se desplazan en horizontal dentro del dock, la siguiente asoma cortada y el orden es el de llegada. "Terminar el día" queda fijo fuera del desplazamiento.
- Horizontal en teléfono: tablero a la izquierda, dock a la derecha, casillas ≥ 44 px.
- Escritorio: el mismo layout centrado, con más aire; casillas ≤ 96 px.

## Sprites en el juego
- Los renders de Blender viven en `assets/sprites/` (fuente) y se copian a `public/assets/characters/` (lo que se publica): `<especie>-<pose>.png` con poses `reposo`, `trabajando` y `feliz`, a 176 × 128. La Gliophorus tiene una variante por estación (`gliophorus-<pose>-<estación>.png`).
- Uso: retrato en reposo en el dock (feliz cuando está seleccionado o sugerido), pose feliz grande en la ficha y pose de trabajo en el tablero, sobre la casilla donde ese miembro trabajó hoy.
- Maestra Bruna aún no tiene modelo: usa la silueta de cono como placeholder.
- Presupuesto: los 21 sprites publicados pesan ≈ 300 KB (límite total de assets: 2 MB).

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
