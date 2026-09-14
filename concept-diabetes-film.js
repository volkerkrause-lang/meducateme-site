(() => {
  const canvas = document.getElementById('insulinFilm');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const playButton = document.getElementById('filmPlay');
  const seek = document.getElementById('filmSeek');
  const clock = document.getElementById('filmTime');
  const bg = document.getElementById('bgGauge');
  const insulin = document.getElementById('insGauge');
  const title = document.getElementById('filmChapterTitle');
  const titleTime = document.getElementById('filmChapterTime');
  const narrationToggle = document.getElementById('narrationToggle');
  const cues = [...document.querySelectorAll('.video-cue')];
  const chapterButtons = [...document.querySelectorAll('.chapter')];
  const chapters = [
    { start: 0, end: 22, label: 'After a meal', range: '0:00–0:22' },
    { start: 22, end: 48, label: 'Pancreatic sensing', range: '0:22–0:48' },
    { start: 48, end: 78, label: 'Receptor signalling', range: '0:48–1:18' },
    { start: 78, end: 90, label: 'Negative feedback', range: '1:18–1:30' }
  ];
  let currentTime = 0, playing = false, narrationOn = true, lastFrame = 0, activeChapter = -1;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const ease = n => n * n * (3 - 2 * n);
  const chapterAt = t => t < 22 ? 0 : t < 48 ? 1 : t < 78 ? 2 : 3;
  const formatTime = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

  function text(value, x, y, size = 30, colour = '#f3f1ea', align = 'center', weight = 700) {
    ctx.fillStyle = colour; ctx.font = `${weight} ${size}px system-ui, sans-serif`; ctx.textAlign = align; ctx.fillText(value, x, y);
  }
  function pill(value, x, y, colour = '#e9a51b') {
    ctx.font = '800 24px system-ui, sans-serif';
    const width = ctx.measureText(value).width + 42;
    ctx.fillStyle = colour + '18'; ctx.strokeStyle = colour; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x - width / 2, y - 28, width, 48, 24); ctx.fill(); ctx.stroke();
    text(value, x, y + 5, 24, colour);
  }
  function particle(x, y, radius, colour, alpha = 1) {
    ctx.globalAlpha = alpha; ctx.fillStyle = colour; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  }
  function base() {
    const gradient = ctx.createRadialGradient(640, 350, 40, 640, 350, 760);
    gradient.addColorStop(0, '#151b23'); gradient.addColorStop(1, '#07090d');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  function drawMeal(t) {
    const p = ease(clamp(t / 22, 0, 1));
    text('CARBOHYDRATE', 235, 255, 26, '#9da1a9');
    ctx.strokeStyle = '#70cbd8'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(200, 300); ctx.bezierCurveTo(120, 420, 335, 470, 250, 590); ctx.stroke();
    text('GUT', 235, 630, 22, '#70cbd8');
    ctx.strokeStyle = '#ed806d'; ctx.lineWidth = 74; ctx.beginPath(); ctx.moveTo(430, 180); ctx.lineTo(430, 610); ctx.stroke();
    ctx.strokeStyle = '#ffb1a3'; ctx.lineWidth = 3; ctx.stroke();
    for (let n = 0; n < 10; n++) {
      const q = clamp(p * 1.35 - n * .045, 0, 1);
      particle(250 + 180 * q, 330 + Math.sin(n * 1.7) * 80 + 150 * q, 11, '#e9a51b');
    }
    for (let n = 0; n < 16; n++) particle(430 + Math.sin(n * 2.2) * 22, 205 + n * 25, 8, '#e9a51b', .25 + .75 * p);
    text('Glucose enters the circulation', 790, 330, 44); pill('BLOOD GLUCOSE RISES', 790, 410); text('Fuel has arrived', 790, 485, 28, '#9da1a9');
  }
  function drawPancreas(t) {
    const p = ease(clamp((t - 22) / 26, 0, 1));
    ctx.fillStyle = '#d88c5a'; ctx.beginPath(); ctx.moveTo(150, 365); ctx.bezierCurveTo(255, 270, 470, 295, 535, 365); ctx.bezierCurveTo(440, 430, 250, 445, 150, 365); ctx.fill();
    text('PANCREAS', 330, 485, 22, '#d88c5a');
    ctx.strokeStyle = '#ffffff25'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(510, 330); ctx.lineTo(690, 215); ctx.stroke();
    ctx.fillStyle = '#111820'; ctx.strokeStyle = '#70cbd8'; ctx.beginPath(); ctx.arc(785, 195, 120, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    for (let n = 0; n < 15; n++) particle(730 + (n % 5) * 27, 145 + Math.floor(n / 5) * 48, 16, '#70cbd8', .55 + .45 * Math.sin(p * 12 + n));
    text('β-CELLS', 785, 350, 22, '#70cbd8');
    ctx.strokeStyle = '#ed806d'; ctx.lineWidth = 64; ctx.beginPath(); ctx.moveTo(640, 520); ctx.lineTo(1140, 520); ctx.stroke();
    for (let n = 0; n < 9; n++) particle(690 + ((p * 530 + n * 68) % 450), 520 + Math.sin(n) * 16, 10, '#70cbd8');
    pill('INSULIN RELEASED', 890, 620, '#70cbd8');
  }
  function drawSignal(t) {
    const p = clamp((t - 48) / 30, 0, 1);
    ctx.fillStyle = '#10151b'; ctx.strokeStyle = '#ffffff28'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(90, 160, 1100, 450, 36); ctx.fill(); ctx.stroke();
    text('MUSCLE / FAT CELL', 190, 210, 20, '#9da1a9', 'left');
    ctx.strokeStyle = '#b8a1ff'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(300, 150); ctx.lineTo(300, 245); ctx.stroke();
    particle(300, 125, 18, '#70cbd8'); text('INSULIN', 300, 87, 18, '#70cbd8');
    [['IRS-1', 440, .12], ['PI3K', 605, .3], ['Akt', 755, .47], ['GLUT4', 930, .64]].forEach(([label, x, at], n) => {
      const on = p >= at;
      if (n) { ctx.strokeStyle = on ? '#e9a51b' : '#ffffff18'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 105, 340); ctx.lineTo(x - 55, 340); ctx.stroke(); }
      ctx.fillStyle = on ? '#e9a51b20' : '#ffffff08'; ctx.strokeStyle = on ? '#e9a51b' : '#ffffff25'; ctx.beginPath(); ctx.roundRect(x - 55, 305, 110, 70, 18); ctx.fill(); ctx.stroke();
      text(label, x, 350, 23, on ? '#e9a51b' : '#777b82');
    });
    const membraneOn = p >= .72;
    ctx.strokeStyle = membraneOn ? '#70cbd8' : '#ffffff25'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(1040, 190); ctx.lineTo(1040, 555); ctx.stroke();
    for (let n = 0; n < 6; n++) { const q = clamp((p - .72) * 3.5 - n * .06, 0, 1); particle(1125 - q * 165, 270 + n * 48, 10, '#e9a51b'); }
    text('Glucose enters', 1110, 590, 20, membraneOn ? '#e9a51b' : '#777b82');
    text(p > .84 ? 'ATP + GLYCOGEN' : 'SIGNAL CASCADE', 650, 485, 32, p > .84 ? '#7fd6a0' : '#9da1a9');
  }
  function drawFeedback(t) {
    const p = clamp((t - 78) / 12, 0, 1), left = 180, top = 260, width = 900, height = 260;
    text('NEGATIVE FEEDBACK', 640, 180, 24, '#9da1a9');
    ctx.strokeStyle = '#ffffff30'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(left, top + height); ctx.lineTo(left + width, top + height); ctx.stroke();
    const drawCurve = (colour, peak, lag = 0) => {
      ctx.strokeStyle = colour; ctx.lineWidth = 7; ctx.beginPath();
      for (let n = 0; n <= Math.floor(120 * p); n++) {
        const q = n / 120, yv = Math.exp(-Math.pow((q - peak) / .22, 2)), x = left + q * width, y = top + height * .72 - yv * height * .58 + lag;
        n ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    };
    drawCurve('#e9a51b', .32); drawCurve('#70cbd8', .48, 20);
    text('GLUCOSE', 930, 300, 21, '#e9a51b'); text('INSULIN', 930, 340, 21, '#70cbd8'); pill('GLUCOSE RETURNS TOWARD BASELINE', 640, 625, '#7fd6a0');
  }
  function draw() {
    base();
    if (currentTime < 22) drawMeal(currentTime); else if (currentTime < 48) drawPancreas(currentTime); else if (currentTime < 78) drawSignal(currentTime); else drawFeedback(currentTime);
  }
  function syncNarration(chapter) {
    cues.forEach((audio, n) => { if (n !== chapter) { audio.pause(); audio.currentTime = 0; } });
    const audio = cues[chapter];
    if (!audio || !narrationOn) return;
    const local = currentTime - chapters[chapter].start;
    audio.playbackRate = 1;
    audio.currentTime = Math.min(Math.max(local, 0), Math.max(0, (audio.duration || 999) - .05));
    if (playing && local < (audio.duration || Infinity)) audio.play().catch(() => {});
  }
  function updateUi(forceCue = false) {
    const chapter = chapterAt(Math.min(currentTime, 89.999)), c = chapters[chapter];
    seek.value = currentTime; clock.value = `${formatTime(currentTime)} / 1:30`; title.textContent = c.label; titleTime.textContent = c.range;
    chapterButtons.forEach((button, n) => button.classList.toggle('active', n === chapter));
    let glucose, insulinText;
    if (currentTime < 22) { glucose = 5 + currentTime / 22 * 3.2; insulinText = 'LOW'; }
    else if (currentTime < 48) { glucose = 8.2 - (currentTime - 22) / 26 * .5; insulinText = 'RISING'; }
    else if (currentTime < 78) { glucose = 7.7 - (currentTime - 48) / 30 * 1.9; insulinText = 'HIGH'; }
    else { glucose = 5.8 - (currentTime - 78) / 12 * .8; insulinText = 'FALLING'; }
    bg.textContent = glucose.toFixed(1); insulin.textContent = insulinText;
    if (forceCue || chapter !== activeChapter) syncNarration(chapter);
    activeChapter = chapter; draw();
  }
  function tick(now) {
    if (!playing) return;
    if (!lastFrame) lastFrame = now;
    currentTime = Math.min(90, currentTime + (now - lastFrame) / 1000); lastFrame = now; updateUi();
    if (currentTime >= 90) pause(); else requestAnimationFrame(tick);
  }
  function play() {
    if (currentTime >= 90) currentTime = 0;
    playing = true; lastFrame = 0; playButton.textContent = '❚❚'; playButton.setAttribute('aria-label', 'Pause animation');
    syncNarration(chapterAt(currentTime)); requestAnimationFrame(tick);
  }
  function pause() {
    playing = false; lastFrame = 0; playButton.textContent = '▶'; playButton.setAttribute('aria-label', 'Play animation');
    cues.forEach(audio => audio.pause()); updateUi();
  }
  playButton.addEventListener('click', () => playing ? pause() : play());
  seek.addEventListener('input', () => { currentTime = Number(seek.value); updateUi(true); });
  chapterButtons.forEach(button => button.addEventListener('click', () => { currentTime = Number(button.dataset.filmTime); updateUi(true); if (!playing) play(); }));
  narrationToggle.addEventListener('click', () => { narrationOn = !narrationOn; if (!narrationOn) cues.forEach(audio => audio.pause()); else if (playing) syncNarration(chapterAt(currentTime)); });
  document.getElementById('start').addEventListener('click', () => { currentTime = 0; updateUi(true); play(); });
  document.addEventListener('click', event => { if (event.target.closest('[data-next],[data-prev]') && !event.target.closest('.chapter')) pause(); });
  updateUi();
})();
