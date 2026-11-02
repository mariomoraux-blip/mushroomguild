# Tareas · 002

## 1. Base
- [x] 1.1 `store.ts`: estado actual, `dispatch(accion)`, suscriptores
- [x] 1.2 `theme.ts` con la paleta de `docs/art-direction.md`: papel #F3E9D2, madera #8B5E3C, tinta café #3B2A1E, acento #E8A33D, micelio #B9F0D6, destello índigo #4B5FD6, tierra base #7A5C3E (sin #17150F)
- [x] 1.3 Shell móvil: HUD arriba, área de tablero, dock abajo; altura `100dvh`, áreas seguras, sin scroll ni zoom por doble toque durante la partida

## 2. Tablero
- [x] 2.1 `GameScene`: tablero vertical de 5×8 con placeholders por tipo de casilla y líneas de micelio
- [x] 2.2 Escalado: casillas ≥ 64 px a 390 × 844, ≥ 56 px a 390 × 664 y nunca < 48 px en vertical; ≥ 44 px a 844 × 390; ≤ 96 px; el tablero completo siempre visible
- [x] 2.3 Variante horizontal (tablero a la izquierda, dock a la derecha) y escritorio centrado

## 3. Gremio y acciones
- [x] 3.1 Dock del gremio en una fila: tarjeta por miembro (sombrero, nombre, rol, lista / descansa), objetivos táctiles ≥ 44 px; scroll horizontal interno con la tarjeta siguiente asomando cortada, orden estable de llegada y "Terminar el día" fijo fuera del scroll en la misma fila
- [x] 3.2 Selección: resaltar solo `validTargets`; tocar casilla resaltada ejecuta `act`
- [x] 3.3 Aviso breve de bitácora sobre el dock con el motivo de una acción inválida; `idleReason(state, memberId)` en `src/rules` devuelve una clave y el aviso "Nombre: motivo" sale de `es.ts`
- [x] 3.4 Reclutar por especie (hoja inferior en móvil), deshabilitado si no alcanza o el gremio está completo
- [x] 3.5 Maestra Bruna: al seleccionarlo, elegir hechizo (Brote arcano / Lluvia de esporas) y luego casilla; mostrar si su magia ya se usó esta estación
- [x] 3.6 Fichas de criatura: un botón de información por especie abre su ficha (nombre científico, rol, acción y línea con humor de `es.ts`; Champiñón = *Agaricus bisporus*)
- [x] 3.7 Terminar el día, en la fila del dock; en el día 12 el botón dice "Terminar el invierno"

## 4. HUD y accesibilidad
- [x] 4.1 HUD compacto: día de 12 y estación, nutrientes, esporas, árboles vivos de 5
- [x] 4.2 Teclado en escritorio: Tab recorre miembros y casillas válidas, Enter actúa, Esc cancela
- [x] 4.3 Pausar al ocultar la pestaña

## 5. Verificación
- [x] 5.1 Playwright con emulación táctil: elegir al Lactarius indigo, tejer, terminar día; capturas a 390 × 844, 390 × 664, 844 × 390 y 1280 × 800
- [ ] 5.2 Proyecto listo para Vercel (build de Vite en `dist/`) y pasos en el README para conectar la cuenta
- [ ] 5.3 Pull request con capturas, link de preview de Vercel y guion de playtest en teléfono real
