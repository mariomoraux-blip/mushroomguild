# 006 · Hacer el juego más profundo

## Por qué
Segundo playtest (Mario, 2 de noviembre), una vez entendida la mecánica:
- La *Gliophorus psittacinus* se siente inútil (cambiar esporas por nutrientes casi nunca conviene) y "Perica" no funciona como nombre.
- Siempre carga el mismo mapa y hay pocos árboles por curar.
- Es demasiado fácil: siguiendo las pistas se ganaba hacia el día 5–7.
- Ya existen sprites de Blender (Bruno, Añil, Rubí y la Gliophorus) que el juego no usa, y la interfaz se ve plana frente a los referentes (*All About Poppy*, *Dine Together*).

## Qué cambia
- **Chispa, la Mensajera** (*Gliophorus psittacinus*): nueva habilidad **Pasa la voz**: por 1 espora, un compañero que ya trabajó hoy vuelve a estar listo. Se usa tocando la casilla donde trabajó. Nombres: Chispa, Pluma, Trina, Gota.
- **Claros aleatorios:** cada partida genera un mapa de 5×8 con 7 árboles, 5 troncos y 6 rocas (Hogar abajo, Árbol Padre arriba). El generador solo acepta mapas que la política de las pistas gana entre el día 8 y el 11. El mapa clásico queda para pruebas y como respaldo.
- **Más difícil:** despertar al Árbol Padre pide **3 árboles revividos y 10 nutrientes**; cada uso de un tronco da **+2**.
- **Arte e interfaz:** los sprites de Blender se usan en el dock, en las fichas y en el tablero (en la casilla donde cada miembro trabajó hoy). Interfaz más cozy: fondo de papel crema, cintas verdes de título, chips con íconos, tarjetas redondeadas con sombra suave, botón principal amarillo, tablero con marco de madera y casillas de pradera. Tipografías Fredoka (títulos) y Nunito (texto).
- **Balance como test:** el bot con criterio pasa a ser la política de las pistas (`playAdvised`); el test mide mapas generados y el bot al azar.

## Fuera de alcance
Cartas de intro y final (003), animaciones (004), sprite de Maestra Bruna (aún sin modelo: queda un placeholder).

## Impacto
Modifica `game-rules`, `board-interaction` y `player-guidance`. La prueba de paridad con `poc/rules.js` se retira: el juego ya se separó del PoC (costos, Gliophorus, mapas).
