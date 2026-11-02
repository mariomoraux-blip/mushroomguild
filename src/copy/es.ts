import { COST, GAIN } from '../rules/config';
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
    },
    lactarius: {
      name: 'Lactarius indigo', short: 'Lactarius', scientific: 'Lactarius indigo', role: 'Tejedor',
      verb: `Teje micelio en tierra vecina a la red (${plural(COST.weave, 'nutriente')}).`,
      quip: 'Si lo cortas, sangra tinta azul. Preferiría que no lo cortaras.',
    },
    amanita: {
      name: 'Amanita muscaria', short: 'Amanita', scientific: 'Amanita muscaria', role: 'Sanadora',
      verb: `Revive un árbol gris vecino a la red (${plural(COST.revive, 'nutriente')}).`,
      quip: 'Comestible: no. Bonita: muchísimo. Úsese solo para curar árboles.',
    },
    gliophorus: {
      name: 'Gliophorus psittacinus', short: 'Gliophorus', scientific: 'Gliophorus psittacinus', role: 'Mensajera',
      verb: `Pasa la voz desde un árbol vivo (−${plural(COST.message, 'espora')}, +${plural(GAIN.message, 'nutriente')}).`,
      quip: 'Viscosa como un caramelo y habladora como un loro. Cambia de color con los días.',
    },
    mago: {
      name: 'Conocybe arcana', short: 'Conocybe', scientific: 'Conocybe arcana', role: 'Maga',
      verb: 'Lanza un hechizo por estación: Brote arcano o Lluvia de esporas.',
      quip: 'No aparece en ningún libro. Ella dice que fueron los libros los que no la encontraron.',
    },
  } satisfies Record<SpeciesId, { name: string; short: string; scientific: string; role: string; verb: string; quip: string }>,

  /** Nombres de los miembros, en orden de llegada. */
  memberNames: {
    champi: ['Bruno', 'Tomillo', 'Migas', 'Trufo'],
    lactarius: ['Añil', 'Ola', 'Nube', 'Brisa'],
    amanita: ['Rubí', 'Cereza', 'Lunar', 'Pimienta'],
    gliophorus: ['Perico', 'Loro', 'Kiwi', 'Lima'],
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
    tired: (name: string) => `${name} ya trabajó hoy. Descansa hasta el amanecer.`,
    lactariusNeedsSoil: 'La Lactarius solo teje sobre tierra libre.',
    alreadyNet: 'Aquí ya hay micelio.',
    farSoil: 'Muy lejos: la tierra debe tocar la red.',
    noNutrientWeave: (n: number) => `Falta${n === 1 ? '' : 'n'} ${plural(n, 'nutriente')} para tejer.`,
    champiNeedsLog: 'El Champiñón necesita un tronco caído.',
    farLog: 'Muy lejos: el tronco debe tocar la red.',
    motherFar: 'La red todavía no llega al Árbol Madre.',
    forestSilent: (n: number) => `El bosque aún no habla: revive al menos ${n} árboles primero.`,
    motherCost: (n: number) => `El Árbol Madre necesita ${n} nutrientes.`,
    amanitaNeedsTree: 'La Amanita solo cura árboles.',
    treeAlive: 'Este árbol ya respira.',
    farTree: 'Muy lejos: el árbol debe tocar la red.',
    reviveCost: (n: number) => `Faltan nutrientes: revivir cuesta ${n}.`,
    gliophorusNeedsTree: 'La Gliophorus solo pasa la voz desde un árbol vivo.',
    messageCost: (n: number) => `Faltan esporas: pasar la voz cuesta ${n}.`,
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
    noSpores: `faltan esporas: pasar la voz cuesta ${COST.message}.`,
    noLiveTrees: 'no hay árboles vivos todavía.',
    magicSpent: 'su magia vuelve con la próxima estación.',
  } satisfies Record<IdleReason, string>,
  idleLine: (name: string, reason: string) => `${name}: ${reason}`,

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
    trees: 'árboles vivos',
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
    mother: 'Árbol Madre',
    motherAwake: 'Árbol Madre despierto',
    soil: 'Tierra',
    log: 'Tronco caído',
    tree: 'Árbol gris',
    treeAlive: 'Árbol vivo',
    rock: 'Roca',
    inNet: 'en la red',
    valid: 'disponible',
    position: (x: number, y: number) => `columna ${x + 1}, fila ${y + 1}`,
    boardLabel: 'Tablero del claro',
  },

  /** Mensajes de bitácora. */
  log: {
    wove: (name: string) => `${name} tejió micelio. La red crece.`,
    logDone: (name: string, n: number) => `${name} terminó el tronco: +${n} nutrientes y queda tierra fértil.`,
    logUsed: (name: string, n: number) => `${name} descompuso el tronco: +${n} nutrientes.`,
    motherAwake: (name: string) => `${name} despertó al Árbol Madre.`,
    revived: (name: string) => `${name} revivió un árbol. Cada amanecer dará una espora y un nutriente.`,
    passedWord: (name: string, spores: number, nutrients: number) =>
      `${name} pasó la voz: −${spores} esporas, +${nutrients} nutrientes.`,
    sprouted: (name: string) => `${name} lanzó el Brote arcano. La roca ahora es tierra con micelio.`,
    rained: (name: string, spores: number, nutrients: number) =>
      `${name} lanzó la Lluvia de esporas: +${plural(spores, 'espora')} y +${plural(nutrients, 'nutriente')}.`,
    recruited: (name: string, species: string) => `${name} (${species}) se unió al gremio. Trabajará desde mañana.`,
    winterEnd: 'Llegó el final del invierno.',
    dawn: (day: number) => `Amanece el día ${day}.`,
    treesGave: (spores: number, nutrients: number) =>
      `Los árboles dieron ${plural(spores, 'espora')} y ${plural(nutrients, 'nutriente')}.`,
    seasonStart: (season: string) => `Comienza ${season.toLowerCase()}.`,
    mageArrives: 'El bosque volvió a hablar, y alguien escuchó. Llega Maestra Bruma.',
  },
} as const;
