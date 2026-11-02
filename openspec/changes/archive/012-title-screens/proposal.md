# 012 · Portada, "Cómo jugar" y "El gremio"

## Por qué
El juego abría directo en el tablero y la ayuda era una sola hoja larga (Libreta de campo). El referente visual y el boceto de pantallas de `docs/art-direction.md` piden una portada, una ayuda corta en pasos y una galería del gremio.

## Decisiones (2 de noviembre)
- **Portada siempre,** salvo con `?map`, `?seed` o `?debugState` (pruebas y playtests entran directo al tablero). "Nueva partida" abre la intro del 003.
- **Sin "Opciones"** hasta que haya algo que ajustar (audio u otros).
- **"?" abre "Cómo jugar"** (5 pasos). La Libreta de campo sigue disponible desde el último paso y desde cualquier paso con el botón "Libreta de campo".
- **Sistemas del referente** (misiones, enciclopedia, logros, moneda): no se agregan (ver GDD › Ideas del referente visual).

## Qué cambia
- **Portada:** logo, los cinco personajes sobre el claro y el menú: Nueva partida (principal), Cómo jugar y El gremio. Fondo `backgrounds/menu` (`menu-landscape` en apaisado).
- **Cómo jugar:** carrusel de 5 pasos en pergamino, cada uno con una ilustración de piezas ya publicadas, ‹ ›, puntos que llevan a cada paso, flechas del teclado y deslizar con el dedo. "¡A jugar!" empieza la partida (desde la portada) o vuelve al tablero (desde "?").
- **El gremio:** las cinco especies en medallón, con nombre, rol y qué hacen; cada fila abre su ficha.
- **Navegación:** "Volver" (‹) y Esc regresan a donde se abrió la pantalla; las hojas (fichas, libreta) se abren encima.
- En apaisado, portada y "Cómo jugar" van en dos columnas para no desplazar.

## Diseño
- Estado `ui.screen` en el store (`title`, `howto` con paso y `back`, `guild` con `back`) y acciones `openScreen`, `howtoStep`, `closeScreen` y `play`. `cancel` (Esc) cierra primero la hoja, después la carta y después la pantalla; en la portada no hace nada.
- `src/ui/screens.ts` dibuja la pantalla y mantiene el foco: el botón principal al entrar y el mismo control al cambiar de paso.
- Las rutas del arte de las pantallas viven en `theme.ts` (`SCREEN_ART`) y se usan como `<img>`: se descargan solo al mostrarse.

## Fuera de alcance
Opciones, restyle de las hojas (fichas, reclutar, libreta) y sistemas nuevos.

## Impacto
Capacidad nueva: `title-screens`. Modifica `player-guidance` (Libreta de campo). Depende de 003.
