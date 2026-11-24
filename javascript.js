// Questions de démonstration : vous pouvez remplacer ou compléter cette liste.
const questions = [
  { category: 'GÉOGRAPHIE', text: 'Quelle est la capitale du Canada ?', answer: 'Ottawa' },
  { category: 'SCIENCES', text: 'Combien de pattes possède une araignée ?', answer: 'Huit' },
  { category: 'HISTOIRE', text: 'En quelle année a eu lieu la prise de la Bastille ?', answer: '1789' },
  { category: 'LITTÉRATURE', text: 'Qui a écrit « Le Petit Prince » ?', answer: 'Antoine de Saint-Exupéry' },
  { category: 'NATURE', text: 'Quel est le plus grand mammifère du monde ?', answer: 'La baleine bleue' },
  { category: 'CULTURE GÉNÉRALE', text: 'Combien de côtés possède un hexagone ?', answer: 'Six' },
  { category: 'MUSIQUE', text: 'Combien de notes compte une gamme classique ?', answer: 'Sept' },
  { category: 'GÉOGRAPHIE', text: 'Quel est le plus vaste océan de la planète ?', answer: 'L’océan Pacifique' },
  { category: 'SCIENCES', text: 'Quelle planète est surnommée la planète rouge ?', answer: 'Mars' },
  { category: 'ART', text: 'Qui a peint La Joconde ?', answer: 'Léonard de Vinci' }
];

const initialPlayers = [
  { name: 'Candidat 1', score: 0 },
  { name: 'Candidat 2', score: 0 }
];
const ROUND_SECONDS = 30;
let players = [...initialPlayers];
let questionOrder = [];
let questionIndex = 0;
let activePlayer = null;
let secondsLeft = ROUND_SECONDS;
let timerInterval = null;
let timerRunning = false;
let answerVisible = false;

const el = (id) => document.getElementById(id);

function shuffleQuestions() {
  questionOrder = questions.map((_, index) => index);
  // Mélange Fisher–Yates : chaque question apparaît une fois avant le nouveau tour.
  for (let i = questionOrder.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [questionOrder[i], questionOrder[j]] = [questionOrder[j], questionOrder[i]];
  }
}

function currentQuestion() {
  return questions[questionOrder[questionIndex]];
}

function renderQuestion() {
  const question = currentQuestion();
  el('question-category').textContent = question.category;
  el('question-text').textContent = question.text;
  el('question-count').textContent = `QUESTION ${questionIndex + 1} / ${questions.length}`;
  el('round-number').textContent = String(Math.floor(questionIndex / questions.length) + 1);
  el('answer-note').textContent = 'Le candidat qui buzze répond. L’arbitre valide ou passe la main.';
  el('answer-note').classList.remove('is-answer');
  el('show-answer').textContent = 'Voir la réponse';
  answerVisible = false;
}

function renderPlayers() {
  const list = el('players-list');
  list.replaceChildren();
  players.forEach((player, index) => {
    const row = document.createElement('div');
    row.className = `player-row${activePlayer === index ? ' is-active' : ''}`;
    const avatar = document.createElement('span');
    avatar.className = 'player-avatar';
    avatar.textContent = player.name.trim().charAt(0).toLocaleUpperCase('fr') || '?';
    const name = document.createElement('span');
    name.className = 'player-name';
    name.textContent = player.name;
    const score = document.createElement('strong');
    score.className = 'player-score';
    score.textContent = String(player.score);
    const points = document.createElement('span');
    points.className = 'player-points';
    points.textContent = 'pts';
    row.append(avatar, name, score, points);
    list.append(row);
  });
}

function renderTimer() {
  el('timer').innerHTML = `${secondsLeft}<span>s</span>`;
  el('timer-bar').style.width = `${(secondsLeft / ROUND_SECONDS) * 100}%`;
  el('timer-bar').style.background = secondsLeft <= 8
    ? 'linear-gradient(90deg,#ffad71,#ff7584)'
    : 'linear-gradient(90deg,#68d6b7,#8daeff)';
}

function setJudgeEnabled(enabled) {
  el('correct-answer').disabled = !enabled;
  el('wrong-answer').disabled = !enabled;
}

function buzz(playerIndex = 0) {
  if (activePlayer !== null || players.length === 0) return;
  activePlayer = playerIndex % players.length;
  el('buzzer').disabled = true;
  el('buzzer-status').textContent = `${players[activePlayer].name} a buzzé !`;
  el('judge-status').textContent = 'Réponse en cours';
  el('judge-help').textContent = 'Écoutez la réponse, puis validez ou passez la main.';
  el('buzzer-signal').classList.add('is-on');
  setJudgeEnabled(true);
  renderPlayers();
}

