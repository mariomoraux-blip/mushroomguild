# Tareas · 002

## 1. Base
- [ ] 1.1 `store.ts`: estado actual, `dispatch(accion)`, suscriptores
- [ ] 1.2 `theme.ts` con la paleta de `docs/art-direction.md` (papel, madera, tinta café, acento)
- [ ] 1.3 Shell móvil: HUD arriba, área de tablero, dock abajo; altura `100dvh`, áreas seguras, sin scroll durante la partida

## 2. Tablero
- [ ] 2.1 `GameScene`: tablero vertical de 5×8 con placeholders por tipo de casilla y líneas de micelio
- [ ] 2.2 Escalado: casillas ≥ 64 px a 390 × 844; el tablero completo siempre visible
- [ ] 2.3 Variante horizontal (tablero a la izquierda, dock a la derecha) y escritorio centrado

## 3. Gremio y acciones
- [ ] 3.1 Dock del gremio: tarjeta por miembro (sombrero, nombre, rol, lista / descansa), objetivos táctiles ≥ 44 px
- [ ] 3.2 Selección: resaltar solo `validTargets`; tocar casilla resaltada ejecuta `act`
- [ ] 3.3 Aviso breve de bitácora sobre el dock con el motivo de una acción inválida
- [ ] 3.4 Reclutar por especie (hoja inferior en móvil), deshabilitado si no alcanza o el gremio está completo
- [ ] 3.5 Maese Bruma: al seleccionarlo, elegir hechizo (Brote arcano / Lluvia de esporas) y luego casilla; mostrar si su magia ya se usó esta estación
- [ ] 3.6 Fichas de criatura: un botón de información por especie abre su ficha (nombre científico, rol, acción)
- [ ] 3.7 Terminar el día; en el día 12 el botón dice "Terminar el invierno"

## 4. HUD y accesibilidad
- [ ] 4.1 HUD compacto: día de 12 y estación, nutrientes, esporas, árboles vivos de 5
- [ ] 4.2 Teclado en escritorio: Tab recorre miembros y casillas válidas, Enter actúa, Esc cancela
- [ ] 4.3 Pausar al ocultar la pestaña

## 5. Verificación
- [ ] 5.1 Playwright con emulación táctil: elegir a la Lactarius indigo, tejer, terminar día; capturas a 390 × 844, 844 × 390 y 1280 × 800
- [ ] 5.2 Pull request con capturas, link de preview y guion de playtest en teléfono real
