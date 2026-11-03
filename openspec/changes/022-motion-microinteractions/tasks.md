# Tareas · 022

Orden por prioridad. El número de fila (`#`) remite a la tabla de `design.md` › Recomendaciones. Antes de empezar, se responden las preguntas abiertas de `proposal.md`.

## 0. Auditoría y propuesta (esta sesión)
- [x] 0.1 Inventario de lo que ya se anima
- [x] 0.2 Auditoría con Playwright a 390 × 664 táctil, con video hasta la llegada de Maestra Bruma (12 momentos)
- [x] 0.3 Verificar los 4 problemas reportados
- [x] 0.4 Principios, tokens, tabla y costos (`design.md`)
- [x] 0.5 Aprobación de la propuesta (ficha opción B; Esc en Maestra Bruma según la propuesta). Nombre: se queda «Árbol Padre». Pendiente: pregunta 3 (vibración, antes de 3.2)

## P0 · Que el jugador entienda
- [x] 1.1 Problema 1: Esc y el gesto «atrás» cierran la capa de arriba (hoja, ficha, carta) sin salir del juego (`history.pushState` por capa y `popstate` → `cancel`). Con Maestra Bruma, según la pregunta 4. Humo: `page.goBack()` en cada capa (fila 11a)
- [x] 1.2 Problema 2: la ficha de la primera vez no se abre sola; punto «nuevo» y un latido en «Ficha», y la línea de la bitácora (fila 3a; delta de `player-guidance`)
- [x] 1.3 Problema 3: tocar una casilla visible del tablero con una ficha abierta la cierra y hace la jugada (fila 11a)
- [x] 1.4 Problema 4: se queda «Árbol Padre» (decisión de Mario, 2 de noviembre); la etiqueta accesible ya es correcta y no cambia nada (fila 14)
- [x] 1.5 Base: `MOTION` en `src/theme.ts`, variables `--motion-*` en `styles.css`, regla de movimiento reducido selectiva, ayudantes `replay` y `countChange` (`src/ui/motion.ts`) y jugadas del 004 migradas a los tokens (fila 0)
- [x] 1.6 Rechazo en el lugar del toque: aro en la casilla, «Zz» que se mece en la tarjeta cansada, contador que falta teñido (fila 5)
- [x] 1.7 HUD: saltito y etiqueta «±n» en los cuatro contadores (fila 6)
- [x] 1.8 Pasar la voz: efecto `call` en `src/effects.ts` (con prueba), notitas en arco hasta el dock (`flyers.ts`, WAAPI) y despertar de la tarjeta (fila 4b)
- [x] 1.9 Pruebas: unitarias de `call` y de las etiquetas del HUD; humo de los escenarios P0, con movimiento reducido y sin él

## P1 · Sensación
- [x] 2.1 Hojas, fichas y cartas: entrada y salida (fila 11b). `showLayer` / `hideLayer` en `src/ui/motion.ts`; la capa que sale no atrapa toques
- [x] 2.2 Intro y «Elige tu dificultad»: cambio de carta y «Saltar» (fila 2). La carta vieja queda como copia muda (`turnCard`)
- [x] 2.3 Selección: tarjeta que sube, casillas válidas en fundido escalonado, latido de la ★ (fila 3b)
- [x] 2.4 Firma por especie al llegar a la casilla y en el dock; destello índigo al tejer (las jugadas del 004 ya usan los tokens desde 1.5) (fila 4a)
- [x] 2.5 Reclutar: entrada del nuevo miembro al dock (fila 10)
- [x] 2.6 Fin del mes: hojarasca al contador, retratos que se van y tarjetas que despiertan; luna del botón (fila 7). El efecto `spores` lleva `leaves` (con prueba)
- [x] 2.7 Cambio de estación: fundido del claro (copia en `CanvasTexture`, como la de la selección, en lugar de `RenderTexture`), etiqueta y corona de Chispa; ráfaga de la estación. CPU ×4 en Chromium sin pantalla: mediana de 22 ms por cuadro y p95 de 34 ms, igual que un fin de mes sin estación (20 y 34 ms); el único tirón es el repintado del claro al despachar, que ya existía. Falta medir en un Android real (4.2)
- [x] 2.8 Maestra Bruma: carta, entrada al dock, aro `arcane` en Brote arcano; token `arcane` validado con su retrato (fila 9). `arcane` = `#80E6E5`, el cian de su bastón: su retrato no tiene violeta (`design.md` › Colores)
- [x] 2.9 Victoria: pausa de 600 ms con el anillo, el halo y la ola dorada, que se puede saltar; fin del invierno con la luz que baja (fila 12). Con movimiento reducido, la pausa es `standard` (280 ms; la spec decía 300)
- [x] 2.10 Pruebas de humo de los escenarios P1, con movimiento reducido y sin él; capturas `022-despertar-390x844.png` y `022-victoria-390x844.png`

## P2 · Deleite
- [ ] 3.1 Entrada de la portada (fila 1)
- [ ] 3.2 Vibración opcional con interruptor (fila 13, pregunta 3)

## Cierre
- [ ] 4.1 `docs/art-direction.md` › Movimiento: reemplazar por los principios, tokens y firmas de `design.md`
- [ ] 4.2 Definición de terminado:
  - `npm run test` (incluido `balance.test.ts`) y `npm run build` sin warnings.
  - Capturas a 390 × 844, 844 × 390 y escritorio con teclado.
  - `prefers-reduced-motion` revisado momento por momento.
  - 60 fps en Android de gama media (o CPU ×4).
- [ ] 4.3 Fusionar las deltas en `openspec/specs/` y archivar el cambio