function releaseBuzzer(message = 'Le buzzer est à nouveau ouvert.') {
  activePlayer = null;
  el('buzzer').disabled = false;
  el('buzzer-status').textContent = message;
  el('judge-status').textContent = 'En attente d’un buzzer';
  el('judge-help').textContent = 'Quand un joueur buzze, choisissez le résultat de sa réponse.';
  el('buzzer-signal').classList.remove('is-on');
  setJudgeEnabled(false);
  renderPlayers();
}

function pauseTimer() {
  window.clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
}

function startTimer() {
  if (timerRunning) return;
  if (secondsLeft === 0) secondsLeft = ROUND_SECONDS;
  timerRunning = true;
  el('timer-status').textContent = 'La manche est lancée';
  el('start-timer').textContent = 'En cours…';
  timerInterval = window.setInterval(() => {
    secondsLeft -= 1;
    renderTimer();
    if (secondsLeft <= 0) {
      pauseTimer();
      el('timer-status').textContent = 'Temps écoulé';
      el('start-timer').textContent = 'Relancer';
      releaseBuzzer('Temps écoulé. Vous pouvez relancer le buzzer.');
    }
  }, 1000);
}

function resetTimer() {
  pauseTimer();
  secondsLeft = ROUND_SECONDS;
  renderTimer();
  el('timer-status').textContent = 'Prêt quand vous l’êtes';
  el('start-timer').textContent = 'Démarrer';
}

function moveToNextQuestion() {
  pauseTimer();
  resetTimer();
  questionIndex += 1;
  if (questionIndex >= questionOrder.length) {
    shuffleQuestions();
    questionIndex = 0;
  }
  releaseBuzzer();
  renderQuestion();
}

function markCorrect() {
  if (activePlayer === null) return;
  players[activePlayer].score += 1;
  renderPlayers();
  el('judge-status').textContent = 'Bonne réponse !';
  window.setTimeout(moveToNextQuestion, 750);
}

function markWrong() {
  if (activePlayer === null) return;
  const nextPlayer = (activePlayer + 1) % players.length;
  activePlayer = null;
  el('buzzer').disabled = false;
  el('buzzer-status').textContent = `${players[nextPlayer].name} peut tenter sa chance.`;
  el('judge-status').textContent = 'À l’autre candidat';
  el('judge-help').textContent = 'Le candidat suivant peut maintenant buzzer.';
  el('buzzer-signal').classList.remove('is-on');
  setJudgeEnabled(false);
  renderPlayers();
}

function addPlayer(name) {
  const cleanName = name.trim();
  if (!cleanName) return;
  players.push({ name: cleanName, score: 0 });
  renderPlayers();
}

el('start-timer').addEventListener('click', startTimer);
el('reset-timer').addEventListener('click', resetTimer);
el('buzzer').addEventListener('click', () => buzz());
el('correct-answer').addEventListener('click', markCorrect);
el('wrong-answer').addEventListener('click', markWrong);
el('skip-question').addEventListener('click', moveToNextQuestion);
el('show-answer').addEventListener('click', () => {
  const note = el('answer-note');
  answerVisible = !answerVisible;
  note.textContent = answerVisible ? `Réponse : ${currentQuestion().answer}` : 'Le candidat qui buzze répond. L’arbitre valide ou passe la main.';
  note.classList.toggle('is-answer', answerVisible);
  el('show-answer').textContent = answerVisible ? 'Masquer la réponse' : 'Voir la réponse';
});
el('add-player').addEventListener('click', () => {
  el('player-name').value = '';
  el('player-dialog').showModal();
  el('player-name').focus();
});
el('player-form').addEventListener('submit', (event) => {
  event.preventDefault();
  addPlayer(el('player-name').value);
  el('player-dialog').close();
});
el('new-game').addEventListener('click', () => {
  pauseTimer();
  players = players.map((player) => ({ ...player, score: 0 }));
  questionIndex = 0;
  shuffleQuestions();
  resetTimer();
  releaseBuzzer('Le premier à buzzer prend la main.');
  renderQuestion();
  renderPlayers();
});
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && !el('player-dialog').open) {
    event.preventDefault();
    buzz();
  }
});

shuffleQuestions();
renderQuestion();
renderPlayers();
renderTimer();
