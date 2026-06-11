function renderHand(game) {
  const player = game.activePlayer;
  const hand = document.getElementById('hand');
  hand.innerHTML = player.hand.map((card) => `
    <article class="card">
      <h3>${card.name}</h3>
      <div class="card-body">
        <p><strong>Recursos:</strong> ${formatCost(card.resources)}</p>
        <p><strong>PM:</strong> +${card.pm}</p>
        <p><strong>Evento:</strong> ${card.event}</p>
      </div>
      <div class="card-actions">
        <button data-card="${card.instanceId}" data-mode="resources">Recursos</button>
        <button data-card="${card.instanceId}" data-mode="pm">PM</button>
        <button data-card="${card.instanceId}" data-mode="event">Evento</button>
      </div>
    </article>
  `).join('');

  hand.querySelectorAll('[data-card]').forEach((button) => {
    button.addEventListener('click', () => game.playCard(button.dataset.card, button.dataset.mode));
  });
}
