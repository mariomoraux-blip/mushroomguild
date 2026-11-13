# Diseño · 046

## Claro del tutorial
Fijo, 5 × 8 como todos (`TUTORIAL_MAP`), ajustado con la prueba que juega el guion:

```
y0  .  .  .  M  .     M Árbol Padre
y1  .  .  .  .  .
y2  .  R  R  R  .     R rocas: Maestra Bruma abre (3,2), junto al segundo árbol, con el Brote arcano
y3  .  .  .  T  .     T árbol gris 2
y4  .  L  .  .  L     L troncos (el de la derecha, para el turno extra que da Chispa)
y5  .  .  T  .  .     T árbol gris 1
y6  .  .  .  .  .
y7  .  L  H  .  .     L tronco junto al Hogar; H Hogar
```

Reglas del nivel `tutorial` en `LEVELS`: empieza con 2 nutrientes y 4 esporas (`start`), Árbol Padre de 2 árboles y 9 nutrientes, sin escarcha, apagados, hambre ni plaga, `rooted: false`, sin ★ propias (aparecen desde su paso y marcan lo que pide el guion), multiplicador 0. Con esos números el guion se gana justo en el mes 6: al llegar al Árbol Padre hay 8 nutrientes y el que falta lo da Pompón al abonar.

Ajustes frente al borrador: el primer tronco está junto al Hogar (si no, Bruno no lo alcanza en el mes 1); hace falta un tercer tronco para que Chispa tenga sentido (Bruno trabaja otra vez); el Árbol Padre pasa a (3,0) para que la roca que abre Maestra Bruma toque el segundo árbol; Pompón se recluta en el mes 5 y trabaja en el 6 (en el mes 4 no alcanzaban las esporas sin regalar 6 al empezar).

## Guion
Cada paso es **Ver** (se pasa con «Siguiente») o **Hacer** (una o más acciones, en orden; lo demás no responde). 28 pasos:

| Mes | # | Tipo | Acciones | Enseña |
| --- | --- | --- | --- | --- |
| 1 | 1–2 | Ver | Árbol Padre · pastillas del HUD | la meta y los recursos |
| | 3 | Hacer | Bruno → Ficha → Entendido → tronco (1,7) | elegir, la ficha, descomponer |
| | 4 | Hacer | Indi → (2,6) | tejer |
| | 5 | Hacer | «Fin del mes» | una vez por mes |
| 2 | 6 | Ver | bitácora y «Ver el mes» | qué pasó al empezar el mes |
| | 7–9 | Hacer | Rubí → árbol (2,5) · Bruno → tronco (1,7) · Indi → (2,4) | revivir; un tronco da dos veces |
| | 10 | Hacer | «Fin del mes» | los árboles dan |
| 3 | 11 | Hacer | «Reclutar» → Chispa | reclutar con esporas; llega cansada |
| | 12–13 | Hacer | Indi → (3,4) · Bruno → tronco (1,4) | |
| | 14 | Hacer | «Fin del mes» | |
| 4 | 15–18 | Hacer | Bruno → (1,4) · Chispa → (1,4) · Bruno → (4,4) · Rubí → árbol (3,3) | pasar la voz; el segundo árbol trae a la maga |
| | 19 | Hacer | «Fin del mes» | |
| 5 | 20 | Hacer | cerrar la carta de Maestra Bruma | |
| | 21 | Hacer | Bruma → Brote arcano → roca (3,2) | hechizos |
| | 22 | Hacer | «Reclutar» → Pompón | |
| | 23 | Hacer | Indi → (3,1) | |
| | 24 | Ver | «?» | Cómo jugar y la Libreta |
| | 25 | Hacer | «Fin del mes» | |
| 6 | 26 | Ver | Pompón con la ★ | las ★ |
| | 27 | Hacer | Pompón → Abonar → árbol (3,3) | abonar |
| | 28 | Hacer | Rubí → Árbol Padre | ganar |

Los textos viven en `es.tutorial`; los números salen de `COST`, `GAIN`, `RECRUIT_COSTS` y `LEVELS.tutorial`.

## Viñetas
```
┌──────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░│  máscara: tinta al 60 %
│░░░░░░░░╭──────╮░░░░░░░░░░│
│░░░░░░░░│ Bruno│░░░░░░░░░░│  hueco redondeado con 6 px de aire y un aro que late
│░░░░░░░░╰──────╯░░░░░░░░░░│
│░░░░░░╭───────▲────────╮░░│
│░░░░░░│ Elige a Bruno.  │░░│  globo de pergamino con flecha hacia el hueco
│░░░░░░│ Paso 3 de 30    │░░│
│░░░░░░│ [Saltar tutorial]│░░│  en «Ver»: [Siguiente] como botón principal
│░░░░░░╰────────────────╯░░│
└──────────────────────────┘
```
- **Máscara:** la sombra enorme de un aro con bordes redondeados hace de máscara (sin SVG). Cuatro bloques alrededor del hueco atrapan los toques; el hueco deja pasar el toque al objetivo real. Así el tutorial usa la interfaz de verdad, no una copia.
- **Globo:** encima o debajo del objetivo, donde quepa; nunca lo tapa. Ancho máximo de 320 px; en horizontal, al costado. Texto ≥ 16 px.
- **Objetivos:** se buscan por selector (`[data-id]` del dock, `.cell[data-x][data-y]`, `.end`, `.chip`, `#month-btn`, botón «?», botones de hojas). Si el objetivo cambia de lugar (rotación, scroll del dock), la máscara se recalcula.
- **Accesibilidad:** el globo es un `role="dialog"` no modal con `aria-live`. En «Hacer» el foco va al objetivo; en «Ver», a «Siguiente». Enter avanza. Tab solo recorre el objetivo y los botones del globo. Esc no salta el tutorial (cierra hojas como siempre).
- **Movimiento reducido:** el aro no late y el hueco salta en vez de deslizarse.
- **Saltar:** «Saltar tutorial» pide confirmar en el mismo globo («¿Saltar el tutorial? Sí · No»). Al confirmar, vuelve a «Elige tu dificultad» con el foco en Brote y el tutorial cuenta como visto.

## Estado
- `GameState.level = 'tutorial'` y `UiState.tutorial = { step, part }`. `currentPart` (en `src/tutorial.ts`) da el texto y la acción esperada; el reducer rechaza en silencio cualquier otra acción (salvo pasar la intro) y avanza cuando llega la esperada. Un toque que las reglas rechazan deja el motivo en la bitácora y no avanza.
- `localStorage['gremio.tutorial'] = 'done' | 'skipped'` quita el «Recomendado». Si el almacenamiento falla, el tutorial se recomienda siempre.
- `?nivel=tutorial` entra directo (para las pruebas de humo).

## Pruebas
- `tutorial.test.ts`: juega el guion paso a paso con el store y gana en el mes 6; una acción fuera del guion no cambia nada; saltar lleva a «Elige tu dificultad».
- Humo: recorre el tutorial completo a 390 × 844, en horizontal y solo con teclado; capturas de un paso «Ver», uno «Hacer» y el final.
