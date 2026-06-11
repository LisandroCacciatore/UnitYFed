function renderLog(game) {
  const log = document.getElementById('log');
  log.innerHTML = game.logEntries.slice(0, 30).map((entry) => `<p>${entry}</p>`).join('');
  log.scrollTop = 0;
}
