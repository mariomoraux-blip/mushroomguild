# Diseño · 040

## Reglas
- `Puff = 'spores' | 'nutrients'` y `Choice = Spell | Puff`. `check`, `validTargets` y `act` aceptan una elección opcional; para Pompón, sin elección vale `spores` (compatibilidad con pruebas y registros viejos de la misma versión no hay: sube `SCORE_VERSION`).
- El registro guarda la elección de Pompón en `spell` (el mismo campo de los hechizos), y `replay`/`replayStrict` se la pasan a `act`. `verify.ts` acepta `spores` y `nutrients` en ese campo.
- Costos: `COST.puff = 1` nutriente y `GAIN.puff = 2` esporas (como hoy); `COST.compost = 2` esporas y `GAIN.compost = 1` nutriente.
- Rechazos nuevos: «Faltan 2 esporas para abonar.». Inactivo: sin árbol vivo, «todavía no hay árboles vivos…»; con árbol vivo pero sin 1 nutriente ni 2 esporas, «no alcanza para ningún cambio.».

## Interfaz
- El store trata a Pompón como a Maestra Bruma: al elegirlo abre la hoja de elección (`sheet: { kind: 'spell' }`) y guarda la elección en `ui.spell`. La hoja muestra los hechizos o los dos cambios según la especie.
- Efecto: abonar vuela hojas (nutrientes) desde el árbol al contador; soplar sigue volando esporas.
- Recetas: dos, «Soplar esporas» (−1 nutriente, +2 esporas) y «Abonar el árbol» (−2 esporas, +1 nutriente).

## Bots
- Pompón abona cuando ya no hay cupo para reclutar y quedan 2 esporas por encima de la que guarda para la Gliophorus o el Ganoderma; sopla cuando hay en qué gastar esporas y quedan nutrientes para revivir.
