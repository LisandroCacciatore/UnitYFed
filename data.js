const PLAYERS = {
  federal: {
    id: 'federal',
    name: 'Federal',
    trackDirection: -1,
    cssClass: 'federal'
  },
  unitario: {
    id: 'unitario',
    name: 'Unitario',
    trackDirection: 1,
    cssClass: 'unitario'
  }
};

const RESOURCE_NAMES = {
  prestigio: 'Prestigio',
  influencia: 'Influencia',
  fe: 'Fe'
};

const TRACK_NAMES = {
  militar: 'Militar',
  politico: 'Político',
  religioso: 'Religioso'
};

const STRUCTURES = {
  cabildo: {
    id: 'cabildo',
    name: 'Cabildo',
    cost: { influencia: 2 },
    strengthTrack: 'politico'
  },
  iglesia: {
    id: 'iglesia',
    name: 'Iglesia',
    cost: { fe: 2 },
    strengthTrack: 'religioso'
  },
  fortin: {
    id: 'fortin',
    name: 'Fortín',
    cost: { prestigio: 2 },
    strengthTrack: 'militar'
  },
  aduana: {
    id: 'aduana',
    name: 'Aduana',
    cost: { prestigio: 1, influencia: 1 },
    strengthTrack: null
  }
};

const TOKENS = [
  { id: 'pulperia', name: 'Pulpería', description: 'Permite convertir 2 recursos iguales en 1 recurso cualquiera.' },
  { id: 'aduana', name: 'Aduana', description: '+1 Prestigio durante mantenimiento.' },
  { id: 'fortin', name: 'Fortín', description: '+1 dado defensivo en campañas militares (registrado como nota).' },
  { id: 'cabildo', name: 'Cabildo', description: '+1 Fuerza Política.' },
  { id: 'iglesia', name: 'Iglesia', description: '+1 Fuerza Religiosa.' },
  { id: 'capilla', name: 'Capilla', description: '+1 Fuerza Religiosa.' },
  { id: 'puerto', name: 'Puerto', description: 'Robar 1 carta y descartar 1 durante mantenimiento.' },
  { id: 'correo', name: 'Correo', description: 'Robar 1 carta extra por ronda.' },
  { id: 'estancia', name: 'Estancia', description: '+1 recurso durante mantenimiento.' },
  { id: 'paso', name: 'Paso', description: 'Reduce costo de movimiento desde este nodo.' }
];
