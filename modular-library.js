(() => {
  const section = document.body.dataset.library;
  const list = document.getElementById('topic-scroll');
  if (!section || !list) return;

  const esc = s => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  async function init() {
    try {
      const r = await fetch('lessons/registry.json', {cache:'no-store'});
      if (!r.ok) return;
      const registry = await r.json();
      const live = (registry.lessons || []).filter(x => x.section === section && x.status === 'live');
      if (!live.length) return;

      const groups = new Map();
      live.forEach(item => {
        const group = item.group || 'New lessons';
        if (!groups.has(group)) groups.set(group, []);
        groups.get(group).push(item);
      });

      groups.forEach((items, group) => {
        const details = document.createElement('details');
        details.className = 'topic-group modular-topic-group';
        details.open = true;
        details.innerHTML = `<summary><h3>${esc(group)}</h3><span>${items.length} ${items.length === 1 ? 'topic' : 'topics'}</span></summary><div class="topic-list"></div>`;
        const box = details.querySelector('.topic-list');
        items.forEach(item => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'topic-item live';
          b.dataset.search = `${group} ${item.title} ${item.description || ''}`.toLowerCase();
          b.dataset.title = item.title;
          b.dataset.group = group;
          b.dataset.desc = item.description || '';
          b.dataset.live = '1';
          b.dataset.href = `lesson-player.html?lesson=${encodeURIComponent(item.lessonId)}`;
          b.dataset.lessonId = item.lessonId;
          b.dataset.access = item.access || 'free';
          b.innerHTML = `<span><strong>${esc(item.title)}</strong>${item.description ? `<small>${esc(item.description)}</small>` : ''}</span><em>Live</em>`;
          b.addEventListener('click', () => {
            list.querySelectorAll('.topic-item').forEach(x => x.classList.toggle('active', x === b));
          });
          box.appendChild(b);
        });
        list.appendChild(details);
      });

      const topicCount = document.getElementById('topic-count');
      const groupCount = document.getElementById('group-count');
      const oldTopics = parseInt(topicCount?.textContent || '0', 10) || 0;
      const oldGroups = parseInt(groupCount?.textContent || '0', 10) || 0;
      if (topicCount) topicCount.textContent = `${oldTopics + live.length} topics`;
      if (groupCount) groupCount.textContent = `${oldGroups + groups.size} sections`;
    } catch (err) {
      console.warn('Modular lesson registry could not be loaded', err);
    }
  }

  init();
})();
