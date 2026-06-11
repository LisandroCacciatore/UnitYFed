function renderBoard(game) {
  const svg = document.getElementById('board-svg');
  const highlightedProvince = game.highlightedProvinceId;
  svg.innerHTML = `
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
      </filter>
    </defs>
    ${game.edges.map(([a, b]) => edgeLine(game.getNode(a), game.getNode(b))).join('')}
    ${game.provinces.map((province) => provinceGroup(game, province, highlightedProvince === province.id)).join('')}
    ${game.nodes.map((node) => nodeGroup(game, node)).join('')}
  `;

  svg.querySelectorAll('[data-node-id]').forEach((element) => {
    element.addEventListener('click', () => {
      game.selectNode(element.dataset.nodeId);
    });
  });
}

function edgeLine(a, b) {
  return `<line class="edge" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
}

function provinceGroup(game, province, highlighted) {
  const control = getProvinceControl(province);
  const controlLabel = control === 'neutral' ? 'Neutral' : PLAYERS[control].name;
  const debugPools = game.debug
    ? ['militar', 'politico', 'religioso'].map((track) => `${TRACK_NAMES[track][0]}:${buildDicePool({ province, track, playerId: game.activePlayerId, nodes: game.nodes }).diceCount}d`).join(' · ')
    : '';
  return `
    <g class="province-shape ${control} ${highlighted ? 'highlighted' : ''}">
      <rect x="${province.x}" y="${province.y}" width="${province.width}" height="${province.height}" rx="14"/>
      <text class="province-title" x="${province.x + 12}" y="${province.y + 26}">${province.name.toUpperCase()}</text>
      <text class="province-tracks" x="${province.x + 12}" y="${province.y + 48}">M: ${describeTrack(province.tracks.militar)} · P: ${describeTrack(province.tracks.politico)} · R: ${describeTrack(province.tracks.religioso)}</text>
      <text class="province-control" x="${province.x + 12}" y="${province.y + 68}">Control: ${controlLabel}</text>
      ${game.debug ? `<text class="province-debug" x="${province.x + 12}" y="${province.y + province.height - 12}">Debug ${PLAYERS[game.activePlayerId].name}: ${debugPools} · Control ${controlLabel}</text>` : ''}
    </g>
  `;
}

function nodeGroup(game, node) {
  const occupied = node.units.federal + node.units.unitario > 0;
  const hasStructure = node.structures.length > 0;
  const selected = game.selectedNodeId === node.id;
  const validMove = game.validMoveNodeIds.includes(node.id);
  const token = node.token ? (node.token.revealed ? `${node.token.icon}` : '?') : '';
  const ownerClass = node.units.federal && node.units.unitario ? 'contested' : node.units.federal ? 'federal' : node.units.unitario ? 'unitario' : 'neutral';

  return `
    <g class="node-group ${ownerClass} ${selected ? 'selected' : ''} ${validMove ? 'valid-move' : ''}" data-node-id="${node.id}">
      <circle cx="${node.x}" cy="${node.y}" r="15" class="node-circle ${occupied ? 'occupied' : 'empty'}"/>
      ${hasStructure ? `<rect class="structure-marker" x="${node.x - 8}" y="${node.y - 8}" width="16" height="16"/>` : ''}
      ${token ? `<text class="token-marker" x="${node.x + 17}" y="${node.y - 10}">${token}</text>` : ''}
      <text class="unit-count federal-text" x="${node.x - 13}" y="${node.y + 5}">${node.units.federal || ''}</text>
      <text class="unit-count unitario-text" x="${node.x + 5}" y="${node.y + 5}">${node.units.unitario || ''}</text>
      <title>${node.name}: F${node.units.federal} / U${node.units.unitario} · ${tokenLabel(node)}</title>
    </g>
  `;
}

function tokenLabel(node) {
  if (!node.token) return 'Sin token';
  if (!node.token.revealed) return '? Token oculto';
  return `${node.token.icon} ${node.token.name}`;
}
