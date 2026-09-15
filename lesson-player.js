(() => {
  const qs = new URLSearchParams(location.search);
  const lessonKey = qs.get('lesson');
  const shell = document.getElementById('lp-shell');
  const audio = document.getElementById('lp-audio-el');
  const audioBtn = document.getElementById('lp-audio');
  const audioPanel = document.getElementById('lp-audio-panel');
  const caption = document.getElementById('lp-caption');
  const controls = document.getElementById('lp-controls');
  const prev = document.getElementById('lp-prev');
  const next = document.getElementById('lp-next');
  const count = document.getElementById('lp-count');
  const chapterBtn = document.getElementById('lp-chapters');
  const chapterDialog = document.getElementById('lp-chapter-dialog');
  const back = document.getElementById('lp-back');

  let manifest = null;
  let current = 0;
  let currentNarration = '';
  let captionsOn = false;
  let panelOpen = false;

  function fail(message) {
    shell.innerHTML = `<section class="lp-error"><strong>Lesson could not load</strong><p>${escapeHtml(message)}</p></section>`;
  }

  function escapeHtml(value='') {
    return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  async function getJson(path) {
    const res = await fetch(path, {cache:'no-store'});
    if (!res.ok) throw new Error(`${path} returned ${res.status}`);
    return res.json();
  }

  function sectionBase() {
    return `lessons/${encodeURIComponent(lessonKey)}/`;
  }

  function resolve(ref) {
    return new URL(ref, new URL(sectionBase(), document.baseURI)).href;
  }

  function renderRichText(blocks=[]) {
    return blocks.map(block => {
      if (block.type === 'paragraph') return `<p>${escapeHtml(block.text)}</p>`;
      if (block.type === 'heading') return `<h2>${escapeHtml(block.text)}</h2>`;
      if (block.type === 'callout') return `<div class="lp-card"><strong>${escapeHtml(block.title || '')}</strong><p>${escapeHtml(block.text || '')}</p></div>`;
      if (block.type === 'list') return `<div class="lp-list">${(block.items||[]).map(item => `<article>${escapeHtml(item)}</article>`).join('')}</div>`;
      return '';
    }).join('');
  }

  function renderGraphic(graphic) {
    if (!graphic) return '<div class="lp-card">No graphic for this section.</div>';
    if (graphic.type === 'image') {
      return `<figure class="lp-visual"><img src="${escapeHtml(resolve(graphic.src))}" alt="${escapeHtml(graphic.alt || '')}">${graphic.caption ? `<figcaption>${escapeHtml(graphic.caption)}</figcaption>` : ''}</figure>`;
    }
    if (graphic.type === 'html') return `<div class="lp-visual">${graphic.html || ''}</div>`;
    return '<div class="lp-card">Unsupported graphic type.</div>';
  }

  function renderQuestion(interaction) {
    if (!interaction || interaction.type !== 'mcq') return '';
    const id = escapeHtml(interaction.id || 'question');
    const answers = (interaction.options || []).map((opt, i) => `<button type="button" data-option="${i}">${escapeHtml(opt.label)}</button>`).join('');
    return `<div class="lp-question" data-question="${id}"><h3>${escapeHtml(interaction.prompt || '')}</h3><div class="lp-answers">${answers}</div><div class="lp-feedback" aria-live="polite"></div></div>`;
  }

  async function renderSection(index, autoplay=false) {
    stopAudio();
    current = Math.max(0, Math.min(index, manifest.sections.length - 1));
    const sec = manifest.sections[current];

    const [content, narration, interaction] = await Promise.all([
      getJson(resolve(sec.contentRef)),
      getJson(resolve(sec.narrationRef)),
      sec.interactionRefs?.[0] ? getJson(resolve(sec.interactionRefs[0])) : Promise.resolve(null)
    ]);

    currentNarration = narration.text || '';
    const graphic = content.graphic || (content.graphics && content.graphics[0]) || null;
    shell.innerHTML = `
      <section class="lp-stage" data-section-id="${escapeHtml(sec.id)}">
        <div>
          <span class="lp-eyebrow">${escapeHtml(content.eyebrow || manifest.title || '')}</span>
          <h1>${escapeHtml(content.title || sec.title || '')}</h1>
          ${renderRichText(content.blocks || [])}
          ${renderQuestion(interaction)}
        </div>
        <div>${renderGraphic(graphic)}</div>
      </section>`;

    document.title = `${content.title || sec.title || manifest.title} — MeducateMe`;
    count.textContent = `${current + 1} / ${manifest.sections.length}`;
    prev.disabled = current === 0;
    next.disabled = current === manifest.sections.length - 1;
    caption.textContent = currentNarration;
    caption.hidden = !captionsOn;
    audio.src = resolve(sec.audioRef);
    audio.load();
    wireQuestion(interaction);
    updateChapterDialog();
    history.replaceState(null, '', `lesson-player.html?lesson=${encodeURIComponent(lessonKey)}&section=${encodeURIComponent(sec.id)}`);
    if (autoplay) playAudio();
  }

  function wireQuestion(interaction) {
    if (!interaction || interaction.type !== 'mcq') return;
    const box = shell.querySelector('[data-question]');
    if (!box) return;
    const feedback = box.querySelector('.lp-feedback');
    box.querySelectorAll('[data-option]').forEach(button => {
      button.addEventListener('click', () => {
        const opt = interaction.options[Number(button.dataset.option)];
        feedback.textContent = opt.feedback || (opt.correct ? 'Correct.' : 'Try again.');
        button.style.borderColor = opt.correct ? '#77d7a1' : '#ff6b62';
      });
    });
  }

  function stopAudio() {
    audio.pause();
    audio.currentTime = 0;
    audioBtn.classList.remove('playing');
    audioBtn.textContent = '▶';
  }

  async function playAudio() {
    try {
      await audio.play();
      audioBtn.classList.add('playing');
      audioBtn.textContent = '❚❚';
    } catch {
      audioBtn.title = 'Narration audio is not available yet';
    }
  }

  function updateChapterDialog() {
    chapterDialog.innerHTML = manifest.sections.map((s, i) => `<button type="button" data-chapter="${i}"><span class="n">${String(i+1).padStart(2,'0')}</span><span class="t">${escapeHtml(s.title)}</span></button>`).join('');
    chapterDialog.querySelectorAll('[data-chapter]').forEach(btn => btn.addEventListener('click', () => {
      chapterDialog.close();
      renderSection(Number(btn.dataset.chapter));
    }));
  }

  async function init() {
    if (!lessonKey) return fail('No lesson ID was supplied.');
    try {
      manifest = await getJson(`${sectionBase()}lesson.json`);
      if (!manifest.lessonId || manifest.lessonId !== lessonKey) throw new Error('Lesson manifest ID does not match the requested lesson.');
      if (!Array.isArray(manifest.sections) || !manifest.sections.length) throw new Error('Lesson has no sections.');

      document.documentElement.dataset.lessonId = manifest.lessonId;
      document.documentElement.dataset.lessonAccess = manifest.access || 'free';
      document.documentElement.dataset.lessonSection = manifest.section || '';
      document.documentElement.style.setProperty('--lp-accent', manifest.accent || '#e9a51b');
      back.href = manifest.backHref || ({fundamentals:'fundamentals.html',concepts:'clinical-concepts.html',cases:'cases.html'}[manifest.section] || 'hub.html');
      controls.hidden = false;
      audioBtn.hidden = false;

      const requested = qs.get('section');
      const start = requested ? Math.max(0, manifest.sections.findIndex(s => s.id === requested)) : 0;
      await renderSection(start);
    } catch (err) {
      fail(err.message || String(err));
    }
  }

  prev.addEventListener('click', () => renderSection(current - 1));
  next.addEventListener('click', () => renderSection(current + 1));
  audioBtn.addEventListener('click', () => audio.paused ? playAudio() : stopAudio());
  audioBtn.addEventListener('contextmenu', e => { e.preventDefault(); panelOpen = !panelOpen; audioPanel.hidden = !panelOpen; });
  let holdTimer;
  audioBtn.addEventListener('pointerdown', () => { holdTimer = setTimeout(() => { panelOpen = true; audioPanel.hidden = false; }, 450); });
  ['pointerup','pointercancel','pointerleave'].forEach(evt => audioBtn.addEventListener(evt, () => clearTimeout(holdTimer)));
  audio.addEventListener('ended', () => { audioBtn.classList.remove('playing'); audioBtn.textContent = '▶'; });

  audioPanel.querySelectorAll('[data-rate]').forEach(button => button.addEventListener('click', () => {
    audio.playbackRate = Number(button.dataset.rate);
    audioPanel.querySelectorAll('[data-rate]').forEach(b => b.classList.toggle('active', b === button));
  }));
  audioPanel.querySelector('[data-caption]').addEventListener('click', e => {
    captionsOn = !captionsOn;
    caption.hidden = !captionsOn;
    e.currentTarget.classList.toggle('active', captionsOn);
  });
  chapterBtn.addEventListener('click', () => chapterDialog.showModal());
  chapterDialog.addEventListener('click', e => { if (e.target === chapterDialog) chapterDialog.close(); });

  init();
})();
