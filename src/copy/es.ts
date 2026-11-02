import { COST, GAIN, LOG_USES, TREES_FOR_MOTHER } from '../rules/config';
import type { IdleReason } from '../rules/idle';
import type { RecruitableSpecies, SpeciesId } from '../rules/types';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

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
      verb: `Pasa la voz: un compañero que ya trabajó hoy vuelve a trabajar (${plural(COST.call, 'espora')}).`,
      quip: 'Viscosa como un caramelo y habladora como un loro. Cambia de color con los días.',
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
    lactarius: ['Añil', 'Ola', 'Nube', 'Brisa'],
    amanita: ['Rubí', 'Cereza', 'Lunar', 'Pimienta'],
    gliophorus: ['Chispa', 'Pluma', 'Trina', 'Gota'],
  } satisfies Record<RecruitableSpecies, readonly string[]>,
  mageName: 'Maestra Bruna',

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
    tired: (name: string) => `${name} ya trabajó hoy. Descansa hasta el amanecer.`,
    lactariusNeedsSoil: 'El Lactarius solo teje sobre tierra libre.',
    alreadyNet: 'Aquí ya hay micelio.',
    farSoil: 'Muy lejos: la tierra debe tocar la red.',
    noNutrientWeave: (n: number) => `Falta${n === 1 ? '' : 'n'} ${plural(n, 'nutriente')} para tejer.`,
    champiNeedsLog: 'El Champiñón necesita un tronco caído.',
    farLog: 'Muy lejos: el tronco debe tocar la red.',
    motherFar: 'La red todavía no llega al Árbol Padre.',
    forestSilent: (n: number) => `El bosque aún no habla: revive al menos ${n} árboles primero.`,
    motherCost: (n: number) => `El Árbol Padre necesita ${n} nutrientes.`,
    amanitaNeedsTree: 'La Amanita solo cura árboles.',
    treeAlive: 'Este árbol ya respira.',
    farTree: 'Muy lejos: el árbol debe tocar la red.',
    reviveCost: (n: number) => `Faltan nutrientes: revivir cuesta ${n}.`,
    gliophorusNeedsWorker: 'La Gliophorus pasa la voz donde un compañero ya trabajó hoy.',
    callCost: (n: number) => `Falta${n === 1 ? '' : 'n'} ${plural(n, 'espora')}: pasar la voz cuesta ${n}.`,
    magicSpent: 'Maestra Bruna descansa: su magia vuelve con la próxima estación.',
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
    noWorkers: 'nadie ha trabajado todavía hoy. Pasa la voz después de que trabaje un compañero.',
    magicSpent: 'su magia vuelve con la próxima estación.',
  } satisfies Record<IdleReason, string>,
  idleLine: (name: string, reason: string) => `${name}: ${reason}`,

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
    endDay: `Nadie más puede trabajar hoy. Pulsa «Fin del día»: cada árbol vivo dará ${plural(GAIN.treeSpores, 'espora')} y ${plural(GAIN.treeNutrients, 'nutriente')}.`,
    pickTile: (n: string) => `${n}: toca una casilla resaltada. La ★ acerca la red a tu meta.`,
    star: 'sugerido',
  },

  /** Qué es cada casilla (al tocarla sin miembro elegido). */
  tileHelp: {
    home: 'Hogar del gremio: aquí empieza la red de micelio.',
    mother: `Árbol Padre: la meta. Llévale la red y despiértalo con la Amanita (${TREES_FOR_MOTHER} árboles vivos y ${COST.mother} nutrientes).`,
    motherAwake: 'Árbol Padre: despierto. ¡El bosque respira!',
    soil: 'Tierra: el Lactarius teje micelio aquí para extender la red.',
    soilNet: 'Tierra tejida: ya es parte de la red. Se trabaja en las casillas vecinas.',
    log: `Tronco caído: el Champiñón lo descompone (+${GAIN.log} nutrientes, ${LOG_USES} veces).`,
    tree: `Árbol gris: la Amanita lo revive si toca la red (${plural(COST.revive, 'nutriente')}).`,
    treeAlive: `Árbol vivo: cada amanecer da ${plural(GAIN.treeSpores, 'espora')} y ${plural(GAIN.treeNutrients, 'nutriente')}.`,
    rock: 'Roca: bloquea la red. Maestra Bruna puede convertirla en tierra.',
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
      nutrients: `Gasta ${plural(COST.weave, 'nutriente')} por cada casilla tejida.`,
    },
    amanita: {
      context: 'Cura a los árboles dormidos del claro y, al final, despierta al Árbol Padre.',
      ability: 'Revive árboles grises y despierta al Árbol Padre.',
      howTo: 'Tócala y después toca un árbol resaltado que toque la red.',
      movement: 'No camina: cura los árboles vecinos a la red. Teje la red hasta un árbol para poder curarlo.',
      nutrients: `Gasta ${COST.revive} nutrientes por árbol y ${COST.mother} en el Árbol Padre.`,
      heals: `Los árboles grises (copa gris y tronco), por ${COST.revive} nutrientes: al revivir entran a la red y cada amanecer dan ${plural(GAIN.treeSpores, 'espora')} y ${plural(GAIN.treeNutrients, 'nutriente')}. El Árbol Padre (aro dorado, arriba): se despierta cuando la red lo toca, hay ${TREES_FOR_MOTHER} árboles revividos y ${COST.mother} nutrientes. Despertarlo es ganar.`,
    },
    gliophorus: {
      context: 'Corre la voz por los hilos de micelio más rápido que el viento. Cuando ella avisa, nadie se queda dormido.',
      ability: `Pasa la voz: un compañero que ya trabajó hoy se despierta y puede trabajar otra vez. Cuesta ${plural(COST.call, 'espora')}.`,
      howTo: 'Tócala y después toca la casilla donde trabajó hoy un compañero (allí se ve su retrato).',
      movement: 'No camina: su voz viaja por toda la red, así que llega a cualquier compañero, esté donde esté.',
      nutrients: 'No consigue nutrientes ella misma, pero hace que otro los consiga dos veces: un Champiñón que descompone de nuevo, o una Amanita que revive otro árbol el mismo día.',
      messenger: 'Es una segunda jugada: convierte esporas en trabajo extra. Úsala con quien más te convenga repetir; no puede llamar a otra Gliophorus ni a Maestra Bruna.',
    },
    mago: {
      context: 'Nadie la recluta: llega sola al amanecer siguiente a revivir el segundo árbol, cuando el bosque vuelve a hablar.',
      ability: 'Lanza un hechizo por estación.',
      howTo: 'Tócala, elige el hechizo y después toca la casilla resaltada.',
      movement: 'No camina: su magia alcanza rocas vecinas a la red y cualquier árbol vivo. Después de lanzar, descansa hasta la próxima estación.',
      nutrients: 'No gasta nutrientes. La Lluvia de esporas, además, los regala.',
      powers: `Brote arcano: convierte una roca vecina a la red en tierra con micelio; sirve para abrir atajos hacia el Árbol Padre. Lluvia de esporas: sobre un árbol vivo, cada árbol vivo da ya ${plural(GAIN.treeSpores, 'espora')} y ${plural(GAIN.treeNutrients, 'nutriente')} extra; sirve para reclutar o revivir antes.`,
    },
  } satisfies Record<SpeciesId, { context: string; ability: string; howTo: string; movement: string; nutrients: string; heals?: string; messenger?: string; powers?: string }>,
  quote: (text: string) => `«${text}»`,

  /** Libreta de campo (ayuda). */
  titleScreen: {
    label: 'Portada',
    play: 'Nueva partida',
    howto: 'Cómo jugar',
    guild: 'El gremio',
  },

  howto: {
    title: 'Cómo jugar',
    steps: [
      { title: 'Elige un hongo', text: 'Toca un hongo del gremio: se resaltan las casillas donde puede trabajar.' },
      { title: 'Trabaja junto a la red', text: 'Toca una casilla resaltada. Solo se trabaja junto a la red de micelio.' },
      { title: 'Una vez por día', text: 'Cada hongo trabaja una vez por día. Después pulsa «Fin del día».' },
      { title: 'Al amanecer', text: `Cada árbol vivo da ${plural(GAIN.treeSpores, 'espora')} y ${plural(GAIN.treeNutrients, 'nutriente')}. Con ${COST.recruit} esporas reclutas otro hongo.` },
      { title: 'Despierta al Árbol Padre', text: `Antes de que acabe el invierno: que la red lo toque, ${TREES_FOR_MOTHER} árboles revividos y ${COST.mother} nutrientes. Si dudas, sigue la ★.` },
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
    goal: `Despierta al Árbol Padre (arriba) antes de que acabe el invierno. Necesitas que la red lo toque, ${TREES_FOR_MOTHER} árboles revividos y ${COST.mother} nutrientes.`,
    howTitle: 'Cómo se juega',
    how: [
      'Toca un hongo del gremio: se resaltan las casillas donde puede trabajar.',
      'Toca una casilla resaltada. Solo se trabaja junto a la red de micelio.',
      'Cada hongo trabaja una vez por día. Después pulsa «Fin del día».',
      `Al amanecer, cada árbol vivo da ${plural(GAIN.treeSpores, 'espora')} y ${plural(GAIN.treeNutrients, 'nutriente')}. Con ${COST.recruit} esporas reclutas otro hongo.`,
    ],
    guildTitle: 'El gremio',
    tilesTitle: 'Las casillas',
    tip: 'Si no sabes qué hacer, sigue la ★: marca el hongo sugerido y la casilla que acerca la red a tu meta.',
    start: '¡A jugar!',
  },

  /** Pistas de la bitácora (del PoC). */
  hints: {
    pickMember: 'Elige a un miembro del gremio.',
    allWorked: 'Todos trabajaron. Termina el día.',
    pickTile: (name: string) => `${name}: toca una casilla resaltada.`,
    pickSpell: (name: string) => `${name}: elige un hechizo.`,
    won: 'El bosque respira de nuevo.',
    lost: 'El invierno terminó.',
  },

  hud: {
    label: 'Estado del bosque',
    day: 'Día',
    of: (n: number) => `/${n}`,
    nutrients: 'nutrientes',
    spores: 'esporas',
    sporesButton: (n: number) => `Esporas: ${n}. Abrir reclutar.`,
    recruitHint: 'esporas +',
    trees: 'árboles vivos',
    treesShort: 'árboles',
  },

  dock: {
    label: 'Gremio',
    ready: 'Lista',
    resting: 'Descansa',
    magicBack: (season: string) => `Magia: vuelve en ${season.toLowerCase()}`,
    magicGone: 'Magia: agotada',
    endDay: 'Terminar el día',
    endWinter: 'Terminar el invierno',
    endShort: 'Fin del día',
    endWinterShort: 'Fin',
    recruit: 'Reclutar',
    recruitCost: (n: number) => `${n} esporas`,
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
    mageTitle: 'Llegó Maestra Bruna',
    mageText: 'El bosque volvió a hablar, y alguien escuchó.',
    mageSpells: 'Una vez por estación lanza uno de sus hechizos:',
    mageOk: 'Seguir',
    wonTitle: '¡El bosque despertó!',
    wonText: (day: number) => `El Árbol Padre despertó en el día ${day}.`,
    lostTitle: 'Llegó el invierno',
    lostText: 'El bosque esperará la próxima primavera.',
    lostTip: 'Consejo: revive árboles temprano. Cada árbol vivo da esporas cada mañana.',
    summary: 'Resumen',
    stats: { day: 'día', trees: 'árboles', nutrients: 'nutrientes', spores: 'esporas' },
    viewBoard: 'Ver el claro',
    again: 'Jugar de nuevo',
  },

  sheet: {
    close: 'Cerrar',
    recruitTitle: 'Reclutar al gremio',
    recruitHelp: (cost: number, max: number) => `Cuesta ${cost} esporas. Hasta ${max} miembros; el recluta trabaja desde mañana.`,
    recruitAction: 'Reclutar',
    info: (name: string) => `Ficha de ${name}`,
    mageArrives: 'Llega sola, al amanecer siguiente al segundo árbol revivido.',
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
    position: (x: number, y: number) => `columna ${x + 1}, fila ${y + 1}`,
    boardLabel: 'Tablero del claro',
  },

  /** Mensajes de bitácora. */
  log: {
    wove: (name: string) => `${name} tejió micelio. La red crece.`,
    logDone: (name: string, n: number) => `${name} terminó el tronco: +${n} nutrientes y queda tierra fértil.`,
    logUsed: (name: string, n: number) => `${name} descompuso el tronco: +${n} nutrientes.`,
    motherAwake: (name: string) => `${name} despertó al Árbol Padre.`,
    revived: (name: string) => `${name} revivió un árbol. Cada amanecer dará una espora y un nutriente.`,
    called: (name: string, other: string) => `${name} pasó la voz: ${other} puede trabajar otra vez.`,
    sprouted: (name: string) => `${name} lanzó el Brote arcano. La roca ahora es tierra con micelio.`,
    rained: (name: string, spores: number, nutrients: number) =>
      `${name} lanzó la Lluvia de esporas: +${plural(spores, 'espora')} y +${plural(nutrients, 'nutriente')}.`,
    recruited: (name: string, species: string) => `${name} (${species}) se unió al gremio. Trabajará desde mañana.`,
    winterEnd: 'Llegó el final del invierno.',
    dawn: (day: number) => `Amanece el día ${day}.`,
    treesGave: (spores: number, nutrients: number) =>
      `Los árboles dieron ${plural(spores, 'espora')} y ${plural(nutrients, 'nutriente')}.`,
    seasonStart: (season: string) => `Comienza ${season.toLowerCase()}.`,
    mageArrives: 'El bosque volvió a hablar, y alguien escuchó. Llega Maestra Bruna.',
  },
} as const;
