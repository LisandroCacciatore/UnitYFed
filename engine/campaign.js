function resolveCampaign({ province, track, attackerId, defenderId, nodes }) {
  const attackerPool = buildDicePool({ province, track, playerId: attackerId, nodes });
  const defenderPool = buildDicePool({ province, track, playerId: defenderId, nodes });
  const attacker = resolveDicePool(attackerPool);
  const defender = resolveDicePool(defenderPool);
  const difference = Math.abs(attacker.total - defender.total);
  const winnerId = attacker.total >= defender.total ? attackerId : defenderId;
  const loserId = winnerId === attackerId ? defenderId : attackerId;
  const margin = marginLabel(difference);
  const trackChange = difference === 0
    ? { before: province.tracks[track], after: province.tracks[track] }
    : shiftTrack(province, track, winnerId, margin.steps);
  const secondaryEffect = difference === 0 ? null : getSecondaryEffect(track, margin.decisive, winnerId, loserId, province, nodes);

  return {
    provinceId: province.id,
    provinceName: province.name,
    track,
    trackName: TRACK_NAMES[track],
    attackerId,
    defenderId,
    attacker,
    defender,
    winnerId: difference === 0 ? null : winnerId,
    loserId: difference === 0 ? null : loserId,
    difference,
    margin: difference === 0 ? { label: 'Empate', steps: 0, decisive: false } : margin,
    trackChange,
    secondaryEffect
  };
}

function getSecondaryEffect(track, decisive, winnerId, loserId, province, nodes) {
  if (!decisive) return null;
  if (track === 'politico') return { type: 'draw-card', playerId: winnerId, text: `${PLAYERS[winnerId].name} roba 1 carta por victoria política decisiva.` };
  if (track === 'religioso') return { type: 'gain-faith', playerId: winnerId, text: `${PLAYERS[winnerId].name} gana 1 Fe por victoria religiosa decisiva.` };
  if (track === 'militar') {
    const targetNode = nodes.find((node) => node.provinceId === province.id && node.units[loserId] > 0);
    return targetNode
      ? { type: 'expel-unit', playerId: loserId, nodeId: targetNode.id, text: `Unidad ${PLAYERS[loserId].name} expulsada de ${targetNode.name}.` }
      : { type: 'none', text: 'No había unidad enemiga para expulsar.' };
  }
  return null;
}
