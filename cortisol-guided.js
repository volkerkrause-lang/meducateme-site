(() => {
  const REV = '20260911-2';
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
  const lessonProgress = document.querySelector('.lesson-progress');

  if (!stages.length || !lessonAudio || !feedbackAudio) return;

  // Match the compact audio control used by the hyponatraemia guided lesson.
  const uiStyle = document.createElement('style');
  uiStyle.textContent = `
    .stage{padding-bottom:82px!important}
    .lesson-controls{left:50%!important;right:auto!important;bottom:12px!important;transform:translateX(-50%);width:auto!important;max-width:calc(100vw - 92px);display:flex!important;gap:4px!important;padding:5px!important;border:1px solid #e9a51b55!important;border-radius:999px;background:#0d0e11f2!important;box-shadow:0 8px 26px #0009;overflow:visible!important;backdrop-filter:blur(12px)}
    .lesson-controls #play,.lesson-controls #mute,.lesson-controls #speed,.lesson-controls #cc,.lesson-controls #free,.lesson-controls .spacer{display:none!important}
    .lesson-controls #prev,.lesson-controls #next{width:40px;min-width:40px;height:34px!important;padding:0!important;border-radius:999px;border:1px solid #ffffff22;background:#ffffff08;color:#f4f1e8;font-size:18px;line-height:1}
    .lesson-controls #prev:disabled,.lesson-controls #next:disabled{opacity:.28}
    .cort-nav-count{height:34px;min-width:58px;padding:0 10px;border:1px solid #ffffff14;border-radius:999px;display:grid;place-items:center;color:#c9c8c4;font-size:10px;letter-spacing:.12em;white-space:nowrap}
    .cort-audio-orb{position:fixed;z-index:9999;right:14px;bottom:18px;width:52px;height:52px;border-radius:50%;border:1px solid #ffd978;background:radial-gradient(circle at 32% 25%,#fff8d8,#f3bd45 30%,#8a4b07 82%);color:#120d06;display:grid;place-items:center;box-shadow:0 10px 30px #000a;touch-action:manipulation;user-select:none;-webkit-tap-highlight-color:transparent}
    .cort-audio-orb svg{width:24px;height:24px}.cort-audio-orb.playing{box-shadow:0 0 0 7px #e9a51b24,0 10px 30px #000a}.cort-audio-orb.free-mode{filter:saturate(.45);opacity:.72}
    .cort-audio-panel{position:fixed;z-index:9998;right:72px;bottom:24px;display:none;gap:4px;padding:6px;border:1px solid #e9a51b55;border-radius:999px;background:#0d0e11f2;box-shadow:0 8px 26px #0009;touch-action:manipulation;max-width:calc(100vw - 86px);overflow-x:auto}
    .cort-audio-panel.open{display:flex}.cort-audio-panel button{height:30px;min-width:40px;padding:0 8px;border-radius:999px;border:1px solid #ffffff22;background:#ffffff08;color:#f4f1e8;font-size:10px;white-space:nowrap;touch-action:manipulation}.cort-audio-panel button.active{background:#e9a51b;color:#090a0c}
    .caption{position:fixed!important;z-index:9997!important;left:50%!important;bottom:82px!important;width:min(720px,calc(100vw - 26px))!important;max-height:28vh!important;border-radius:12px!important}
    .audio-note{position:fixed!important;z-index:9996!important;right:17px!important;bottom:76px!important;font-size:8px!important;pointer-events:none;opacity:0;transition:opacity .2s ease}.audio-note.show{opacity:.86}
    .lesson-progress{cursor:pointer;position:relative}.lesson-progress:focus-visible{outline:1px solid var(--cort);outline-offset:5px}
    .cort-chapter-menu{position:fixed;z-index:10010;top:68px;right:12px;width:min(360px,calc(100vw - 24px));max-height:min(72dvh,620px);overflow:auto;display:none;padding:8px;border:1px solid #e9a51b55;background:#0c0d10f7;box-shadow:0 18px 60px #000c;backdrop-filter:blur(14px)}
    .cort-chapter-menu.open{display:block}.cort-chapter-menu button{width:100%;display:grid;grid-template-columns:38px 1fr;gap:10px;align-items:center;text-align:left;padding:11px 10px;border:0;border-bottom:1px solid #ffffff10;background:transparent;color:#f3f1ea}.cort-chapter-menu button:last-child{border-bottom:0}.cort-chapter-menu button.current{background:#e9a51b12}.cort-chapter-menu .num{color:#e9a51b;font-size:10px;letter-spacing:.12em}.cort-chapter-menu .ttl{font-weight:750;font-size:12px}
    @media(max-width:820px){.stage{padding-bottom:74px!important}.lesson-controls{bottom:10px!important}.cort-audio-orb{width:48px;height:48px;right:10px;bottom:10px}.cort-audio-panel{right:62px;bottom:15px;max-width:calc(100vw - 76px)}.caption{bottom:70px!important;font-size:12px!important}.audio-note{right:12px!important;bottom:64px!important}.cort-chapter-menu{top:62px}.lesson-progress small{gap:8px}.lesson-progress #step-title{max-width:112px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
  `;
  document.head.append(uiStyle);

  const navCount = document.createElement('span');
  navCount.className = 'cort-nav-count';
  navCount.setAttribute('aria-live', 'polite');
  prevBtn.insertAdjacentElement('afterend', navCount);

  const orb = document.createElement('button');
  orb.className = 'cort-audio-orb';
  orb.type = 'button';
  orb.setAttribute('aria-label', 'Play narration. Hold for speed, captions and lesson mode');
  orb.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a8 8 0 0 0-8 8v6a3 3 0 0 0 3 3h2v-8H6v-1a6 6 0 0 1 12 0v1h-3v8h2a3 3 0 0 0 3-3v-6a8 8 0 0 0-8-8Z"/></svg>';

  const panel = document.createElement('div');
  panel.className = 'cort-audio-panel';
  panel.innerHTML = '<button data-rate="0.8">0.8×</button><button data-rate="1" class="active">1×</button><button data-rate="1.2">1.2×</button><button data-rate="1.5">1.5×</button><button data-cc>CC</button><button data-mute>🔊</button><button data-mode>Explore</button>';
  document.body.append(orb, panel);

  const chapterMenu = document.createElement('div');
  chapterMenu.className = 'cort-chapter-menu';
  chapterMenu.setAttribute('role', 'dialog');
  chapterMenu.setAttribute('aria-label', 'Choose lesson chapter');
  chapterMenu.innerHTML = stages.map((stage, index) => `<button type="button" data-chapter="${index}"><span class="num">${String(index + 1).padStart(2, '0')}</span><span class="ttl">${stage.dataset.title || `Step ${index + 1}`}</span></button>`).join('');
  document.body.append(chapterMenu);

  lessonProgress.setAttribute('role', 'button');
  lessonProgress.setAttribute('tabindex', '0');
  lessonProgress.setAttribute('aria-label', 'Choose lesson chapter');
  lessonProgress.title = 'Choose chapter';

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
  let holdTimer = null;
  let held = false;
  let suppressClick = false;

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

  function setNote(text, flash = false) {
    note.textContent = text;
    orb.title = text;
    if (flash) {
      note.classList.add('show');
      window.clearTimeout(setNote.timer);
      setNote.timer = window.setTimeout(() => note.classList.remove('show'), 1800);
    }
  }

  function setPlayState(playing) {
    playBtn.innerHTML = playing ? '❚❚ <span class="label-hide">Pause</span>' : '▶ <span class="label-hide">Play</span>';
    orb.classList.toggle('playing', playing);
    orb.setAttribute('aria-label', playing ? 'Pause narration. Hold for options' : 'Play narration. Hold for speed, captions and lesson mode');
  }

  function setCaption(extra = '') {
    const base = stageScript();
    caption.textContent = extra ? `${base}\n\n${extra}` : base;
    caption.classList.toggle('open', captionsOn);
  }

  function syncPanel() {
    panel.querySelectorAll('[data-rate]').forEach(button => button.classList.toggle('active', Number(button.dataset.rate) === Number(speed.value || 1)));
    const cc = panel.querySelector('[data-cc]');
    const mute = panel.querySelector('[data-mute]');
    const mode = panel.querySelector('[data-mode]');
    cc.classList.toggle('active', captionsOn);
    mute.classList.toggle('active', muted);
    mute.textContent = muted ? '🔇' : '🔊';
    mode.textContent = guided ? 'Explore' : 'Guided';
    mode.classList.toggle('active', !guided);
    orb.classList.toggle('free-mode', !guided);
  }

  function updateChapterUI() {
    navCount.textContent = `${current + 1} / ${stages.length}`;
    chapterMenu.querySelectorAll('[data-chapter]').forEach((button, index) => button.classList.toggle('current', index === current));
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
    setNote(item().querySelector('.checkpoint') ? 'Make your prediction' : 'Step complete', true);
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
      setNote('Muted — visual guide running', true);
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
    setNote('Device voice fallback', true);
    speechSynthesis.speak(u);
    setPlayState(!isFeedback);
  }

  function playCurrent() {
    if (!guided) {
      setNote('Switch to Guided mode for narration', true);
      return;
    }
    wantsPlayback = true;
    stageComplete = false;
    lessonAudio.playbackRate = Number(speed.value || 1);
    const attempt = lessonAudio.play();
    if (attempt && typeof attempt.then === 'function') {
      attempt.then(() => { setNote('Playing Chatterbox narration'); setPlayState(true); }).catch(() => startFallback(stageScript()));
    }
  }

  function pauseResume() {
    if (!guided) {
      setNote('Switch to Guided mode for narration', true);
      return;
    }
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
    prevBtn.textContent = '←';
    nextBtn.textContent = current === stages.length - 1 ? '✓' : '→';
    prevBtn.setAttribute('aria-label', current === 0 ? 'Previous step unavailable' : `Previous: ${stages[current - 1]?.dataset.title || `step ${current}`}`);
    nextBtn.setAttribute('aria-label', current === stages.length - 1 ? 'Lesson complete' : `Next: ${stages[current + 1]?.dataset.title || `step ${current + 2}`}`);
    setCaption();
    updateChapterUI();
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
    syncPanel();
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
    setNote(good ? 'Correct — explanation' : 'Not quite — explanation', true);
    feedbackAudio.src = mediaUrl(`${id()}-${key}.mp3`);
    feedbackAudio.playbackRate = Number(speed.value || 1);
    const attempt = feedbackAudio.play();
    const done = () => setNote('Continue when ready', true);
    if (attempt && typeof attempt.catch === 'function') attempt.catch(() => startFallback(payload, done, true));
    feedbackAudio.onended = done;
    feedbackAudio.onerror = () => {
      if (!feedbackAudio.paused) return;
      startFallback(payload, done, true);
    };
  }

  function toggleChapterMenu(force) {
    const open = typeof force === 'boolean' ? force : !chapterMenu.classList.contains('open');
    chapterMenu.classList.toggle('open', open);
    lessonProgress.setAttribute('aria-expanded', String(open));
    if (open) chapterMenu.querySelector('.current')?.scrollIntoView({ block: 'nearest' });
  }

  function openOptions() {
    held = true;
    suppressClick = true;
    panel.classList.add('open');
    syncPanel();
  }

  function closeOptions() {
    window.clearTimeout(holdTimer);
    panel.classList.remove('open');
    held = false;
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
  ccBtn.addEventListener('click', () => { captionsOn = !captionsOn; ccBtn.classList.toggle('active', captionsOn); setCaption(); syncPanel(); });
  muteBtn.addEventListener('click', () => {
    muted = !muted;
    lessonAudio.muted = muted;
    feedbackAudio.muted = muted;
    muteBtn.textContent = muted ? '🔇' : '🔊';
    if (muted && fallbackUtterance && 'speechSynthesis' in window) speechSynthesis.cancel();
    syncPanel();
  });
  speed.addEventListener('change', () => {
    lessonAudio.playbackRate = Number(speed.value || 1);
    feedbackAudio.playbackRate = Number(speed.value || 1);
    syncPanel();
  });

  orb.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    held = false;
    holdTimer = window.setTimeout(openOptions, 350);
  });
  orb.addEventListener('pointerup', () => {
    window.clearTimeout(holdTimer);
    if (held) window.setTimeout(() => { if (!panel.matches(':hover')) closeOptions(); }, 700);
  });
  orb.addEventListener('pointercancel', () => window.clearTimeout(holdTimer));
  orb.addEventListener('contextmenu', event => event.preventDefault());
  orb.addEventListener('click', event => {
    if (suppressClick) {
      suppressClick = false;
      event.preventDefault();
      return;
    }
    pauseResume();
  });

  panel.addEventListener('pointerdown', event => event.stopPropagation());
  panel.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    if (button.dataset.rate) {
      speed.value = button.dataset.rate;
      speed.dispatchEvent(new Event('change'));
      setNote(`Speed ${button.textContent}`, true);
    } else if (button.hasAttribute('data-cc')) {
      captionsOn = !captionsOn;
      ccBtn.classList.toggle('active', captionsOn);
      setCaption();
      syncPanel();
    } else if (button.hasAttribute('data-mute')) {
      muteBtn.click();
      setNote(muted ? 'Muted' : 'Sound on', true);
    } else if (button.hasAttribute('data-mode')) {
      setMode(!guided);
      showStage(current, guided);
      setNote(guided ? 'Guided mode' : 'Explore mode', true);
    }
    window.setTimeout(closeOptions, 180);
  });

  lessonProgress.addEventListener('click', () => toggleChapterMenu());
  lessonProgress.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleChapterMenu(); }
  });
  chapterMenu.addEventListener('click', event => {
    const button = event.target.closest('[data-chapter]');
    if (!button) return;
    const target = Number(button.dataset.chapter);
    toggleChapterMenu(false);
    showStage(target, false);
  });

  document.addEventListener('pointerdown', event => {
    if (panel.classList.contains('open') && !panel.contains(event.target) && event.target !== orb) closeOptions();
    if (chapterMenu.classList.contains('open') && !chapterMenu.contains(event.target) && !lessonProgress.contains(event.target)) toggleChapterMenu(false);
  });

  window.addEventListener('keydown', event => {
    if (startCard && !startCard.hidden) return;
    if (event.key === 'Escape') { closeOptions(); toggleChapterMenu(false); return; }
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
    .catch(() => setNote('Narration text unavailable', true));

  setMode(true);
  showStage(0, false);
})();
