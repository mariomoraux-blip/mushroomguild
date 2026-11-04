# Diseño · 029

- `howtoArt(step, state)` arma cada miniatura con `span` y las clases del juego (`card`, `card__medal`, `card__badge`, `card__name`, `end`, `chip`, `recipe__tile`, `recipe__chip`). Así la miniatura cambia sola si cambia el componente.
- Todo va dentro de `.howto__art` con `aria-hidden="true"` e `inert`: es decoración; el texto del paso lo explica.
- Las tarjetas del dock usan `--dock-h` como en el dock. En horizontal la miniatura se achica con `zoom`/`scale` para caber en 96 px de alto.
- Paso 5: el valor de nutrientes es `motherCost(state.game)`; desde la portada es el del nivel guardado (10 en Brote, 12 en Bosque y Ancestral). El texto dice los dos.
- Sin animación nueva: nada que adaptar para `prefers-reduced-motion`.
