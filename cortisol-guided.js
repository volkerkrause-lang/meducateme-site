(() => {
  const REV = '20260911-1';
  const stages = [...document.querySelectorAll('.stage')];
  const lessonAudio = document.querySelector('#lesson-audio');
  const feedbackAudio = document.querySelector('#feedback-audio');
  const startCard = document.querySelector('#start-card');
  const startGuided = document.querySelector('#start-guided');
  const startFree = document.querySelector('#start-free');
  const playBtn = document.querySelector('#play');
  const muteBtn = document.querySelector('#mute');
  const speed = document.querySelector('#speed');
  const ccBtn = document.querySelector('#cc');
  const freeBtn = document.querySelector('#free');
  const prevBtn = document.querySelector('#prev');
  const nextBtn = document.querySelector('#next');
  const caption = document.querySelector('#caption');
  const note = document.querySelector('#audio-note');
  const stepLabel = document.querySelector('#step-label');
  const stepTitle = document.querySelector('#step-title');
  const progressFill = document.querySelector('#progress-fill');

  let scripts = {};
  let feedbackScripts = {};
  let current = 0;
  let guided = true;
  let captionsOn = false;
  let muted = false;
  let fallbackUtterance = null;
  let fallbackTimer = null;
  let fallbackStarted = 0;
  let fallbackDuration = 0;
  let fallbackPausedAt = 0;
  let fallbackPauseStart = 0;
  let wantsPlayback = false;
  let stageComplete = false;

  lessonAudio.preservesPitch = true;
  feedbackAudio.preservesPitch = true;

  function item() { return stages[current]; }
  function id() { return item()?.dataset.stage || ''; }
  function stageScript() { return scripts[id()]?.script || ''; }

  function mediaUrl(filename) {
    const url = new URL(`audio/cortisol-chatterbox/${filename}`, document.baseURI);
    url.searchParams.set('v', REV);
    return url.href;
  }

  function setNote(text) { note.textContent = text; }
  function setPlayState(playing) {
    playBtn.innerHTML = playing ? '❚❚ <span class="label-hide">Pause</span>' : '▶ <span class="label-hide">Play</span>';
  }

  function setCaption(extra = '') {
    const base = stageScript();
    caption.textContent = extra ? `${base}\n\n${extra}` : base;
    caption.classList.toggle('open', captionsOn);
  }

  function clearFallback() {
    if (fallbackTimer) window.clearInterval(fallbackTimer);
    fallbackTimer = null;
    fallbackUtterance = null;
    fallbackStarted = 0;
    fallbackDuration = 0;
    fallbackPausedAt = 0;
    fallbackPauseStart = 0;
  }

  function stopAll() {
    wantsPlayback = false;
    lessonAudio.pause();
    feedbackAudio.pause();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    clearFallback();
    setPlayState(false);
  }

  function revealFraction(fraction) {
    if (!guided) return;
    const value = Math.max(0, Math.min(1, fraction || 0));
    item().querySelectorAll('.cue').forEach(el => {
      const at = Number(el.dataset.cue || 0);
      el.classList.toggle('is-on', at <= value + 0.001);
    });
    progressFill.style.width = `${((current + value) / stages.length) * 100}%`;
  }

  function revealAll() {
    item().querySelectorAll('.cue').forEach(el => el.classList.add('is-on'));
    revealFraction(1);
  }

  function resetReveals() {
    item().querySelectorAll('.cue').forEach(el => el.classList.remove('is-on'));
    item().querySelectorAll('.cue').forEach(el => {
      if (Number(el.dataset.cue || 0) <= 0.05 || !guided) el.classList.add('is-on');
    });
  }

  function showCheckpoint() {
    const q = item().querySelector('.checkpoint');
    if (q) q.classList.add('ready');
  }

  function resetCheckpoint() {
    item().querySelectorAll('.checkpoint').forEach(q => {
      q.classList.remove('ready');
      q.querySelectorAll('button').forEach(b => { b.disabled = false; b.classList.remove('good','bad'); });
      const f = q.querySelector('.feedback'); if (f) f.textContent = '';
    });
  }

  function completeStage() {
    stageComplete = true;
    revealAll();
    showCheckpoint();
    setPlayState(false);
    setNote(item().querySelector('.checkpoint') ? 'Make your prediction' : 'Step complete');
  }

  function loadStageAudio() {
    lessonAudio.pause();
    lessonAudio.src = mediaUrl(`${id()}.mp3`);
    lessonAudio.load();
    lessonAudio.playbackRate = Number(speed.value || 1);
  }

  function estimatedSeconds(text) {
    const words = (text.match(/\S+/g) || []).length;
    const rate = Number(speed.value || 1);
    return Math.max(8, (words / (148 * rate)) * 60);
  }

  function startFallback(text, onDone = completeStage, isFeedback = false) {
    if (!text || !('speechSynthesis' in window)) {
      onDone();
      return;
    }
    speechSynthesis.cancel();
    clearFallback();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB';
    u.rate = Number(speed.value || 1) * 0.96;
    const voices = speechSynthesis.getVoices();
    const voice = voices.find(v => /en-GB/i.test(v.lang) && /Daniel|Sonia|Google UK English/i.test(v.name)) || voices.find(v => /en-GB/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang));
    if (voice) u.voice = voice;
    fallbackUtterance = u;
    fallbackStarted = performance.now();
    fallbackDuration = estimatedSeconds(text) * 1000;
    if (!isFeedback) {
      fallbackTimer = window.setInterval(() => {
        if (!fallbackStarted || fallbackPauseStart) return;
        const elapsed = performance.now() - fallbackStarted - fallbackPausedAt;
        revealFraction(elapsed / fallbackDuration);
      }, 160);
    }
    u.onend = () => { clearFallback(); onDone(); };
    u.onerror = () => { clearFallback(); onDone(); };
    if (muted) {
      setNote('Muted — visual guide running');
      if (!isFeedback) {
        const silentStart = performance.now();
        fallbackTimer = window.setInterval(() => {
          const f = (performance.now() - silentStart) / fallbackDuration;
          revealFraction(f);
          if (f >= 1) { clearFallback(); onDone(); }
        }, 160);
      } else onDone();
      return;
    }
    setNote('Device voice fallback');
    speechSynthesis.speak(u);
    setPlayState(!isFeedback);
  }

  function playCurrent() {
    if (!guided) return;
    wantsPlayback = true;
    stageComplete = false;
    lessonAudio.playbackRate = Number(speed.value || 1);
    const attempt = lessonAudio.play();
    if (attempt && typeof attempt.then === 'function') {
      attempt.then(() => { setNote('Playing Chatterbox narration'); setPlayState(true); }).catch(() => startFallback(stageScript()));
    }
  }

  function pauseResume() {
    if (!guided) return;
    if (fallbackUtterance && 'speechSynthesis' in window) {
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
        if (fallbackPauseStart) fallbackPausedAt += performance.now() - fallbackPauseStart;
        fallbackPauseStart = 0;
        setPlayState(true);
        setNote('Playing device voice');
      } else if (speechSynthesis.speaking) {
        speechSynthesis.pause();
        fallbackPauseStart = performance.now();
        setPlayState(false);
        setNote('Paused');
      } else playCurrent();
      return;
    }
    if (lessonAudio.paused) playCurrent(); else lessonAudio.pause();
  }

  function showStage(index, autoplay = false) {
    stopAll();
    current = Math.max(0, Math.min(stages.length - 1, index));
    stages.forEach((s, n) => s.classList.toggle('active', n === current));
    item().scrollTop = 0;
    resetCheckpoint();
    resetReveals();
    stageComplete = false;
    stepLabel.textContent = `STEP ${current + 1} OF ${stages.length}`;
    stepTitle.textContent = item().dataset.title || '';
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === stages.length - 1;
    nextBtn.textContent = current === stages.length - 1 ? 'Complete' : 'Continue →';
    setCaption();
    progressFill.style.width = `${(current / stages.length) * 100}%`;
    if (guided) {
      loadStageAudio();
      setNote('Narration ready');
      if (autoplay) playCurrent();
    } else {
      revealAll();
      showCheckpoint();
      setNote('Free explore mode');
    }
  }

  function setMode(isGuided) {
    guided = isGuided;
    document.body.classList.toggle('guided', guided);
    document.body.classList.toggle('free', !guided);
    freeBtn.textContent = guided ? 'Explore' : 'Guided';
    playBtn.disabled = !guided;
    muteBtn.disabled = !guided;
    speed.disabled = !guided;
    ccBtn.disabled = !guided;
  }

  function playFeedback(button) {
    const key = button.dataset.feedbackKey;
    const payload = feedbackScripts[id()]?.[key] || button.dataset.feedback || '';
    const box = button.closest('.question');
    const output = box.querySelector('.feedback');
    const good = button.dataset.correct === 'true';
    box.querySelectorAll('button').forEach(b => b.disabled = true);
    button.classList.add(good ? 'good' : 'bad');
    output.textContent = payload;
    setCaption(payload);
    if (!guided) return;
    setNote(good ? 'Correct — explanation' : 'Not quite — explanation');
    feedbackAudio.src = mediaUrl(`${id()}-${key}.mp3`);
    feedbackAudio.playbackRate = Number(speed.value || 1);
    const attempt = feedbackAudio.play();
    const done = () => setNote('Continue when ready');
    if (attempt && typeof attempt.catch === 'function') attempt.catch(() => startFallback(payload, done, true));
    feedbackAudio.onended = done;
    feedbackAudio.onerror = () => {
      if (!feedbackAudio.paused) return;
      startFallback(payload, done, true);
    };
  }

  lessonAudio.addEventListener('timeupdate', () => {
    if (!guided || !Number.isFinite(lessonAudio.duration) || !lessonAudio.duration) return;
    revealFraction(lessonAudio.currentTime / lessonAudio.duration);
  });
  lessonAudio.addEventListener('playing', () => { setPlayState(true); setNote('Playing Chatterbox narration'); });
  lessonAudio.addEventListener('pause', () => { if (!lessonAudio.ended) { setPlayState(false); if (wantsPlayback) setNote('Paused'); } });
  lessonAudio.addEventListener('ended', completeStage);
  lessonAudio.addEventListener('error', () => {
    if (guided && wantsPlayback && !fallbackUtterance) startFallback(stageScript());
  });

  document.querySelectorAll('.answers button').forEach(button => button.addEventListener('click', () => playFeedback(button)));
  startGuided.addEventListener('click', () => { startCard.hidden = true; setMode(true); showStage(0, true); });
  startFree.addEventListener('click', () => { startCard.hidden = true; setMode(false); showStage(0, false); });
  playBtn.addEventListener('click', pauseResume);
  prevBtn.addEventListener('click', () => showStage(current - 1, guided));
  nextBtn.addEventListener('click', () => { if (current < stages.length - 1) showStage(current + 1, guided); });
  freeBtn.addEventListener('click', () => { setMode(!guided); showStage(current, guided); });
  ccBtn.addEventListener('click', () => { captionsOn = !captionsOn; ccBtn.classList.toggle('active', captionsOn); setCaption(); });
  muteBtn.addEventListener('click', () => {
    muted = !muted;
    lessonAudio.muted = muted;
    feedbackAudio.muted = muted;
    muteBtn.textContent = muted ? '🔇' : '🔊';
    if (muted && fallbackUtterance && 'speechSynthesis' in window) speechSynthesis.cancel();
  });
  speed.addEventListener('change', () => {
    lessonAudio.playbackRate = Number(speed.value || 1);
    feedbackAudio.playbackRate = Number(speed.value || 1);
  });
  window.addEventListener('keydown', event => {
    if (startCard && !startCard.hidden) return;
    if (event.key === 'ArrowRight' && current < stages.length - 1) showStage(current + 1, guided);
    if (event.key === 'ArrowLeft' && current > 0) showStage(current - 1, guided);
    if (event.key === ' ') { event.preventDefault(); pauseResume(); }
  });

  fetch(new URL(`narration/cortisol-guided.json?v=${REV}`, document.baseURI), {cache:'no-store'})
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => {
      scripts = Object.fromEntries((data.stages || []).map(s => [s.id, s]));
      feedbackScripts = Object.fromEntries((data.stages || []).map(s => [s.id, s.feedback || {}]));
      setCaption();
    })
    .catch(() => setNote('Narration text unavailable'));

  setMode(true);
  showStage(0, false);
})();
