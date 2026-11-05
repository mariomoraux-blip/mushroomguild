# Diseño · 031

- `LevelRules.motherTrees` junto a `mother`; `motherTrees(s)` en `state.ts` como `motherCost(s)`. `TREES_FOR_MOTHER = 3` sigue siendo el valor de Brote y Bosque y el mínimo de árboles con que se genera un claro (`mapgen`: al menos `TREES_FOR_MOTHER + 2` = 5), así que Ancestral siempre tiene árboles de sobra para pedir 4.
- `actions.ts` (rechazo «El bosque aún no habla») y `advice.ts` (tejer hacia el Árbol Padre) leen `motherTrees(s)`.
- Textos fuera de la partida (`es.ts`): `motherNeeds` arma «3 árboles revividos y 10 nutrientes (4 y 12 en Ancestral)» desde `LEVELS`; si los niveles vuelven a coincidir, el paréntesis desaparece solo. Dentro de la partida, `tileHelp.mother(n, trees)` y `help.goal(n, trees)` reciben lo del nivel.
- La miniatura del paso 5 de «Cómo jugar» muestra los árboles del nivel de la partida.
- Con 12 nutrientes algunos claros dejan de poder ganarse (85 de 100 certificados en Ancestral); el juego solo sirve los certificados, y el piso de Ancestral en `balance.test.ts` baja a 80.
- **Respaldo:** `levelMap` caía al clásico (semilla 0) cuando ningún intento servía, y el clásico ya no se gana en Ancestral. Ahora cae a `firstCertified(level)`, la primera semilla con claro certificado; la semilla 0 sigue siendo el clásico para `?map=clasico` y las pruebas de humo.
- **Fuera de la tabla:** `levelAttempt` recibe cuántos intentos probar; fuera de la tabla son `MAP_GEN.levelAttemptsOutside` = 10 (cada intento juega `playExpert`). Sin el tope, una semilla sin intento válido tardaba 225 ms en Node.
