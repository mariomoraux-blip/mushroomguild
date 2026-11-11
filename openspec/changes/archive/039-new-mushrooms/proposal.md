# 039 · Hongos nuevos para reclutar

## Por qué
Mario sigue encontrando fácil Ancestral y quiere hongos nuevos (11 de noviembre de 2026). Hoy reclutar es sumar copias de los tres del inicio; el segundo Lactarius es la jugada más fuerte que vimos. Decidió que se recluten solo especies nuevas, una de cada una, en todos los niveles.

## Qué cambia
- **Quién se recluta:** ya no Lactarius, Champiñón ni Amanita (solo están al empezar). Se recluta a la Gliophorus y a tres especies nuevas que solo llegan reclutando, **una de cada especie**. Hay 4 especies para 3 cupos (costos 3, 5 y 7 esporas, sin cambios).
- **Morchella esculenta · Rompe-rocas (Panal):** convierte en tierra sin tejer una roca vecina a la red. Cuesta 2 nutrientes.
- **Ganoderma lucidum · Boticaria (Ámbar):** revive un árbol gris a 2 casillas o menos de la red, aunque la red no lo toque (3 nutrientes + 1 espora; apagado, 7 + 1). El árbol entra a la red, como con la Amanita. En Ancestral también limpia una casilla con plaga a 2 casillas o menos de la red (1 espora).
- **Lycoperdon perlatum · Soplador (Pompón):** sobre un árbol vivo, cambia 1 nutriente por 2 esporas.
- **Pista:** sin trabajo útil, sugiere reclutar la primera especie que falte en el gremio, en un orden fijo que se mide en este cambio. Sigue sugiriendo la Gliophorus cuando falta pasar la voz.
- **Puntaje:** la variedad (150) pide que **todas las especies de tu gremio** hayan actuado al menos una vez (Maestra Bruma, si llegó, con un hechizo). `SCORE_VERSION` sube a 9: empieza la Temporada 9 del ranking.
- **Interfaz:** tarjeta, ficha, receta visual, «El gremio» y Libreta con las ocho especies. Mario entregó los retratos durante el cambio: `characters/panal`, `characters/ambar` y `characters/pompon` (recortados de su hoja; el pasto y las piedras se quitaron a mano).
- **Claros:** cambian las reglas, así que se regenera `level-seeds.ts` y los claros de Brote (que acepta la pista) pueden cambiar para la misma semilla.

## Riesgos
- **La Ganoderma salta la red:** un árbol curado a 2 casillas entra a la red y la extiende de golpe. Puede facilitar el juego; se mide antes de cerrar.
- **La Morchella abre caminos** entre las 10 rocas de Ancestral; también se mide.
- Si Ancestral queda fuera de 10–25 % con las pistas o Bosque fuera de 55–70 %, se le muestran los números a Mario antes de tocar rangos o costos.

## Balance medido
Con las semillas 1–100: Brote, pistas 100 % con mes medio 8,9 y bot al azar 10,5 %. Bosque, pistas 74 % (antes 67 %), 98 certificados. Ancestral, pistas 28–32 % (antes 16 %), 84 certificados; la búsqueda gana más tarde (mes 10,45 frente a 10,0). La subida viene del Ganoderma como segundo sanador: encarecerlo (2 esporas, +1 nutriente o sin entrar a la red) casi no cambia nada, y pedir 5 árboles o 13 nutrientes en Ancestral la empeora. Mario eligió **ensanchar los rangos**: pistas en Bosque 55–75 % y en Ancestral 10–35 % (`game-rules` › Dificultad medida).

## Fuera de alcance
Más especies (Armillaria, Mycena, Trametes), el visitante por estación y el cambio 022.

## Impacto
- **Specs:** `game-rules` › Reclutar y Dificultad medida (MODIFIED); Romper rocas, Curar a distancia, Soplar esporas (ADDED). `scoring` › Puntaje (MODIFIED). `player-guidance` › Cómo reclutar, Recetas visuales (MODIFIED). `title-screens` › El gremio (MODIFIED). `visual-feedback` › Respuesta a cada acción (MODIFIED).
- **Código:** `src/rules/` (types, config, actions, state, advice, autoplay, idle, scoring, level-seeds), `src/copy/es.ts`, `src/theme.ts`, `src/ui/` (dock, sheet, recipe, howto-art), `src/scenes/` (GameScene, fx), `src/effects.ts`, `src/styles.css`, `src/debug.ts`.
