# Hoja de personaje: *Gliophorus psittacinus* "Chispa"

**Rol:** Mensajera · **Silueta:** campana pequeña, viscosa y brillante · **Accesorio:** saquito de cartas

Hoja previa a Blender, según [Dirección de arte](../art-direction.md). Referencia del hongo real: *Gliophorus psittacinus* (sombrero acampanado, viscoso y brillante, que pasa de verde loro a amarillo, naranja o rosa; tallo amarillento y viscoso).

## Silueta
- Campana pequeña con un pezón diminuto en la cima y el borde algo abierto hacia fuera, sobre un tallo esbelto.
- Es la más pequeña del gremio y la silueta más fácil de distinguir: solape de 0,22–0,38 con las demás en las pruebas a 56 px.
- Se mantiene la regla del 55 % para el sombrero. El hongo real tiene el tallo largo, pero siendo la más pequeña necesita cuerpo para la cara.

## Proporciones
H = altura total (0,60 m).

| Parte | Medida |
| --- | --- |
| Sombrero | ≈ 0,55 H de alto · ≈ 0,75 H de ancho, borde abierto |
| Tallo-cuerpo | ≈ 0,25 H de ancho; la cara justo bajo el borde |
| En el gremio | 0,75 de Bruno (ver [Altura relativa](#altura-relativa)) |
| Sprite (cámara a ¾, 100 px/m) | ≈ 60 px de alto en el lienzo de 176 × 128; ≈ 26 px en la copia a 56 px |

## Paleta por estación
El sombrero cambia con la estación; tallo y láminas no.

| Estación | Sombra | Base | Luz | Brillo |
| --- | --- | --- | --- | --- |
| Primavera, verde loro | `#2F7A3E` | `#4FB04A` | `#8FD66A` | `#E9FBD9` |
| Verano, amarillo | `#B8901C` | `#E8C22E` | `#F7E17A` | `#FFF8D6` |
| Otoño, naranja | `#B4511F` | `#E87B2E` | `#F6AE6A` | `#FFEAD6` |
| Invierno, rosa | `#A8476E` | `#E07BA3` | `#F3B3CB` | `#FFE8F1` |

Tallo y láminas, todo el año: `#F2E6B6` (sombra `#D6C78A`).
Comunes a todo el elenco: contorno `--ink` `#3B2A1E` (Tinta café de la paleta base), rubor `#E8957A`.
Saquito de cuero `#B98A5E` (sombra `#8C603D`), correa en Madera `#8B5E3C`, sobre crema `#F2E9D8` con sello `#CF4D3C`.

En primavera el verde queda cerca del follaje (`canopy` `#7CC36A`); el contorno café lo separa, pero hay que comprobarlo sobre el tablero.

### Cómo aplicar la estación
La dirección de arte dice "tinte del sprite". El tinte por defecto de Phaser multiplica: teñiría también contorno, cara, tallo y saquito, y no daría los hex exactos. Opciones:
- **Recomendada:** renderizar una variante por estación desde Blender (3 poses × 4 estaciones = 12 sprites pequeños), con los hex exactos.
- **Tinte en tiempo real:** renderizar el sombrero en grises en una capa aparte y teñir solo esa capa sobre el cuerpo sin teñir.

Cualquiera de las dos pide actualizar esa línea de `art-direction.md`.

**Decisión:** una variante de sprite por estación. Con el tinte que multiplica, desde la base verde `#4FB04A` no se llega a las otras estaciones: el rojo tendría que multiplicarse por ≈ 2,9 y multiplicar solo oscurece.

## Modelo y sprites
- `assets/blender/gliophorus-perico.blend`: modelo y poses en `poses_perico.py` (reposo; trabajando, entregando una carta; feliz). `estacion(...)` cambia la paleta del sombrero (y de la gota). Sombrero con el grupo `Toon4` de `gremio-base.blend`.
- `assets/sprites/gliophorus-{reposo,trabajando,feliz}-{primavera,verano,otono,invierno}.png` (176 × 128) y copias `-56.png`. Los `gliophorus-{pose}.png` sin estación son idénticos a los de primavera.
- Hoja de contacto: `perico-estaciones.png` (4 estaciones × 3 poses, arriba a 128 px recortado y abajo a 56 px).

**Brillo a 56 px**, por estación (píxeles de brillo, % del sombrero, luminancia del brillo frente al resto del sombrero):

| Estación | Píxeles | % | Luminancia |
| --- | --- | --- | --- |
| Primavera | 27–39 | 11–16 | 237–242 / 137–138 |
| Verano | 30–40 | 13–16 | 240–243 / 178–179 |
| Otoño | 30–41 | 13–17 | 233–235 / 133 |
| Invierno | 25–31 | 11–14 | 234–235 / 138–140 |

Se lee en las cuatro: una franja de ≈ 2 px de ancho más el punto de la cima. Verano es la de menos contraste (el amarillo ya es claro), pero el brillo sigue ≈ 60 puntos por encima. El borde húmedo queda en 1 px y apenas se nota a 56 px; a 128 px sí.

## Brillo húmedo en toon
Sobre las 3 bandas de `Toon3` (sombra, base, luz), el sombrero suma:
1. **Brillo especular duro** (4.ª banda): grupo `Toon4` = Glossy BSDF (rugosidad ≈ 0,15) → Shader to RGB → umbral → color de **brillo**. Una mancha alargada arriba a la izquierda (del lado de la luz) y un punto cerca de la cima. Mínimo 2 px a 56 px; si no, el sombrero se lee mate.
2. **Borde húmedo:** línea fina del color de **luz** sobre el lado en sombra, pegada al contorno, como si la viscosidad dejara pasar la luz. Layer Weight (Facing) → umbral, solo dentro de la banda de sombra.
3. **Gota viscosa** colgando del borde, del color base, con su propio punto de brillo.

Sin degradados: todo son manchas planas de borde nítido, como el resto del elenco.

## Accesorio de rol
Saquito de cuero en bandolera, a la cadera, con un sobre crema asomando y sello rojo.

## Expresión base
Vivaz y charlatana: ojos de punto, boca pequeña en "o" (a punto de dar la noticia), rubor.
Para la ficha de criatura: "lo sabe todo antes que nadie y no se lo guarda".

## Vistas
- **Frente:** campana con el brillo arriba a la izquierda y el borde húmedo a la derecha; gota colgando del borde. Cara en el tallo bajo el borde; correa cruzando en diagonal hasta el saquito en la cadera.
- **Perfil:** la campana se ve igual de alta; el borde abierto sobresale un poco por delante y por detrás. El saquito, de lado, con el sobre asomando.
- **¾ de espalda:** la campana entera con el brillo en la parte alta; la correa cruza la espalda y el saquito asoma por el costado.

## Poses
| Pose | Descripción |
| --- | --- |
| Reposo | Expresión base, saquito a la cadera |
| Trabajando | "Pasa la voz": saca una carta del saquito y la alza |
| Feliz | Saltito con el sobre en alto |

## Altura relativa
Es la más pequeña del gremio: **0,60 m, el 75 % de Bruno**.

| Personaje | Altura | Relativa a Bruno |
| --- | --- | --- |
| Maestra Bruma | 1,35 m | 1,7× |
| Indi | 0,84 m | 1,05× |
| Bruno | 0,80 m | 1× |
| Rubí | 0,76 m | 0,95× |
| **Chispa** | **0,60 m** | **0,75×** |

Es el mínimo razonable: más baja, el sombrero quedaría por debajo de ≈ 18 px de ancho a 56 px y se perderían el brillo y la cara.

### Contorno de referencia
Unidades: x centrado en 0, suelo en y = 100; 1 unidad = 1 cm.

```
Sombrero  M-23,74 Q-19,66 -16,55 Q-11,40 0,39 Q11,40 16,55 Q19,66 23,74 Q12,70 0,70 Q-12,70 -23,74 Z
Tallo     M-7,71 Q-8,86 -8,100 L8,100 Q8,86 7,71 Z
Saquito   rect(7, 85, 7, 6)
```
