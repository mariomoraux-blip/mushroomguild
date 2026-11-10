import { COST, FADED_REVIVE, FROST_WEAVE, GAIN, LEVELS, LOG_USES, PLAGUE_REACH, RECRUIT_COSTS, UPKEEP } from '../rules/config';
import type { IdleReason } from '../rules/idle';
import type { Level, RecruitableSpecies, SpeciesId } from '../rules/types';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
/** «3, 5 y 7». */
const listY = (items: readonly (string | number)[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items.at(-1)}`);
/**
 * Lo que pide el Árbol Padre fuera de la partida (028, 031): lo de Brote y Bosque, y entre paréntesis lo de Ancestral
 * si es distinto. Dentro de la partida, la meta y la etiqueta usan lo del nivel (`motherCost`, `motherTrees`).
 */
const B = LEVELS.brote;
const A = LEVELS.ancestral;
const motherNutrients = A.mother === B.mother ? `${B.mother} nutrientes` : `${B.mother} nutrientes (${A.mother} en Ancestral)`;
const motherNeeds =
  A.mother === B.mother && A.motherTrees === B.motherTrees
    ? `${B.motherTrees} árboles revividos y ${B.mother} nutrientes`
    : `${B.motherTrees} árboles revividos y ${B.mother} nutrientes (${A.motherTrees} y ${A.mother} en Ancestral)`;
/** Curva de reclutar (027): «cuesta 3, luego 5 y luego 7». */
const recruitCurve = `cuesta ${listY(RECRUIT_COSTS.map((n, i) => (i === 0 ? n : `luego ${n}`)))}`;
const times = (m: number) => `×${String(m).replace('.', ',')}`;

// Textos visibles del juego. Español neutro, tono cozy, frases cortas.
export const es = {
  title: 'El Gremio de los Hongos',

  species: {
    champi: {
      name: 'Champiñón', short: 'Champiñón', scientific: 'Agaricus bisporus', role: 'Descompositor',
      verb: `Descompone un tronco vecino a la red (+${plural(GAIN.log, 'nutriente')}).`,
      quip: 'Comestible: sí, y lo sabe. Por eso trabaja rápido.',
      action: `Descompone · +${GAIN.log} nutrientes`,
    },
    lactarius: {
      name: 'Lactarius indigo', short: 'Lactarius', scientific: 'Lactarius indigo', role: 'Tejedor',
      verb: `Teje micelio en tierra vecina a la red (${plural(COST.weave, 'nutriente')}).`,
      quip: 'Si lo cortas, sangra tinta azul. Preferiría que no lo cortaras.',
      action: `Teje · −${plural(COST.weave, 'nutriente')}`,
    },
    amanita: {
      name: 'Amanita muscaria', short: 'Amanita', scientific: 'Amanita muscaria', role: 'Sanadora',
      verb: `Revive un árbol gris vecino a la red (${plural(COST.revive, 'nutriente')}).`,
      quip: 'Comestible: no. Bonita: muchísimo. Úsese solo para curar árboles.',
      action: `Revive · −${plural(COST.revive, 'nutriente')}`,
    },
    gliophorus: {
      name: 'Gliophorus psittacinus', short: 'Gliophorus', scientific: 'Gliophorus psittacinus', role: 'Mensajera',
      verb: `Pasa la voz: un compañero que ya trabajó este mes vuelve a trabajar (${plural(COST.call, 'espora')}).`,
      quip: 'Viscosa como un caramelo y habladora como un loro. Cambia de color con los meses.',
      action: `Llama · −${plural(COST.call, 'espora')}`,
    },
    mago: {
      name: 'Conocybe arcana', short: 'Conocybe', scientific: 'Conocybe arcana', role: 'Maga',
      verb: 'Lanza un hechizo por estación: Brote arcano o Lluvia de esporas.',
      quip: 'No aparece en ningún libro. Ella dice que fueron los libros los que no la encontraron.',
      action: '1 hechizo por estación',
    },
  } satisfies Record<SpeciesId, { name: string; short: string; scientific: string; role: string; verb: string; quip: string; action: string }>,

  /** Nombres de los miembros, en orden de llegada. */
  memberNames: {
    champi: ['Bruno', 'Tomillo', 'Migas', 'Trufo'],
    lactarius: ['Indi', 'Ola', 'Nube', 'Brisa'],
    amanita: ['Rubí', 'Cereza', 'Lunar', 'Pimienta'],
    gliophorus: ['Chispa', 'Pluma', 'Trina', 'Gota'],
  } satisfies Record<RecruitableSpecies, readonly string[]>,
  mageName: 'Maestra Bruma',

  spells: {
    sprout: 'Brote arcano',
    rain: 'Lluvia de esporas',
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
    motherFar: 'La red todavía no llega al Árbol Padre.',
    forestSilent: (n: number) => `El bosque aún no habla: revive al menos ${n} árboles primero.`,
    motherCost: (n: number) => `El Árbol Padre necesita ${n} nutrientes.`,
    amanitaNeedsTree: 'La Amanita solo cura árboles.',
    treeAlive: 'Este árbol ya respira.',
    farTree: 'Muy lejos: el árbol debe tocar la red.',
    reviveCost: (n: number) => `Faltan nutrientes: revivir cuesta ${n}.`,
    gliophorusNeedsWorker: 'La Gliophorus pasa la voz donde un compañero ya trabajó este mes.',
    callCost: (n: number) => `Falta${n === 1 ? '' : 'n'} ${plural(n, 'espora')}: pasar la voz cuesta ${n}.`,
    magicSpent: 'Maestra Bruma descansa: su magia vuelve con la próxima estación.',
    sproutNeedsRock: 'El Brote arcano solo despierta rocas que tocan la red.',
    rainNeedsTree: 'La Lluvia de esporas se lanza sobre un árbol vivo.',
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
  } satisfies Record<IdleReason, string>,
  idleLine: (name: string, reason: string) => `${name}: ${reason}`,
  /** Acción del Tejedor con el costo de este mes (con escarcha, 2). */
  weaveAction: (n: number) => `Teje · −${plural(n, 'nutriente')}`,

  /** Pistas del siguiente paso (`advise`). */
  advice: {
    awaken: (n: string) => `Pista: ${n} puede despertar al Árbol Padre. ¡Es la meta!`,
    revive: (n: string) => `Pista: ${n} puede revivir un árbol gris. Cada árbol vivo da esporas y nutrientes.`,
    recruit: (spores: number, species: string) => `Pista: tienes ${plural(spores, 'espora')}. Recluta un ${species} en «+ Reclutar» o tocando las esporas.`,
    decompose: (n: string) => `Pista: ${n} puede descomponer un tronco junto a la red (+${GAIN.log} nutrientes).`,
    weaveTree: (n: string) => `Pista: ${n} puede tejer la red hacia un árbol gris (★).`,
    weaveMother: (n: string) => `Pista: ${n} puede tejer la red hacia el Árbol Padre (★).`,
    call: (n: string, other: string) => `Pista: ${n} puede pasar la voz a ${other} para que trabaje otra vez (★).`,
    spell: (n: string, spell: string) => `Pista: ${n} puede lanzar ${spell}.`,
    endMonth: `Nadie más puede trabajar este mes. Pulsa «Fin del mes»: cada árbol vivo dará ${plural(GAIN.treeSpores, 'espora')} y ${plural(GAIN.treeNutrients, 'nutriente')}.`,
    pickTile: (n: string) => `${n}: toca una casilla resaltada. La ★ acerca la red a tu meta.`,
    star: 'sugerido',
  },

  /** Qué es cada casilla (al tocarla sin miembro elegido). */
  tileHelp: {
    home: 'Hogar del gremio: aquí empieza la red de micelio.',
    mother: (n: number, trees: number) => `Árbol Padre: la meta. Llévale la red y despiértalo con la Amanita (${trees} árboles vivos y ${n} nutrientes).`,
    motherAwake: 'Árbol Padre: despierto. ¡El bosque respira!',
    soil: 'Tierra: el Lactarius teje micelio aquí para extender la red.',
    soilNet: 'Tierra tejida: ya es parte de la red. Se trabaja en las casillas vecinas.',
    log: `Tronco caído: el Champiñón lo descompone (+${GAIN.log} nutrientes, ${LOG_USES} veces).`,
    tree: `Árbol gris: la Amanita lo revive si toca la red (${plural(COST.revive, 'nutriente')}).`,
    plague: `Red con plaga: se marchitará al terminar el mes si ningún hongo trabaja a ${PLAGUE_REACH} casillas o menos. Marchita, sale de la red y no se puede tejer hasta limpiarla.`,
    plagueWithered: `Plaga marchita: no se puede tejer. Se limpia al terminar un mes en que un hongo trabaje a ${PLAGUE_REACH} casillas o menos; entonces vuelve a ser tierra.`,
    treeFading: `Árbol gris con escarcha: se apagará al terminar el mes si la Amanita no lo revive (${plural(COST.revive, 'nutriente')}).`,
    treeFaded: `Árbol apagado: la Amanita aún puede revivirlo, pero cuesta ${plural(FADED_REVIVE, 'nutriente')}.`,
    treeAlive: `Árbol vivo: al empezar cada mes da ${plural(GAIN.treeSpores, 'espora')} y ${plural(GAIN.treeNutrients, 'nutriente')}.`,
    rock: 'Roca: bloquea la red. Maestra Bruma puede convertirla en tierra.',
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
      context: 'Cura a los árboles dormidos del claro y, al final, despierta al Árbol Padre.',
      ability: 'Revive árboles grises y despierta al Árbol Padre.',
      howTo: 'Tócala y después toca un árbol resaltado que toque la red.',
      movement: 'No camina: cura los árboles vecinos a la red. Teje la red hasta un árbol para poder curarlo.',
      nutrients: `Gasta ${COST.revive} nutrientes por árbol, ${FADED_REVIVE} por un árbol apagado y ${motherNutrients} en el Árbol Padre.`,
      heals: `Los árboles grises (copa gris y tronco), por ${COST.revive} nutrientes: al revivir entran a la red y al empezar cada mes dan ${plural(GAIN.treeSpores, 'espora')} y ${plural(GAIN.treeNutrients, 'nutriente')}. El Árbol Padre (aro dorado, arriba): se despierta cuando la red lo toca y hay ${motherNeeds}. Despertarlo es ganar. En Bosque y Ancestral, un árbol con escarcha se apaga al terminar el mes si nadie lo revive; apagado, revivirlo cuesta ${FADED_REVIVE}.`,
    },
    gliophorus: {
      context: 'Corre la voz por los hilos de micelio más rápido que el viento. Cuando ella avisa, nadie se queda dormido.',
      ability: `Pasa la voz: un compañero que ya trabajó este mes se despierta y puede trabajar otra vez. Cuesta ${plural(COST.call, 'espora')}.`,
      howTo: 'Tócala y después toca la casilla donde trabajó este mes un compañero (allí se ve su retrato).',
      movement: 'No camina: su voz viaja por toda la red, así que llega a cualquier compañero, esté donde esté.',
      nutrients: 'No consigue nutrientes ella misma, pero hace que otro los consiga dos veces: un Champiñón que descompone de nuevo, o una Amanita que revive otro árbol el mismo mes.',
      messenger: 'Es una segunda jugada: convierte esporas en trabajo extra. Úsala con quien más te convenga repetir; no puede llamar a otra Gliophorus ni a Maestra Bruma.',
    },
    mago: {
      context: 'Nadie la recluta: llega sola al empezar el mes siguiente a revivir el segundo árbol, cuando el bosque vuelve a hablar.',
      ability: 'Lanza un hechizo por estación.',
      howTo: 'Tócala, elige el hechizo y después toca la casilla resaltada.',
      movement: 'No camina: su magia alcanza rocas vecinas a la red y cualquier árbol vivo. Después de lanzar, descansa hasta la próxima estación.',
      nutrients: 'No gasta nutrientes. La Lluvia de esporas, además, los regala.',
      powers: `Brote arcano: convierte una roca vecina a la red en tierra con micelio; sirve para abrir atajos hacia el Árbol Padre. Lluvia de esporas: sobre un árbol vivo, cada árbol vivo da ya ${plural(GAIN.treeSpores, 'espora')} y ${plural(GAIN.treeNutrients, 'nutriente')} extra; sirve para reclutar o revivir antes.`,
    },
  } satisfies Record<SpeciesId, { context: string; ability: string; howTo: string; movement: string; nutrients: string; heals?: string; messenger?: string; powers?: string }>,
  quote: (text: string) => `«${text}»`,

  /** Libreta de campo (ayuda). */
  levels: {
    title: 'Elige tu dificultad',
    label: 'Niveles de dificultad',
    names: { brote: 'Brote', bosque: 'Bosque', ancestral: 'Ancestral' },
    lines: {
      brote: 'El claro de siempre, con la ★ para guiarte.',
      bosque: 'Más rocas, escarcha en otoño y un árbol que se apaga.',
      ancestral: 'Más rocas aún, escarcha hasta el final, cinco árboles que se apagan, plaga, un Árbol Padre más exigente y sin ★.',
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

  howto: {
    title: 'Cómo jugar',
    steps: [
      { title: 'Elige un hongo', text: 'Toca un hongo del gremio: se resaltan las casillas donde puede trabajar.' },
      { title: 'Trabaja junto a la red', text: 'Toca una casilla resaltada. Solo se trabaja junto a la red de micelio.' },
      { title: 'Una vez por mes', text: 'Cada hongo trabaja una vez por mes. Después pulsa «Fin del mes».' },
      { title: 'Al empezar el mes', text: `Cada árbol vivo da ${plural(GAIN.treeSpores, 'espora')} y ${plural(GAIN.treeNutrients, 'nutriente')}. Con esporas reclutas otro hongo: ${recruitCurve}.` },
      { title: 'Despierta al Árbol Padre', text: `Antes de que acabe el invierno: que la red lo toque y ${motherNeeds}. Si dudas, sigue la ★.` },
    ],
    step: (n: number, total: number) => `Paso ${n} de ${total}`,
    prev: 'Paso anterior',
    next: 'Paso siguiente',
    goTo: (n: number) => `Ir al paso ${n}`,
    notebook: 'Libreta de campo',
    back: 'Volver',
    play: '¡A jugar!',
  },

  guild: {
    title: 'El gremio',
    intro: 'Cinco especies, un oficio cada una. Toca una para ver su ficha.',
    open: (name: string) => `Ver la ficha de ${name}`,
    back: 'Volver',
  },

  help: {
    button: 'Ayuda: Cómo jugar',
    title: 'Libreta de campo',
    goalTitle: 'La meta',
    goal: (n: number, trees: number) => `Despierta al Árbol Padre (arriba) antes de que acabe el invierno. Necesitas que la red lo toque, ${trees} árboles revividos y ${n} nutrientes.`,
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
    levels: `La escarcha hace que tejer cueste ${plural(FROST_WEAVE, 'nutriente')}. Algunos meses, un árbol gris se cubre de escarcha: si nadie lo revive ese mes, se apaga y revivirlo cuesta ${plural(FADED_REVIVE, 'nutriente')}. En otoño e invierno, al terminar cada mes el gremio come ${plural(UPKEEP, 'nutriente')} (si no hay, el primero en llegar descansa el mes siguiente). En invierno los árboles no dan esporas. Nunca se pierden los árboles vivos. En Ancestral, al empezar el otoño y el invierno la plaga marca una casilla tejida cerca del Árbol Padre: al terminar el mes se marchita si ningún hongo trabajó a ${PLAGUE_REACH} casillas o menos, y la plaga sigue ahí (no se puede tejer) hasta que un hongo trabaje así de cerca. En Ancestral no hay ★ y el Árbol Padre pide ${A.motherTrees} árboles revividos y ${plural(A.mother, 'nutriente')}.`,
    start: '¡A jugar!',
  },

  /** Pistas de la bitácora (del PoC). */
  hints: {
    pickMember: 'Elige a un miembro del gremio.',
    allWorked: 'Todos trabajaron. Termina el mes.',
    pickTile: (name: string) => `${name}: toca una casilla resaltada.`,
    pickSpell: (name: string) => `${name}: elige un hechizo.`,
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
    season: (season: string, frost: boolean, level: string, plague = false) => `${season}${frost ? ', con escarcha' : ''}${plague ? ', con plaga' : ''} · ${level}`,
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
      variety: 'Las 5 especies',
      time: 'Rapidez',
    },
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
      { title: 'Antes del invierno', text: 'Lleva la red de micelio hasta el Árbol Padre y despiértalo antes de que termine el invierno.' },
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
    /** Regla extra de la carta en Ancestral (032). */
    coldPlague: `Cada estación, la plaga marca una casilla de la red cerca del Árbol Padre: se marchita al terminar el mes si ningún hongo trabaja a ${PLAGUE_REACH} casillas o menos, y se queda hasta que uno lo haga.`,
    coldOk: 'Seguir',
    wonTitle: '¡El bosque despertó!',
    wonText: (month: number) => `El Árbol Padre despertó en el mes ${month}.`,
    lostTitle: 'Llegó el invierno',
    lostText: 'El bosque esperará la próxima primavera.',
    lostTip: 'Consejo: revive árboles temprano. Cada árbol vivo da esporas cada mes.',
    summary: 'Resumen',
    stats: { month: 'mes', trees: 'árboles', nutrients: 'nutrientes', spores: 'esporas' },
    viewBoard: 'Ver el claro',
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
    info: (name: string) => `Ficha de ${name}`,
    mageArrives: 'Llega sola, al empezar el mes siguiente al segundo árbol revivido.',
    spellTitle: 'Elige un hechizo',
  },

  tiles: {
    home: 'Hogar del gremio',
    mother: 'Árbol Padre',
    motherAwake: 'Árbol Padre despierto',
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
    plague: `con plaga: se marchitará al terminar el mes si ningún hongo trabaja a ${PLAGUE_REACH} casillas o menos`,
    plagueWithered: `con plaga marchita: no se puede tejer hasta que un hongo trabaje a ${PLAGUE_REACH} casillas o menos`,
    position: (x: number, y: number) => `columna ${x + 1}, fila ${y + 1}`,
    boardLabel: 'Tablero del claro',
  },

  /** Mensajes de bitácora. */
  log: {
    wove: (name: string) => `${name} tejió micelio. La red crece.`,
    logDone: (name: string, n: number) => `${name} terminó el tronco: +${n} nutrientes y queda tierra fértil.`,
    logUsed: (name: string, n: number) => `${name} descompuso el tronco: +${n} nutrientes.`,
    motherAwake: (name: string) => `${name} despertó al Árbol Padre.`,
    revived: (name: string) => `${name} revivió un árbol. Al empezar cada mes dará una espora y un nutriente.`,
    called: (name: string, other: string) => `${name} pasó la voz: ${other} puede trabajar otra vez.`,
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
    plagueWithered: (reach: number) => `La plaga marchitó una casilla de la red: no se puede tejer hasta que un hongo trabaje a ${reach} casillas o menos.`,
    plagueStopped: 'Los hongos frenaron la plaga.',
    plagueCleared: 'Los hongos limpiaron la plaga: la casilla volvió a ser tierra.',
    treeFaded: (n: number) => `Un árbol se apagó: revivirlo ahora cuesta ${plural(n, 'nutriente')}.`,
    /** Mes vacío (024): no es una pista, sale también en Ancestral. */
    emptyMonth: (nutrients: number) =>
      nutrients > 0
        ? `Nadie tiene trabajo este mes. Termina el mes: la hojarasca traerá ${plural(nutrients, 'nutriente')}.`
        : 'Nadie tiene trabajo este mes. Termina el mes.',
  },
} as const;
