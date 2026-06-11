const PLAYERS = {
  federal: { id: 'federal', name: 'Federal', shortName: 'F', trackDirection: -1, cssClass: 'federal' },
  unitario: { id: 'unitario', name: 'Unitario', shortName: 'U', trackDirection: 1, cssClass: 'unitario' }
};

const RESOURCE_NAMES = { prestigio: 'Prestigio', influencia: 'Influencia', fe: 'Fe' };
const TRACK_NAMES = { militar: 'Militar', politico: 'Político', religioso: 'Religioso' };

const STRUCTURES = {
  cabildo: { id: 'cabildo', name: 'Cabildo', icon: '🏛', cost: { influencia: 2 }, campaignTracks: ['politico'] },
  iglesia: { id: 'iglesia', name: 'Iglesia', icon: '⛪', cost: { fe: 2 }, campaignTracks: ['religioso'] },
  fortin: { id: 'fortin', name: 'Fortín', icon: '🛡', cost: { prestigio: 2 }, campaignTracks: ['militar'] },
  cuartel: { id: 'cuartel', name: 'Cuartel', icon: '⚔️', cost: { prestigio: 1, influencia: 1 }, campaignTracks: ['militar'] },
  aduana: { id: 'aduana', name: 'Aduana', icon: '⚖️', cost: { prestigio: 1, influencia: 1 }, campaignTracks: [] }
};

function getProvinceControl(province) {
  const federalTracks = Object.values(province.tracks).filter((value) => value < 0).length;
  const unitarioTracks = Object.values(province.tracks).filter((value) => value > 0).length;
  if (federalTracks >= 2) return 'federal';
  if (unitarioTracks >= 2) return 'unitario';
  return 'neutral';
}

function describeTrack(value) {
  if (value < 0) return `F${Math.abs(value)}`;
  if (value > 0) return `U${value}`;
  return '0';
}

function shiftTrack(province, track, playerId, steps = 1) {
  const before = province.tracks[track];
  province.tracks[track] = clamp(before + PLAYERS[playerId].trackDirection * steps, -3, 3);
  return { before, after: province.tracks[track] };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
