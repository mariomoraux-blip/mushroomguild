# Hoja de personaje: *Amanita muscaria* "Rubí"

**Rol:** Sanadora · **Silueta:** domo rojo con verrugas y falda en el tallo (variante R1, "Sombrilla") · **Accesorio:** bolso con hojas que curan

Hoja previa a Blender, según [Dirección de arte](../art-direction.md). Referencia del hongo real: *Amanita muscaria* (sombrero rojo con verrugas blancas, láminas blancas, anillo en el tallo, base bulbosa con volva).

## Silueta
- Domo rojo ancho, de sombrilla, con verrugas crema que rompen el contorno, sobre un tallo-cuerpo esbelto con falda y base bulbosa.
- Frente a Bruno, que también es domo, la masa del sombrero se parece; la diferencia está en los detalles del contorno:
  - **Verrugas:** contorno irregular frente al domo liso de Bruno.
  - **Tallo esbelto:** la mitad de ancho que el barril de Bruno, con falda a ⅓ de su altura.
  - **Base bulbosa** con rebordes de volva, frente a la base cortada en plano de Bruno.
  - **Sin nada al costado:** el bolso va por delante; el costado derecho es de la canasta de Bruno y el izquierdo, del carrete de Indi.

## Proporciones
H = altura total (≈ 0,76 m).

| Parte | Medida |
| --- | --- |
| Sombrero | 0,55 H de alto · ≈ 1,4 H de ancho con las verrugas |
| Tallo-cuerpo | ≈ 0,4 H de ancho (Bruno: ≈ 0,8 H); la cara entre el borde del sombrero y la falda |
| Falda | Baja, justo sobre el bulbo, ≈ 0,7 H de ancho, borde ondulado |
| Base | Bulbo de ≈ 0,55 H de ancho con 2 rebordes de volva |
| Sombrero en 3D | Echado 14° hacia atrás, levantando el ala del lado de la cámara |
| Sprite (cámara a ¾, 100 px/m) | ≈ 110 × 82 px en un lienzo de 176 × 128; copia a 56 px: ≈ 47 × 36 |

En el modelo, el ala de sombrilla tapaba la cara desde la cámara a ¾ (15° de elevación). Para que se vea, el sombrero va echado hacia atrás, la falda baja junto al bulbo (en la silueta de frente estaba a ⅓ del tallo) y la cara sube hasta justo bajo el ala.

## Paleta
| Uso | Hex |
| --- | --- |
| Sombrero, sombra | `#A63A2C` |
| Sombrero, rojo | `#CF4D3C` (= `capRed` en `src/theme.ts`) |
| Sombrero, luz | `#E8705A` |
| Crema: verrugas, falda, tallo, láminas | `#F2E9D8` (= tallo de Bruno) |
| Sombra de la crema | `#D6C3A2` (= sombra del tallo de Bruno) |

Comunes a todo el elenco: contorno `--ink` `#3B2A1E` (Tinta café de la paleta base), rubor `#E8957A`.
El bolso es de cuero en los marrones de la canasta de Bruno (`#B98A5E`, sombra `#8C603D`); las hojas, `#7CC36A` con sombra `#5E9A4F`, como el musgo de Bruno.

## Accesorio de rol
Bolso en bandolera: la correa cruza el pecho en diagonal y el bolso descansa en la cadera delantera, con hojas que curan asomando. Va por delante a propósito: queda dentro de la silueta y no ocupa el costado de la canasta de Bruno ni el del carrete de Indi.

## Expresión base
Dulce y atenta: ojos de punto, sonrisa pequeña y suave, el rubor más marcado del elenco.
Para la ficha de criatura: "cuida de todos y siempre lleva una hoja de más".

## Vistas
- **Frente:** domo de sombrilla con 6–8 verrugas crema de distintos tamaños (las del contorno, las más grandes). Bajo el borde, franja de láminas crema. Cara en el tallo, con la correa del bolso cruzando por debajo. Falda colgando con borde ondulado; base bulbosa con dos rebordes.
- **Perfil:** el domo se ve igual de ancho que de frente; el bolso sobresale por delante, a la cadera, con las hojas hacia arriba. La falda, como una campana corta.
- **¾ de espalda:** verrugas también atrás, sin patrón regular. La correa cruza la espalda; las hojas del bolso asoman por el costado.

## Poses
| Pose | Descripción |
| --- | --- |
| Reposo | Expresión base, bolso a la cadera |
| Trabajando | Saca una hoja del bolso y la apoya en un árbol gris |
| Feliz | Da un saltito con una hoja en alto |

## Prueba de silueta
Negro sobre blanco a 56 px, contra el domo bajo de Bruno (variante E) y el embudo de Indi (variante 8). Las siluetas de Chispa y Maestra Bruma son bocetos: si cambian, hay que volver a medir.

| Variante | Solape con Bruno | Perfil vs. Bruno | Peor solape con el resto |
| --- | --- | --- | --- |
| **R1 · Sombrilla** | 0,62 | 0,36 | Indi 0,53 |
| R2 · Domo alto | 0,47 | 0,51 | Indi 0,61 |
| R3 · Huevo | 0,35 | 0,64 | Indi 0,50 |

Solape (IoU): menor es mejor. Perfil (diferencia de anchos fila por fila): mayor es mejor.

**Elegida: R1**, por decisión de dirección de arte, aunque es la más cercana a Bruno de todas las medidas. Cabe en el lienzo común de 128 px, cosa que la R3 no.

Reforzar los detalles no cambia el solape de áreas, porque lo domina la masa del sombrero (medido: verrugas más grandes 0,64; tallo más fino 0,61; ambas cosas y falda más ancha 0,63). La diferencia con Bruno depende del contorno, así que hay que confirmarla a ojo con los sprites reales a 56 px, como se hizo con Indi (`silueta-56-bruno-indi.png`). Reglas para que no se pierda:
- Verrugas del contorno de ≥ 5 unidades de radio (≈ 3 px a 56 px), para que el borde se lea irregular.
- Tallo ≤ 0,4 H de ancho y falda claramente acampanada: la cintura estrecha bajo el sombrero es lo que Bruno no tiene.
- Nada colgando a los costados.

**Con los sprites reales** (cámara a ¾, 56 px, ver `silueta-56-bruno-rubi-indi.png`): solape con Bruno 0,63 en reposo, 0,60 trabajando y 0,71 feliz; con Indi, 0,49–0,56. En negro, Rubí se separa de Bruno por la cintura estrecha entre el sombrero de base plana y la falda; las verrugas apenas abultan el contorno a 56 px.

### Contorno de referencia (variante R1)
Unidades: x centrado en 0, suelo en y = 100; 100 unidades = 56 px.

```
Sombrero  M-52,65.8 Q-54.6,24 0,24 Q54.6,24 52,65.8 Q26,59.8 0,59.8 Q-26,59.8 -52,65.8 Z
Verrugas  círculos r=4 en (±46.8,41.7) (±31.2,29.1) (±8.4,24.3)
Tallo     rect(-15, 61.8, 30, 38.2)
Falda     M-15,76.1 L-27,87.1 L27,87.1 L15,76.1 Z
Base      elipse centro (0,90), radios 21 × 10
```
