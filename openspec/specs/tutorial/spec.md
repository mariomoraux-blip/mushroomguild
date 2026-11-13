# tutorial

## Purpose
«Cómo jugar» (hasta el 048, «Primeros pasos»): la partida guiada antes de Brote, con viñetas (máscara con hueco y globo) sobre la interfaz real. Origen: cambio 046 (archivado); el 048 lo puso en la portada como «Cómo jugar» y lo saca de los niveles una vez visto. Nivel en `src/rules/config.ts` (`LEVELS.tutorial`, `TUTORIAL_MAP`), guion en `src/tutorial.ts`, bloqueo de acciones en `src/store.ts` y viñetas en `src/ui/coach.ts`.

## Requirements

### Requirement: Nivel Primeros pasos
El juego SHALL tener un tutorial (`tutorial`, «Cómo jugar» desde el 048) que se juega en un claro fijo, con un Árbol Ancestral que pide 2 árboles revividos, sin escarcha, árboles que se apagan, hambre ni plaga. Maestra Bruma SHALL llegar como en los demás niveles, al empezar el mes siguiente al segundo árbol revivido. El tutorial no SHALL dar puntaje ni entrar al ranking. Se empieza con «Cómo jugar» en la portada (siempre) o en «Elige tu dificultad» (solo mientras no se haya completado ni saltado). `?nivel=tutorial` SHALL entrar directo al tutorial.

#### Scenario: Se gana siguiendo el guion
- WHEN el jugador hace cada paso del guion
- THEN despierta al Árbol Ancestral en el mes 6

#### Scenario: Sin puntaje
- WHEN el jugador gana el tutorial
- THEN no se muestra puntaje ni se ofrece registrarlo en el ranking

### Requirement: Viñetas paso a paso
Durante el tutorial, el juego SHALL mostrar un paso a la vez: una máscara oscura sobre toda la pantalla con un hueco redondeado sobre el objetivo del paso y un globo con su texto, el contador «Paso N de M» y «Saltar tutorial». El globo SHALL ir encima, debajo o al costado del objetivo sin taparlo. Un paso «Ver» SHALL pasar con «Siguiente» (o Enter); un paso «Hacer» SHALL pasar solo cuando el jugador hace la acción indicada sobre el objetivo, y cualquier otra acción no SHALL tener efecto. El guion SHALL enseñar a elegir un miembro, ver su ficha, descomponer, tejer, revivir, terminar el mes, leer «Ver el mes», reclutar, pasar la voz con Chispa, los hechizos de Maestra Bruma, Pompón, la Libreta y las ★.

#### Scenario: Paso Hacer
- WHEN el paso dice «Elige a Bruno»
- THEN solo Bruno responde al toque y, al elegirlo, el tutorial pasa al paso siguiente

#### Scenario: Paso Ver
- WHEN el paso muestra el Árbol Ancestral
- THEN el globo tiene «Siguiente» y el tablero no responde

### Requirement: Saltar el tutorial
«Saltar tutorial» SHALL pedir confirmación en el mismo globo. Al confirmar, el juego SHALL volver a «Elige tu dificultad» con el foco en Brote, y el tutorial SHALL contar como visto.

#### Scenario: Saltar
- WHEN el jugador pulsa «Saltar tutorial» y confirma
- THEN vuelve a «Elige tu dificultad» y «Cómo jugar» ya no aparece ahí

### Requirement: Final del tutorial
Al despertar al Árbol Ancestral en el tutorial, el juego SHALL mostrar la carta «¡Ya sabes jugar!» con «Jugar Brote» (principal) y «Volver a la portada», y el tutorial SHALL contar como visto.

#### Scenario: Terminar
- WHEN el jugador despierta al Árbol Ancestral en el tutorial
- THEN aparece «¡Ya sabes jugar!» y «Jugar Brote» empieza una partida en Brote sin las cartas de intro

### Requirement: Viñetas accesibles
El globo SHALL ser legible y usable a 390 × 844, en horizontal y con teclado: texto de al menos 16 px, botones de al menos 44 px, foco en el objetivo (paso «Hacer») o en «Siguiente» (paso «Ver»), Tab limitado al objetivo y al globo, y Esc sin saltar el tutorial. Con `prefers-reduced-motion: reduce`, el aro del hueco no SHALL latir y el hueco SHALL cambiar de lugar sin deslizarse.

#### Scenario: Solo teclado
- WHEN el jugador recorre el tutorial solo con Tab, Enter y Esc
- THEN puede completarlo
