# Hoja de personaje: *Conocybe arcana* "Maestra Bruna"

**Rol:** Maga · **Silueta:** cono alto con la punta doblada en rizo (variante D2), túnica larga · **Accesorio:** bastón de ramita con una espora luminosa

Hoja previa a Blender, según [Dirección de arte](../art-direction.md). *Conocybe* es un género real de sombrero cónico; *arcana* es inventado: es el único personaje fantástico del gremio.

**Género:** femenino. El rol es "Maga". El nombre es "Maestra Bruna" (antes "Maese Bruma").

## Carácter
Sabia y amable, nunca amenazante:
- **Nada que apunte con filo:** la punta del sombrero termina en un rizo redondo; la túnica es una campana suave.
- **Cara despejada:** el borde del cono queda sobre la frente; los ojos nunca quedan en sombra.
- **Colores cálidos:** sombrero rojo que se aclara hasta el blanco, punta naranja, estrellas doradas, túnica color tallo, cabello rubio, espora de micelio con halo.

## Silueta
- Cono alto sin ala, que se abre un poco en el borde, con la punta doblada y enrollada en espiral (rizo).
- Tallo largo en forma de túnica de campana hasta el suelo, en el beige de un tallo de hongo y con fibras verticales; la parte alta del tallo, más clara, es la cara.
- Cabello de hilos de micelio cayendo a ambos lados de la cara hasta los hombros.
- Bastón de ramita a su lado, con la espora por encima del hombro.

## Proporciones
H = altura total (≈ 1,30–1,35 m): la más alta del gremio.

| Parte | Medida |
| --- | --- |
| Sombrero | ≈ 0,6 H de alto (del borde a lo alto del rizo) · ≈ 0,58 H de ancho en el borde |
| Rizo de la punta | ≈ 0,12 m de diámetro; ≈ 5 px a 56 px |
| Túnica | Del cuello al suelo, ≈ 0,5 H de ancho abajo |
| Bastón | Hasta ≈ 0,7 H; la espora a la altura del sombrero |
| Lienzo | No cabe en 176 × 128 a 100 px/m: usar 176 × 160 con la misma escala y el suelo a la misma distancia del borde inferior |

## Paleta
**Sombrero: degradado continuo** de rojo amanita (abajo) a blanco (arriba); la punta pasa a naranja de golpe. Es una excepción intencional a "sin degradados", solo para la maga. Cada color lleva su sombra para el toon.

| Parte | Base | Sombra |
| --- | --- | --- |
| Sombrero, abajo: rojo amanita (= `capRed`) | `#CF4D3C` | `#A63A2C` |
| Sombrero, paso intermedio: coral | `#E57F66` | `#C0604C` |
| Sombrero, paso intermedio: rosado | `#F4B9A6` | `#D69A88` |
| Sombrero, arriba: blanco | `#FBF1E6` | `#DCCFC0` |
| Punta en rizo: naranja de otoño (= Chispa en otoño) | `#E87B2E` | `#B4511F` |
| Motas-estrella (doradas, para que se vean sobre el blanco) | `#F2C14E` | — |
| Túnica color tallo (fibras verticales en la sombra) | `#E6D3B3` | `#C4AB86` (cuello en luz `#F2E6CF`) |
| Cara y parte alta del tallo | `#F2E9D8` | `#D6C3A2` |
| Cabello de micelio, rubio | `#F2D98B` | `#D1B25E` |
| Bastón (Madera de la paleta base) | `#8B5E3C` | — |
| Espora luminosa (Micelio de la paleta base) | `#B9F0D6`, núcleo `#F4FFF9` | halo `#DFF8EC` |

Comunes a todo el elenco: contorno `--ink` `#3B2A1E`, rubor `#E8957A`.
Coral y rosado son los pasos del degradado; en el render salen solos de la interpolación entre rojo y blanco.
Estrellas y espora van sin sombreado toon (color plano) para que siempre se vean encendidas: es el "brilla siempre un poco".

## Accesorio de rol
Bastón de ramita torcida con un brote lateral; en lo alto, la espora luminosa en forma de gota, con núcleo blanco y halo plano.

## Expresión base
Ojos de punto tranquilos, sonrisa pequeña, rubor. Sin cejas fruncidas ni ojos rasgados.
Para la ficha de criatura: "habla poco, sonríe mucho y siempre sabe qué estación viene".

## Vistas
- **Frente:** cono con el degradado de rojo a blanco y 5–7 estrellas doradas de cuatro puntas; arriba, el rizo naranja. El cabello rubio cae a ambos lados de la cara como cortinas. La cara en la parte clara del tallo; debajo, la túnica color tallo con el cuello en luz y fibras verticales. La mano derecha del espectador sujeta el bastón; la espora, a la altura del sombrero.
- **Perfil:** el cono, ligeramente echado atrás; el rizo se ve de lado, como un caracol. El cabello cae por la espalda. La túnica, una campana larga que roza el suelo; el bastón, por delante.
- **¾ de espalda:** estrellas también por detrás; el degradado se ve completo. El cabello hasta media espalda, con 2–3 hilos que brillan un poco en las puntas. El halo de la espora asoma por encima del hombro.

## Poses
| Pose | Descripción |
| --- | --- |
| Reposo | Apoyada en el bastón, expresión base |
| Trabajando | Alza el bastón: la espora se enciende más (Brote arcano / Lluvia de esporas) |
| Feliz | Ojos cerrados en arco, el rizo del sombrero rebota |

## Variaciones del doblez
| Doblez | Lectura |
| --- | --- |
| D1 · Caída suave | La punta cuelga como un gorro de dormir: amable, menos mágica |
| **D2 · Rizo** | La punta se enrolla en espiral: mágica y redonda, no apunta a nadie |
| D3 · Quiebre | Codo en ángulo con la punta afilada: hechicero clásico, pero el filo lo acerca a "bruja" |

**Elegida: D2.**

## Notas para Blender
- Sombrero: rampa de color por altura (coordenada Z del objeto) del borde al arranque de la punta, interpolación lineal de rojo a blanco, alimentando las entradas Base y Sombra de `Toon3` (dos rampas: una con las bases y otra con las sombras). La punta naranja, material aparte.
- Estrellas y espora: material de emisión plano, sin `Toon3`.
- Lienzo de 176 × 160 para este personaje.

## Modelo y sprites
- `assets/blender/mago-bruma.blend`: modelo y poses en `poses_bruma.py` (reposo; hechizo, con el bastón en alto, la espora y el halo más grandes y chispas; feliz, con ojos en arco y el sombrero rebotando). Parte de `gremio-base.blend` con el lienzo de 176 × 160 (`shift_y` de la cámara para conservar el suelo).
- Sombrero: degradado continuo por altura (rampa en las entradas de `Toon3`), echado 10° atrás para que la cara se vea desde la cámara a ¾. Rizo naranja como tubo de curva que se afina, en el plano que mira a la cámara.
- Motas: 13 estrellas doradas con núcleo claro, en emisión plana y sin contorno.
- Sprites: `assets/sprites/mago-{reposo,hechizo,feliz}.png` (176 × 160) y copias `-56.png` (77 × 70, misma escala que el resto). En el juego: `public/assets/characters/mago-{reposo,trabajando,feliz}.png`.
- Escala: ≈ 1,3 m frente a 0,76 m de Rubí; 11–14 px de margen arriba en el lienzo de 160 px.
