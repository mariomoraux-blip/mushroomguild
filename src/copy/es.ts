import { COST, GAIN } from '../rules/config';
import type { RecruitableSpecies, SpeciesId } from '../rules/types';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Textos visibles del juego. Español neutro, tono cozy, frases cortas.
export const es = {
  title: 'El Gremio de los Hongos',

  species: {
    champi: { name: 'Champiñón', role: 'Descompositor', verb: `Descompone un tronco vecino a la red (+${plural(GAIN.log, 'nutriente')}).` },
    lactarius: { name: 'Lactarius indigo', role: 'Tejedora', verb: `Teje micelio en tierra vecina a la red (${plural(COST.weave, 'nutriente')}).` },
    amanita: { name: 'Amanita muscaria', role: 'Sanadora', verb: `Revive un árbol gris vecino a la red (${plural(COST.revive, 'nutriente')}).` },
    gliophorus: { name: 'Gliophorus psittacinus', role: 'Mensajera', verb: `Pasa la voz desde un árbol vivo (−${plural(COST.message, 'espora')}, +${plural(GAIN.message, 'nutriente')}).` },
    mago: { name: 'Conocybe arcana', role: 'Mago', verb: 'Lanza un hechizo por estación: Brote arcano o Lluvia de esporas.' },
  } satisfies Record<SpeciesId, { name: string; role: string; verb: string }>,

  /** Nombres de los miembros, en orden de llegada. */
  memberNames: {
    champi: ['Bruno', 'Tomillo', 'Migas', 'Trufo'],
    lactarius: ['Añil', 'Ola', 'Nube', 'Brisa'],
    amanita: ['Rubí', 'Cereza', 'Lunar', 'Pimienta'],
    gliophorus: ['Perico', 'Loro', 'Kiwi', 'Lima'],
  } satisfies Record<RecruitableSpecies, readonly string[]>,
  mageName: 'Maese Bruma',

  spells: {
    sprout: 'Brote arcano',
    rain: 'Lluvia de esporas',
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
    magicSpent: 'Maese Bruma descansa: su magia vuelve con la próxima estación.',
    sproutNeedsRock: 'El Brote arcano solo despierta rocas que tocan la red.',
    rainNeedsTree: 'La Lluvia de esporas se lanza sobre un árbol vivo.',
    guildFull: 'El gremio está completo.',
    recruitCost: (n: number) => `Reclutar cuesta ${n} esporas.`,
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
    mageArrives: 'El bosque volvió a hablar, y alguien escuchó. Llega Maese Bruma.',
  },
} as const;
