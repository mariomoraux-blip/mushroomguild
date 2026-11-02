# Dirección de arte

Estilo **ilustrado con contorno café**, formas redondas y rubor. La **luz cambia con las estaciones**: mañana de primavera → anochecer de invierno. Mobile-first en vertical.

## Personajes
- Cuerpo-tallo redondo, sombrero ≈ 55 % de la altura, cara mínima (ojos de punto, rubor, boca pequeña).
- Contorno café oscuro (`--ink`), nunca negro. Grosor constante.
- Cada especie se reconoce por **silueta**, no solo por color:

| Especie (nombre) | Rol | Silueta | Color | Accesorio | Rasgo especial |
| --- | --- | --- | --- | --- | --- |
| Champiñón ("Bruno") | Descompositor | Domo bajo y ancho | Café claro | Canasta | — |
| *Lactarius indigo* ("Añil") | Tejedora | Embudo poco profundo con anillos concéntricos | Índigo, láminas azules | Carrete de hilo índigo | Gotitas de látex azul; el micelio que teje tiene destellos índigo |
| *Amanita muscaria* ("Rubí") | Sanadora | Domo alto con verrugas y falda en el tallo | Rojo y crema | Bolso con hojas que curan | — |
| *Gliophorus psittacinus* ("Perico") | Mensajera | Campana pequeña, viscosa y brillante | Verde loro | Saquito de cartas | Cambia de color con la estación: verde, amarillo, naranja, rosa |
| *Conocybe arcana* ("Maese Bruma") | Mago | Cono alto y puntiagudo, doblado en la punta como sombrero de hechicero; el más alto | Violeta profundo con motas que brillan como estrellas | Bastón de ramita con una espora luminosa | Barba de hilos de micelio; brilla siempre un poco |

Prueba de silueta: domo bajo, embudo, domo alto con falda, campana pequeña y cono alto deben distinguirse en negro sobre blanco a 56 px.
*Conocybe* es un género real de sombrero cónico; *arcana* es inventado: el mago es el único personaje fantástico.

- Antes de Blender: una hoja de personaje por especie (frente, perfil, ¾ espalda, paleta, escala), formato de `references/mushie-character-sheet.jpg`.
- Tamaño en pantalla: ~56 px de alto en un teléfono de 390 px. Render a 2× (≈ 128 px).

## Luz por estación
Un solo juego de assets; cada estación es una **gradación de color** (filtro de color de Phaser) sobre el escenario. Personajes y UI no se gradúan, con una excepción intencional: la Gliophorus cambia de tono con la estación (tinte del sprite).

| Estación | Días | Hora | Gradación | Micelio |
| --- | --- | --- | --- | --- |
| Primavera | 1–3 | Mañana | Fresca, verdes tiernos | Apenas visible |
| Verano | 4–6 | Mediodía | Dorada, sombras cortas | Sutil |
| Otoño | 7–9 | Atardecer | Naranja, sombras largas | Se nota |
| Invierno | 10–12 | Anochecer | Azul frío, nieve ligera | Brilla y alumbra el claro |

La saturación del progreso (gris → color según árboles revividos) se aplica además de la gradación.

## Interfaz: libreta de campo
- Paneles de papel crema con bordes suaves; botones y marcos de madera; etiquetas tipo cinta.
- Display redondeada y gruesa para títulos y números; cuerpo de alta legibilidad.
- Fichas de criatura con humor para cada especie (ver `references/chanterelle-creature-sheet.jpg`).
- Intro y finales con globo de diálogo sobre papel (ver `references/fablevale-ui.jpg`).

## Layout móvil (vertical)
```
┌──────────────────────┐
│ HUD: día · estación  │  ← chips compactos
│ nutrientes · esporas │
├──────────────────────┤
│                      │
│   Tablero 5 × 8      │  ← Árbol Madre arriba
│   casillas ≥ 64 px   │     Hogar abajo
│                      │
├──────────────────────┤
│ aviso de bitácora    │
│ [Ola][Bruno][Rubí] ▶ │  ← dock del gremio (pulgar)
│ [ Terminar el día ]  │
└──────────────────────┘
```
Horizontal en teléfono: tablero a la izquierda, dock a la derecha. Escritorio: el mismo layout centrado, con más aire.

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
