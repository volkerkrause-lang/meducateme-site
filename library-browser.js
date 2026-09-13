(() => {
  const key=document.body.dataset.library;
  if(typeof C==='undefined'||!C[key]) return;
  const data=C[key];
  const config={
    cases:{eyebrow:'Symptoms & signs → clinical reasoning',title:'Cases',intro:'Start with the child in front of you. Work through the presentation before the diagnosis is revealed, then use physiology to explain every finding.',image:'meducate-torso.webp',placeholder:'Search fever, vomiting, weakness, jaundice…',flagLabel:'Flagship case'},
    concepts:{eyebrow:'Disease processes → mechanisms → decisions',title:'Clinical Concepts',intro:'Build the causal chain behind disease: what changed, what follows, what you see clinically and why treatment makes physiological sense.',image:'meducate-cells.webp',placeholder:'Search shock, hyponatraemia, asthma, AKI…',flagLabel:'Flagship concept'},
    fundamentals:{eyebrow:'Normal physiology → mental model',title:'Fundamentals',intro:'Understand normal function first. Build physiology systematically, then follow each mechanism into disease and the child at the bedside.',image:'meducate-brain.webp',placeholder:'Search cardiac output, ADH, V/Q, cortisol…',flagLabel:'Flagship fundamental'}
  }[key];
  const liveLessons={
    cases:{'Vomiting + deep breathing':'lesson.html?topic=dka','Hyponatremia':'case-hyponatremia.html'},
    concepts:{'Hyponatraemia':'concept-hyponatraemia.html'},
    fundamentals:{'Cortisol physiology':'fundamental-cortisol-guided.html'}
  }[key]||{};
  const reviewKey=href=>{if(!href)return null;if(href.includes('lesson.html'))return'dka';if(href.includes('case-hyponatremia'))return'hyponatremia_case';if(href.includes('concept-hyponatraemia'))return'hyponatraemia';if(href.includes('fundamental-cortisol'))return'cortisol';return null};
  const shell=document.querySelector('.learning-browser');if(!shell)return;
  const title=document.getElementById('preview-title'),desc=document.getElementById('preview-desc'),meta=document.getElementById('preview-meta'),status=document.getElementById('preview-status'),start=document.getElementById('preview-start'),visual=document.querySelector('.lesson-visual');
  const search=document.getElementById('browser-search'),list=document.getElementById('topic-scroll'),empty=document.getElementById('topic-empty');

  const actions=document.createElement('div');
  actions.className='lesson-actions';
  actions.innerHTML='<a class="lesson-action primary" id="lessonExplore"><span class="action-icon">→</span><span><b>Explore lesson</b><small>Start the guided teaching session</small></span></a><a class="lesson-action secondary" id="lessonFlash"><span class="action-icon">▦</span><span><b>Flashcards</b><small>Test the key ideas</small></span></a><a class="lesson-action secondary" id="lessonPicture"><span class="action-icon">◎</span><span><b>See the whole picture</b><small>View the lesson as one connected visual summary</small></span></a>';
  const copy=document.querySelector('.lesson-copy');
  if(copy){start.style.display='none';copy.appendChild(actions)}
  const explore=actions.querySelector('#lessonExplore'),flash=actions.querySelector('#lessonFlash'),picture=actions.querySelector('#lessonPicture');
  const style=document.createElement('style');style.textContent=`
  .lesson-copy{align-items:flex-end!important;gap:18px!important}.lesson-copy>div:first-child{min-width:0;flex:1}.lesson-actions{display:flex;gap:9px;align-items:stretch;flex-wrap:wrap;justify-content:flex-end;max-width:620px}.lesson-action{display:flex;align-items:center;gap:11px;min-height:58px;padding:10px 14px;border:1px solid #ffffff20;background:#0a0b0d;color:var(--ink)!important;text-decoration:none;transition:.2s ease}.lesson-action:hover{border-color:#e9a51b88;transform:translateY(-1px)}.lesson-action.primary{background:#e9a51b;color:#090a0c!important;border-color:#e9a51b;min-width:190px}.lesson-action.secondary{min-width:170px}.lesson-action .action-icon{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;border:1px solid currentColor;font-weight:900;font-size:16px;flex:0 0 34px}.lesson-action b{display:block;font-size:12px;letter-spacing:.04em}.lesson-action small{display:block;margin-top:3px;font-size:10px;line-height:1.25;color:var(--muted)}.lesson-action.primary small{color:#382506}.lesson-action.disabled{opacity:.42;pointer-events:none}.lesson-actions.review-hidden .secondary{display:none}@media(max-width:900px){.lesson-copy{align-items:flex-start!important;flex-direction:column!important}.lesson-actions{justify-content:flex-start;max-width:none;width:100%}.lesson-action{flex:1 1 180px}}@media(max-width:600px){.lesson-actions{display:grid;grid-template-columns:1fr 1fr;width:100%}.lesson-action.primary{grid-column:1/-1}.lesson-action{min-width:0!important}.lesson-action small{font-size:9px}}
  `;document.head.appendChild(style);

  document.getElementById('browser-eyebrow').textContent=config.eyebrow;
  document.getElementById('browser-section-title').textContent=config.title;
  document.getElementById('browser-section-intro').textContent=config.intro;
  search.placeholder=config.placeholder;
  visual.style.setProperty('--lesson-image',`url('${config.image}')`);
  let total=0;const flat=[];
  Object.entries(data.groups).forEach(([group,items],gi)=>{
    total+=items.length;const d=document.createElement('details');d.className='topic-group';if(gi<2)d.open=true;
    d.innerHTML=`<summary><h3>${group}</h3><span>${items.length} topics</span></summary><div class="topic-list"></div>`;
    const box=d.querySelector('.topic-list');
    items.forEach(raw=>{const [t,sub]=raw.split(' — ');const href=liveLessons[t]||null;const live=!!href;const b=document.createElement('button');b.type='button';b.className='topic-item'+(live?' live':'');b.dataset.search=(group+' '+raw).toLowerCase();b.dataset.title=t;b.dataset.group=group;b.dataset.desc=sub||'';b.dataset.live=live?'1':'0';b.dataset.href=href||'';b.innerHTML=`<span><strong>${t}</strong>${sub?`<small>${sub}</small>`:''}</span><em>${live?'Live':'Preview'}</em>`;box.appendChild(b);flat.push(b)});
    list.appendChild(d)
  });
  document.getElementById('topic-count').textContent=total+' topics';document.getElementById('group-count').textContent=Object.keys(data.groups).length+' sections';
  function showPreview(opts){
    flat.forEach(x=>x.classList.toggle('active',x===opts.el));title.textContent=opts.title;desc.textContent=opts.desc;meta.textContent=opts.meta;status.textContent=opts.live?'Live lesson':'Lesson preview';status.classList.toggle('lesson-live',opts.live);
    const rk=opts.live?reviewKey(opts.href):null;
    if(opts.live){explore.href=opts.href;explore.classList.remove('disabled');explore.removeAttribute('aria-disabled');actions.classList.toggle('review-hidden',!rk);if(rk){flash.href=`lesson-tools.html?lesson=${rk}#flashcards`;picture.href=`lesson-tools.html?lesson=${rk}#infographic`;}}
    else{explore.removeAttribute('href');explore.classList.add('disabled');explore.setAttribute('aria-disabled','true');actions.classList.add('review-hidden')}
    if(window.innerWidth<700){document.querySelector('.lesson-pane')?.scrollIntoView({behavior:'smooth',block:'start'})}
  }
  showPreview({title:data.flag.title,desc:data.flag.desc,meta:config.flagLabel,live:true,href:data.flag.href});
  list.addEventListener('click',e=>{const b=e.target.closest('.topic-item');if(!b)return;const live=b.dataset.live==='1';showPreview({el:b,title:b.dataset.title,desc:b.dataset.desc||(key==='cases'?'Work through this presentation step by step, then connect the clinical clues back to the underlying mechanism.':'Build this topic from first principles, then connect the mechanism to clinical findings and decisions.'),meta:b.dataset.group,live,href:live?b.dataset.href:null})});
  search.addEventListener('input',()=>{const s=search.value.trim().toLowerCase();let visible=0;list.querySelectorAll('.topic-group').forEach(g=>{let any=0;g.querySelectorAll('.topic-item').forEach(b=>{const on=!s||b.dataset.search.includes(s);b.classList.toggle('hidden',!on);if(on){any++;visible++}});g.classList.toggle('hidden',!any);if(s&&any)g.open=true});empty.style.display=visible?'none':'block'});
})();