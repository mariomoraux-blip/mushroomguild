# Hoja de personaje: Champiñón "Bruno"

**Rol:** Descompositor · **Silueta:** domo bajo y ancho (variante E, "Hogaza baja") · **Accesorio:** canasta

Hoja previa a Blender, según [Dirección de arte](../art-direction.md). Referencia del hongo real: champiñón café (cremini).

## Silueta
- Domo bajo, ancho y liso sobre un cuerpo-tallo redondo en forma de barril. Es el más ancho y el más bajo del gremio: la única silueta en forma de ◠ ancho.
- Del hongo real tomamos: borde del sombrero enrollado hacia dentro (deja ver una franja crema de láminas), 2–3 fibras radiales cerca de la cima, y base del tallo cortada en plano. Sin pies.
- La canasta, colgada al costado de la cadera, es lo único que rompe la simetría.

## Proporciones
H = altura total.

| Parte | Medida |
| --- | --- |
| Sombrero | 0,55 H de alto · 1,55 H de ancho |
| Cuerpo-tallo | 0,45 H visibles · ≈ 0,8 H de ancho (el más grueso del elenco); nace ancho, justo bajo el ala |
| Brazos | Muñones cortos, a ⅔ de la altura del cuerpo |
| Cara | En el cuerpo, justo bajo la franja de láminas |
| Sprite (cámara a ¾, 100 px/m) | ≈ 126 × 92 px en un lienzo de 176 × 128; copia a 56 px: ≈ 55 × 40 |

## Paleta
| Uso | Hex |
| --- | --- |
| Sombrero, base | `#B98A5E` (= `capBrown` en `src/theme.ts`) |
| Sombrero, sombra | `#8C603D` |
| Sombrero, luz y fibras | `#D9B68C` |
| Tallo y láminas | `#F2E9D8` |
| Sombra de tallo y láminas | `#D6C3A2` |

Comunes a todo el elenco: contorno `--ink` `#3B2A1E` (Tinta café de la paleta base), rubor `#E8957A`.
La canasta reutiliza la paleta: trama `#8C603D` sobre `#D9B68C`.

## Accesorio de rol
Canasta de mimbre con asa, colgada del brazo a la derecha del espectador. Lleva astillas de tronco y un brote de musgo asomando.

## Expresión base
Contento y sin prisa: ojos de punto bajo el ala, a la sombra del sombrero, más separados que en el resto del elenco; boca pequeña con sonrisa cerrada; rubor ancho y bajo.
Para la ficha de criatura: "el panadero del bosque: huele a tierra mojada y nunca tiene prisa".

## Vistas
- **Frente:** domo simétrico; el ala cae sobre la parte alta del cuerpo. Bajo el ala, la franja crema de láminas y justo debajo la cara. Canasta a la altura de la cadera. Base plana.
- **Perfil** (mirando hacia el lado de la canasta): el ala sobresale ≈ 0,35 H por delante y por detrás del tallo; el borde enrollado se dibuja como una curva hacia dentro bajo el ala. Un ojo y el rubor cerca del borde frontal del cuerpo; la canasta delante de la cadera, con el asa sobre el brazo.
- **¾ de espalda:** domina la cima del domo, con las fibras radiales llegando a un punto algo desplazado del centro. Nuca del tallo lisa, sin cara. El asa y el borde de la canasta asoman por un costado; el ala tapa casi todo el cuerpo desde arriba.

## Poses
| Pose | Descripción |
| --- | --- |
| Reposo | Expresión base, canasta colgando |
| Trabajando | Desmenuza un tronco dentro de la canasta |
| Feliz | Levanta la canasta |

## Prueba de silueta
Negro sobre blanco a 56 px, contra embudo (Indi, variante 6), domo alto con falda (Rubí), campana (Chispa) y cono alto (Maestra Bruma). Las siluetas de comparación son bocetos a partir de referentes, no diseños finales: si cambian, hay que volver a medir.

| Variante | Peor solape (IoU, menor es mejor) | Más parecida a | Diferencia de perfil mínima (mayor es mejor) |
| --- | --- | --- | --- |
| A · Hogaza | 0,49 | Embudo y domo alto | 0,40 |
| B · Botón | 0,60 | Domo alto | 0,30 |
| C · Portobello | 0,48 | Embudo | 0,43 |
| D · Panecillo | 0,55 | Domo alto | 0,38 |
| **E · Hogaza baja** | **0,48** | Embudo | 0,42 |

**Elegida: E.** Empata con C en números, pero C es más ancha arriba (ala levantada), igual que el embudo; E es más ancha en la base del sombrero y conserva las formas redondas.

Para que no se confunda con Indi:
- El tallo de Bruno nace ancho bajo el ala; el de Indi se estrecha en ▽. No engordar el cuello de Indi ni adelgazar el de Bruno.
- La canasta de Bruno va del lado contrario al carrete de Indi.

### Contorno de referencia (variante E)
Unidades: x centrado en 0, suelo en y = 100; 100 unidades = 56 px.

```
Sombrero  M-62,58 Q-64,20 0,20 Q64,20 62,58 Q60,64 52,64 L-52,64 Q-60,64 -62,58 Z
Tallo     M-32,60 Q-40,82 -30,100 L30,100 Q40,82 32,60 Z
Canasta   M36,76 L62,76 L58,96 L40,96 Z
Asa       M40,77 Q49,60 58,77   (trazo de 4 unidades)
```
