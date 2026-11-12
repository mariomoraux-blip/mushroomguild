# 042 · Más eventos por estación en Bosque y Ancestral

## Por qué
Mario (11 de noviembre de 2026) quiere seguir subiendo la dificultad. Se midieron 16 palancas sueltas en los tres niveles. Mario eligió sumar **eventos por estación**, no escasez de recursos ni reloj.

## Qué cambia
- **Bosque:**
  - La escarcha dura otoño e invierno (antes, solo otoño).
  - La plaga llega en invierno: marca una casilla tejida al empezar el mes 10.
  - Es el primer contacto con la plaga antes de Ancestral.
  - Se apaga un árbol también al terminar el mes 4 (meses 4 y 6).
- **Ancestral:** también se apaga un árbol al terminar el mes 2. Los meses pasan a 2, 3, 5, 7, 9 y 11 (seis veces).
- **Brote:** no cambia.
- **Balance:** los rangos de las pistas bajan.
  - Bosque: de 55–70 % a 35–50 %.
  - Ancestral: de 10–25 % a 10–20 %.
  - El piso de claros certificados baja a 85 en Bosque y a 60 en Ancestral.
- **Textos:**
  - La línea de cada nivel en «Elige tu dificultad».
  - «Cómo jugar».
  - La carta «Llega el frío» de Bosque, que ahora avisa la plaga del invierno.
- **Puntaje:** los `actionLog` guardados de Bosque y Ancestral ya no se reproducen igual, así que `SCORE_VERSION` pasa a 12 (Temporada 12).

## Riesgos
- Menos claros certificados en Ancestral: la medición sobre los claros de hoy deja 48 de cada 100. Al regenerar, cada semilla prueba otros acomodos de rocas.
- La plaga en Bosque aparece con pistas. Las pistas ya saben limpiar una casilla marchita con el Ganoderma, pero no frenan una casilla marcada.

## Impacto
- **Specs:**
  - `game-rules` › Niveles de dificultad, Dificultad medida, Escarcha y Plaga.
  - `game-rules` › Árboles marcados: se quita y se agrega «Árboles que se apagan» con seis meses en Ancestral.
  - `story-presentation` › Llega el frío.
- **Código:** `src/rules/config.ts` (`LEVELS`, `SCORE_VERSION`), `level-seeds.ts`, `src/copy/es.ts` y `src/ui/story.ts`.
- **Pruebas:** `tests/balance.test.ts`, `plague.test.ts`, `levels.test.ts` y las de humo con textos de nivel.
