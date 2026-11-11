# Diseño · 039

## Reglas (`src/rules/`)
- `SpeciesId` suma `morchella | ganoderma | lycoperdon`. `RecruitableSpecies` sigue excluyendo a la maga; `RECRUITABLE` pasa a `['gliophorus', 'morchella', 'ganoderma', 'lycoperdon']`. `STARTING_GUILD` no cambia.
- `recruit` rechaza una especie que ya está en el gremio con «Ya hay una <especie> en el gremio.». La hoja de reclutar deshabilita esas filas.
- `memberNames` queda con un nombre por especie reclutable (Chispa, Panal, Ámbar, Pompón); `nameIdx` se conserva para no tocar el formato del estado.
- Costos nuevos en `config.ts`: `COST.breakRock = 2`, `COST.heal = 1` (esporas que suma la Ganoderma), `COST.puff = 1` (nutriente del Lycoperdon), `GAIN.puff = 2` (esporas), `HEAL_REACH = 2`.
- Distancia de la Ganoderma: pasos en cruz desde la casilla tejida más cercana, sin importar rocas (igual que la plaga). Un árbol que toca la red también vale.
- La Ganoderma sobre una casilla con plaga quita la plaga al momento: si seguía tejida, sigue en la red; si estaba marchita, vuelve a ser tierra. Además cuenta como «un hongo trabajó cerca» para cualquier otra plaga.
- La escarcha no cambia ningún costo nuevo.

## Bots
- `PolicyOptions.recruitOrder` usa las especies nuevas. La política de las pistas aprende a usar cada especie solo cuando ayuda al siguiente paso: Morchella cuando una roca alarga el camino al Árbol Padre o a un árbol; Ganoderma cuando un árbol gris está a 2 casillas y tejer hasta él cuesta más; Lycoperdon cuando faltan esporas para el próximo recluta o para pasar la voz y sobran nutrientes para el siguiente paso.
- `EXPERT_VARIANTS` y `SEARCH_VARIANTS` prueban órdenes de reclutar con las especies nuevas, para que la certificación siga encontrando victorias.
- El orden de la pista (sin trabajo útil) se elige midiendo; arranca en Gliophorus, Morchella, Ganoderma, Lycoperdon.

## Interfaz
- Tokens nuevos en `theme.ts`: `honey` (Morchella), `lacquer` (Ganoderma), `puff` (Lycoperdon), para siluetas, sombreros del dock y destellos.
- Receta visual: Morchella (red y roca resaltada → red y tierra, −2 nutrientes); Ganoderma (red, una tierra y árbol gris resaltado → árbol vivo, −3 nutrientes −1 espora); Lycoperdon (árbol vivo resaltado → árbol vivo con esporas, −1 nutriente +2 esporas).
- Efectos (`effects.ts`, `fx.ts`): `crumble` (la roca se parte en piedras, ≤ 400 ms), revivir reutiliza el de la Amanita con un hilo dorado desde la red, `puff` (nube de esporas al contador).
- `CHARACTER_DIR` apunta a `panal`, `ambar` y `pompon` (retratos de Mario, 280 px, ≤ 21 KB cada uno); si un retrato faltara, `SILHOUETTE` dibuja la silueta con su color.
- La receta del Ganoderma (3 casillas → 1) no cabe en una línea a 360 px: `.recipe` puede partirse y el «después» baja entero.
- «El gremio» marca con «Solo reclutando» las cuatro especies que no están al empezar; en la hoja de reclutar la especie que ya está queda atenuada con «Ya está en el gremio.».
