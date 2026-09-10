(() => {
  const AUDIO_REVISION = '20260910-2';
  const order = [
    '01-reframe',
    '02-tonicity',
    '03-firstfork',
    '04-adh',
    '05-uosm',
    '06-unasodium',
    '07-causes',
    '08-volume',
    '09-emergency',
    '10-reconstruct'
  ];
  const labels = [
    'Reframe the sodium',
    'Tonicity & the brain',
    'First diagnostic fork',
    'ADH: the master controller',
    'Urine osmolality',
    'Urine sodium',
    'Build the causes',
    'Volume states derived',
    'The emergency',
    'Reconstruct the algorithm'
  ];

  const introFix = document.createElement('style');
  introFix.textContent = '.intro[hidden]{display:none!important}';
  document.head.append(introFix);

  document.querySelectorAll('.ions').forEach(element => {
    element.innerHTML = Array.from({ length: 12 }, () => '<span class="ion">Na</span>').join('');
  });

  const style = document.createElement('style');
  style.textContent = `.hyp-audio-orb{position:fixed;z-index:9999;right:14px;bottom:18px;width:52px;height:52px;border-radius:50%;border:1px solid #ffd978;background:radial-gradient(circle at 32% 25%,#fff8d8,#f3bd45 30%,#8a4b07 82%);color:#120d06;display:none;place-items:center;box-shadow:0 10px 30px #000a;touch-action:manipulation;user-select:none;-webkit-tap-highlight-color:transparent}.hyp-audio-orb svg{width:24px;height:24px}.hyp-audio-orb.playing{box-shadow:0 0 0 7px #e9a51b24,0 10px 30px #000a}.hyp-audio-panel{position:fixed;z-index:9998;right:72px;bottom:24px;display:none;gap:4px;padding:6px;border:1px solid #e9a51b55;border-radius:999px;background:#0d0e11f2;box-shadow:0 8px 26px #0009;touch-action:manipulation}.hyp-audio-panel.open{display:flex}.hyp-audio-panel button{height:30px;min-width:40px;padding:0 8px;border-radius:999px;border:1px solid #ffffff22;background:#ffffff08;color:#f4f1e8;font-size:10px;touch-action:manipulation}.hyp-audio-panel button.active{background:#e9a51b;color:#090a0c}.hyp-caption{position:fixed;z-index:9997;left:50%;transform:translateX(-50%);bottom:82px;width:min(720px,calc(100vw - 26px));max-height:28vh;overflow:auto;display:none;padding:11px 14px;border:1px solid #ffffff18;border-radius:12px;background:#050608f5;color:#fff;font-size:13px;line-height:1.6;box-shadow:0 8px 28px #000a}.hyp-caption.open{display:block}.hyp-audio-note{position:fixed;z-index:9996;right:17px;bottom:76px;font-size:8px;letter-spacing:.11em;color:#e9a51b;text-transform:uppercase;opacity:.8;display:none}@media(max-width:700px){.hyp-audio-orb{width:48px;height:48px;right:10px;bottom:12px}.hyp-audio-panel{right:62px;bottom:17px;max-width:calc(100vw - 76px);overflow-x:auto}.hyp-audio-note{right:12px;bottom:64px}.hyp-caption{bottom:72px;font-size:12px}}`;
  document.head.append(style);

  const orb = document.createElement('button');
  orb.className = 'hyp-audio-orb';
  orb.type = 'button';
  orb.setAttribute('aria-label', 'Play narration. Hold for speed and captions');
  orb.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a8 8 0 0 0-8 8v6a3 3 0 0 0 3 3h2v-8H6v-1a6 6 0 0 1 12 0v1h-3v8h2a3 3 0 0 0 3-3v-6a8 8 0 0 0-8-8Z"/></svg>';

  const panel = document.createElement('div');
  panel.className = 'hyp-audio-panel';
  panel.innerHTML = '<button data-rate="0.5">0.5×</button><button data-rate="0.8">0.8×</button><button data-rate="1" class="active">1×</button><button data-rate="1.25">1.25×</button><button data-rate="1.5">1.5×</button><button data-cc>CC</button>';

  const caption = document.createElement('div');
  caption.className = 'hyp-caption';
  caption.setAttribute('role', 'status');
  caption.setAttribute('aria-live', 'polite');

  const note = document.createElement('div');
  note.className = 'hyp-audio-note';
  note.textContent = 'Narration';

  // Keeping a real media element in the document is more reliable on iPadOS
  // than an unattached `new Audio()` object.
  const audio = document.createElement('audio');
  audio.preload = 'metadata';
  audio.playsInline = true;
  audio.setAttribute('playsinline', '');
  audio.setAttribute('webkit-playsinline', '');
  audio.style.display = 'none';
  audio.preservesPitch = true;

  document.body.append(audio, orb, panel, caption, note);

  let current = 0;
  let rate = 1;
  let captionsOn = false;
  let holdTimer = null;
  let held = false;
  let suppressClick = false;
  let panelOpenedByHold = false;
  let retryCount = 0;
  let scripts = {};

  function source(retry = false) {
    const url = new URL(`audio/hyponatraemia-chatterbox/${order[current]}.mp3`, document.baseURI);
    url.searchParams.set('v', AUDIO_REVISION);
    if (retry) url.searchParams.set('retry', String(Date.now()));
    return url.href;
  }

  function syncCaption() {
    caption.textContent = scripts[order[current]] || 'Captions are loading for this step.';
    caption.classList.toggle('open', captionsOn);
  }

  function setNote(message, resetAfter = 0) {
    note.textContent = message;
    if (resetAfter) {
      window.setTimeout(() => {
        if (note.textContent === message) note.textContent = 'Narration';
      }, resetAfter);
    }
  }

  function loadStage() {
    audio.pause();
    orb.classList.remove('playing');
    orb.setAttribute('aria-label', 'Play narration. Hold for speed and captions');
    retryCount = 0;
    audio.src = source();
    audio.load();
    audio.playbackRate = rate;
    syncCaption();
  }

  function playPause() {
    if (!audio.paused) {
      audio.pause();
      return;
    }

    // The call stays directly inside the tap/click handler so iPadOS recognises
    // it as user-initiated media playback.
    audio.playbackRate = rate;
    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(() => {
        if (retryCount === 0) {
          retryCount += 1;
          audio.src = source(true);
          audio.load();
          setNote('Tap once more to play');
        } else {
          setNote('Audio could not load — please retry', 3500);
        }
      });
    }
  }

  function openPanel() {
    panelOpenedByHold = true;
    held = true;
    suppressClick = true;
    panel.classList.add('open');
  }

  function closePanel() {
    window.clearTimeout(holdTimer);
    panel.classList.remove('open');
    held = false;
    panelOpenedByHold = false;
  }

  audio.addEventListener('playing', () => {
    if (audio.paused) return;
    orb.classList.add('playing');
    orb.setAttribute('aria-label', 'Pause narration');
    setNote('Playing');
  });
  audio.addEventListener('pause', () => {
    orb.classList.remove('playing');
    orb.setAttribute('aria-label', 'Play narration. Hold for speed and captions');
    if (!audio.ended) setNote('Narration');
  });
  audio.addEventListener('ended', () => setNote('Step complete'));
  audio.addEventListener('error', () => {
    if (retryCount > 0) setNote('Audio could not load — please retry', 3500);
  });

  orb.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    held = false;
    panelOpenedByHold = false;
    holdTimer = window.setTimeout(openPanel, 350);
  });
  orb.addEventListener('pointerup', () => {
    window.clearTimeout(holdTimer);
    if (held) {
      window.setTimeout(() => {
        if (!panel.matches(':hover')) closePanel();
      }, 700);
    }
  });
  orb.addEventListener('pointercancel', () => {
    window.clearTimeout(holdTimer);
    if (!panelOpenedByHold) closePanel();
  });
  orb.addEventListener('contextmenu', event => event.preventDefault());
  orb.addEventListener('click', event => {
    if (suppressClick) {
      suppressClick = false;
      event.preventDefault();
      return;
    }
    playPause();
  });

  panel.addEventListener('pointerdown', event => event.stopPropagation());
  panel.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();

    if (button.dataset.rate) {
      rate = Number(button.dataset.rate);
      audio.playbackRate = rate;
      panel.querySelectorAll('[data-rate]').forEach(item => item.classList.toggle('active', item === button));
      setNote(`Speed ${button.textContent}`, 1200);
    } else if (button.hasAttribute('data-cc')) {
      captionsOn = !captionsOn;
      button.classList.toggle('active', captionsOn);
      syncCaption();
    }
    window.setTimeout(closePanel, 220);
  });

  document.addEventListener('pointerdown', event => {
    if (panel.classList.contains('open') && !panel.contains(event.target) && event.target !== orb) closePanel();
  });

  // Register this before any network request. A quick tap on iPad can no longer
  // outrun the caption download and leave the audio on the wrong step.
  window.addEventListener('hyponatraemia-step', event => {
    current = Math.max(0, Math.min(order.length - 1, event.detail.step || 0));
    loadStage();
    orb.style.display = 'grid';
    note.style.display = 'block';
    setNote(labels[current], 1800);
  });

  fetch(new URL(`narration/hyponatraemia.json?v=${AUDIO_REVISION}`, document.baseURI), { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error(`Caption request failed: ${response.status}`);
      return response.json();
    })
    .then(data => {
      scripts = Object.fromEntries((data.stages || []).map(stage => [stage.id, stage.script || '']));
      syncCaption();
    })
    .catch(() => {});

  // Recover gracefully if the lesson was started before this script finished
  // loading from the network or an older cached page.
  const activeStage = document.querySelector('.stage.active');
  if (activeStage) {
    current = Math.max(0, Number(activeStage.dataset.stage) || 0);
    loadStage();
    orb.style.display = 'grid';
    note.style.display = 'block';
  }

  window.HyponatraemiaAudio = {
    audio,
    orb,
    panel,
    caption,
    setRate(nextRate) {
      rate = Number(nextRate) || 1;
      audio.playbackRate = rate;
    },
    toggleCaptions() {
      captionsOn = !captionsOn;
      syncCaption();
    }
  };
})();
