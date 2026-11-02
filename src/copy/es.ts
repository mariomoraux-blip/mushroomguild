import type { SpeciesId } from '../rules/types';

// Textos visibles del juego. Español neutro, tono cozy, frases cortas.
export const es = {
  title: 'El Gremio de los Hongos',

  species: {
    ostra: { name: 'Ostra', role: 'Tejedora', verb: 'Teje micelio en tierra vecina a la red (1 nutriente).' },
    champi: { name: 'Champiñón', role: 'Descompositor', verb: 'Descompone un tronco vecino a la red (+3 nutrientes).' },
    amanita: { name: 'Amanita', role: 'Sanadora', verb: 'Revive un árbol gris vecino a la red (3 nutrientes).' },
  } satisfies Record<SpeciesId, { name: string; role: string; verb: string }>,

  memberNames: {
    ostra: ['Ola', 'Nube', 'Brisa', 'Perla'],
    champi: ['Bruno', 'Tomillo', 'Gordo', 'Migas'],
    amanita: ['Rubí', 'Cereza', 'Lunar', 'Pimienta'],
  } satisfies Record<SpeciesId, readonly string[]>,

  seasons: ['Primavera', 'Verano', 'Otoño', 'Invierno'],

  /** Motivos de rechazo (texto para el jugador). */
  reasons: {
    gameOver: 'La partida terminó.',
    unknown: '',
    tired: (name: string) => `${name} ya trabajó hoy. Descansa hasta el amanecer.`,
    ostraNeedsSoil: 'La Ostra solo teje sobre tierra libre.',
    alreadyNet: 'Aquí ya hay micelio.',
    farSoil: 'Muy lejos: la tierra debe tocar la red.',
    noNutrientWeave: 'Falta 1 nutriente para tejer.',
    champiNeedsLog: 'El Champiñón necesita un tronco caído.',
    farLog: 'Muy lejos: el tronco debe tocar la red.',
    motherFar: 'La red todavía no llega al Árbol Madre.',
    forestSilent: (n: number) => `El bosque aún no habla: revive al menos ${n} árboles primero.`,
    motherCost: (n: number) => `El Árbol Madre necesita ${n} nutrientes.`,
    amanitaNeedsTree: 'La Amanita solo cura árboles.',
    treeAlive: 'Este árbol ya respira.',
    farTree: 'Muy lejos: el árbol debe tocar la red.',
    reviveCost: (n: number) => `Faltan nutrientes: revivir cuesta ${n}.`,
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
    recruited: (name: string, species: string) => `${name} (${species}) se unió al gremio. Trabajará desde mañana.`,
    winterEnd: 'Llegó el final del invierno.',
    dawn: (day: number) => `Amanece el día ${day}.`,
    treesGave: (n: number) =>
      `Los árboles dieron ${n} espora${n > 1 ? 's' : ''} y ${n} nutriente${n > 1 ? 's' : ''}.`,
    seasonStart: (season: string) => `Comienza ${season.toLowerCase()}.`,
  },
} as const;
