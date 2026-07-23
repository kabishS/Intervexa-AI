const API_URL = "https://aptitude-gold.vercel.app/Random";
  const TOTAL_ROUNDS = 20;

  let state = {
    index: 0,            // current position, 0-based
    score: 0,
    answered: 0,
    streak: 0,
    bestStreak: 0,
    locked: false,
    ended: false,
    questions: []         // { data, selected, isCorrect } per fetched question
  };

  const trackEl = document.getElementById('track');
  const qNumEl = document.getElementById('qNum');
  const qTotalEl = document.getElementById('qTotal');
  const trackPctEl = document.getElementById('trackPct');
  const questionEl = document.getElementById('questionText');
  const optionsEl = document.getElementById('optionsBox');
  const feedbackEl = document.getElementById('feedback');
  const nextBtn = document.getElementById('nextBtn');
  const backBtn = document.getElementById('backBtn');
  const stopBtn = document.getElementById('stopBtn');
  const restartBtn = document.getElementById('restartBtn');
  const scoreVal = document.getElementById('scoreVal');
  const streakVal = document.getElementById('streakVal');
  const errorBox = document.getElementById('errorBox');
  const scanLine = document.getElementById('scanLine');
  const quizView = document.getElementById('quizView');
  const summaryView = document.getElementById('summaryView');
  const footerRow = document.getElementById('footerRow');
  const eyebrow = document.getElementById('eyebrow');

  qTotalEl.textContent = TOTAL_ROUNDS;

  function buildTrack(){
    trackEl.innerHTML = '';
    for(let i=0;i<TOTAL_ROUNDS;i++){
      const seg = document.createElement('div');
      seg.className = 'seg';
      seg.id = 'seg-'+i;
      trackEl.appendChild(seg);
    }
    updateTrack();
  }

  function updateTrack(){
    for(let i=0;i<TOTAL_ROUNDS;i++){
      const seg = document.getElementById('seg-'+i);
      seg.className = 'seg';
      const q = state.questions[i];
      if(q && q.isCorrect === true) seg.classList.add('correct');
      else if(q && q.isCorrect === false) seg.classList.add('wrong');
      else if(i === state.index) seg.classList.add('active');
    }
    const pct = Math.round((state.answered / TOTAL_ROUNDS) * 100);
    trackPctEl.textContent = pct + '%';
    qNumEl.textContent = state.index + 1;
  }

  function updateScore(){
    scoreVal.textContent = state.score + '/' + state.answered;
    streakVal.textContent = state.streak;
  }

  function escapeHtml(str){
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  async function fetchNewQuestion(){
    const res = await fetch(API_URL, { cache: 'no-store' });
    if(!res.ok) throw new Error('Bad response');
    return await res.json();
  }

  async function showIndex(i){
    state.index = i;
    state.locked = false;
    errorBox.classList.remove('show');
    feedbackEl.classList.remove('show');
    feedbackEl.innerHTML = '';
    nextBtn.classList.remove('show');
    updateTrack();
    backBtn.disabled = i === 0;

    let entry = state.questions[i];

    if(!entry){
      questionEl.textContent = 'Loading question…';
      optionsEl.innerHTML = '';
      try{
        const data = await fetchNewQuestion();
        entry = { data, selected: null, isCorrect: null };
        state.questions[i] = entry;
      }catch(err){
        questionEl.textContent = 'Question unavailable.';
        errorBox.classList.add('show');
        return;
      }
    }

    renderQuestion(entry);
    scanLine.style.animation = 'none';
    void scanLine.offsetWidth;
    scanLine.style.animation = 'scan 1.1s ease-out';
  }

  function renderQuestion(entry){
    const data = entry.data;
    questionEl.textContent = data.question;
    optionsEl.innerHTML = '';
    const letters = ['A','B','C','D','E','F'];

    data.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'opt';
      btn.innerHTML = '<span class="letter">' + letters[idx] + '</span><span>' + escapeHtml(opt) + '</span>';
      btn.addEventListener('click', () => selectAnswer(opt, btn));
      optionsEl.appendChild(btn);
    });

    // already answered previously (navigated back to it) -> show locked state
    if(entry.selected !== null){
      state.locked = true;
      const allBtns = optionsEl.querySelectorAll('.opt');
      allBtns.forEach(b => {
        b.disabled = true;
        const label = b.querySelector('span:last-child').textContent;
        if(label === data.answer) b.classList.add('correct');
        else if(label === entry.selected && !entry.isCorrect) b.classList.add('wrong');
      });
      feedbackEl.innerHTML = '<strong>' + (entry.isCorrect ? 'Correct.' : 'Not quite — correct answer: ' + escapeHtml(data.answer) + '.') +
        '</strong><br>' + escapeHtml(data.explanation || '');
      feedbackEl.classList.add('show');
      if(state.index < TOTAL_ROUNDS - 1) nextBtn.classList.add('show');
    }
  }

  function selectAnswer(selected, btnEl){
    if(state.locked) return;
    state.locked = true;

    const entry = state.questions[state.index];
    const correctAnswer = entry.data.answer;
    const isCorrect = selected === correctAnswer;

    const allBtns = optionsEl.querySelectorAll('.opt');
    allBtns.forEach(b => {
      b.disabled = true;
      const label = b.querySelector('span:last-child').textContent;
      if(label === correctAnswer) b.classList.add('correct');
      else if(b === btnEl && !isCorrect) b.classList.add('wrong');
    });

    entry.selected = selected;
    entry.isCorrect = isCorrect;

    state.answered++;
    if(isCorrect){
      state.score++;
      state.streak++;
      if(state.streak > state.bestStreak) state.bestStreak = state.streak;
    } else {
      state.streak = 0;
    }

    feedbackEl.innerHTML = '<strong>' + (isCorrect ? 'Correct.' : 'Not quite — correct answer: ' + escapeHtml(correctAnswer) + '.') +
      '</strong><br>' + escapeHtml(entry.data.explanation || '');
    feedbackEl.classList.add('show');

    if(state.index < TOTAL_ROUNDS - 1){
      nextBtn.classList.add('show');
    } else {
      // last question answered -> auto show summary shortly after
      setTimeout(showSummary, 900);
    }

    updateScore();
    updateTrack();
  }

  function goNext(){
    if(state.index < TOTAL_ROUNDS - 1){
      showIndex(state.index + 1);
    }
  }

  function goBack(){
    if(state.index > 0){
      showIndex(state.index - 1);
    }
  }

  function showSummary(){
    state.ended = true;
    quizView.style.display = 'none';
    summaryView.classList.add('show');
    footerRow.style.display = 'none';
    eyebrow.style.display = 'none';

    document.getElementById('summaryScore').textContent = state.score + '/' + state.answered;
    document.getElementById('summaryMsg').textContent =
      state.answered >= TOTAL_ROUNDS ? 'Session complete' : 'Session stopped early';
    document.getElementById('sumCorrect').textContent = state.score;
    document.getElementById('sumWrong').textContent = state.answered - state.score;
    document.getElementById('sumBest').textContent = state.bestStreak;
  }

  function restartSession(){
    state = {
      index: 0, score: 0, answered: 0, streak: 0, bestStreak: 0,
      locked: false, ended: false, questions: []
    };
    quizView.style.display = 'block';
    summaryView.classList.remove('show');
    footerRow.style.display = 'flex';
    eyebrow.style.display = 'flex';
    updateScore();
    buildTrack();
    showIndex(0);
  }

  nextBtn.addEventListener('click', goNext);
  backBtn.addEventListener('click', goBack);
  stopBtn.addEventListener('click', () => { if(state.answered > 0 || state.questions.length) showSummary(); });
  restartBtn.addEventListener('click', restartSession);
  document.getElementById('retryLink').addEventListener('click', () => showIndex(state.index));

  document.addEventListener('keydown', (e) => {
    if(state.locked || state.ended) return;
    const idx = parseInt(e.key, 10) - 1;
    const btns = optionsEl.querySelectorAll('.opt');
    if(idx >= 0 && idx < btns.length){
      btns[idx].click();
    }
  });

  buildTrack();
  showIndex(0);