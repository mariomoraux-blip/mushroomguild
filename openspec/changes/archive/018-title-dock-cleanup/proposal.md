# 018 · Portada limpia, logo completo y dock sin tarjetas cortadas

## Por qué
Revisión visual del playtest:
- La portada se siente cargada con los cinco personajes; el gremio ya se presenta en la intro y en "El gremio".
- El logo se ve cortado abajo: el recorte `ui/hud/logo.webp` (y `logo-small`) dejaba fuera la base de los hongos y la flor inferior.
- Con el gremio completo, el dock corta tarjetas en los bordes (el aro de la primera y la tarjeta que asoma junto a "Fin del mes").

## Qué cambia
- Portada: solo logo y menú.
- Logo: nuevo recorte desde `hoja-logo-fondos` con margen transparente en los cuatro lados.
- Dock: solo tarjetas enteras. El espacio sobrante se reparte entre las que caben, el scroll se detiene de tarjeta en tarjeta y una flecha decorativa en cada borde indica si hay más de ese lado. Reemplaza "la tarjeta siguiente asoma cortada" (decisión del jugador entre tres opciones: tarjetas enteras, desvanecido o tarjetas más chicas).

## Fuera de alcance
- Tarjetas más pequeñas o en dos filas: en vertical no caben las 8 sin bajar de 44 px.
