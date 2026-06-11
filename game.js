class Game {
  constructor() {
    const baseMap = createBaseMap();
    this.provinces = baseMap.provinces;
    this.nodes = baseMap.nodes;
    this.players = this.createPlayers();
    this.activePlayerId = 'federal';
    this.turn = 1;
    this.logEntries = [];

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
      {
        ...player,
        resources: { prestigio: 4, influencia: 3, fe: 2 },
        pm: 0,
        deck: this.createDeck(),
        hand: [],
        discard: []
      }
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
    const shuffledNodes = shuffle([...this.nodes]);
    TOKENS.forEach((token, index) => {
      shuffledNodes[index].token = { ...token, revealed: false };
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

    document.getElementById('end-round-btn').addEventListener('click', () => {
      this.endRound();
    });

    document.getElementById('build-form').addEventListener('submit', (event) => {
      event.preventDefault();
      this.buildStructure(
        document.getElementById('build-type').value,
        document.getElementById('build-node').value
      );
    });

    document.getElementById('move-form').addEventListener('submit', (event) => {
      event.preventDefault();
      this.moveUnit(
        document.getElementById('move-from').value,
        document.getElementById('move-to').value
      );
    });

    document.getElementById('move-from').addEventListener('change', () => this.populateMoveDestinations());

    document.getElementById('campaign-form').addEventListener('submit', (event) => {
      event.preventDefault();
      this.runCampaign(
        document.getElementById('campaign-province').value,
        document.getElementById('campaign-type').value
      );
    });
  }

  populateStaticControls() {
    fillSelect(
      document.getElementById('build-type'),
      Object.values(STRUCTURES).map((structure) => ({
        value: structure.id,
        label: `${structure.name} (${formatCost(structure.cost)})`
      }))
    );

    const nodeOptions = this.nodes.map((node) => ({ value: node.id, label: node.name }));
    fillSelect(document.getElementById('build-node'), nodeOptions);
    fillSelect(document.getElementById('move-from'), nodeOptions);
    fillSelect(document.getElementById('campaign-province'), this.provinces.map((province) => ({
      value: province.id,
      label: province.name
    })));
    this.populateMoveDestinations();
  }

  populateMoveDestinations() {
    const from = this.getNode(document.getElementById('move-from').value);
    const options = from.adjacent.map((nodeId) => {
      const node = this.getNode(nodeId);
      return { value: node.id, label: node.name };
    });
    fillSelect(document.getElementById('move-to'), options);
  }

  get activePlayer() {
    return this.players[this.activePlayerId];
  }

  get rivalPlayer() {
    return this.players[this.activePlayerId === 'federal' ? 'unitario' : 'federal'];
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

    if (mode === 'event') {
      this.resolveEvent(player, card);
    }

    this.render();
  }

  resolveEvent(player, card) {
    const province = this.getMostContestedProvince();
    if (card.event === 'politica') this.shiftTrack(province, 'politico', player.id);
    if (card.event === 'militar') this.shiftTrack(province, 'militar', player.id);
    if (card.event === 'religion') this.shiftTrack(province, 'religioso', player.id);
    if (card.event === 'economia') addResources(player.resources, { prestigio: 1, influencia: 1, fe: 1 });
    if (card.event === 'cartas') this.drawCards(player, 2);

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
    this.log(`${player.name} construye ${structure.name} en ${node.name}. Costo: ${formatCost(structure.cost)} y 1 PM.`);
    this.render();
  }

  moveUnit(fromId, toId) {
    const player = this.activePlayer;
    const from = this.getNode(fromId);
    const to = this.getNode(toId);

    if (!from.adjacent.includes(to.id)) {
      this.log(`${to.name} no está conectado con ${from.name}.`);
      return;
    }

    if (from.units[player.id] < 1) {
      this.log(`${player.name} no tiene unidades en ${from.name}.`);
      return;
    }

    const cost = this.hasActiveTokenForPlayer(from, player.id, 'paso') ? 0 : 1;
    if (!this.spendPm(player, cost)) return;

    from.units[player.id] -= 1;
    to.units[player.id] += 1;
    if (to.token && !to.token.revealed) {
      to.token.revealed = true;
      this.log(`Token revelado en ${to.name}: ${to.token.name}.`);
    }
    this.log(`${player.name} mueve 1 unidad de ${from.name} a ${to.name}. Costo: ${cost} PM.`);
    this.render();
  }

  runCampaign(provinceId, track) {
    const player = this.activePlayer;
    const rival = this.rivalPlayer;
    const province = this.getProvince(provinceId);

    if (!this.spendPm(player, 1)) return;

    const playerStrength = this.calculateStrength(province, track, player.id);
    const rivalStrength = this.calculateStrength(province, track, rival.id);
    const before = province.tracks[track];

    if (playerStrength > rivalStrength) {
      this.shiftTrack(province, track, player.id);
      this.log(`Campaña ${TRACK_NAMES[track]} en ${province.name}. ${player.name}: ${playerStrength} fuerza. ${rival.name}: ${rivalStrength} fuerza. Track: ${before} → ${province.tracks[track]}.`);
    } else {
      this.log(`Campaña ${TRACK_NAMES[track]} en ${province.name}. ${player.name}: ${playerStrength} fuerza. ${rival.name}: ${rivalStrength} fuerza. Sin cambio.`);
    }

    this.render();
  }

  calculateStrength(province, track, playerId) {
    const trackValue = province.tracks[track];
    const favorableTrack = playerId === 'federal' ? Math.max(0, -trackValue) : Math.max(0, trackValue);
    const provinceNodes = province.nodes.map((nodeId) => this.getNode(nodeId));
    const units = provinceNodes.reduce((sum, node) => sum + node.units[playerId], 0);
    const structures = provinceNodes.reduce((sum, node) => sum + node.structures.filter((structure) => {
      const definition = STRUCTURES[structure.type];
      return structure.owner === playerId && definition.strengthTrack === track;
    }).length, 0);
    const tokens = provinceNodes.reduce((sum, node) => {
      if (!this.hasPresence(playerId, node) || !node.token?.revealed) return sum;
      if (track === 'politico' && node.token.id === 'cabildo') return sum + 1;
      if (track === 'religioso' && ['iglesia', 'capilla'].includes(node.token.id)) return sum + 1;
      return sum;
    }, 0);

    return favorableTrack + units + structures + tokens;
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
      if (player.deck.length === 0) {
        player.deck = shuffle(player.discard.splice(0));
      }
      const card = player.deck.pop();
      if (!card) break;
      player.hand.push(card);
      drawn += 1;
    }
    return drawn;
  }

  spendPm(player, amount) {
    if (player.pm < amount) {
      this.log(`${player.name} no tiene PM suficientes. Necesita ${amount}, tiene ${player.pm}.`);
      this.render();
      return false;
    }
    player.pm -= amount;
    return true;
  }

  shiftTrack(province, track, playerId) {
    const direction = PLAYERS[playerId].trackDirection;
    province.tracks[track] = clamp(province.tracks[track] + direction, -3, 3);
  }

  hasPresence(playerId, node) {
    return node.units[playerId] > 0 || node.structures.some((structure) => structure.owner === playerId);
  }

  hasActiveTokenForPlayer(node, playerId, tokenId) {
    return node.token?.revealed && node.token.id === tokenId && this.hasPresence(playerId, node);
  }

  getMostContestedProvince() {
    return [...this.provinces].sort((a, b) => this.controlScore(a) - this.controlScore(b))[0];
  }

  controlScore(province) {
    return Object.values(province.tracks).reduce((sum, value) => sum + Math.abs(value), 0);
  }

  getProvince(id) {
    return this.provinces.find((province) => province.id === id);
  }

  getNode(id) {
    return this.nodes.find((node) => node.id === id);
  }

  getProvinceControl(province) {
    const federalTracks = Object.values(province.tracks).filter((value) => value < 0).length;
    const unitarioTracks = Object.values(province.tracks).filter((value) => value > 0).length;
    if (federalTracks >= 2) return 'Federal';
    if (unitarioTracks >= 2) return 'Unitario';
    return 'Neutral';
  }

  log(message) {
    this.logEntries.unshift(message);
  }

  render() {
    document.getElementById('active-player').textContent = this.activePlayer.name;
    document.getElementById('turn-counter').textContent = `Turno ${this.turn}`;
    this.renderPlayers();
    this.renderHand();
    this.renderProvinces();
    this.renderNodes();
    this.renderLog();
  }

  renderPlayers() {
    document.getElementById('players-summary').innerHTML = Object.values(this.players).map((player) => `
      <article class="player-card ${player.cssClass}">
        <h3>${player.name}</h3>
        <p><strong>PM:</strong> ${player.pm}</p>
        <p>${Object.entries(player.resources).map(([key, value]) => `${RESOURCE_NAMES[key]}: ${value}`).join(' · ')}</p>
        <p>Mazo: ${player.deck.length} · Mano: ${player.hand.length} · Descarte: ${player.discard.length}</p>
      </article>
    `).join('');
  }

  renderHand() {
    const player = this.activePlayer;
    document.getElementById('hand').innerHTML = player.hand.map((card) => `
      <article class="card">
        <h3>${card.name}</h3>
        <p>Recursos: ${formatCost(card.resources)}</p>
        <p>PM: ${card.pm}</p>
        <p>Evento: ${card.event}</p>
        <div class="card-actions">
          <button data-card="${card.instanceId}" data-mode="resources">Recursos</button>
          <button data-card="${card.instanceId}" data-mode="pm">PM</button>
          <button data-card="${card.instanceId}" data-mode="event">Evento</button>
        </div>
      </article>
    `).join('');

    document.querySelectorAll('[data-card]').forEach((button) => {
      button.addEventListener('click', () => this.playCard(button.dataset.card, button.dataset.mode));
    });
  }

  renderProvinces() {
    document.getElementById('provinces').innerHTML = this.provinces.map((province) => `
      <article class="province">
        <h3>${province.name}</h3>
        <p><strong>Control:</strong> ${this.getProvinceControl(province)}</p>
        ${Object.entries(province.tracks).map(([track, value]) => `
          <div class="track">
            <span>${TRACK_NAMES[track]}</span>
            <strong>${value}</strong>
            <small>${describeTrack(value)}</small>
          </div>
        `).join('')}
      </article>
    `).join('');
  }

  renderNodes() {
    document.getElementById('nodes').innerHTML = this.nodes.map((node) => `
      <article class="node">
        <h3>${node.name}${node.isCapital ? ' (Capital)' : ''}</h3>
        <p>Unidades: Federal ${node.units.federal} · Unitario ${node.units.unitario}</p>
        <p>Estructuras: ${node.structures.length ? node.structures.map((structure) => `${PLAYERS[structure.owner].name} ${STRUCTURES[structure.type].name}`).join(', ') : 'Ninguna'}</p>
        <p>Token: ${renderToken(node)}</p>
        <p class="adjacent">Conecta: ${node.adjacent.map((id) => this.getNode(id).name).join(', ')}</p>
      </article>
    `).join('');
  }

  renderLog() {
    document.getElementById('log').innerHTML = this.logEntries.map((entry) => `<p>${entry}</p>`).join('');
  }
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
  Object.entries(amount).forEach(([key, value]) => {
    resources[key] += value;
  });
}

function canPay(resources, cost) {
  return Object.entries(cost).every(([key, value]) => resources[key] >= value);
}

function payResources(resources, cost) {
  Object.entries(cost).forEach(([key, value]) => {
    resources[key] -= value;
  });
}

function formatCost(cost) {
  const entries = Object.entries(cost);
  if (!entries.length) return 'Sin recursos';
  return entries.map(([key, value]) => `${value} ${RESOURCE_NAMES[key]}`).join(', ');
}

function describeTrack(value) {
  if (value < 0) return 'Federal';
  if (value > 0) return 'Unitario';
  return 'Neutral';
}

function renderToken(node) {
  if (!node.token) return 'Sin token';
  if (!node.token.revealed) return 'Oculto';
  const activeFor = Object.values(PLAYERS)
    .filter((player) => node.units[player.id] > 0 || node.structures.some((structure) => structure.owner === player.id))
    .map((player) => player.name);
  return `${node.token.name} (${activeFor.length ? `activo: ${activeFor.join(', ')}` : 'inactivo'})`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

window.addEventListener('DOMContentLoaded', () => new Game());
