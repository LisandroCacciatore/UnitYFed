const PROVINCE_NAMES = [
  'Salta',
  'Tucumán',
  'Córdoba',
  'Santa Fe',
  'Entre Ríos',
  'Corrientes',
  'Buenos Aires'
];

function createBaseMap() {
  const provinces = [];
  const nodes = [];

  PROVINCE_NAMES.forEach((provinceName, provinceIndex) => {
    const provinceId = slugify(provinceName);
    const provinceNodes = [];

    for (let index = 1; index <= 5; index += 1) {
      const nodeId = `${provinceId}-${index}`;
      provinceNodes.push(nodeId);
      nodes.push({
        id: nodeId,
        name: `${provinceName} Nodo ${index}`,
        provinceId,
        provinceName,
        isCapital: index === 1,
        units: { federal: 0, unitario: 0 },
        structures: [],
        token: null,
        adjacent: []
      });
    }

    provinces.push({
      id: provinceId,
      name: provinceName,
      nodes: provinceNodes,
      tracks: { militar: 0, politico: 0, religioso: 0 }
    });
  });

  connectNodes(nodes);

  return { provinces, nodes };
}

function connectNodes(nodes) {
  const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));

  PROVINCE_NAMES.forEach((provinceName, provinceIndex) => {
    const provinceId = slugify(provinceName);
    for (let index = 1; index <= 5; index += 1) {
      const current = byId[`${provinceId}-${index}`];
      if (index > 1) addConnection(current, byId[`${provinceId}-${index - 1}`]);
      if (index < 5) addConnection(current, byId[`${provinceId}-${index + 1}`]);
    }

    const nextProvince = PROVINCE_NAMES[provinceIndex + 1];
    if (nextProvince) {
      addConnection(byId[`${provinceId}-5`], byId[`${slugify(nextProvince)}-1`]);
    }
  });
}

function addConnection(a, b) {
  if (!a || !b) return;
  if (!a.adjacent.includes(b.id)) a.adjacent.push(b.id);
  if (!b.adjacent.includes(a.id)) b.adjacent.push(a.id);
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-');
}
