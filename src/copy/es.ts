import { COST, FADED_REVIVE, FROST_WEAVE, GAIN, HEAL_REACH, LEVELS, LOG_USES, PLAGUE_REACH, RECRUIT_COSTS, UPKEEP } from '../rules/config';
import type { IdleReason } from '../rules/idle';
import type { GuildSpecies, Level, SpeciesId } from '../rules/types';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
/** «3, 5 y 7». */
const listY = (items: readonly (string | number)[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items.at(-1)}`);
/**
 * Lo que pide el Árbol Ancestral fuera de la partida (028, 031): lo de Brote y Bosque, y entre paréntesis lo de Ancestral
 * si es distinto. Dentro de la partida, la meta y la etiqueta usan lo del nivel (`motherCost`, `motherTrees`).
 */
const B = LEVELS.brote;
const W = LEVELS.bosque;
const A = LEVELS.ancestral;
// 041: cada nivel pide sus nutrientes (10, 11 y 13); se nombran solo los que cambian.
const otherNutrients = [W.mother !== B.mother && `${W.mother} en Bosque`, A.mother !== B.mother && `${A.mother} en el nivel Ancestral`].filter((t): t is string => Boolean(t));
const motherNutrients = otherNutrients.length ? `${B.mother} nutrientes (${listY(otherNutrients)})` : `${B.mother} nutrientes`;
const motherNeeds = [
  `${B.motherTrees} árboles revividos y ${B.mother} nutrientes`,
  [W.mother !== B.mother && `${W.mother} nutrientes en Bosque`, (A.mother !== B.mother || A.motherTrees !== B.motherTrees) && `${A.motherTrees} árboles y ${A.mother} nutrientes en el nivel Ancestral`].filter(Boolean).join('; '),
].filter(Boolean).join(' (') + (W.mother !== B.mother || A.mother !== B.mother || A.motherTrees !== B.motherTrees ? ')' : '');
/** Curva de reclutar (027): «cuesta 3, luego 5 y luego 7». */
const recruitCurve = `cuesta ${listY(RECRUIT_COSTS.map((n, i) => (i === 0 ? n : `luego ${n}`)))}`;
const times = (m: number) => `×${String(m).replace('.', ',')}`;

// Textos visibles del juego. Español neutro, tono cozy, frases cortas.
export const es = {
  title: 'El Gremio de los Hongos',

  species: {
    champi: {
      name: 'Champiñón', short: 'Champiñón', article: 'un', scientific: 'Agaricus bisporus', role: 'Descompositor',
      verb: `Descompone un tronco vecino a la red (+${plural(GAIN.log, 'nutriente')}).`,
      quip: 'Comestible: sí, y lo sabe. Por eso trabaja rápido.',
      action: `Descompone · +${GAIN.log} nutrientes`,
    },
    lactarius: {
      name: 'Lactarius indigo', short: 'Lactarius', article: 'un', scientific: 'Lactarius indigo', role: 'Tejedor',
      verb: `Teje micelio en tierra vecina a la red (${plural(COST.weave, 'nutriente')}).`,
      quip: 'Si lo cortas, sangra tinta azul. Preferiría que no lo cortaras.',
      action: `Teje · −${plural(COST.weave, 'nutriente')}`,
    },
    amanita: {
      name: 'Amanita muscaria', short: 'Amanita', article: 'una', scientific: 'Amanita muscaria', role: 'Sanadora',
      verb: `Revive un árbol gris vecino a la red (${plural(COST.revive, 'nutriente')}).`,
      quip: 'Comestible: no. Bonita: muchísimo. Úsese solo para curar árboles.',
      action: `Revive · −${plural(COST.revive, 'nutriente')}`,
    },
    gliophorus: {
      name: 'Gliophorus psittacinus', short: 'Gliophorus', article: 'una', scientific: 'Gliophorus psittacinus', role: 'Mensajera',
      verb: `Pasa la voz: un compañero que ya trabajó este mes vuelve a trabajar (${plural(COST.call, 'espora')}).`,
      quip: 'Viscosa como un caramelo y habladora como un loro. Cambia de color con los meses.',
      action: `Llama · −${plural(COST.call, 'espora')}`,
    },
    morchella: {
      name: 'Morchella esculenta', short: 'Morchella', article: 'una', scientific: 'Morchella esculenta', role: 'Rompe-rocas',
      verb: `Rompe una roca vecina a la red y deja tierra para tejer (${plural(COST.breakRock, 'nutriente')}).`,
      quip: 'Para ella, cada roca es una puerta que nadie ha abierto todavía.',
      action: `Rompe · −${plural(COST.breakRock, 'nutriente')}`,
    },
    ganoderma: {
      name: 'Ganoderma lucidum', short: 'Ganoderma', article: 'un', scientific: 'Ganoderma lucidum', role: 'Boticaria',
      verb: `Revive un árbol gris a ${HEAL_REACH} casillas o menos de la red (${plural(COST.revive, 'nutriente')} y ${plural(COST.heal, 'espora')}).`,
      quip: 'Lleva siglos en las tazas de té. Brilla como si la hubieran barnizado, y es verdad.',
      action: `Cura a distancia · −${COST.revive} nutrientes, −${plural(COST.heal, 'espora')}`,
    },
    lycoperdon: {
      name: 'Lycoperdon perlatum', short: 'Lycoperdon', article: 'un', scientific: 'Lycoperdon perlatum', role: 'Soplador',
      verb: `Desde un árbol vivo, cambia ${plural(COST.puff, 'nutriente')} por ${plural(GAIN.puff, 'espora')}, o ${plural(COST.compost, 'espora')} por ${plural(GAIN.compost, 'nutriente')}.`,
      quip: 'Tiene cosquillas: lo tocas y sopla una nube de esporas.',
      action: 'Sopla o abona · cambia nutrientes y esporas',
    },
    mago: {
      name: 'Conocybe arcana', short: 'Conocybe', article: 'una', scientific: 'Conocybe arcana', role: 'Maga',
      verb: 'Lanza un hechizo por estación: Brote arcano o Lluvia de esporas.',
      quip: 'No aparece en ningún libro. Ella dice que fueron los libros los que no la encontraron.',
      action: '1 hechizo por estación',
    },
  } satisfies Record<SpeciesId, { name: string; short: string; article: 'un' | 'una'; scientific: string; role: string; verb: string; quip: string; action: string }>,

  /** Nombres de los miembros, en orden de llegada. */
  memberNames: {
    champi: ['Bruno', 'Tomillo', 'Migas', 'Trufo'],
    lactarius: ['Indi', 'Ola', 'Nube', 'Brisa'],
    amanita: ['Rubí', 'Cereza', 'Lunar', 'Pimienta'],
    gliophorus: ['Chispa', 'Pluma', 'Trina', 'Gota'],
    morchella: ['Panal'],
    ganoderma: ['Ámbar'],
    lycoperdon: ['Pompón'],
  } satisfies Record<GuildSpecies, readonly string[]>,
  mageName: 'Maestra Bruma',

  spells: {
    sprout: 'Brote arcano',
    rain: 'Lluvia de esporas',
  },
  /** Cambios de Pompón (040), en su hoja de elección. */
  puffs: { spores: 'Soplar esporas', nutrients: 'Abonar el árbol' },
  puffHelp: {
    spores: `${plural(COST.puff, 'nutriente')} → ${plural(GAIN.puff, 'espora')}.`,
    nutrients: `${plural(COST.compost, 'espora')} → ${plural(GAIN.compost, 'nutriente')}.`,
  },
  spellHelp: {
    sprout: 'Convierte una roca vecina a la red en tierra con micelio.',
    rain: 'Sobre un árbol vivo: 1 espora y 1 nutriente ya, por cada árbol vivo.',
  },

  seasons: ['Primavera', 'Verano', 'Otoño', 'Invierno'],

  /** Motivos de rechazo (texto para el jugador). */
  reasons: {
    gameOver: 'La partida terminó.',
    unknown: '',
    tired: (name: string) => `${name} ya trabajó este mes. Descansa hasta el mes siguiente.`,
    lactariusNeedsSoil: 'El Lactarius solo teje sobre tierra libre.',
    alreadyNet: 'Aquí ya hay micelio.',
    plagueBlocks: (reach: number) => `La plaga no deja tejer aquí: se va al terminar un mes en que un hongo trabaje a ${reach} casillas o menos.`,
    farSoil: 'Muy lejos: la tierra debe tocar la red.',
    noNutrientWeave: (n: number) => `Falta${n === 1 ? '' : 'n'} ${plural(n, 'nutriente')} para tejer.`,
    noNutrientWeaveFrost: (n: number) => `Falta${n === 1 ? '' : 'n'} ${plural(n, 'nutriente')} para tejer con escarcha.`,
    champiNeedsLog: 'El Champiñón necesita un tronco caído.',
    farLog: 'Muy lejos: el tronco debe tocar la red.',
    motherFar: 'La red todavía no llega al Árbol Ancestral.',
    forestSilent: (n: number) => `El bosque aún no habla: revive al menos ${n} árboles primero.`,
    motherCost: (n: number) => `El Árbol Ancestral necesita ${n} nutrientes.`,
    amanitaNeedsTree: 'La Amanita solo cura árboles.',
    treeAlive: 'Este árbol ya respira.',
    farTree: 'Muy lejos: el árbol debe tocar la red.',
    reviveCost: (n: number) => `Faltan nutrientes: revivir cuesta ${n}.`,
    gliophorusNeedsWorker: 'La Gliophorus pasa la voz donde un compañero ya trabajó este mes.',
    callCost: (n: number) => `Falta${n === 1 ? '' : 'n'} ${plural(n, 'espora')}: pasar la voz cuesta ${n}.`,
    magicSpent: 'Maestra Bruma descansa: su magia vuelve con la próxima estación.',
    sproutNeedsRock: 'El Brote arcano solo despierta rocas que tocan la red.',
    rainNeedsTree: 'La Lluvia de esporas se lanza sobre un árbol vivo.',
    morchellaNeedsRock: 'La Morchella solo rompe rocas.',
    farRock: 'Muy lejos: la roca debe tocar la red.',
    breakCost: (n: number) => `Faltan nutrientes: romper una roca cuesta ${n}.`,
    ganodermaNeedsTree: 'El Ganoderma cura árboles grises y limpia la plaga.',
    farHeal: (n: number) => `Muy lejos: el Ganoderma cura árboles a ${n} casillas o menos de la red.`,
    healSpores: (n: number) => `Falta${n === 1 ? '' : 'n'} ${plural(n, 'espora')}: curar a distancia cuesta ${n}.`,
    lycoperdonNeedsTree: 'El Lycoperdon sopla esporas desde un árbol vivo.',
    compostCost: (n: number) => `Faltan ${plural(n, 'espora')} para abonar.`,
    puffCost: (n: number) => `Falta${n === 1 ? '' : 'n'} ${plural(n, 'nutriente')} para soplar esporas.`,
    speciesTaken: (article: string, species: string) => `Ya hay ${article} ${species} en el gremio.`,
    guildFull: 'El gremio está completo.',
    recruitCost: (n: number) => `Reclutar cuesta ${n} esporas.`,
  },

  /** Motivos de inactividad (`idleReason`); la bitácora muestra "Nombre: motivo". */
  idle: {
    noLogs: 'no hay troncos junto a la red. Teje hacia uno.',
    noNutrients: 'faltan nutrientes.',
    noSoil: 'no hay tierra junto a la red.',
    noGreyTrees: 'no hay árboles grises junto a la red.',
    noSpores: `falta${COST.call === 1 ? '' : 'n'} ${plural(COST.call, 'espora')}: pasar la voz cuesta ${COST.call}.`,
    noWorkers: 'nadie ha trabajado todavía este mes. Pasa la voz después de que trabaje un compañero.',
    magicSpent: 'su magia vuelve con la próxima estación.',
    noRocks: 'no hay rocas junto a la red.',
    noHealSpores: `falta${COST.heal === 1 ? '' : 'n'} ${plural(COST.heal, 'espora')}: curar a distancia cuesta ${COST.heal}.`,
    noTreesInReach: `no hay árboles grises a ${HEAL_REACH} casillas o menos de la red.`,
    noLiveTrees: 'todavía no hay árboles vivos para soplar desde ellos.',
    noTrade: `no alcanza para ningún cambio: soplar pide ${plural(COST.puff, 'nutriente')} y abonar, ${plural(COST.compost, 'espora')}.`,
  } satisfies Record<IdleReason, string>,
  idleLine: (name: string, reason: string) => `${name}: ${reason}`,
  /** Acción del Tejedor con el costo de este mes (con escarcha, 2). */
  weaveAction: (n: number) => `Teje · −${plural(n, 'nutriente')}`,

  /** Pistas del siguiente paso (`advise`). */
  advice: {
    awaken: (n: string) => `Pista: ${n} puede despertar al Árbol Ancestral. ¡Es la meta!`,
    revive: (n: string) => `Pista: ${n} puede revivir un árbol gris. Cada árbol vivo da esporas y nutrientes.`,
    recruit: (spores: number, species: string) => `Pista: tienes ${plural(spores, 'espora')}. Recluta ${species} en «+ Reclutar» o tocando las esporas.`,
    decompose: (n: string) => `Pista: ${n} puede descomponer un tronco junto a la red (+${GAIN.log} nutrientes).`,
    heal: (n: string) => `Pista: ${n} puede curar un árbol gris a distancia. Entra a la red de un salto.`,
    cleanse: (n: string) => `Pista: ${n} puede limpiar la plaga por ${plural(COST.heal, 'espora')}.`,
    breakRock: (n: string) => `Pista: ${n} puede romper una roca que acorta el camino (★).`,
    puff: (n: string) => `Pista: ${n} puede soplar esporas desde un árbol vivo (+${GAIN.puff}).`,
    compost: (n: string) => `Pista: ${n} puede abonar un árbol: ${plural(COST.compost, 'espora')} se vuelven ${plural(GAIN.compost, 'nutriente')}.`,
    weaveTree: (n: string) => `Pista: ${n} puede tejer la red hacia un árbol gris (★).`,
    weaveMother: (n: string) => `Pista: ${n} puede tejer la red hacia el Árbol Ancestral (★).`,
    call: (n: string, other: string) => `Pista: ${n} puede pasar la voz a ${other} para que trabaje otra vez (★).`,
    spell: (n: string, spell: string) => `Pista: ${n} puede lanzar ${spell}.`,
    endMonth: `Nadie más puede trabajar este mes. Pulsa «Fin del mes»: cada árbol vivo dará ${plural(GAIN.treeSpores, 'espora')} y ${plural(GAIN.treeNutrients, 'nutriente')}.`,
    pickTile: (n: string) => `${n}: toca una casilla resaltada. La ★ acerca la red a tu meta.`,
    star: 'sugerido',
  },

  /** Qué es cada casilla (al tocarla sin miembro elegido). */
  tileHelp: {
    home: 'Hogar del gremio: aquí empieza la red de micelio.',
    mother: (n: number, trees: number) => `Árbol Ancestral: la meta. Llévale la red y despiértalo con la Amanita (${trees} árboles vivos y ${n} nutrientes).`,
    motherAwake: 'Árbol Ancestral: despierto. ¡El bosque respira!',
    soil: 'Tierra: el Lactarius teje micelio aquí para extender la red.',
    soilNet: 'Tierra tejida: ya es parte de la red. Se trabaja en las casillas vecinas.',
    log: `Tronco caído: el Champiñón lo descompone (+${GAIN.log} nutrientes, ${LOG_USES} veces).`,
    tree: `Árbol gris: la Amanita lo revive si toca la red (${plural(COST.revive, 'nutriente')}).`,
    plague: `Red con plaga: se marchitará al terminar el mes si ningún hongo trabaja a ${PLAGUE_REACH} casillas o menos. Marchita, sale de la red y no se puede tejer hasta limpiarla.`,
    plagueWithered: `Plaga marchita: no se puede tejer. Se limpia al terminar un mes en que un hongo trabaje a ${PLAGUE_REACH} casillas o menos; entonces vuelve a ser tierra.`,
    treeFading: `Árbol gris con escarcha: se apagará al terminar el mes si la Amanita no lo revive (${plural(COST.revive, 'nutriente')}).`,
    treeFaded: `Árbol apagado: la Amanita aún puede revivirlo, pero cuesta ${plural(FADED_REVIVE, 'nutriente')}.`,
    treeUnrooted: 'Árbol vivo, pero suelto: la red no lo une al Hogar, así que no da nada. Teje un camino de red hasta él.',
    treeAlive: `Árbol vivo: al empezar cada mes da ${plural(GAIN.treeSpores, 'espora')} y ${plural(GAIN.treeNutrients, 'nutriente')}.`,
    rock: 'Roca: bloquea la red. La Morchella la rompe y Maestra Bruma la convierte en tierra.',
  },

  /** Ficha de cada especie al seleccionarla (player-guidance). */
  card: {
    understood: 'Entendido',
    open: 'Ficha',
    openLabel: (name: string) => `Ver la ficha de ${name}`,
    title: (member: string, species: string) => `${member} · ${species}`,
    sections: {
      ability: 'Habilidad',
      howTo: 'Cómo usarlo',
      movement: 'Movimiento',
      nutrients: 'Nutrientes',
      heals: 'Qué árboles cura',
      messenger: 'Para qué sirve la mensajera',
      powers: 'Poderes',
    },
  },
  /** Recetas visuales (026): lo que dice el lector de pantalla de cada tira «antes → después». */
  recipe: {
    lactarius: `Antes: la red y una tierra resaltada. Después: la red creció una casilla. Gasta ${plural(COST.weave, 'nutriente')}.`,
    champi: `Antes: la red y un tronco resaltado. Después: el tronco usado y ${plural(GAIN.log, 'nutriente')} más.`,
    amanita: `Antes: la red y un árbol gris resaltado. Después: el árbol vivo. Gasta ${COST.revive} nutrientes.`,
    morchella: `Antes: la red y una roca resaltada. Después: la roca es tierra libre. Gasta ${plural(COST.breakRock, 'nutriente')}.`,
    ganoderma: `Antes: la red y un árbol gris a dos casillas, resaltado. Después: el árbol vivo y en la red. Gasta ${COST.revive} nutrientes y ${plural(COST.heal, 'espora')}.`,
    lycoperdon: `Soplar esporas. Antes: un árbol vivo resaltado. Después: el mismo árbol y ${plural(GAIN.puff, 'espora')} más. Gasta ${plural(COST.puff, 'nutriente')}.`,
    compost: `Abonar el árbol. Antes: un árbol vivo resaltado. Después: el mismo árbol y ${plural(GAIN.compost, 'nutriente')} más. Gasta ${plural(COST.compost, 'espora')}.`,
    gliophorus: `Antes: un compañero cansado. Después: el compañero, listo para trabajar otra vez. Gasta ${plural(COST.call, 'espora')}.`,
    sprout: 'Brote arcano. Antes: la red y una roca resaltada. Después: la roca es red.',
    rain: 'Lluvia de esporas. Antes: un árbol vivo resaltado. Después: esporas y nutrientes extra por cada árbol vivo.',
  },
  guide: {
    champi: {
      context: 'El más trabajador del gremio: convierte la madera muerta en alimento para el bosque.',
      ability: 'Descompone troncos caídos.',
      howTo: 'Tócalo y después toca un tronco resaltado que toque la red.',
      movement: 'No camina: trabaja desde la red, en cualquier casilla vecina a ella. Para alcanzar un tronco lejano, primero teje la red hasta él.',
      nutrients: `Consigue +${GAIN.log} nutrientes cada vez. Cada tronco aguanta ${LOG_USES} usos y después queda tierra libre.`,
    },
    lactarius: {
      context: 'Teje los hilos de micelio que conectan el bosque. La red es el camino de todo el gremio.',
      ability: 'Teje micelio en tierra libre y extiende la red.',
      howTo: 'Tócalo y después toca una tierra resaltada junto a la red. La ★ marca la que acerca la red a tu meta.',
      movement: 'No camina: hace crecer la red una casilla cada vez. Donde llega la red, el resto del gremio puede trabajar.',
      nutrients: `Gasta ${plural(COST.weave, 'nutriente')} por cada casilla tejida. Con escarcha (Bosque y Ancestral), ${plural(FROST_WEAVE, 'nutriente')}.`,
    },
    amanita: {
      context: 'Cura a los árboles dormidos del claro y, al final, despierta al Árbol Ancestral.',
      ability: 'Revive árboles grises y despierta al Árbol Ancestral.',
      howTo: 'Tócala y después toca un árbol resaltado que toque la red.',
      movement: 'No camina: cura los árboles vecinos a la red. Teje la red hasta un árbol para poder curarlo.',
      nutrients: `Gasta ${COST.revive} nutrientes por árbol, ${FADED_REVIVE} por un árbol apagado y ${motherNutrients} en el Árbol Ancestral.`,
      heals: `Los árboles grises (copa gris y tronco), por ${COST.revive} nutrientes: al revivir entran a la red y al empezar cada mes dan ${plural(GAIN.treeSpores, 'espora')} y ${plural(GAIN.treeNutrients, 'nutriente')}. El Árbol Ancestral (aro dorado, arriba): se despierta cuando la red lo toca y hay ${motherNeeds}. Despertarlo es ganar. En Bosque y Ancestral, un árbol con escarcha se apaga al terminar el mes si nadie lo revive; apagado, revivirlo cuesta ${FADED_REVIVE}.`,
    },
    gliophorus: {
      context: 'Corre la voz por los hilos de micelio más rápido que el viento. Cuando ella avisa, nadie se queda dormido.',
      ability: `Pasa la voz: un compañero que ya trabajó este mes se despierta y puede trabajar otra vez. Cuesta ${plural(COST.call, 'espora')}.`,
      howTo: 'Tócala y después toca la casilla donde trabajó este mes un compañero (allí se ve su retrato).',
      movement: 'No camina: su voz viaja por toda la red, así que llega a cualquier compañero, esté donde esté.',
      nutrients: 'No consigue nutrientes ella misma, pero hace que otro los consiga dos veces: un Champiñón que descompone de nuevo, o una Amanita que revive otro árbol el mismo mes.',
      messenger: 'Es una segunda jugada: convierte esporas en trabajo extra. Úsala con quien más te convenga repetir; no puede llamar a otra Gliophorus ni a Maestra Bruma.',
    },
    morchella: {
      context: 'La cantera del gremio. Terca y alegre: cada roca es una puerta que nadie ha abierto todavía.',
      ability: 'Rompe una roca vecina a la red y la deja como tierra libre.',
      howTo: 'Tócala y después toca una roca resaltada que toque la red. Luego el Lactarius puede tejer ahí.',
      movement: 'No camina: trabaja en las rocas vecinas a la red. Sirve para abrir atajos donde las rocas cierran el paso.',
      nutrients: `Gasta ${plural(COST.breakRock, 'nutriente')} por roca, también con escarcha. La tierra que deja todavía no es red: tejerla cuesta aparte.`,
    },
    ganoderma: {
      context: 'Boticaria tranquila y sabia, como el reishi de una taza de té. Cura de lejos con un hilo de micelio dorado.',
      ability: `Revive árboles grises a ${HEAL_REACH} casillas o menos de la red, aunque la red no los toque. En Bosque y Ancestral también limpia la plaga.`,
      howTo: 'Tócala y después toca un árbol resaltado, cerca de la red pero no necesariamente junto a ella.',
      movement: `No camina: su hilo dorado alcanza ${HEAL_REACH} pasos en cruz desde la red, por encima de las rocas. El árbol curado entra a la red de un salto.`,
      nutrients: `Gasta ${COST.revive} nutrientes y ${plural(COST.heal, 'espora')} por árbol (${FADED_REVIVE} nutrientes si está apagado). Limpiar la plaga cuesta ${plural(COST.heal, 'espora')}. No despierta al Árbol Ancestral: eso es de la Amanita.`,
    },
    lycoperdon: {
      context: 'Redondo, juguetón y con cosquillas: cualquier toque le hace soplar una nube de esporas.',
      ability: `Desde un árbol vivo hace un cambio: sopla esporas (${plural(COST.puff, 'nutriente')} por ${plural(GAIN.puff, 'espora')}) o abona el árbol (${plural(COST.compost, 'espora')} por ${plural(GAIN.compost, 'nutriente')}).`,
      howTo: 'Tócalo, elige «Soplar esporas» o «Abonar el árbol» y después toca un árbol vivo resaltado.',
      movement: 'No camina: trabaja desde cualquier árbol vivo del claro, esté donde esté. El Árbol Ancestral no cuenta.',
      nutrients: 'Soplar sirve para reclutar, pasar la voz o curar antes; abonar, para llegar a los nutrientes del Árbol Ancestral cuando ya sobran esporas. Ida y vuelta no gana nada.',
    },
    mago: {
      context: 'Nadie la recluta: llega sola al empezar el mes siguiente a revivir el segundo árbol, cuando el bosque vuelve a hablar.',
      ability: 'Lanza un hechizo por estación.',
      howTo: 'Tócala, elige el hechizo y después toca la casilla resaltada.',
      movement: 'No camina: su magia alcanza rocas vecinas a la red y cualquier árbol vivo. Después de lanzar, descansa hasta la próxima estación.',
      nutrients: 'No gasta nutrientes. La Lluvia de esporas, además, los regala.',
      powers: `Brote arcano: convierte una roca vecina a la red en tierra con micelio; sirve para abrir atajos hacia el Árbol Ancestral. Lluvia de esporas: sobre un árbol vivo, cada árbol vivo da ya ${plural(GAIN.treeSpores, 'espora')} y ${plural(GAIN.treeNutrients, 'nutriente')} extra; sirve para reclutar o revivir antes.`,
    },
  } satisfies Record<SpeciesId, { context: string; ability: string; howTo: string; movement: string; nutrients: string; heals?: string; messenger?: string; powers?: string }>,
  quote: (text: string) => `«${text}»`,

  /** Libreta de campo (ayuda). */
  levels: {
    title: 'Elige tu dificultad',
    label: 'Niveles de dificultad',
    names: { tutorial: 'Cómo jugar', brote: 'Brote', bosque: 'Bosque', ancestral: 'Ancestral' },
    lines: {
      tutorial: 'Una partida corta y guiada: aprende a jugar paso a paso.',
      brote: 'El claro de siempre, con la ★ para guiarte.',
      bosque: 'Más rocas, escarcha en otoño e invierno, dos árboles que se apagan, una plaga que crece en invierno y un Árbol Ancestral más exigente. Los árboles solo dan si la red los une al Hogar.',
      ancestral: 'Más rocas aún, escarcha hasta el final, seis árboles que se apagan, una plaga que crece desde el otoño, un Árbol Ancestral aún más exigente y sin ★. Los árboles solo dan si la red los une al Hogar.',
    },
    multiplier: (m: number) => `Puntaje ${times(m)}`,
    back: 'Volver a la portada',
  } satisfies { names: Record<Level, string>; lines: Record<Level, string> } & Record<string, unknown>,

  titleScreen: {
    label: 'Portada',
    play: 'Nueva partida',
    howto: 'Cómo jugar',
    guild: 'El gremio',
    ranking: 'Ranking',
    /** Jugador que vuelve (036). */
    hello: (alias: string) => `Hola de nuevo, ${alias}`,
    /** Firma del autor (020): va tal cual, en inglés. */
    credit: 'By Mario Mora for BerryLab',
  },

  /** Pantallas fuera de la partida. */
  screens: { back: 'Volver' },

  guild: {
    title: 'El gremio',
    intro: 'Ocho especies, un oficio cada una. Toca una para ver su ficha.',
    open: (name: string) => `Ver la ficha de ${name}`,
    /** 039: las que no están al empezar. */
    recruitOnly: 'Solo reclutando',
    back: 'Volver',
  },

  help: {
    button: 'Ayuda: Libreta de campo',
    title: 'Libreta de campo',
    goalTitle: 'La meta',
    goal: (n: number, trees: number) => `Despierta al Árbol Ancestral (arriba) antes de que acabe el invierno. Necesitas que la red lo toque, ${trees} árboles revividos y ${n} nutrientes.`,
    howTitle: 'Cómo se juega',
    how: [
      'Toca un hongo del gremio: se resaltan las casillas donde puede trabajar.',
      'Toca una casilla resaltada. Solo se trabaja junto a la red de micelio.',
      'Cada hongo trabaja una vez por mes. Después pulsa «Fin del mes».',
      `Al empezar el mes, cada árbol vivo da ${plural(GAIN.treeSpores, 'espora')} y ${plural(GAIN.treeNutrients, 'nutriente')}. Con esporas reclutas otro hongo: ${recruitCurve}.`,
    ],
    guildTitle: 'El gremio',
    tilesTitle: 'Las casillas',
    tip: 'Si no sabes qué hacer, sigue la ★: marca el hongo sugerido y la casilla que acerca la red a tu meta.',
    levelsTitle: 'Bosque y Ancestral',
    levels: `La escarcha hace que tejer cueste ${plural(FROST_WEAVE, 'nutriente')}. Algunos meses, un árbol gris se cubre de escarcha: si nadie lo revive ese mes, se apaga y revivirlo cuesta ${plural(FADED_REVIVE, 'nutriente')}. En otoño e invierno, al terminar cada mes el gremio come ${plural(UPKEEP, 'nutriente')} (si no hay, el primero en llegar descansa el mes siguiente). En invierno los árboles no dan esporas. Nunca se pierden los árboles vivos, pero solo dan si la red los une al Hogar. En invierno en Bosque, y en otoño e invierno en Ancestral, la plaga marca casillas tejidas junto a los árboles vivos, cada mes de la estación más (1, 2 y 3): al terminar el mes se marchitan si ningún hongo trabajó a ${PLAGUE_REACH} casillas o menos, y la plaga sigue ahí (no se puede tejer) hasta que un hongo trabaje así de cerca. Si corta la red, los árboles del otro lado dejan de dar: la red cortada se ve gris. En el nivel Ancestral no hay ★ y el Árbol Ancestral pide ${A.motherTrees} árboles revividos y ${plural(A.mother, 'nutriente')}.`,
    start: '¡A jugar!',
  },

  /** Pistas de la bitácora (del PoC). */
  hints: {
    pickMember: 'Elige a un miembro del gremio.',
    allWorked: 'Todos trabajaron. Termina el mes.',
    pickTile: (name: string) => `${name}: toca una casilla resaltada.`,
    pickSpell: (name: string) => `${name}: elige un hechizo.`,
    pickPuff: (name: string) => `${name}: elige qué cambiar.`,
    /** Primera vez con una especie (022): la ficha no se abre sola. */
    meetCard: (name: string) => `Toca Ficha para conocer a ${name}.`,
    won: 'El bosque respira de nuevo.',
    lost: 'El invierno terminó.',
  },

  hud: {
    label: 'Estado del bosque',
    month: 'Mes',
    of: (n: number) => `/${n}`,
    nutrients: 'nutrientes',
    spores: 'esporas',
    sporesButton: (n: number, cost: number | null) =>
      cost === null ? `Esporas: ${n}. Gremio completo. Abrir reclutar.` : `Esporas: ${n}. El próximo recluta cuesta ${cost}. Abrir reclutar.`,
    recruitHint: 'esporas +',
    trees: 'árboles vivos',
    treesShort: 'árboles',
    time: (t: string) => `Tiempo de juego: ${t}`,
    /** Etiqueta del ícono de la estación: estación, escarcha y nivel (019). */
    season: (season: string, frost: boolean, level: string, plague = 0) =>
      `${season}${frost ? ', con escarcha' : ''}${plague ? `, con plaga${plague > 1 ? ` en ${plague} casillas` : ''}` : ''} · ${level}`,
  },

  /** Ranking global (036). */
  leaderboard: {
    title: 'Ranking',
    season: (n: number) => `Temporada ${n}`,
    players: (n: number) => (n === 1 ? '1 jugador' : `${n} jugadores`),
    you: '(tú)',
    rename: 'Cambiar nombre',
    open: 'Ver ranking',
    register: 'Registra tu puntaje',
    sending: 'Enviando tu puntaje…',
    rank: (rank: number, players: number) => `Puesto ${rank} de ${players}`,
    best: (total: number) => `Tu mejor: ${total}`,
    offline: 'No pudimos llegar al bosque. Tu puntaje quedó guardado y lo enviaremos después.',
    offlineBoard: 'No pudimos llegar al bosque. Prueba de nuevo en un rato.',
    retry: 'Reintentar',
    rejected: 'Este puntaje no se pudo verificar.',
    loading: 'Buscando el ranking…',
    empty: 'Aún no hay puntajes. ¡Sé el primero!',
    privacy: 'Guardamos tu nombre del gremio y tus puntajes. Nada más.',
    list: 'Mejores puntajes',
    row: (rank: number, alias: string, total: number, level: string, stars: string, me: boolean) =>
      `Puesto ${rank}, ${alias}${me ? ' (tú)' : ''}, ${total} puntos, ${level}, ${stars}`,
    sheet: {
      title: 'Tu nombre en el gremio',
      help: 'Así te verán en el ranking. Puedes cambiarlo cuando quieras.',
      roll: 'Otro nombre',
      confirm: 'Registrar',
      save: 'Guardar',
      later: 'Ahora no',
      // Nombre escrito (038).
      write: 'Escribir el mío',
      pick: 'Elegir uno del gremio',
      label: 'Tu nombre',
      hint: 'De 3 a 16 letras, sin números ni signos.',
      problems: {
        length: 'Usa de 3 a 16 letras.',
        chars: 'Solo letras y espacios, sin números ni signos.',
        blocked: 'Ese nombre no está permitido en el gremio. Prueba con otro.',
      },
    },
    /** Alias generados (036): «<nombre> del/de la <lugar>». Sin texto libre, sin moderación. */
    alias: {
      names: ['Bruno', 'Lía', 'Tomillo', 'Anís', 'Brezo', 'Canela', 'Olmo', 'Malva', 'Junco', 'Salvia', 'Trébol', 'Nube', 'Piñón', 'Romero', 'Vera', 'Lino', 'Mora', 'Ciro', 'Hiedra', 'Nilo', 'Perla', 'Tilo', 'Ámbar', 'Coral'],
      places: [
        ['del', 'Musgo'], ['del', 'Rocío'], ['de la', 'Hojarasca'], ['del', 'Arroyo'], ['de la', 'Loma'], ['del', 'Helecho'],
        ['de la', 'Niebla'], ['del', 'Claro'], ['de la', 'Raíz'], ['del', 'Sendero'], ['de la', 'Bellota'], ['del', 'Roble'],
        ['de la', 'Corteza'], ['del', 'Manantial'], ['de la', 'Colina'], ['del', 'Valle'], ['de la', 'Espora'], ['del', 'Tronco'],
        ['de la', 'Luna'], ['del', 'Alba'], ['de la', 'Lluvia'], ['del', 'Otoño'], ['de la', 'Brisa'], ['del', 'Liquen'],
      ],
    } satisfies { names: readonly string[]; places: readonly (readonly [string, string])[] },
  },

  scoring: {
    title: 'Puntaje',
    total: 'puntos',
    time: 'tiempo',
    stars: (n: number) => `${n} de 3 estrellas`,
    newRecord: 'Nuevo récord',
    breakdown: {
      victory: 'Victoria',
      months: 'Meses de sobra',
      trees: 'Árboles revividos',
      reserves: 'Reservas',
      guild: 'Gremio eficiente',
      activity: 'Actividad',
      variety: 'Todo el gremio actuó',
      time: 'Rapidez',
    },
    /** Fila de variedad según las especies reclutables del gremio (041). */
    variety: (n: number) => (n >= 4 ? 'Las 4 especies reclutadas' : n >= 2 ? `${n} especies reclutadas` : 'Todo el gremio actuó'),
    level: (name: string) => `Nivel ${name}`,
    multiplier: times,
  },

  dock: {
    label: 'Gremio',
    ready: 'Lista',
    resting: 'Descansa',
    hungry: 'Con hambre',
    magicBack: (season: string) => `Magia: vuelve en ${season.toLowerCase()}`,
    magicGone: 'Magia: agotada',
    endMonth: 'Terminar el mes',
    endWinter: 'Terminar el invierno',
    endShort: 'Fin del mes',
    endWinterShort: 'Fin',
    showEnd: 'Ver el final de la partida',
    showEndShort: 'Ver final',
    recruit: 'Reclutar',
    recruitCost: (n: number) => `${n} esporas`,
    recruitFull: 'gremio completo',
  },

  story: {
    label: 'Historia',
    intro: [
      { title: 'El bosque se apaga', text: 'Los árboles del claro se durmieron y el color se fue con ellos.' },
      { title: 'Un gremio despierta', text: 'Tres hongos se asoman bajo la casa-hongo, con ganas de trabajar.' },
      { title: 'Antes del invierno', text: 'Lleva la red de micelio hasta el Árbol Ancestral y despiértalo antes de que termine el invierno.' },
    ],
    step: (n: number, total: number) => `Carta ${n} de ${total}`,
    next: 'Siguiente',
    start: 'Comenzar',
    skip: 'Saltar',
    mageTitle: 'Llegó Maestra Bruma',
    mageText: 'El bosque volvió a hablar, y alguien escuchó.',
    mageSpells: 'Una vez por estación lanza uno de sus hechizos:',
    mageOk: 'Seguir',
    coldTitle: 'Llega el frío',
    coldText: 'Llegó el otoño y el gremio tiene más hambre.',
    coldRules: [
      `Al terminar cada mes de otoño e invierno, el gremio come ${plural(UPKEEP, 'nutriente')}.`,
      'Si no hay, el primero en llegar al gremio se queda con hambre y descansa el mes siguiente.',
      'En invierno, los árboles no dan esporas.',
    ],
    /** Regla extra de la carta en los niveles con plaga (032; 042: Bosque solo en invierno). */
    coldPlague: (winterOnly: boolean) => `${winterOnly ? 'En invierno' : 'En otoño y en invierno'}, la plaga marca casillas de la red junto a los árboles vivos, cada mes más: 1, 2 y 3. Se marchitan al terminar el mes si ningún hongo trabaja a ${PLAGUE_REACH} casillas o menos. Un árbol que la red ya no une al Hogar no da nada.`,
    coldOk: 'Seguir',
    /** 044: la primera vez en la partida que un árbol queda suelto. */
    looseTitle: 'Un árbol suelto',
    looseText: 'La red ya no une este árbol al Hogar.',
    looseRules: [
      'Sigue vivo y cuenta para el Árbol Ancestral, pero no da esporas ni nutrientes.',
      'Lo verás con esta insignia: el hilo de micelio cortado.',
      'Teje un camino de red desde el Hogar hasta él y volverá a dar.',
    ],
    looseOk: 'Entendido',
    wonTitle: '¡El bosque despertó!',
    wonText: (month: number) => `El Árbol Ancestral despertó en el mes ${month}.`,
    lostTitle: 'Llegó el invierno',
    lostText: 'El bosque esperará la próxima primavera.',
    lostTip: 'Consejo: revive árboles temprano. Cada árbol vivo da esporas cada mes.',
    summary: 'Resumen',
    stats: { month: 'mes', trees: 'árboles', nutrients: 'nutrientes', spores: 'esporas' },
    viewBoard: 'Ver tablero',
    again: 'Jugar de nuevo',
  },

  sheet: {
    close: 'Cerrar',
    recruitTitle: 'Reclutar al gremio',
    recruitHelp: (cost: number | null, max: number) =>
      cost === null
        ? `El gremio está completo: ${max} miembros.`
        : `El próximo recluta cuesta ${cost} esporas; cada uno cuesta más (${listY(RECRUIT_COSTS)}). Hasta ${max} miembros; trabaja desde el mes siguiente.`,
    recruitAction: 'Reclutar',
    /** 039: una de cada especie. */
    inGuild: 'Ya está en el gremio.',
    info: (name: string) => `Ficha de ${name}`,
    mageArrives: 'Llega sola, al empezar el mes siguiente al segundo árbol revivido.',
    spellTitle: 'Elige un hechizo',
    /** 040: la hoja de Pompón. */
    puffTitle: (name: string) => `¿Qué cambia ${name}?`,
  },

  tiles: {
    home: 'Hogar del gremio',
    mother: 'Árbol Ancestral',
    motherAwake: 'Árbol Ancestral despierto',
    soil: 'Tierra',
    log: 'Tronco caído',
    tree: 'Árbol gris',
    treeAlive: 'Árbol vivo',
    rock: 'Roca',
    inNet: 'en la red',
    valid: 'disponible',
    goal: 'la meta',
    fading: `con escarcha: se apagará al terminar el mes, revivirlo cuesta ${plural(COST.revive, 'nutriente')}`,
    faded: `apagado: revivirlo cuesta ${plural(FADED_REVIVE, 'nutriente')}`,
    unrooted: 'suelto: la red no lo une al Hogar y no da nada',
    /** 045 */
    guards: 'frena la plaga',
    cut: 'red cortada: no llega al Hogar',
    plague: `con plaga: se marchitará al terminar el mes si ningún hongo trabaja a ${PLAGUE_REACH} casillas o menos`,
    plagueWithered: `con plaga marchita: no se puede tejer hasta que un hongo trabaje a ${PLAGUE_REACH} casillas o menos`,
    position: (x: number, y: number) => `columna ${x + 1}, fila ${y + 1}`,
    boardLabel: 'Tablero del claro',
  },

  /** Mensajes de bitácora. */
  /**
   * Resumen del mes en la bitácora (045): una línea corta con lo más urgente y qué hacer; el detalle va en «Ver el mes».
   */
  month: {
    open: 'Ver el mes',
    openLabel: (month: number) => `Ver lo que pasó al empezar el mes ${month}`,
    title: (month: number) => `Empieza el mes ${month}`,
    prefix: (month: number) => `Mes ${month} · `,
    plague: (n: number, atRisk: number) =>
      `La plaga marcó ${n === 1 ? 'una casilla' : `${n} casillas`}${atRisk ? ` y amenaza ${atRisk === 1 ? 'un árbol' : `${atRisk} árboles`}` : ''}. Trabaja a ${PLAGUE_REACH} o menos para frenarla.`,
    unrooted: (n: number) => `${n === 1 ? 'Un árbol suelto no dio' : `${n} árboles sueltos no dieron`} nada. Teje la red hasta el Hogar.`,
    withered: (n: number) => `La plaga marchitó ${n === 1 ? 'una casilla' : `${n} casillas`}. Trabaja a ${PLAGUE_REACH} o menos para limpiar${n === 1 ? 'la' : 'las'}.`,
    quiet: 'Nada nuevo en el claro.',
  },
  log: {
    wove: (name: string) => `${name} tejió micelio. La red crece.`,
    logDone: (name: string, n: number) => `${name} terminó el tronco: +${n} nutrientes y queda tierra fértil.`,
    logUsed: (name: string, n: number) => `${name} descompuso el tronco: +${n} nutrientes.`,
    motherAwake: (name: string) => `${name} despertó al Árbol Ancestral.`,
    revived: (name: string) => `${name} revivió un árbol. Al empezar cada mes dará una espora y un nutriente.`,
    called: (name: string, other: string) => `${name} pasó la voz: ${other} puede trabajar otra vez.`,
    brokeRock: (name: string) => `${name} rompió la roca. Ahora es tierra lista para tejer.`,
    healed: (name: string) => `${name} curó un árbol a distancia: entró a la red. Al empezar cada mes dará una espora y un nutriente.`,
    healedLoose: (name: string) => `${name} curó un árbol a distancia, pero queda suelto: dará algo cuando la red lo una al Hogar.`,
    plagueHealed: (name: string) => `${name} limpió la plaga.`,
    composted: (name: string, n: number) => `${name} abonó el árbol: +${plural(n, 'nutriente')}.`,
    puffed: (name: string, n: number) => `${name} sopló una nube: +${plural(n, 'espora')}.`,
    sprouted: (name: string) => `${name} lanzó el Brote arcano. La roca ahora es tierra con micelio.`,
    rained: (name: string, spores: number, nutrients: number) =>
      `${name} lanzó la Lluvia de esporas: +${plural(spores, 'espora')} y +${plural(nutrients, 'nutriente')}.`,
    recruited: (name: string, species: string) => `${name} (${species}) se unió al gremio. Trabajará desde el mes siguiente.`,
    winterEnd: 'Llegó el final del invierno.',
    newMonth: (month: number) => `Empieza el mes ${month}.`,
    treesGave: (spores: number, nutrients: number) =>
      spores ? `Los árboles dieron ${plural(spores, 'espora')} y ${plural(nutrients, 'nutriente')}.` : `Los árboles dieron ${plural(nutrients, 'nutriente')}.`,
    seasonStart: (season: string) => `Comienza ${season.toLowerCase()}.`,
    mageArrives: 'El bosque volvió a hablar, y alguien escuchó. Llega Maestra Bruma.',
    frostStart: (n: number) => `Llegó la escarcha: tejer cuesta ${plural(n, 'nutriente')}.`,
    /** Temporadas frías (028): avisos, salen también en Ancestral. */
    guildAte: (n: number) => `El gremio comió ${plural(n, 'nutriente')}.`,
    hungry: (names: readonly string[]) => `${listY(names)} ${names.length > 1 ? 'se quedaron' : 'se quedó'} sin comer: ${names.length > 1 ? 'descansan' : 'descansa'} este mes.`,
    sporelessStart: 'Llegó el invierno: los árboles ya no dan esporas.',
    treeFading: 'Este árbol se apagará al terminar el mes si nadie lo revive.',
    plagueMarked: (reach: number) => `La plaga llegó a la red: esa casilla se marchitará al terminar el mes si ningún hongo trabaja a ${reach} casillas o menos.`,
    plagueWithered: (n: number, reach: number) =>
      `La plaga marchitó ${n === 1 ? 'una casilla' : `${n} casillas`} de la red: no se ${n === 1 ? 'puede' : 'pueden'} tejer hasta que un hongo trabaje a ${reach} casillas o menos.`,
    plagueMarkedMany: (n: number, reach: number) => `La plaga crece: ${n} casillas de la red se marchitarán al terminar el mes si ningún hongo trabaja a ${reach} casillas o menos de cada una.`,
    /** 044: aviso previo al marcar la plaga. `marked`: cuántas casillas marcó (concuerda «se marchita» / «se marchitan»). */
    looseAtRisk: (n: number, marked: number) =>
      `Si ${marked === 1 ? 'se marchita' : 'se marchitan'}, ${n === 1 ? 'un árbol quedará suelto y no dará nada' : `${n} árboles quedarán sueltos y no darán nada`}.`,
    treesUnrooted: (n: number) => `${n === 1 ? 'Un árbol no dio nada' : `${n} árboles no dieron nada`}: la red no ${n === 1 ? 'lo' : 'los'} une al Hogar.`,
    plagueStopped: (n: number) => (n === 1 ? 'Los hongos frenaron la plaga.' : `Los hongos frenaron la plaga en ${n} casillas.`),
    plagueCleared: (n: number) =>
      n === 1 ? 'Los hongos limpiaron la plaga: la casilla volvió a ser tierra.' : `Los hongos limpiaron la plaga: ${n} casillas volvieron a ser tierra.`,
    treeFaded: (n: number) => `Un árbol se apagó: revivirlo ahora cuesta ${plural(n, 'nutriente')}.`,
    /** Mes vacío (024): no es una pista, sale también en Ancestral. */
    emptyMonth: (nutrients: number) =>
      nutrients > 0
        ? `Nadie tiene trabajo este mes. Termina el mes: la hojarasca traerá ${plural(nutrients, 'nutriente')}.`
        : 'Nadie tiene trabajo este mes. Termina el mes.',
  },

  /** Tutorial, «Cómo jugar» (046, 048): el globo de cada paso del guion (`src/tutorial.ts`), frases cortas. */
  tutorial: {
    label: 'Tutorial',
    count: (n: number, total: number) => `Paso ${n} de ${total}`,
    next: 'Siguiente',
    skip: 'Saltar tutorial',
    skipAsk: '¿Saltar el tutorial?',
    skipYes: 'Sí, saltar',
    skipNo: 'No, seguir',
    // Mes 1
    mother: `Este es el Árbol Ancestral. Despiértalo y el claro vuelve a la vida: pide ${LEVELS.tutorial.motherTrees} árboles revividos y ${plural(LEVELS.tutorial.mother, 'nutriente')}.`,
    hud: 'Arriba ves tus nutrientes (para trabajar), tus esporas (para reclutar) y los árboles que reviviste.',
    pickBruno: 'Este es tu gremio. Elige a Bruno.',
    openCard: 'Toca Ficha para ver qué hace Bruno.',
    readCard: 'Cada hongo tiene su ficha: qué hace y cuánto cuesta. Toca Entendido.',
    log: `Bruno descompone troncos junto a la red. Toca el tronco: ganas ${plural(GAIN.log, 'nutriente')}.`,
    pickIndi: 'Ahora elige a Indi, que teje la red.',
    weave: `Indi teje la red de micelio hacia el árbol gris (${plural(COST.weave, 'nutriente')}).`,
    end: 'Cada hongo trabaja una vez por mes. Termina el mes.',
    // Mes 2
    month2: 'Al empezar el mes, aquí ves lo que pasó. «Ver el mes» lo cuenta completo.',
    revive: `La red ya toca el árbol gris. Elige a Rubí y revívelo (${plural(COST.revive, 'nutriente')}).`,
    logAgain: `Bruno otra vez al tronco: cada tronco da ${LOG_USES} veces.`,
    weaveOn: 'Indi sigue la red hacia el otro árbol gris.',
    endGives: `Termina el mes: cada árbol vivo da ${plural(GAIN.treeSpores, 'espora')} y ${plural(GAIN.treeNutrients, 'nutriente')}.`,
    // Mes 3
    recruit: 'Con esporas reclutas hongos nuevos. Toca Reclutar.',
    recruitChispa: `Recluta a Chispa (${plural(RECRUIT_COSTS[0], 'espora')}). Llega cansada: trabaja desde el mes que viene.`,
    weaveTree2: 'Indi lleva la red hasta el segundo árbol.',
    log3: 'Bruno junta nutrientes en el otro tronco.',
    end3: 'Termina el mes.',
    // Mes 4
    logGone: 'Bruno usa el tronco por segunda vez y se deshace.',
    call: `Chispa pasa la voz: toca donde trabajó Bruno y Bruno trabaja otra vez (${plural(COST.call, 'espora')}).`,
    again: '¡Bruno está listo de nuevo! Llévalo al último tronco.',
    revive2: 'Rubí revive el segundo árbol. Alguien lo va a notar…',
    end4: 'Termina el mes.',
    // Mes 5
    mage: 'Llegó Maestra Bruma.',
    pickBruma: 'Elige a Maestra Bruma.',
    sprout: 'Una vez por estación lanza un hechizo. Elige Brote arcano.',
    sproutRock: 'Toca la roca junto al árbol: se vuelve tierra con red.',
    recruitMore: 'Hay esporas para otro hongo. Toca Reclutar.',
    recruitPompon: `Recluta a Pompón (${plural(RECRUIT_COSTS[1], 'espora')}): cambia nutrientes por esporas, o al revés.`,
    weaveMother: 'Indi teje hasta tocar al Árbol Ancestral.',
    help: 'Si dudas, el «?» abre la Libreta de campo: ahí está todo lo que aprendiste.',
    end5: 'Termina el mes.',
    // Mes 6
    star: 'Cuando juegues sin guía, la ★ te sugiere a quién elegir y dónde tocar.',
    pickPompon: `Al Árbol Ancestral le falta ${plural(GAIN.compost, 'nutriente')}. Elige a Pompón.`,
    compost: `Elige Abonar el árbol: ${plural(COST.compost, 'espora')} por ${plural(GAIN.compost, 'nutriente')}.`,
    compostTree: 'Toca un árbol vivo.',
    wake: '¡Ya está todo! Elige a Rubí y despierta al Árbol Ancestral.',
    // Final
    doneTitle: '¡Ya sabes jugar!',
    doneText: 'El Árbol Ancestral despertó. En Brote cada partida es un claro nuevo, y la ★ te acompaña.',
    playBrote: 'Jugar Brote',
    toTitle: 'Volver a la portada',
  },
} as const;
