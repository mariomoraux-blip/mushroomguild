# 016 · La red alumbra el invierno

## Por qué
El GDD hace del invierno el clímax: "cuando la luz se va, la red que tejiste es lo que alumbra". La tabla de luz por estación de `docs/art-direction.md` pide un micelio apenas visible en primavera que se note en otoño y brille en invierno. Desde el 010, la estación la cuentan las piezas pintadas y el 003 descartó la gradación de color, así que hoy la red (la losa dorada) se ve igual los 12 meses y nada marca ese clímax.

## Qué cambia
- **Luz del micelio:** una capa encima del claro pintado y debajo del Árbol Padre y de los retratos: un halo suave en cada casilla de la red y el resplandor de los hilos, con mezcla aditiva. No le afecta la saturación del progreso.
- **Intensidad por estación**, con valores en `src/theme.ts`: primavera 0,2, verano 0,4, otoño 0,65 e invierno 1,0. En invierno, la red es lo más brillante del tablero.
- **Transición:** 600 ms al cambiar de estación, inmediata con `prefers-reduced-motion`. Sin pulsos ni animación continua.
- **Sin WebGL:** funciona igual, porque Phaser hace la mezcla aditiva también en Canvas.

## Fuera de alcance
- Gradación de color por estación del tablero, los personajes o la interfaz (descartada en el 003 y el 010).
- Piezas pintadas nuevas.
- Partículas nuevas (las del 004 no cambian).

## Pregunta abierta
- ¿Oscurecer el fondo vivo en invierno, como un anochecer, para que la luz de la red se lea más? Sería solo la capa del shader, nunca el tablero ni sus piezas. Propuesta: no por ahora; se decide con la captura de invierno.

## Impacto
Agrega un requisito a `visual-feedback`. No toca reglas ni `GameState`. Depende de 010 (tablero pintado por estación) y de 004 (sensación), los dos archivados. Referencia de implementación: la capa de luz del micelio de la rama `feat/003-story-presentation` (PR #12, cerrado sin fusionar). Sesión estimada: 1.
