const MAP_DATA = {
  provinces: [
    { id: 'salta', name: 'Salta', x: 30, y: 30, width: 210, height: 150 },
    { id: 'tucuman', name: 'Tucumán', x: 270, y: 55, width: 210, height: 150 },
    { id: 'cordoba', name: 'Córdoba', x: 510, y: 85, width: 230, height: 165 },
    { id: 'santa-fe', name: 'Santa Fe', x: 60, y: 245, width: 220, height: 160 },
    { id: 'entre-rios', name: 'Entre Ríos', x: 315, y: 265, width: 220, height: 160 },
    { id: 'corrientes', name: 'Corrientes', x: 585, y: 295, width: 220, height: 160 },
    { id: 'buenos-aires', name: 'Buenos Aires', x: 210, y: 475, width: 360, height: 170 }
  ],
  nodes: [
    { id: 'salta-1', provinceId: 'salta', name: 'Salta Capital', x: 70, y: 75, isCapital: true },
    { id: 'salta-2', provinceId: 'salta', name: 'Salta Nodo 2', x: 140, y: 70 },
    { id: 'salta-3', provinceId: 'salta', name: 'Salta Nodo 3', x: 200, y: 105 },
    { id: 'salta-4', provinceId: 'salta', name: 'Salta Nodo 4', x: 95, y: 145 },
    { id: 'salta-5', provinceId: 'salta', name: 'Salta Nodo 5', x: 180, y: 155 },
    { id: 'tucuman-1', provinceId: 'tucuman', name: 'Tucumán Capital', x: 310, y: 100, isCapital: true },
    { id: 'tucuman-2', provinceId: 'tucuman', name: 'Tucumán Nodo 2', x: 380, y: 92 },
    { id: 'tucuman-3', provinceId: 'tucuman', name: 'Tucumán Nodo 3', x: 445, y: 130 },
    { id: 'tucuman-4', provinceId: 'tucuman', name: 'Tucumán Nodo 4', x: 330, y: 170 },
    { id: 'tucuman-5', provinceId: 'tucuman', name: 'Tucumán Nodo 5', x: 420, y: 180 },
    { id: 'cordoba-1', provinceId: 'cordoba', name: 'Córdoba Capital', x: 550, y: 130, isCapital: true },
    { id: 'cordoba-2', provinceId: 'cordoba', name: 'Córdoba Nodo 2', x: 625, y: 125 },
    { id: 'cordoba-3', provinceId: 'cordoba', name: 'Córdoba Nodo 3', x: 700, y: 165 },
    { id: 'cordoba-4', provinceId: 'cordoba', name: 'Córdoba Nodo 4', x: 575, y: 215 },
    { id: 'cordoba-5', provinceId: 'cordoba', name: 'Córdoba Nodo 5', x: 670, y: 220 },
    { id: 'santa-fe-1', provinceId: 'santa-fe', name: 'Santa Fe Capital', x: 100, y: 290, isCapital: true },
    { id: 'santa-fe-2', provinceId: 'santa-fe', name: 'Santa Fe Nodo 2', x: 175, y: 285 },
    { id: 'santa-fe-3', provinceId: 'santa-fe', name: 'Santa Fe Nodo 3', x: 240, y: 325 },
    { id: 'santa-fe-4', provinceId: 'santa-fe', name: 'Santa Fe Nodo 4', x: 125, y: 370 },
    { id: 'santa-fe-5', provinceId: 'santa-fe', name: 'Santa Fe Nodo 5', x: 215, y: 375 },
    { id: 'entre-rios-1', provinceId: 'entre-rios', name: 'Entre Ríos Capital', x: 355, y: 310, isCapital: true },
    { id: 'entre-rios-2', provinceId: 'entre-rios', name: 'Entre Ríos Nodo 2', x: 430, y: 305 },
    { id: 'entre-rios-3', provinceId: 'entre-rios', name: 'Entre Ríos Nodo 3', x: 500, y: 345 },
    { id: 'entre-rios-4', provinceId: 'entre-rios', name: 'Entre Ríos Nodo 4', x: 380, y: 390 },
    { id: 'entre-rios-5', provinceId: 'entre-rios', name: 'Entre Ríos Nodo 5', x: 470, y: 395 },
    { id: 'corrientes-1', provinceId: 'corrientes', name: 'Corrientes Capital', x: 625, y: 340, isCapital: true },
    { id: 'corrientes-2', provinceId: 'corrientes', name: 'Corrientes Nodo 2', x: 700, y: 338 },
    { id: 'corrientes-3', provinceId: 'corrientes', name: 'Corrientes Nodo 3', x: 765, y: 375 },
    { id: 'corrientes-4', provinceId: 'corrientes', name: 'Corrientes Nodo 4', x: 650, y: 420 },
    { id: 'corrientes-5', provinceId: 'corrientes', name: 'Corrientes Nodo 5', x: 735, y: 425 },
    { id: 'buenos-aires-1', provinceId: 'buenos-aires', name: 'Buenos Aires Capital', x: 255, y: 525, isCapital: true },
    { id: 'buenos-aires-2', provinceId: 'buenos-aires', name: 'Buenos Aires Nodo 2', x: 350, y: 515 },
    { id: 'buenos-aires-3', provinceId: 'buenos-aires', name: 'Buenos Aires Nodo 3', x: 520, y: 535 },
    { id: 'buenos-aires-4', provinceId: 'buenos-aires', name: 'Buenos Aires Nodo 4', x: 315, y: 610 },
    { id: 'buenos-aires-5', provinceId: 'buenos-aires', name: 'Buenos Aires Nodo 5', x: 455, y: 615 }
  ],
  edges: [
    ['salta-1','salta-2'], ['salta-2','salta-3'], ['salta-3','salta-5'], ['salta-5','salta-4'], ['salta-4','salta-1'],
    ['tucuman-1','tucuman-2'], ['tucuman-2','tucuman-3'], ['tucuman-3','tucuman-5'], ['tucuman-5','tucuman-4'], ['tucuman-4','tucuman-1'],
    ['cordoba-1','cordoba-2'], ['cordoba-2','cordoba-3'], ['cordoba-3','cordoba-5'], ['cordoba-5','cordoba-4'], ['cordoba-4','cordoba-1'],
    ['santa-fe-1','santa-fe-2'], ['santa-fe-2','santa-fe-3'], ['santa-fe-3','santa-fe-5'], ['santa-fe-5','santa-fe-4'], ['santa-fe-4','santa-fe-1'],
    ['entre-rios-1','entre-rios-2'], ['entre-rios-2','entre-rios-3'], ['entre-rios-3','entre-rios-5'], ['entre-rios-5','entre-rios-4'], ['entre-rios-4','entre-rios-1'],
    ['corrientes-1','corrientes-2'], ['corrientes-2','corrientes-3'], ['corrientes-3','corrientes-5'], ['corrientes-5','corrientes-4'], ['corrientes-4','corrientes-1'],
    ['buenos-aires-1','buenos-aires-2'], ['buenos-aires-2','buenos-aires-3'], ['buenos-aires-3','buenos-aires-5'], ['buenos-aires-5','buenos-aires-4'], ['buenos-aires-4','buenos-aires-1'],
    ['salta-3','tucuman-1'], ['tucuman-3','cordoba-1'], ['salta-5','santa-fe-1'], ['santa-fe-3','entre-rios-1'], ['entre-rios-3','corrientes-1'], ['cordoba-5','corrientes-2'], ['santa-fe-5','buenos-aires-1'], ['entre-rios-5','buenos-aires-2'], ['corrientes-4','buenos-aires-3']
  ]
};

function createBaseMap() {
  const provinces = MAP_DATA.provinces.map((province) => ({
    ...province,
    nodes: MAP_DATA.nodes.filter((node) => node.provinceId === province.id).map((node) => node.id),
    tracks: { militar: 0, politico: 0, religioso: 0 }
  }));

  const nodes = MAP_DATA.nodes.map((node) => ({
    ...node,
    units: { federal: 0, unitario: 0 },
    structures: [],
    token: null,
    adjacent: []
  }));

  const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));
  MAP_DATA.edges.forEach(([a, b]) => {
    byId[a].adjacent.push(b);
    byId[b].adjacent.push(a);
  });

  return { provinces, nodes, edges: MAP_DATA.edges };
}
