// Lista negra de nombres escritos (038 · leaderboard › Nombre en el gremio). La usan el cliente (para avisar en la
// hoja) y el servidor (para rechazar con 400). Las entradas se comparan ya normalizadas por `normalizeName`
// (sin tildes, minúsculas, sin espacios, sin letras repetidas), así que «P u u t a» o «Púta» también caen.

/** Raíces que se rechazan dentro de cualquier parte del nombre: casi nunca aparecen en un nombre inocente. */
export const BLOCKED_ANYWHERE: readonly string[] = [
  // Español
  'puta', 'puto', 'mierda', 'pendej', 'cabron', 'culero', 'culiao', 'culiad', 'chinga', 'joder', 'jodid',
  'maricon', 'mamon', 'mamahuev', 'malparid', 'gonorrea', 'hijueput', 'gilipoll', 'idiota', 'imbecil', 'estupid',
  'subnormal', 'retrasad', 'mongol', 'sudaca', 'negrata', 'travelo', 'violador', 'pedofil', 'porno', 'sexo', 'sexy',
  'follar', 'chupala', 'chupamela', 'pajero', 'zorron', 'malnacid', 'huevon', 'weon', 'conchetum',
  'conchasu', 'ctm', 'hdp',
  // Inglés
  'fuck', 'shit', 'bitch', 'cunt', 'pussy', 'asshole', 'bastard', 'whore', 'slut', 'nigg', 'faggot', 'retard',
  'penis', 'vagina', 'porn', 'hitler',
  // Suplantación del equipo del juego
  'admin', 'moderador', 'moderator',
];

/** Palabras que solo se rechazan si son una palabra entera del nombre: dentro de otras son inocentes. */
export const BLOCKED_WORDS: readonly string[] = [
  'culo', 'pene', 'caca', 'teta', 'tetas', 'polla', 'perra', 'perras', 'marica', 'cono', 'pija', 'pito', 'nabo',
  'verga', 'coger', 'nazi', 'nazis',
  'dick', 'cock', 'fag', 'rape', 'sex', 'tits', 'anal',
  'oficial', 'soporte', 'staff',
];
