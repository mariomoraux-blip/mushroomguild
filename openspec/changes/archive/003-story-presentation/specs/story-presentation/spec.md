# Delta · story-presentation

## ADDED Requirements

### Requirement: Intro
Una partida nueva SHALL abrir con tres cartas de una frase cada una, que se pueden saltar.

#### Scenario: Saltar la intro
- WHEN el jugador pulsa "Saltar" en la primera carta
- THEN se cierra la intro y la bitácora invita a elegir un miembro del gremio

### Requirement: Llegada dla maga
Cuando Maestra Bruna se une al gremio, el juego SHALL mostrar una carta breve que lo presente y explique sus dos hechizos.

#### Scenario: Amanecer con la maga
- WHEN empieza el día en que llega Maestra Bruna
- THEN aparece la carta "El bosque volvió a hablar, y alguien escuchó." con sus hechizos en una línea cada uno

### Requirement: Finales
Al ganar o al terminar el invierno, el juego SHALL mostrar una carta de final con un resumen y la opción de jugar otra vez.

#### Scenario: Victoria
- WHEN la Amanita muscaria despierta al Árbol Padre en el día 8
- THEN la carta dice "El Árbol Padre despertó en el día 8." e indica los árboles revividos

#### Scenario: Fin del invierno
- WHEN el estado pasa a `lost`
- THEN la carta dice "El bosque esperará la próxima primavera." y sugiere revivir árboles temprano

### Requirement: El color vuelve
La saturación del escenario SHALL aumentar con cada árbol revivido y alcanzar el máximo al despertar al Árbol Padre.

#### Scenario: Inicio y final
- WHEN empieza la partida
- THEN el escenario se ve casi gris
- AND WHEN se despierta al Árbol Padre THEN se ve con color pleno

### Requirement: La luz sigue a las estaciones
La gradación del escenario SHALL cambiar con la estación: mañana, mediodía, atardecer y anochecer.

#### Scenario: Otoño
- WHEN comienza el día 7
- THEN el escenario usa la gradación de atardecer y el follaje vivo se ve naranja

#### Scenario: Invierno
- WHEN comienza el día 10
- THEN el escenario usa la gradación de anochecer
- AND el micelio brilla con su intensidad máxima

#### Scenario: Personajes y UI
- WHEN cambia la estación
- THEN los personajes y los paneles conservan sus colores originales, excepto la Gliophorus psittacinus, que adopta el tono de la estación
