# 046 · Primeros pasos: una partida guiada

> Implementado el 13 de noviembre de 2026.

## Por qué
Hoy el jugador nuevo aprende con la intro, las fichas, las ★ y la Libreta, pero tiene que descubrir solo el orden de las cosas (elegir un hongo, tocar una casilla, terminar el mes) y las piezas avanzadas (reclutar, pasar la voz, Maestra Bruma, Pompón). Mario (13 de noviembre de 2026) pidió una partida guiada antes de Brote, con viñetas paso a paso sobre la interfaz real, usando máscaras y globos.

## Decisiones de Mario
- **Corta y con meta reducida:** un claro fijo hecho a mano; el Árbol Padre pide 2 árboles revividos y pocos nutrientes. Se gana en unos 6 meses (8–10 min) y termina con el Padre despertando.
- **Solo el paso indicado:** la máscara oscurece todo menos el objetivo y lo demás no responde. Siempre se puede saltar.
- **Qué enseña:** lo básico (elegir, descomponer, tejer, revivir, terminar el mes), reclutar con esporas, pasar la voz con Chispa, Maestra Bruma, Pompón, la ficha, la Libreta y las ★.
- **Entrada:** «Primeros pasos» es la primera opción de «Elige tu dificultad», marcada «Recomendado» hasta que se complete o se salte. Las 3 cartas de intro van antes del tutorial y ya no se repiten en Brote.

## Qué cambia
- **Nivel «Primeros pasos»** (`tutorial`) en `LEVELS`: claro fijo (`TUTORIAL_MAP`), Árbol Padre de 2 árboles, Maestra Bruma al revivir el segundo árbol (como siempre), recursos iniciales ajustados al guion, sin escarcha, plaga ni apagados. No da puntaje ni entra al ranking.
- **Guion** (`src/tutorial.ts`, junto al store, sin DOM): una lista de pasos. Cada paso dice qué resaltar, el texto del globo y qué acción lo completa (o «Siguiente» si solo explica). El store solo deja pasar la acción del paso.
- **Viñetas** (`src/ui/coach.ts`): máscara oscura con un hueco redondeado sobre el objetivo, globo con flecha, contador «Paso 4 de 28» y «Saltar tutorial».
- **Final:** carta «¡Ya sabes jugar!» con «Jugar Brote» (principal) y «Volver a la portada».
- **Textos:** todos en `src/copy/es.ts`, frases cortas y tono cozy.

## Fuera
- Reglas de Brote, Bosque y Ancestral: no cambian.
- Arte nuevo: no hace falta; el globo usa el panel y los retratos que ya existen.

## Riesgos
- El guion depende de la interfaz: si cambia el dock o el HUD, hay que revisar los objetivos. Lo cubre una prueba de humo que recorre el tutorial completo.
- Un guion estricto puede sentirse lento: cada globo lleva una frase y cada paso de «Siguiente» se puede pasar con un toque o con Enter.

## Impacto
- **Specs:** `tutorial` (nueva); `title-screens` › Elige tu dificultad.
- **Código:** `src/rules/` (`types.ts`, `config.ts`, `state.ts`, `mapgen.ts`, `scoring.ts`, `verify.ts`), `src/tutorial.ts` (nuevo), `src/store.ts`, `src/main.ts`, `src/ui/coach.ts` (nuevo), `src/ui/screens.ts`, `src/ui/story.ts`, `src/copy/es.ts`, `src/styles.css`.
- **Pruebas:** `tutorial.test.ts` (el guion se gana al pie de la letra y el store bloquea lo demás), humo que recorre el tutorial en vertical, horizontal y con teclado, con capturas.
