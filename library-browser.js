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
  const shell=document.querySelector('.learning-browser');
  if(!shell)return;
  const title=document.getElementById('preview-title'),desc=document.getElementById('preview-desc'),meta=document.getElementById('preview-meta'),status=document.getElementById('preview-status'),start=document.getElementById('preview-start'),visual=document.querySelector('.lesson-visual');
  const search=document.getElementById('browser-search'),list=document.getElementById('topic-scroll'),empty=document.getElementById('topic-empty');
  const quick=document.createElement('div');quick.className='lesson-quick-tools';quick.innerHTML='<a class="quick-tool flash" aria-label="Open flashcards" title="Flashcards">◫</a><a class="quick-tool info" aria-label="Open infographic" title="Infographic">⌁</a>';start.insertAdjacentElement('beforebegin',quick);
  const quickStyle=document.createElement('style');quickStyle.textContent='.lesson-quick-tools{display:none;align-items:center;gap:8px;margin-left:auto;margin-right:10px}.lesson-quick-tools.show{display:flex}.quick-tool{width:38px;height:38px;border:1px solid #ffffff2a;border-radius:50%;display:grid;place-items:center;background:#0c0d10d9;color:#e9a51b!important;font-size:18px;text-decoration:none;box-shadow:0 8px 22px #0007}.quick-tool:hover{border-color:#e9a51b}.lesson-copy{align-items:center}.lesson-copy>div:first-child{min-width:0}@media(max-width:700px){.lesson-quick-tools{margin-left:0;margin-right:6px}.quick-tool{width:36px;height:36px}}';document.head.appendChild(quickStyle);
  document.getElementById('browser-eyebrow').textContent=config.eyebrow;
  document.getElementById('browser-section-title').textContent=config.title;
  document.getElementById('browser-section-intro').textContent=config.intro;
  search.placeholder=config.placeholder;
  visual.style.setProperty('--lesson-image',`url('${config.image}')`);
  let total=0;
  const flat=[];
  Object.entries(data.groups).forEach(([group,items],gi)=>{
    total+=items.length;
    const d=document.createElement('details');d.className='topic-group';if(gi<2)d.open=true;
    d.innerHTML=`<summary><h3>${group}</h3><span>${items.length} topics</span></summary><div class="topic-list"></div>`;
    const box=d.querySelector('.topic-list');
    items.forEach(raw=>{
      const [t,sub]=raw.split(' — ');const href=liveLessons[t]||null;const live=!!href;
      const b=document.createElement('button');b.type='button';b.className='topic-item'+(live?' live':'');
      b.dataset.search=(group+' '+raw).toLowerCase();b.dataset.title=t;b.dataset.group=group;b.dataset.desc=sub||'';b.dataset.live=live?'1':'0';b.dataset.href=href||'';
      b.innerHTML=`<span><strong>${t}</strong>${sub?`<small>${sub}</small>`:''}</span><em>${live?'Live':'Preview'}</em>`;
      box.appendChild(b);flat.push(b);
    });
    list.appendChild(d);
  });
  document.getElementById('topic-count').textContent=total+' topics';
  document.getElementById('group-count').textContent=Object.keys(data.groups).length+' sections';
  function showPreview(opts){
    flat.forEach(x=>x.classList.toggle('active',x===opts.el));
    title.textContent=opts.title;desc.textContent=opts.desc;meta.textContent=opts.meta;
    status.textContent=opts.live?'Live lesson':'Lesson preview';status.classList.toggle('lesson-live',opts.live);
    const rk=opts.live?reviewKey(opts.href):null;
    quick.classList.toggle('show',!!rk);if(rk){quick.querySelector('.flash').href=`lesson-tools.html?lesson=${rk}#flashcards`;quick.querySelector('.info').href=`lesson-tools.html?lesson=${rk}#infographic`;}
    if(opts.live){start.textContent='Start lesson →';start.href=opts.href;start.classList.remove('disabled');start.removeAttribute('aria-disabled');}
    else{start.textContent='Coming soon';start.removeAttribute('href');start.classList.add('disabled');start.setAttribute('aria-disabled','true');}
    if(window.innerWidth<700){document.querySelector('.lesson-pane')?.scrollIntoView({behavior:'smooth',block:'start'});}
  }
  showPreview({title:data.flag.title,desc:data.flag.desc,meta:config.flagLabel,live:true,href:data.flag.href});
  list.addEventListener('click',e=>{const b=e.target.closest('.topic-item');if(!b)return;const live=b.dataset.live==='1';showPreview({el:b,title:b.dataset.title,desc:b.dataset.desc||(key==='cases'?'Work through this presentation step by step, then connect the clinical clues back to the underlying mechanism.':'Build this topic from first principles, then connect the mechanism to clinical findings and decisions.'),meta:b.dataset.group,live,href:live?b.dataset.href:null});});
  search.addEventListener('input',()=>{const s=search.value.trim().toLowerCase();let visible=0;list.querySelectorAll('.topic-group').forEach(g=>{let any=0;g.querySelectorAll('.topic-item').forEach(b=>{const on=!s||b.dataset.search.includes(s);b.classList.toggle('hidden',!on);if(on){any++;visible++;}});g.classList.toggle('hidden',!any);if(s&&any)g.open=true;});empty.style.display=visible?'none':'block';});
})();