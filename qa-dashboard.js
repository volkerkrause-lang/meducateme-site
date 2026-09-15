(() => {
  const list = document.getElementById('qa-list');
  const summary = document.getElementById('qa-summary');

  async function getJson(path) {
    const r = await fetch(path, {cache:'no-store'});
    if (!r.ok) throw new Error(`${path}: ${r.status}`);
    return r.json();
  }

  async function exists(path) {
    try {
      const r = await fetch(path, {method:'HEAD', cache:'no-store'});
      return r.ok;
    } catch { return false; }
  }

  const esc = s => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  async function inspect(entry) {
    const manifest = await getJson(entry.manifest);
    const base = entry.manifest.replace(/lesson\.json$/, '');
    let content = 0, narration = 0, audio = 0, custom = 0;
    const sections = manifest.sections || [];
    await Promise.all(sections.map(async sec => {
      const checks = await Promise.all([
        sec.contentRef ? exists(base + sec.contentRef) : false,
        sec.narrationRef ? exists(base + sec.narrationRef) : false,
        sec.audioRef ? exists(base + sec.audioRef) : false,
        sec.customModule ? exists(base + sec.customModule) : true
      ]);
      if (checks[0]) content++;
      if (checks[1]) narration++;
      if (checks[2]) audio++;
      if (checks[3] && sec.customModule) custom++;
    }));
    return {entry, manifest, sections, content, narration, audio, custom};
  }

  function check(label, ok, warn=false) {
    return `<span class="qa-check ${ok ? 'ok' : warn ? 'warn' : 'bad'}">${esc(label)}</span>`;
  }

  function legacyCards() {
    const lessons = window.MeducateMeLessons?.all || [];
    return lessons.map(lesson => `
      <article class="qa-card">
        <div>
          <div class="qa-meta"><span class="qa-tag" data-status="live">live</span><span class="qa-tag">${esc(lesson.section)}</span><span class="qa-tag">${esc(lesson.access)}</span><span class="qa-tag">legacy</span></div>
          <h2>${esc(lesson.title)}</h2>
          <div class="qa-checks">
            ${check('live lesson', true)}
            ${check('legacy architecture', true, true)}
            ${check('section-level QA not migrated', false, true)}
          </div>
        </div>
        <div class="qa-actions"><a href="${esc(lesson.href)}">Open lesson</a></div>
      </article>`).join('');
  }

  async function init() {
    try {
      const registry = await getJson('lessons/registry.json');
      const entries = registry.lessons || [];
      const legacy = window.MeducateMeLessons?.all || [];
      const counts = {draft:0, review:0, live:legacy.length};
      entries.forEach(x => {
        if (counts[x.status] !== undefined) counts[x.status]++;
      });
      summary.innerHTML = [
        `<span class="qa-pill">${legacy.length} legacy live</span>`,
        `<span class="qa-pill">${entries.length} modular lessons</span>`,
        `<span class="qa-pill">${counts.draft} draft</span>`,
        `<span class="qa-pill">${counts.review} review</span>`,
        `<span class="qa-pill">${counts.live} live total</span>`
      ].join('');

      const legacyHtml = legacy.length ? `<h2 style="margin:24px 0 10px">Live lessons</h2>${legacyCards()}` : '';

      if (!entries.length) {
        list.innerHTML = legacyHtml + '<div class="qa-empty">No future modular lessons have been created yet.</div>';
        return;
      }

      const results = await Promise.all(entries.map(inspect));
      const modularHtml = `<h2 style="margin:32px 0 10px">Modular lessons</h2>` + results.map(({entry,manifest,sections,content,narration,audio}) => {
        const n = sections.length;
        const refs = (manifest.references || []).length;
        return `<article class="qa-card">
          <div>
            <div class="qa-meta"><span class="qa-tag" data-status="${esc(manifest.status)}">${esc(manifest.status)}</span><span class="qa-tag">${esc(manifest.section)}</span><span class="qa-tag">${esc(manifest.access)}</span></div>
            <h2>${esc(manifest.title)}</h2>
            <div class="qa-checks">
              ${check(`${content}/${n} content`, content===n)}
              ${check(`${narration}/${n} narration`, narration===n)}
              ${check(`${audio}/${n} audio`, audio===n, manifest.status!=='live')}
              ${check(`${refs} references`, refs>0, manifest.status==='draft')}
              ${check('permanent section IDs', new Set(sections.map(s=>s.id)).size===n)}
            </div>
          </div>
          <div class="qa-actions"><a href="lesson-player.html?lesson=${encodeURIComponent(entry.lessonId)}">Open lesson</a></div>
        </article>`;
      }).join('');

      list.innerHTML = legacyHtml + modularHtml;
    } catch (err) {
      list.innerHTML = `<div class="qa-empty">Dashboard could not load: ${esc(err.message || err)}</div>`;
    }
  }
  init();
})();
