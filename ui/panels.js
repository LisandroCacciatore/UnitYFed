function renderPanels(game) {
  document.getElementById('active-player').textContent = game.activePlayer.name;
  document.getElementById('turn-counter').textContent = `Turno ${game.turn}`;
  renderPlayers(game);
  renderNodeDetails(game);
  renderCombatPanel(game);
  renderStats(game);
}

function renderPlayers(game) {
  document.getElementById('players-summary').innerHTML = Object.values(game.players).map((player) => `
    <article class="player-card ${player.cssClass}">
      <h3>${player.name}</h3>
      <dl class="resource-grid">
        <div><dt>Prestigio</dt><dd>${player.resources.prestigio}</dd></div>
        <div><dt>Influencia</dt><dd>${player.resources.influencia}</dd></div>
        <div><dt>Fe</dt><dd>${player.resources.fe}</dd></div>
        <div><dt>PM</dt><dd>${player.pm}</dd></div>
        <div><dt>Mano</dt><dd>${player.hand.length}</dd></div>
      </dl>
      <p>Mazo: ${player.deck.length} · Descarte: ${player.discard.length}</p>
    </article>
  `).join('');
}

function renderNodeDetails(game) {
  const panel = document.getElementById('node-details');
  const node = game.selectedNodeId ? game.getNode(game.selectedNodeId) : null;
  if (!node) {
    panel.innerHTML = '<p class="hint">Haz click en un nodo del mapa para ver sus datos.</p>';
    return;
  }
  panel.innerHTML = `
    <h3>${node.name}</h3>
    <p><strong>Provincia:</strong> ${game.getProvince(node.provinceId).name}</p>
    <p><strong>Unidades:</strong> Federal ${node.units.federal} · Unitario ${node.units.unitario}</p>
    <p><strong>Estructuras:</strong> ${node.structures.length ? node.structures.map((structure) => `${PLAYERS[structure.owner].name} ${STRUCTURES[structure.type].icon} ${STRUCTURES[structure.type].name}`).join(', ') : 'Ninguna'}</p>
    <p><strong>Token:</strong> ${tokenLabel(node)}</p>
    <p><strong>Conexiones:</strong> ${node.adjacent.map((id) => game.getNode(id).name).join(', ')}</p>
    ${game.debug ? `<pre>${JSON.stringify(node, null, 2)}</pre>` : ''}
  `;
}

function renderCombatPanel(game) {
  const panel = document.getElementById('combat-result');
  const result = game.lastCampaignResult;
  if (!result) {
    panel.innerHTML = '<p class="hint">Las campañas mostrarán aquí dados, explosiones, guardados, descartados y cambios de track.</p>';
    return;
  }

  panel.innerHTML = `
    <h3>${result.trackName} en ${result.provinceName}</h3>
    <p><strong>${result.winnerId ? `${PLAYERS[result.winnerId].name} gana` : 'Empate'}:</strong> ${result.margin.label} · Diferencia ${result.difference}</p>
    <div class="combat-columns">
      ${combatantBlock(result.attacker)}
      ${combatantBlock(result.defender)}
    </div>
    <p><strong>Track:</strong> ${result.trackChange.before} → ${result.trackChange.after}</p>
    ${result.secondaryEffect ? `<p><strong>Efecto:</strong> ${result.secondaryEffect.text}</p>` : ''}
  `;
}

function combatantBlock(combatant) {
  return `
    <section class="combatant ${PLAYERS[combatant.playerId].cssClass}">
      <h4>${PLAYERS[combatant.playerId].name}</h4>
      <p><strong>Dados generados:</strong> ${combatant.diceCount}d10</p>
      <p><strong>Tirados:</strong> ${combatant.rolled.map(formatDie).join(' · ')}</p>
      <p><strong>Explosiones:</strong> ${combatant.explosions.length ? combatant.explosions.map((die) => die.parts.join(' → ')).join(' / ') : 'Ninguna'}</p>
      <p><strong>Guardados:</strong> ${combatant.kept.map(formatDie).join(' · ')}</p>
      <p><strong>Descartados:</strong> ${combatant.discarded.length ? combatant.discarded.map(formatDie).join(' · ') : 'Ninguno'}</p>
      <p><strong>Total:</strong> ${combatant.total}</p>
      <details><summary>Modificadores</summary><ul>${combatant.modifiers.map((item) => `<li>${item}</li>`).join('')}</ul></details>
    </section>
  `;
}

function renderStats(game) {
  const avg = game.stats.campaigns ? (game.stats.totalDifference / game.stats.campaigns).toFixed(1) : '0.0';
  document.getElementById('stats').innerHTML = `
    <dl class="stats-grid">
      <div><dt>Campañas</dt><dd>${game.stats.campaigns}</dd></div>
      <div><dt>Victorias Federales</dt><dd>${game.stats.federalWins}</dd></div>
      <div><dt>Victorias Unitarias</dt><dd>${game.stats.unitarioWins}</dd></div>
      <div><dt>Diferencia promedio</dt><dd>${avg}</dd></div>
      <div><dt>Dieces explosivos</dt><dd>${game.stats.explodingTens}</dd></div>
      <div><dt>Victorias decisivas</dt><dd>${game.stats.decisiveWins}</dd></div>
    </dl>
  `;
}
