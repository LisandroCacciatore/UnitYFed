class Game {
  constructor() {
    const baseMap = createBaseMap();
    this.provinces = baseMap.provinces;
    this.nodes = baseMap.nodes;
    this.edges = baseMap.edges;
    this.players = this.createPlayers();
    this.activePlayerId = 'federal';
    this.turn = 1;
    this.logEntries = [];
    this.selectedNodeId = null;
    this.validMoveNodeIds = [];
    this.highlightedProvinceId = null;
    this.lastCampaignResult = null;
    this.debug = false;
    this.stats = {
      campaigns: 0,
      federalWins: 0,
      unitarioWins: 0,
      totalDifference: 0,
      explodingTens: 0,
      decisiveWins: 0
    };

    this.assignTokens();
    this.placeStartingUnits();
    this.initialDraw();
    this.bindEvents();
    this.populateStaticControls();
    this.log('Turno 1. Comienza Federal.');
    this.render();
  }

  createPlayers() {
    return Object.fromEntries(Object.values(PLAYERS).map((player) => [
      player.id,
      { ...player, resources: { prestigio: 4, influencia: 3, fe: 2 }, pm: 0, deck: this.createDeck(), hand: [], discard: [] }
    ]));
  }

  createDeck() {
    return shuffle([...CARD_LIBRARY, ...CARD_LIBRARY].map((card, index) => ({
      ...card,
      instanceId: `${card.id}-${index}-${Math.random().toString(16).slice(2)}`
    })));
  }

  initialDraw() {
    Object.values(this.players).forEach((player) => this.drawToHand(player, 7));
  }

  assignTokens() {
    shuffle([...this.nodes]).slice(0, TOKEN_DEFINITIONS.length).forEach((node, index) => {
      node.token = { ...TOKEN_DEFINITIONS[index], revealed: false };
    });
  }

  placeStartingUnits() {
    this.provinces.forEach((province) => {
      const capital = this.getNode(province.nodes[0]);
      capital.units.federal += 1;
      capital.units.unitario += 1;
      if (capital.token) capital.token.revealed = true;
    });
    this.getNode('buenos-aires-5').units.federal += 3;
    this.getNode('salta-5').units.unitario += 3;
  }

  bindEvents() {
    document.getElementById('maintenance-btn').addEventListener('click', () => {
      this.runMaintenance();
      this.render();
    });
    document.getElementById('end-round-btn').addEventListener('click', () => this.endRound());
    document.getElementById('debug-toggle').addEventListener('change', (event) => {
      this.debug = event.target.checked;
      this.render();
    });
    document.getElementById('build-form').addEventListener('submit', (event) => {
      event.preventDefault();
      this.buildStructure(document.getElementById('build-type').value, document.getElementById('build-node').value);
    });
    document.getElementById('move-form').addEventListener('submit', (event) => {
      event.preventDefault();
      this.moveUnit(document.getElementById('move-from').value, document.getElementById('move-to').value);
    });
    document.getElementById('move-from').addEventListener('change', () => this.populateMoveDestinations());
    document.getElementById('campaign-form').addEventListener('submit', (event) => {
      event.preventDefault();
      this.runCampaign(document.getElementById('campaign-province').value, document.getElementById('campaign-type').value);
    });
  }

  populateStaticControls() {
    fillSelect(document.getElementById('build-type'), Object.values(STRUCTURES).map((structure) => ({
      value: structure.id,
      label: `${structure.icon} ${structure.name} (${formatCost(structure.cost)})`
    })));
    const nodeOptions = this.nodes.map((node) => ({ value: node.id, label: node.name }));
    fillSelect(document.getElementById('build-node'), nodeOptions);
    fillSelect(document.getElementById('move-from'), nodeOptions);
    fillSelect(document.getElementById('campaign-province'), this.provinces.map((province) => ({ value: province.id, label: province.name })));
    this.populateMoveDestinations();
  }

  populateMoveDestinations() {
    const from = this.getNode(document.getElementById('move-from').value);
    this.validMoveNodeIds = from ? [...from.adjacent] : [];
    fillSelect(document.getElementById('move-to'), this.validMoveNodeIds.map((nodeId) => {
      const node = this.getNode(nodeId);
      return { value: node.id, label: node.name };
    }));
    this.render();
  }

  get activePlayer() { return this.players[this.activePlayerId]; }
  get rivalPlayer() { return this.players[this.activePlayerId === 'federal' ? 'unitario' : 'federal']; }
  getProvince(id) { return this.provinces.find((province) => province.id === id); }
  getNode(id) { return this.nodes.find((node) => node.id === id); }

  selectNode(nodeId) {
    this.selectedNodeId = nodeId;
    const moveFrom = document.getElementById('move-from');
    moveFrom.value = nodeId;
    this.populateMoveDestinations();
  }

  playCard(instanceId, mode) {
    const player = this.activePlayer;
    const cardIndex = player.hand.findIndex((card) => card.instanceId === instanceId);
    if (cardIndex === -1) return;
    const [card] = player.hand.splice(cardIndex, 1);
    player.discard.push(card);

    if (mode === 'resources') {
      addResources(player.resources, card.resources);
      this.log(`${player.name} juega ${card.name} como Recursos. Gana ${formatCost(card.resources)}.`);
    }
    if (mode === 'pm') {
      player.pm += card.pm;
      this.log(`${player.name} juega ${card.name} como PM. Gana ${card.pm} PM.`);
    }
    if (mode === 'event') this.resolveEvent(player, card);
    this.render();
  }

  resolveEvent(player, card) {
    const province = this.getMostNeutralProvince();
    if (card.event === 'politica') shiftTrack(province, 'politico', player.id);
    if (card.event === 'militar') shiftTrack(province, 'militar', player.id);
    if (card.event === 'religion') shiftTrack(province, 'religioso', player.id);
    if (card.event === 'economia') addResources(player.resources, { prestigio: 1, influencia: 1, fe: 1 });
    if (card.event === 'cartas') this.drawCards(player, 2);
    this.highlightedProvinceId = province.id;
    this.log(`${player.name} juega ${card.name} como Evento (${card.event}). Objetivo automático: ${province.name}.`);
  }

  buildStructure(structureId, nodeId) {
    const player = this.activePlayer;
    const structure = STRUCTURES[structureId];
    const node = this.getNode(nodeId);
    if (!this.spendPm(player, 1)) return;
    if (!canPay(player.resources, structure.cost)) {
      player.pm += 1;
      this.log(`No hay recursos suficientes para construir ${structure.name}.`);
      this.render();
      return;
    }
    payResources(player.resources, structure.cost);
    node.structures.push({ owner: player.id, type: structure.id });
    this.selectedNodeId = node.id;
    this.log(`${player.name} construye ${structure.name} en ${node.name}. Costo: ${formatCost(structure.cost)} y 1 PM.`);
    this.render();
  }

  moveUnit(fromId, toId) {
    const player = this.activePlayer;
    const from = this.getNode(fromId);
    const to = this.getNode(toId);
    if (!from.adjacent.includes(to.id)) return this.logAndRender(`${to.name} no está conectado con ${from.name}.`);
    if (from.units[player.id] < 1) return this.logAndRender(`${player.name} no tiene unidades en ${from.name}.`);
    const cost = this.hasActiveTokenForPlayer(from, player.id, 'paso') ? 0 : 1;
    if (!this.spendPm(player, cost)) return;
    from.units[player.id] -= 1;
    to.units[player.id] += 1;
    this.selectedNodeId = to.id;
    if (to.token && !to.token.revealed) {
      to.token.revealed = true;
      this.log(`Token revelado en ${to.name}: ${to.token.icon} ${to.token.name}.`);
    }
    this.log(`${player.name} mueve 1 unidad de ${from.name} a ${to.name}. Costo: ${cost} PM.`);
    this.populateMoveDestinations();
    this.render();
  }

  runCampaign(provinceId, track) {
    const attacker = this.activePlayer;
    const defender = this.rivalPlayer;
    const province = this.getProvince(provinceId);
    if (!this.spendPm(attacker, 1)) return;

    const result = resolveCampaign({ province, track, attackerId: attacker.id, defenderId: defender.id, nodes: this.nodes });
    this.lastCampaignResult = result;
    this.highlightedProvinceId = province.id;
    this.applySecondaryEffect(result.secondaryEffect);
    this.updateStats(result);
    this.logCampaign(result);
    this.render();
  }

  applySecondaryEffect(effect) {
    if (!effect) return;
    if (effect.type === 'draw-card') this.drawCards(this.players[effect.playerId], 1);
    if (effect.type === 'gain-faith') this.players[effect.playerId].resources.fe += 1;
    if (effect.type === 'expel-unit') {
      const node = this.getNode(effect.nodeId);
      node.units[effect.playerId] = Math.max(0, node.units[effect.playerId] - 1);
    }
  }

  updateStats(result) {
    this.stats.campaigns += 1;
    this.stats.totalDifference += result.difference;
    this.stats.explodingTens += result.attacker.explosions.length + result.defender.explosions.length;
    if (result.margin.decisive) this.stats.decisiveWins += 1;
    if (result.winnerId === 'federal') this.stats.federalWins += 1;
    if (result.winnerId === 'unitario') this.stats.unitarioWins += 1;
  }

  logCampaign(result) {
    const attacker = PLAYERS[result.attackerId].name;
    const defender = PLAYERS[result.defenderId].name;
    this.log(`Campaña ${result.trackName} en ${result.provinceName}. Track actual: ${result.trackChange.before}.`);
    this.log(`${attacker}: dados ${result.attacker.rolled.map(formatDie).join(' ')}; guardados ${result.attacker.kept.map(formatDie).join(' ')}; total ${result.attacker.total}.`);
    this.log(`${defender}: dados ${result.defender.rolled.map(formatDie).join(' ')}; guardados ${result.defender.kept.map(formatDie).join(' ')}; total ${result.defender.total}.`);
    this.log(`${result.winnerId ? `${PLAYERS[result.winnerId].name} gana` : 'Empate'}. Diferencia ${result.difference}. ${result.margin.label}. Track ${result.trackName}: ${result.trackChange.before} → ${result.trackChange.after}.`);
    if (result.secondaryEffect) this.log(result.secondaryEffect.text);
  }

  runMaintenance() {
    Object.values(this.players).forEach((player) => {
      let activeCount = 0;
      this.nodes.forEach((node) => {
        if (!node.token?.revealed || !this.hasPresence(player.id, node)) return;
        activeCount += 1;
        this.applyTokenMaintenance(player, node.token);
      });
      this.log(`Mantenimiento ${player.name}: ${activeCount} tokens activos procesados.`);
    });
  }

  applyTokenMaintenance(player, token) {
    if (token.id === 'aduana') addResources(player.resources, { prestigio: 1 });
    if (token.id === 'estancia') addResources(player.resources, { prestigio: 1 });
    if (token.id === 'puerto') {
      this.drawCards(player, 1);
      const discarded = player.hand.pop();
      if (discarded) player.discard.push(discarded);
    }
    if (token.id === 'correo') this.drawCards(player, 1);
  }

  endRound() {
    this.runMaintenance();
    const player = this.activePlayer;
    const extraDraws = this.nodes.filter((node) => this.hasActiveTokenForPlayer(node, player.id, 'correo')).length;
    this.drawToHand(player, 7 + extraDraws);
    this.log(`${player.name} roba hasta ${7 + extraDraws} cartas.`);
    this.activePlayerId = this.activePlayerId === 'federal' ? 'unitario' : 'federal';
    if (this.activePlayerId === 'federal') this.turn += 1;
    this.log(`Turno ${this.turn}. Jugador activo: ${this.activePlayer.name}.`);
    this.render();
  }

  drawToHand(player, targetSize) {
    while (player.hand.length < targetSize) {
      if (!this.drawCards(player, 1)) break;
    }
  }

  drawCards(player, amount) {
    let drawn = 0;
    for (let index = 0; index < amount; index += 1) {
      if (player.deck.length === 0) player.deck = shuffle(player.discard.splice(0));
      const card = player.deck.pop();
      if (!card) break;
      player.hand.push(card);
      drawn += 1;
    }
    return drawn;
  }

  spendPm(player, amount) {
    if (player.pm < amount) {
      this.logAndRender(`${player.name} no tiene PM suficientes. Necesita ${amount}, tiene ${player.pm}.`);
      return false;
    }
    player.pm -= amount;
    return true;
  }

  hasPresence(playerId, node) { return node.units[playerId] > 0 || node.structures.some((structure) => structure.owner === playerId); }
  hasActiveTokenForPlayer(node, playerId, tokenId) { return node.token?.revealed && node.token.id === tokenId && this.hasPresence(playerId, node); }
  getMostNeutralProvince() { return [...this.provinces].sort((a, b) => controlScore(a) - controlScore(b))[0]; }

  logAndRender(message) {
    this.log(message);
    this.render();
  }

  log(message) { this.logEntries.unshift(message); }

  render() {
    renderPanels(this);
    renderHand(this);
    renderBoard(this);
    renderLog(this);
  }
}

function controlScore(province) {
  return Object.values(province.tracks).reduce((sum, value) => sum + Math.abs(value), 0);
}

function fillSelect(select, options) {
  select.innerHTML = options.map((option) => `<option value="${option.value}">${option.label}</option>`).join('');
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function addResources(resources, amount) {
  Object.entries(amount).forEach(([key, value]) => { resources[key] += value; });
}

function canPay(resources, cost) {
  return Object.entries(cost).every(([key, value]) => resources[key] >= value);
}

function payResources(resources, cost) {
  Object.entries(cost).forEach(([key, value]) => { resources[key] -= value; });
}

function formatCost(cost) {
  const entries = Object.entries(cost);
  if (!entries.length) return 'Sin recursos';
  return entries.map(([key, value]) => `${value} ${RESOURCE_NAMES[key]}`).join(', ');
}

window.addEventListener('DOMContentLoaded', () => new Game());
