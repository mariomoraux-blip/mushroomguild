# 019 · Niveles de dificultad: Brote, Bosque y Ancestral

## Por qué
Una vez que se aprende el orden (descomponer, tejer, revivir), el claro deja de ser un reto. Medido el 2 de noviembre en 20 claros generados:
- **La política de las pistas** gana el 100 % de los claros, en el mes 8,7 de media (de 12).
- **El mejor juego posible** (la mejor de 2000 partidas al azar por claro) gana alrededor del mes 8. Ni el juego perfecto adelanta mucho, así que el reto no está en optimizar más.
- **El bot al azar** gana el 16 % (hasta el 40 % en algunos claros).
- **Nada juega en contra:** no hay mantenimiento, ni presión que avance, ni pérdida.

Sobran 3 o 4 meses. Quien busca un paseo tranquilo debe seguir teniéndolo; quien ya aprendió necesita un claro que le pida pensar.

## Qué cambia
- **Tres niveles** que se eligen al tocar «Nueva partida»:

  | | Brote | Bosque | Ancestral |
  | --- | --- | --- | --- |
  | Rocas en el claro | 6 (como hoy) | 8 | 10 |
  | Troncos | 5 | 5 | 5 |
  | Escarcha (tejer cuesta 2) | — | otoño | otoño e invierno |
  | Árboles que se apagan | — | 1, al cerrar el verano | 1 por estación (meses 3, 6 y 9) |
  | Pistas (★) | sí | sí | no |
  | Multiplicador de puntaje | ×1 | ×1,5 | ×2 |
  | Jugador con experiencia | gana siempre | pierde ~20 % | pierde ~50 % |

- **Escarcha:** en las estaciones frías del nivel, tejer cuesta 2 nutrientes en vez de 1. Los árboles producen igual. Se anuncia al empezar la estación.
- **Árboles que se apagan:** al empezar el último mes de la estación, el árbol gris más lejano de la red queda marcado. Si al terminar ese mes sigue gris, se apaga: revivirlo cuesta 5 nutrientes en vez de 3. Revivirlo ese mes lo salva.
- **Nunca se pierde lo logrado** (decisión del jugador): ninguna regla nueva toca la red, los árboles vivos, los nutrientes ni las esporas. La presión solo encarece lo que todavía no se reclamó.
- **Claros justos:** en todos los niveles el generador acepta solo claros que un bot experto gana; si se pierde, es por cómo se jugó, no por el mapa.
- **Más rocas, mismo claro:** la semilla fija el claro de Brote; Bosque y Ancestral le agregan rocas sobre la tierra, también según la semilla. El Brote arcano de Maestra Bruma (roca a micelio) gana valor.
- **Puntaje:** un solo récord por claro para los tres niveles; el total se multiplica por el nivel. Las estrellas siguen usando la referencia de Brote, así que en los niveles altos 3 estrellas son el premio por arriesgarse.
- **Ancestral sin pistas:** sin ★ en el dock ni en el tablero y sin «Pista:» en la bitácora. Los avisos de escarcha y del árbol marcado no son pistas: se muestran en todos los niveles que los tienen.

## Fuera de alcance
- Menos troncos (decisión del jugador: por ahora no).
- Reglas que quiten progreso: escarcha que congela micelio, árboles vivos que vuelven a gris, hambre del gremio.
- Desbloquear niveles o progresión por claro: los tres están disponibles desde el inicio.
- Una pieza pintada para el árbol marcado y el apagado: se usa un velo de escarcha (ver Decisiones).

## Impacto
- `game-rules`: niveles, escarcha, árboles que se apagan; modifica Tablero inicial, Tejer, Revivir y Dificultad medida.
- `player-guidance`: sin pistas en Ancestral; avisos de la presión.
- `title-screens`: «Nueva partida» abre «Elige tu claro» con los tres niveles.
- `scoring`: multiplicador, estrellas con referencia de Brote, nivel en el resultado y en el récord. Sube `SCORE_VERSION` (los récords anteriores dejan de leerse).
- `board-interaction`: nivel y escarcha en el HUD; árbol marcado y apagado en el tablero.
- `GameState` gana `level` y, por árbol, `fading` (marcado) y `faded` (apagado). `?nivel=brote|bosque|ancestral` en la URL.
- Depende de 017 (#15, salida tras «Ver el claro») y 018 (#16, portada sin personajes): el delta de `title-screens` › Portada parte del texto del 018. Fusionarlos antes de implementar.

## Decisiones (2 de noviembre)
Las tres preguntas abiertas de la propuesta quedaron cerradas así:
1. **Arte del árbol marcado y del apagado:** sin pieza pintada nueva. El árbol gris lleva un velo de escarcha de un color nuevo `frost` en `theme.ts`. El marcado late suave (quieto con movimiento reducido); el apagado tiene el velo fijo y un copo en la esquina.
2. **Pistas en Bosque:** la misma política que en Brote (seguirlas gana ~80 %), más los avisos de la presión en la bitácora. Las pistas no anticipan la presión.
3. **Intro:** la intro de 3 cartas se ve solo la primera vez que se juega cada nivel; las demás veces se entra directo al tablero.
