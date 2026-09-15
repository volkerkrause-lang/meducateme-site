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

  async function init() {
    try {
      const registry = await getJson('lessons/registry.json');
      const entries = registry.lessons || [];
      const counts = {draft:0, review:0, live:0};
      entries.forEach(x => { if (counts[x.status] !== undefined) counts[x.status]++; });
      summary.innerHTML = [
        `<span class="qa-pill">${entries.length} modular lessons</span>`,
        `<span class="qa-pill">${counts.draft} draft</span>`,
        `<span class="qa-pill">${counts.review} review</span>`,
        `<span class="qa-pill">${counts.live} live</span>`
      ].join('');
      if (!entries.length) {
        list.innerHTML = '<div class="qa-empty">No future modular lessons have been created yet. Existing legacy lessons are intentionally not included.</div>';
        return;
      }
      const results = await Promise.all(entries.map(inspect));
      list.innerHTML = results.map(({entry,manifest,sections,content,narration,audio}) => {
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
    } catch (err) {
      list.innerHTML = `<div class="qa-empty">Dashboard could not load: ${esc(err.message || err)}</div>`;
    }
  }
  init();
})();
