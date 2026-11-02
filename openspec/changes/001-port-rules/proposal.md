# 001 · Montar el proyecto y portar las reglas

## Por qué
La prueba de concepto validó el loop y el balance, pero vive en un solo HTML. Antes de dibujar nada en Phaser necesitamos las reglas como un módulo TypeScript puro y probado, que sea la fuente de verdad del juego.

## Qué cambia
- Proyecto Vite + TypeScript + Phaser + Vitest, con scripts `dev`, `build`, `test`.
- `src/rules/` portado desde `poc/rules.js`, con tipos explícitos y un generador aleatorio con semilla.
- Pruebas por cada requisito de `game-rules` y una prueba de balance por simulación.
- Una escena de Phaser vacía que arranca y muestra el título (prueba de humo).

## Fuera de alcance
Dibujo del tablero, interacción, intro, arte.

## Impacto
Capacidad nueva: `game-rules`. Sesión estimada: 1.
