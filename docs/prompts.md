# Prompts · El Gremio de los Hongos

Prompts listos para copiar en Claude Code (nube) y en la sesión local de arte (Blender MCP).
Regla de oro: **una sesión = un cambio**. Cada cambio pasa por cuatro prompts: planear → implementar → revisar → cerrar.

Índice
- [0. Arranque de sesión](#0-arranque-de-sesión-todas-las-sesiones)
- [1. Cambio 001 · Reglas](#1-cambio-001--montar-el-proyecto-y-portar-las-reglas)
- [2. Cambio 002 · Tablero jugable](#2-cambio-002--tablero-jugable-en-phaser)
- [3. Cambio 003 · Historia y estaciones](#3-cambio-003--historia-estaciones-y-color)
- [4. Cambio 004 · Sensación y arte](#4-cambio-004--sensación-y-arte-final)
- [5. Arte en Blender (sesión local)](#5-arte-en-blender-sesión-local)
- [6. Prompts transversales](#6-prompts-transversales)

---

## 0. Arranque de sesión (todas las sesiones)

Pégalo al inicio de cada sesión nueva, antes del prompt del cambio.

```
Vamos a trabajar en el cambio <ID> de OpenSpec.
Antes de nada: lee CLAUDE.md, openspec/project.md y todo openspec/changes/<ID>/.
Confirma en 3 líneas qué entendiste del cambio y qué NO incluye.
Si hay cambios anteriores sin archivar en openspec/changes/, dímelo.
```

---

## 1. Cambio 001 · Montar el proyecto y portar las reglas

### 1.1 Planear
```
Planea 001-port-rules. Solo plan, sin código.
Incluye:
1. Archivos a crear y la responsabilidad de cada uno.
2. Versiones exactas para Vite, TypeScript, Phaser, Vitest y Playwright (estables, sin rangos).
3. Cómo mapeas cada escenario de specs/game-rules/spec.md a un test (tabla escenario → test).
4. Cómo traduces la partida guiada del PoC al mapa vertical de 5×8 con (x, y) → (y, 7 − x).
5. Dudas o contradicciones en la spec. Si una regla no está especificada, pregunta; no la inventes.
Detente y espera mi aprobación.
```

### 1.2 Implementar
```
Aprobado. Implementa 001 siguiendo tasks.md en orden.
- Marca cada tarea en tasks.md al terminarla.
- src/rules/ no importa Phaser ni toca el DOM; las acciones devuelven un estado nuevo.
- Todos los números de balance viven en config.ts; todos los textos en src/copy/es.ts.
- Corre npm run test y npm run build al final y pégame el resumen.
- Si algo te obliga a salirte del plan, detente y avísame antes.
```

### 1.3 Revisar
```
Revisa tu propio trabajo en 001 como lo haría un revisor exigente:
- ¿Cada escenario de la spec tiene su test y el test falla si la regla se rompe?
- ¿Algún número de balance o texto quedó fuera de config.ts / es.ts?
- ¿Alguna acción muta el estado recibido?
- ¿El test de balance usa semilla y reporta tasa de victoria y mes medio?
Lista lo que encuentres y corrígelo. No agregues alcance nuevo.
```

### 1.4 Cerrar
```
Cierra 001:
- Fusiona el delta de specs/game-rules/ en openspec/specs/game-rules/spec.md.
- Mueve openspec/changes/001-port-rules/ a openspec/changes/archive/.
- Abre el pull request con: captura de BootScene, resultado del test de balance
  (tasa de victoria del bot y mes de la partida guiada) y una línea de qué probar.
```

---

## 2. Cambio 002 · Tablero jugable en Phaser

### 2.1 Planear
```
Planea 002-board-interaction. Solo plan, sin código.
Lee también docs/art-direction.md (layout móvil y paleta).
Incluye:
1. Cómo se reparte la UI entre Phaser (tablero) y DOM (HUD, dock, bitácora) y cómo se conectan vía store.
2. Cálculo del tamaño de casilla para 390×844, 844×390 y 1280×800 (mínimo 64 px, máximo 96 px).
3. Cómo manejas toques vs. clics, el zoom por doble toque y el scroll de la página.
4. Qué pruebas con Playwright (emulación táctil) y en qué tamaños tomas capturas.
5. Dudas sobre la spec board-interaction.
Detente y espera mi aprobación.
```

### 2.2 Implementar
```
Aprobado. Implementa 002 siguiendo tasks.md en orden y márcalas al terminar.
- Mobile-first: construye y revisa primero a 390×844; después horizontal y escritorio.
- Usa formas y colores de theme.ts como placeholders; nada de arte final.
- Toda acción del jugador pasa por rules; las escenas solo dibujan el estado.
- Al final: npm run test, npm run build y el test de humo de Playwright con las tres capturas.
```

### 2.3 Revisar
```
Revisa 002 contra la spec y la checklist móvil:
- ¿Las casillas miden ≥ 64 px a 390×844 y todo el tablero es visible sin scroll?
- ¿Todos los controles miden ≥ 44 px y nada depende de hover?
- ¿Una acción inválida muestra el motivo exacto de check()?
- ¿Se puede jugar un mes completo solo con teclado en escritorio?
- ¿El juego se pausa al ocultar la pestaña?
Corrige lo que falle y muéstrame las capturas de nuevo.
```

### 2.4 Cerrar
```
Cierra 002: fusiona el delta en openspec/specs/board-interaction/spec.md,
archiva el cambio y abre el pull request con las tres capturas y este guion de
playtest para teléfono: elegir al Lactarius indigo, tejer, descomponer un tronco, revivir
dos árboles, recibir a Maestra Bruma, lanzar un Brote arcano y reclutar una Gliophorus.
```

---

## 3. Cambio 003 · Historia, estaciones y color

### 3.1 Planear
```
Planea 003-story-presentation. Solo plan, sin código.
Incluye:
1. Cómo implementas la gradación por estación solo sobre el escenario (no personajes ni UI) en Phaser.
2. Cómo combinas esa gradación con la saturación del progreso.
3. Valores propuestos de theme.ts para las 4 estaciones según la tabla de docs/art-direction.md.
4. Cómo haces accesibles las cartas de intro y final (foco, Esc, lectores de pantalla) y legibles a 360 px.
5. Cómo pruebas visualmente las 4 estaciones y los 2 finales sin jugar 12 meses.
Detente y espera mi aprobación.
```

### 3.2 Implementar
```
Aprobado. Implementa 003 siguiendo tasks.md y márcalas al terminar.
- Agrega una forma de saltar a un mes y estado concretos solo en modo desarrollo
  (por ejemplo ?debugDay=10) para poder revisar estaciones y finales.
- Textos de cartas en src/copy/es.ts, idénticos a la spec.
- Al final: tests, build y capturas a 390×844 de las 4 estaciones y los 2 finales.
```

### 3.3 Revisar
```
Revisa 003:
- ¿Personajes y paneles conservan su color en todas las estaciones?
- ¿El invierno se lee como anochecer y el micelio es lo más brillante de la escena?
- ¿El modo debug está desactivado en el build de producción?
- ¿Las cartas se pueden cerrar con teclado y leen bien a 360 px?
Corrige y muéstrame las capturas.
```

### 3.4 Cerrar
```
Cierra 003: fusiona el delta en openspec/specs/story-presentation/spec.md,
archiva el cambio y abre el pull request con las 6 capturas.
```

---

## 4. Cambio 004 · Sensación y arte final

### 4.1 Planear
```
Planea 004-visual-feedback. Solo plan, sin código.
Incluye:
1. Lista de animaciones con duración y easing (todas ≤ 400 ms).
2. Cómo detectas prefers-reduced-motion y qué muestra cada animación en ese modo.
3. Cómo cargas el atlas de sprites si existe y el fallback a formas si no.
4. Presupuesto de partículas y cómo mides fps en móvil.
5. Qué recortarías primero si el cambio no cabe en una sesión.
Detente y espera mi aprobación.
```

### 4.2 Implementar
```
Aprobado. Implementa 004 siguiendo tasks.md y márcalas al terminar.
- Primero las animaciones de las 3 acciones; después el cambio de mes; al final partículas.
- El juego debe verse y funcionar igual sin el atlas de public/assets/atlas/.
- Al final: tests, build, tamaño total de dist/assets y una captura antes/después.
```

### 4.3 Revisar
```
Revisa 004:
- ¿Alguna animación supera 400 ms o bloquea la siguiente acción?
- ¿Con movimiento reducido no hay desplazamientos ni partículas?
- ¿Hay errores en consola sin el atlas?
- ¿public/assets pesa 4 MB o menos y la primera carga baja en menos de 3 s?
Corrige y reporta los números.
```

### 4.4 Cerrar
```
Cierra 004: fusiona el delta en openspec/specs/visual-feedback/spec.md,
archiva el cambio y abre el pull request con capturas y el peso de los assets.
```

---

## 5. Arte en Blender (sesión local)

Estos prompts van en una sesión local de Claude con Blender abierto y el MCP conectado, no en la nube.

### 5.1 Hoja de personaje
```
Lee docs/art-direction.md. Quiero la hoja de personaje de la <ESPECIE> antes de modelar.
Descríbeme: silueta, proporciones (sombrero ≈ 55 % de la altura), paleta de 4–5 colores
con hex, accesorio de rol y expresión base. Después propón 3 variaciones de silueta
y dime cuál se distingue mejor de las otras cuatro especies sin color.
```

### 5.2 Primer personaje (validación)
```
Modela la <ESPECIE> en Blender según la hoja aprobada:
- Low-poly, shader toon de 2–3 bandas, contorno café oscuro (casco invertido o Line Art).
- Cámara ortográfica a ¾, fondo transparente.
- Render PNG de 128 px de alto en pose de reposo.
Muéstrame el render y una versión reducida a 56 px para juzgar si se lee en un teléfono.
No hagas más personajes hasta que lo apruebe.
```

### 5.3 Producción
```
Aprobado el estilo. Con la misma cámara, luces y materiales:
- Modela las otras cuatro especies (Maestra Bruma al final: es el más complejo) y el Árbol Padre (dormido y despierto).
- Renderiza 3 poses por especie: reposo, trabajando, feliz.
- Exporta los PNG con nombres <especie>-<pose>.png y arma un atlas (PNG + JSON
  compatible con Phaser) de 2048 px como máximo.
- Guarda el .blend y dime el peso total del atlas.
```

---

## 6. Prompts transversales

### Playtest → feedback
```
Hice un playtest en teléfono. Notas:
<pega tus notas tal cual>
Clasifícalas en: bug (rompe una spec), ajuste (cabe en una spec existente) o
idea nueva (necesita su propio cambio). Para cada bug, dime qué escenario de la
spec lo cubre o propón el escenario que falta. No escribas código todavía.
```

### Nuevo cambio desde una idea
```
Crea un cambio de OpenSpec nuevo: <ID> · <título>.
Idea: <describe la idea>.
Escribe proposal.md, tasks.md y el delta de spec con requisitos SHALL y
escenarios WHEN/THEN. Verifica que sirva a al menos uno de los 3 pilares de
openspec/project.md; si no, dímelo antes de escribir nada.
```

### Ajuste de balance
```
Quiero ajustar el balance: <qué se siente mal>.
Propón cambios solo en config.ts, uno a la vez, y para cada uno corre la
simulación de balance y dame: tasa de victoria del bot, mes medio y mes de
victoria de la partida guiada. No cambies reglas, solo números.
```

### Retomar una sesión interrumpida
```
Retomamos el cambio <ID>. Lee tasks.md y dime qué está marcado, qué falta y si
el último estado del código pasa npm run test. Continúa desde la primera tarea
sin marcar.
```

### Control de créditos
```
Antes de seguir: ¿cuántas tareas quedan de este cambio y cuáles podrías dejar
para otro cambio sin romper la spec? Propón el corte mínimo que deja algo jugable.
```
