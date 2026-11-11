# Tareas · 038

## 1. Reglas
- [x] 1.1 `cleanName`, `checkName` y lista negra (`src/rules/blocklist.ts`); `isValidAlias` acepta nombres escritos válidos.

## 2. Hoja y cliente
- [x] 2.1 «Escribir el mío» / «Elegir uno del gremio»: campo, ayuda, error en el lugar, Enter registra; textos en `src/copy/es.ts`.
- [x] 2.2 `saveAlias` avisa al servidor antes de guardar y distingue rechazo de falta de conexión.

## 3. Pruebas
- [x] 3.1 Reglas (formato, limpieza, lista negra sin falsos positivos comunes), servidor (400) y cliente (rechazo y sin conexión).
- [x] 3.2 Humo: escribir un nombre, error y registro; `npm run test`, `npm run build`; capturas `docs/screenshots/038-*`.

## 4. Cierre
- [ ] 4.1 Fusionar el delta y archivar.
