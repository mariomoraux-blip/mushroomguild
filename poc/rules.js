// El Gremio de los Hongos — reglas puras (sin DOM). Se prueban en Node y se inyectan en la página.
const Rules = (() => {
  const W = 8, H = 5, DAYS = 12, MAX_GUILD = 6;
  const COST = { weave: 1, revive: 3, mother: 6, recruit: 2 };
  const GAIN = { log: 3 };
  const TREES_FOR_MOTHER = 2;

  const SPECIES = {
    ostra:   { name: 'Ostra',     role: 'Tejedora',      verb: 'Teje micelio en tierra vecina a la red (1 nutriente).' },
    champi:  { name: 'Champiñón', role: 'Descompositor', verb: 'Descompone un tronco vecino a la red (+3 nutrientes).' },
    amanita: { name: 'Amanita',   role: 'Sanadora',      verb: 'Revive un árbol gris vecino a la red (3 nutrientes).' },
  };
  const NAMES = {
    ostra: ['Ola', 'Nube', 'Brisa', 'Perla'],
    champi: ['Bruno', 'Tomillo', 'Gordo', 'Migas'],
    amanita: ['Rubí', 'Cereza', 'Lunar', 'Pimienta'],
  };
  const SEASONS = ['Primavera', 'Verano', 'Otoño', 'Invierno'];

  // H hogar · M Árbol Madre · . tierra · L tronco · T árbol gris · R roca
  const MAP = [
    '.L.RT...',
    'L..R..LT',
    'H.T..R.M',
    '..R.L...',
    '.T...RT.',
  ];
  const KIND = { H: 'home', M: 'mother', '.': 'soil', L: 'log', T: 'tree', R: 'rock' };

  function newGame() {
    const tiles = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = KIND[MAP[y][x]];
      tiles.push({ x, y, t, net: t === 'home', uses: 0, alive: false });
    }
    const s = {
      tiles, day: 1, nutrients: 2, spores: 0, status: 'playing', wonDay: null,
      members: [], nameIdx: { ostra: 0, champi: 0, amanita: 0 }, nextId: 1,
    };
    ['ostra', 'champi', 'amanita'].forEach(sp => addMember(s, sp));
    return s;
  }

  function addMember(s, sp) {
    const list = NAMES[sp];
    const name = list[s.nameIdx[sp] % list.length];
    s.nameIdx[sp]++;
    s.members.push({ id: s.nextId++, sp, name, used: false, at: null });
  }

  const tile = (s, x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? null : s.tiles[y * W + x];
  const neighbors = (s, x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => tile(s, x + dx, y + dy)).filter(Boolean);
  const touchesNet = (s, x, y) => neighbors(s, x, y).some(n => n.net);
  const revivedCount = s => s.tiles.filter(t => t.t === 'tree' && t.alive).length;
  const treeTotal = s => s.tiles.filter(t => t.t === 'tree').length;
  const season = day => SEASONS[Math.min(3, Math.floor((day - 1) / 3))];
  const member = (s, id) => s.members.find(m => m.id === id);

  // Devuelve { ok, reason }. reason es texto para el jugador.
  function check(s, id, x, y) {
    const m = member(s, id), t = tile(s, x, y);
    if (s.status !== 'playing') return { ok: false, reason: 'La partida terminó.' };
    if (!m || !t) return { ok: false, reason: '' };
    if (m.used) return { ok: false, reason: `${m.name} ya trabajó hoy. Descansa hasta el amanecer.` };
    const near = touchesNet(s, x, y);
    if (m.sp === 'ostra') {
      if (t.t !== 'soil') return { ok: false, reason: 'La Ostra solo teje sobre tierra libre.' };
      if (t.net) return { ok: false, reason: 'Aquí ya hay micelio.' };
      if (!near) return { ok: false, reason: 'Muy lejos: la tierra debe tocar la red.' };
      if (s.nutrients < COST.weave) return { ok: false, reason: 'Falta 1 nutriente para tejer.' };
      return { ok: true };
    }
    if (m.sp === 'champi') {
      if (t.t !== 'log') return { ok: false, reason: 'El Champiñón necesita un tronco caído.' };
      if (!near) return { ok: false, reason: 'Muy lejos: el tronco debe tocar la red.' };
      return { ok: true };
    }
    if (m.sp === 'amanita') {
      if (t.t === 'mother') {
        if (!near) return { ok: false, reason: 'La red todavía no llega al Árbol Madre.' };
        if (revivedCount(s) < TREES_FOR_MOTHER) return { ok: false, reason: `El bosque aún no habla: revive al menos ${TREES_FOR_MOTHER} árboles primero.` };
        if (s.nutrients < COST.mother) return { ok: false, reason: `El Árbol Madre necesita ${COST.mother} nutrientes.` };
        return { ok: true };
      }
      if (t.t !== 'tree') return { ok: false, reason: 'La Amanita solo cura árboles.' };
      if (t.alive) return { ok: false, reason: 'Este árbol ya respira.' };
      if (!near) return { ok: false, reason: 'Muy lejos: el árbol debe tocar la red.' };
      if (s.nutrients < COST.revive) return { ok: false, reason: `Faltan nutrientes: revivir cuesta ${COST.revive}.` };
      return { ok: true };
    }
    return { ok: false, reason: '' };
  }

  function validTargets(s, id) {
    return s.tiles.filter(t => check(s, id, t.x, t.y).ok);
  }

  // Ejecuta la acción. Devuelve texto para la bitácora o lanza error si no es válida.
  function act(s, id, x, y) {
    const c = check(s, id, x, y);
    if (!c.ok) throw new Error(c.reason);
    const m = member(s, id), t = tile(s, x, y);
    m.used = true; m.at = { x, y };
    if (m.sp === 'ostra') {
      s.nutrients -= COST.weave; t.net = true;
      return `${m.name} tejió micelio. La red crece.`;
    }
    if (m.sp === 'champi') {
      s.nutrients += GAIN.log; t.uses++;
      if (t.uses >= 2) { t.t = 'soil'; t.uses = 0; return `${m.name} terminó el tronco: +${GAIN.log} nutrientes y queda tierra fértil.`; }
      return `${m.name} descompuso el tronco: +${GAIN.log} nutrientes.`;
    }
    if (t.t === 'mother') {
      s.nutrients -= COST.mother; t.alive = true; t.net = true;
      s.status = 'won'; s.wonDay = s.day;
      return `${m.name} despertó al Árbol Madre.`;
    }
    s.nutrients -= COST.revive; t.alive = true; t.net = true;
    return `${m.name} revivió un árbol. Cada amanecer dará una espora y un nutriente.`;
  }

  function recruit(s, sp) {
    if (s.status !== 'playing') throw new Error('La partida terminó.');
    if (s.members.length >= MAX_GUILD) throw new Error('El gremio está completo.');
    if (s.spores < COST.recruit) throw new Error(`Reclutar cuesta ${COST.recruit} esporas.`);
    s.spores -= COST.recruit; addMember(s, sp);
    const m = s.members[s.members.length - 1];
    m.used = true; // llega cansado: trabaja desde mañana
    return `${m.name} (${SPECIES[sp].name}) se unió al gremio. Trabajará desde mañana.`;
  }

  function endDay(s) {
    if (s.status !== 'playing') return '';
    if (s.day >= DAYS) { s.status = 'lost'; return 'Llegó el final del invierno.'; }
    const before = season(s.day);
    s.day++;
    const gained = revivedCount(s);
    s.spores += gained;
    s.nutrients += gained; // hojarasca: cada árbol vivo también deja 1 nutriente
    s.members.forEach(m => { m.used = false; m.at = null; });
    const now = season(s.day);
    const parts = [`Amanece el día ${s.day}.`];
    if (gained) parts.push(`Los árboles dieron ${gained} espora${gained > 1 ? 's' : ''} y ${gained} nutriente${gained > 1 ? 's' : ''}.`);
    if (now !== before) parts.push(`Comienza ${now.toLowerCase()}.`);
    return parts.join(' ');
  }

  return {
    W, H, DAYS, MAX_GUILD, COST, GAIN, TREES_FOR_MOTHER, SPECIES, SEASONS,
    newGame, tile, neighbors, touchesNet, revivedCount, treeTotal, season, member,
    check, validTargets, act, recruit, endDay,
  };
})();
if (typeof module !== 'undefined') module.exports = Rules;
