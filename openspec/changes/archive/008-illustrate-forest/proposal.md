# 008 · Bosque ilustrado

## Por qué
Playtest del 2 de noviembre (Mario), con Maestra Bruna ya integrada (007):
- Cuando un hongo trabaja sobre una casilla, el objeto de abajo (tronco, árbol, roca) se ve a través del sprite.
- La interfaz del 006 se quedó en "cajas, círculos y colores": no alcanza la frescura ni el atrevimiento de los referentes (*All About Poppy*, *Dine Together*, el kit de madera y papel).

## Qué cambia
- **Casilla ocupada:** si un miembro trabajó hoy en una casilla, su sprite la ocupa y el objeto de abajo no se pinta (se mantienen el suelo, la red y el aura del Árbol Padre).
- **Tablero pintado:** `src/scenes/paint.ts` pinta el claro en Canvas2D (gradientes, curvas, brillos y variación determinista por casilla): pradera con pasto y florecitas, micelio luminoso con hilos ondulados, árboles de copa en capas (grises dormidos, verdes con flores al revivir), troncos con corteza, corte con anillos y un hongo diminuto, rocas con musgo, casa-hongo con sombrero rojo, Árbol Padre con aura y aro de meta, casillas válidas con borde punteado luminoso y ★ con brillo.
- **Fondo vivo:** shader WebGL (`src/ui/ambient.ts`) detrás de la interfaz: copas del bosque, haces de luz, esporas y luciérnagas que suben y grano de papel. A media resolución y ~30 fps; con `prefers-reduced-motion` pinta un solo cuadro; se pausa con la pestaña oculta.
- **Interfaz ilustrada en SVG** (`src/ui/art.ts`): HUD en tablón de madera con cuerdas y clavos, etiqueta de papel para el día, medallones festoneados con íconos a color, sello de cera para "?", bitácora en papel rasgado con cinta, tarjetas de criatura con costura y montículo de pasto, sobre de semillas para reclutar, botón redondo de madera con luna, enredaderas en el marco del tablero, hojas de pergamino con borde rasgado y cintas de puntas cortadas, grano de papel (feTurbulence).
- **Paleta:** tokens nuevos en `theme.ts` (corteza, hoja oscura, pradera oscura, baya, durazno, brillo, piedra oscura).

## Fuera de alcance
Reglas, balance y textos de juego (salvo etiquetas cortas del HUD: "esporas +", "árboles"). Gradación por estación (003) y animaciones de acciones (004).

## Impacto
Modifica `board-interaction` (Estilo cozy) y agrega "Casilla ocupada" y "Fondo vivo".
