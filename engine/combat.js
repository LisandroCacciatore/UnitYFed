function rollExplodingD10() {
  const parts = [];
  let total = 0;
  let exploded = false;
  while (true) {
    const value = Math.floor(Math.random() * 10) + 1;
    parts.push(value);
    total += value;
    if (value !== 10) break;
    exploded = true;
  }
  return { total, parts, exploded };
}

function marginLabel(difference) {
  if (difference >= 10) return { label: 'Victoria Decisiva', steps: 3, decisive: true };
  if (difference >= 5) return { label: 'Victoria Importante', steps: 2, decisive: false };
  return { label: 'Victoria Menor', steps: 1, decisive: false };
}

function buildDicePool({ province, track, playerId, nodes }) {
  const provinceNodes = nodes.filter((node) => node.provinceId === province.id);
  const trackValue = province.tracks[track];
  const trackDice = playerId === 'federal' ? Math.max(0, -trackValue) : Math.max(0, trackValue);
  const unitCount = provinceNodes.reduce((sum, node) => sum + node.units[playerId], 0);
  const unitDice = Math.min(unitCount, 3);
  const structureDice = Math.min(countStructureSupport(provinceNodes, track, playerId), 2);
  const diceCount = 1 + trackDice + unitDice + structureDice;
  const keepCount = Math.min(1 + unitCount, 4);

  return {
    playerId,
    baseDice: 1,
    trackDice,
    unitCount,
    unitDice,
    structureDice,
    diceCount,
    keepCount,
    modifiers: [
      `Base +1`,
      `Track ${describeTrack(trackValue)} +${trackDice}`,
      `Unidades ${unitCount} (máx. +3) = +${unitDice}`,
      `Estructuras/tokens (máx. +2) = +${structureDice}`,
      `Dados guardados: ${keepCount}`
    ]
  };
}

function countStructureSupport(nodes, track, playerId) {
  let support = 0;
  nodes.forEach((node) => {
    support += node.structures.filter((structure) => {
      const definition = STRUCTURES[structure.type];
      return structure.owner === playerId && definition.campaignTracks.includes(track);
    }).length;

    if (track === 'politico' && node.isCapital && hasPresence(node, playerId)) support += 1;
    if (node.token?.revealed && hasPresence(node, playerId)) {
      if (track === 'militar' && node.token.id === 'fortin') support += 1;
      if (track === 'politico' && node.token.id === 'cabildo') support += 1;
      if (track === 'religioso' && ['iglesia', 'capilla'].includes(node.token.id)) support += 1;
    }
  });
  return support;
}

function resolveDicePool(pool) {
  const rolled = Array.from({ length: pool.diceCount }, () => rollExplodingD10());
  const sorted = [...rolled].sort((a, b) => b.total - a.total);
  const kept = sorted.slice(0, pool.keepCount);
  const discarded = sorted.slice(pool.keepCount);
  return {
    ...pool,
    rolled,
    kept,
    discarded,
    total: kept.reduce((sum, die) => sum + die.total, 0),
    explosions: rolled.filter((die) => die.exploded)
  };
}

function formatDie(die) {
  return die.parts.length > 1 ? `${die.total} (${die.parts.join('→')})` : `${die.total}`;
}

function hasPresence(node, playerId) {
  return node.units[playerId] > 0 || node.structures.some((structure) => structure.owner === playerId);
}
