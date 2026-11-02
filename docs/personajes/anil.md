# Hoja de personaje: *Lactarius indigo* "Añil"

**Rol:** Tejedor · **Silueta:** embudo poco profundo de borde muy ondulado (variante 8, "Ondas marcadas") · **Accesorio:** carrete de hilo índigo

Hoja previa a Blender, según [Dirección de arte](../art-direction.md). Referencia del hongo real: *Lactarius indigo* (sombrero en embudo con anillos concéntricos, láminas azules, látex azul).

## Silueta
- Embudo poco profundo sobre un tallo medio: la silueta es un ▽, ancha arriba y estrecha en el cuello. Es lo contrario de los domos de Bruno y Rubí, anchos abajo.
- El borde tiene ondas marcadas: dos crestas altas a los lados y una más baja al centro. Las crestas son lo que ve la cámara a ¾, así que el borde se lee desde cualquier ángulo.
- Del hongo real tomamos: centro hundido con anillos concéntricos, borde ondulado, tallo corto y firme. Anillos, láminas y gotas son de color; no cambian la silueta.

## Proporciones
H = altura total.

| Parte | Medida |
| --- | --- |
| Sombrero | ≈ 0,55 H de alto (de la cresta al cuello) · ≈ 1,3 H de ancho en el borde |
| Cuello | ≈ 0,4 H de ancho, donde el embudo se une al tallo |
| Tallo | Recto, con un ligero ensanche en la base |
| Cara | En el tallo, justo bajo el cuello; sin ala que la tape |
| Sprite (cámara a ¾, 100 px/m) | ≈ 114 × 104 px en un lienzo de 176 × 128; copia a 56 px: ≈ 49 × 45 |

## Paleta
| Uso | Hex |
| --- | --- |
| Sombrero, sombra | `#2E3A7A` |
| Sombrero, base índigo | `#4A5FB0` |
| Anillos y luz (también sombra del tallo) | `#8FA6D8` |
| Láminas y látex | `#3C7FDB` |
| Tallo | `#D3DDEF` |

Comunes a todo el elenco: contorno `--ink` `#3B2A1E` (Tinta café de la paleta base), rubor `#E8957A`.
El carrete reutiliza la madera de la canasta de Bruno (`#D9B68C` con trama `#8C603D`); el hilo es `#4A5FB0` con luz `#8FA6D8`.
`capBlue` en `src/theme.ts` (`#9cb4c3`) es un gris azulado del PoC: no es el índigo de Añil.

## Accesorio de rol
Carrete de madera con pestañas e hilo índigo enrollado, a la izquierda del espectador (lado opuesto a la canasta de Bruno). Del carrete sale un hilo fino hasta el suelo con destellos índigo: el micelio que teje. A 56 px el hilo desaparece; es detalle para 128 px.

## Rasgo especial
Dos o tres gotitas de látex `#3C7FDB` cuelgan del filo de las láminas y una baja por el tallo.

## Expresión base
Tranquilo y concentrado, "contando puntos": ojos de punto algo más juntos que los de Bruno (cara más estrecha), boca pequeña con media sonrisa de lado, rubor más pequeño.
Para la ficha de criatura: "callado y paciente; cuenta los anillos de su sombrero como quien cuenta puntos de tejido".
Detalle opcional: una vuelta de hilo índigo alrededor del tallo, como faja. Queda dentro de la silueta; no ensancha el cuello.

## Vistas
- **Frente:** las dos crestas laterales del borde y, entre ellas, el hundimiento con 2–3 anillos concéntricos (índigo base y luz alternados). Bajo el borde, la cara inferior del ▽ muestra las láminas azul vivo hasta el cuello, con gotas colgando del filo. La cara en el tallo, bajo el cuello. Carrete a la cadera.
- **Perfil:** el embudo se ve como un cuenco de borde ondulado; la pendiente de láminas desde el borde hasta el cuello se ve entera. Carrete de lado (cilindro con pestañas) y el hilo cayendo al suelo.
- **¾ de espalda:** desde arriba se ve el interior del embudo con los anillos completos, como una diana. En la nuca del tallo, 2–3 manchas índigo oscuras (solo atrás, para no confundirlas con los ojos). El hilo deja un rastro de destellos en el suelo.

## Poses
| Pose | Descripción |
| --- | --- |
| Reposo | Expresión base, carrete a la cadera |
| Trabajando | Teje: tira del hilo del carrete hacia el suelo, donde brota el micelio |
| Feliz | Alza el carrete y suelta una gotita de látex |

## Prueba de silueta
Negro sobre blanco a 56 px, contra el domo bajo de Bruno (variante E) y el domo alto con falda de Rubí. Las siluetas de comparación de Rubí, Perico y Maestra Bruma son bocetos a partir de referentes: si cambian, hay que volver a medir.

| Variante | Solape con Bruno | Solape con Rubí | Perfil vs. Bruno | Perfil vs. Rubí |
| --- | --- | --- | --- | --- |
| 6 · Embudo suave | 0,48 | 0,47 | 0,42 | 0,48 |
| 7 · Embudo hundido | 0,39 | 0,34 | 0,43 | 0,48 |
| **8 · Ondas marcadas** | 0,48 | 0,52 | 0,45 | 0,41 |

Solape (IoU): menor es mejor. Perfil (diferencia de anchos fila por fila): mayor es mejor.

**Elegida: 8**, por decisión de dirección de arte. Es la más distinta de Bruno en perfil, pero queda más cerca de Rubí que la 7: las crestas le dan algo de altura de domo. Para que no se confunda con Rubí:
- El ▽ manda: el borde siempre más ancho que cualquier parte del tallo y el cuello estrecho. Rubí es ancha abajo del sombrero y tiene falda en el tallo.
- Las crestas no deben subir más de lo dibujado (≈ 0,2 H sobre el cuello del borde); más altas, el sombrero se lee como domo.
- El carrete y el bolso de Rubí no deben ir en el mismo lado ni a la misma altura; se recomienda el bolso de Rubí cruzado sobre el pecho.

### Contorno de referencia (variante 8)
Unidades: x centrado en 0, suelo en y = 100; 100 unidades = 56 px.

```
Sombrero y tallo  M-52,26 Q-34,8 -16,22 Q0,12 16,22 Q34,8 52,26 Q56,30 50,34 Q30,42 20,52 Q16,57 17,62
                  L18,96 Q19,100 22,100 L-22,100 Q-19,100 -18,96 L-17,62 Q-16,57 -20,52 Q-30,42 -50,34 Q-56,30 -52,26 Z
Carrete           rect(-50,70,16,18) · pestañas rect(-52,68,20,3) y rect(-52,86,20,3)
```

## Notas para Blender
- Modelar el borde con 6 lóbulos (ondas alrededor de todo el embudo), no solo dos crestas: así la cámara a ¾ siempre ve crestas en el contorno.
- Las láminas van en la cara inferior del embudo, en `#3C7FDB` con las bandas de sombra de `Toon3`.
