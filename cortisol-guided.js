(() => {
  const REV = '20260917-cortisol-review';
  const stages = [...document.querySelectorAll('.stage')];
  const lessonAudio = document.querySelector('#lesson-audio');
  const feedbackAudio = document.querySelector('#feedback-audio');
  const startCard = document.querySelector('#start-card');
  const startGuided = document.querySelector('#start-guided');
  const startFree = document.querySelector('#start-free');
  const prevBtn = document.querySelector('#prev');
  const nextBtn = document.querySelector('#next');
  const caption = document.querySelector('#caption');
  const note = document.querySelector('#audio-note');
  const stepLabel = document.querySelector('#step-label');
  const stepTitle = document.querySelector('#step-title');
  const progressFill = document.querySelector('#progress-fill');
  const lessonProgress = document.querySelector('.lesson-progress');
  if (!stages.length || !lessonAudio || !feedbackAudio) return;

  // Content refinements from the 17 Sep review. Keeping these here makes the
  // revision reversible without disturbing the underlying lesson structure.
  const revisions = {
    '03-cholesterol': {
      title: 'The origin of cortisol',
      heading: 'The <em>origin of cortisol</em>',
      paragraphs: [
        'Cortisol is a steroid hormone made from cholesterol. Cholesterol is the common raw material from which the adrenal cortex builds cortisol and its other steroid hormones.',
        'That steroid structure matters because cortisol is lipid soluble: it can pass through the cell membrane rather than needing a surface receptor. It is made when required rather than stored in large secretory vesicles like a peptide hormone.'
      ]
    },
    '04-build': {
      title: 'How does cortisol work at cellular level?',
      heading: 'How does cortisol work at <em>cellular level</em>?',
      paragraphs: [
        'Cortisol diffuses through the cell membrane and binds an intracellular glucocorticoid receptor. The cortisol–glucocorticoid-receptor complex then moves into the nucleus.',
        'Inside the nucleus, the complex binds specific regulatory DNA sequences called glucocorticoid response elements and also interacts with other transcription factors. This changes which genes are transcribed, increasing some proteins and reducing others.',
        'Different tissues express different genes and regulatory machinery. So the same cortisol signal can produce different effects in liver, blood vessels, immune cells, bone, brain and growth tissues.'
      ]
    },
    '05-axis': {
      title: 'How does the HPA axis control cortisol release?',
      heading: 'How does the <em>HPA axis control cortisol release</em>?',
      paragraphs: [
        'HPA means hypothalamic–pituitary–adrenal axis: a control chain linking the brain to the adrenal gland. The hypothalamus releases corticotropin-releasing hormone (CRH). The anterior pituitary responds by releasing adrenocorticotropic hormone (ACTH). ACTH then stimulates the adrenal zona fasciculata to make cortisol.',
        'Cortisol feeds back to both the hypothalamus and pituitary and reduces further CRH and ACTH release. This negative-feedback loop prevents uncontrolled stimulation and keeps cortisol matched to the body’s needs.'
      ]
    },
    '06-actions': {
      title: 'Why does cortisol rise in the morning and during stress?',
      heading: 'Why does cortisol rise <em>in the morning and during stress</em>?',
      paragraphs: [
        'Cortisol follows a circadian rhythm. The brain’s central clock in the suprachiasmatic nucleus helps time pulsatile HPA-axis activity, so cortisol begins rising before waking, peaks in the early morning and then falls towards its lowest levels around midnight.',
        'The pre-waking rise helps prepare the body for activity: fuel availability and cardiovascular responsiveness increase before the demands of the day begin. Physiological stress—such as infection, trauma, surgery, fasting or hypoglycaemia—can add extra HPA-axis drive on top of this daily rhythm.',
        'The unifying idea is adaptation. Cortisol helps the body keep functioning when demand changes, rather than simply being a “stress hormone”.'
      ]
    },
    '07-deficiency': {
      title: 'How does cortisol protect blood glucose during stress?',
      heading: 'How does cortisol protect <em>blood glucose during stress</em>?',
      paragraphs: [
        'During fasting or illness, the body cannot rely on a meal arriving on time. Cortisol supports hepatic gluconeogenesis and helps mobilise amino acids and fatty acids, preserving a supply of usable fuel.',
        'The evolutionary logic is short-term survival: during injury, infection, fasting or threat, the brain and working tissues still need energy even when intake falls and demand rises. Cortisol therefore helps prevent fuel shortage rather than simply “making glucose high”.'
      ]
    },
    '08-localise': {
      title: 'How does cortisol mobilise protein and fat?',
      heading: 'How does cortisol mobilise <em>protein and fat</em>?',
      paragraphs: [
        'Cortisol promotes protein catabolism in peripheral tissues, releasing amino acids that can support hepatic glucose production and other immediate priorities. It also promotes mobilisation of fatty acids, providing an alternative energy source.',
        'From an evolutionary perspective this reallocates stored resources towards immediate survival. In the short term that is adaptive; if cortisol remains excessive for weeks or months, the same catabolic programme produces muscle wasting, thin skin, impaired growth and tissue fragility.'
      ]
    },
    '09-cah': {
      title: 'How does cortisol help maintain blood pressure?',
      heading: 'How does cortisol help maintain <em>blood pressure</em>?',
      paragraphs: [
        'Cortisol has a permissive effect on the circulation: it helps blood vessels respond normally to vasoconstrictors such as noradrenaline and adrenaline, supporting vascular tone when the body is under pressure.',
        'This fits the same overall purpose—preserving perfusion during physiological stress. In severe cortisol deficiency, catecholamines may still be present but vascular responsiveness is blunted, so hypotension can be unusually difficult to correct.'
      ]
    },
    '10-21oh': {
      title: 'How does cortisol restrain inflammation?',
      heading: 'How does cortisol <em>restrain inflammation</em>?',
      paragraphs: [
        'Inflammation is essential for defence and repair, but an unrestricted response can damage the body’s own tissues. Cortisol changes transcription of inflammatory mediators and dampens several immune signalling pathways, acting as a physiological brake.',
        'Again, the benefit is balance during short-term stress: enough inflammation to defend the body without uncontrolled collateral damage. Chronic cortisol excess pushes this useful restraint too far, increasing infection risk and impairing wound healing.'
      ]
    },
    '11-crisis': {
      title: 'How does excess cortisol impair growth, bone and tissue?',
      heading: 'How does excess cortisol impair <em>growth, bone and tissue</em>?',
      paragraphs: [
        'The key distinction is short-term adaptation versus chronic exposure. Cortisol temporarily redirects resources away from expensive long-term processes when immediate survival has priority.',
        'With prolonged excess, protein catabolism persists, osteoblast-driven bone formation falls, calcium balance becomes less favourable, and growth-hormone/IGF-1 signalling is opposed. Muscle and connective tissue are also continually broken down.',
        'So an adaptive short-term programme becomes harmful when it stays switched on. In paediatrics, reduced linear growth can therefore be an important early clue to chronic cortisol excess.'
      ]
    },
    '12-contrast': {
      title: 'Cortisol excess and deficiency',
      heading: '<em>Cortisol excess and deficiency</em>',
      paragraphs: [
        'Now run the normal physiology in both directions. Deficiency removes fuel support, vascular responsiveness and stress adaptation; chronic excess exaggerates glucose production, catabolism and immune restraint.'
      ]
    },
    '13-reconstruct': {
      title: 'Bringing everything together',
      heading: 'Bringing <em>everything together</em>',
      paragraphs: [
        'Cortisol is a cholesterol-derived steroid made mainly in the adrenal zona fasciculata. The hypothalamic–pituitary–adrenal axis controls its release, while the circadian clock and physiological stress determine when more is needed.',
        'Its general purpose is adaptation: keep fuel available, preserve cardiovascular responsiveness, prevent inflammation from overshooting, and temporarily redirect resources away from long-term growth and tissue building when immediate demands take priority.',
        'That gives one model rather than a list of facts: short-term cortisol responses are protective; too little causes failure of stress adaptation, while prolonged excess turns the same protective mechanisms into pathology.'
      ]
    }
  };

  function applyRevisions(){
    stages.forEach(stage => {
      const r = revisions[stage.dataset.stage];
      if (!r) return;
      stage.dataset.title = r.title;
      const h = stage.querySelector('h1,h2');
      if (h) h.innerHTML = r.heading;
      const left = stage.firstElementChild;
      if (!left) return;
      const old = [...left.children].filter(el => el.tagName === 'P');
      old.forEach(el => el.remove());
      const checkpoint = left.querySelector('.checkpoint');
      r.paragraphs.forEach((text,i) => {
        const p=document.createElement('p');
        p.className=(i===r.paragraphs.length-1 && stage.dataset.stage==='13-reconstruct')?'lead cue':'cue';
        p.dataset.cue=String([.15,.36,.62][i] ?? .62);
        p.textContent=text;
        left.insertBefore(p,checkpoint || null);
      });
    });
  }
  applyRevisions();

  let scripts = {};
  let feedbackScripts = {};
  let current = 0;
  let guided = true;
  let captionsOn = false;
  let muted = false;
  let wantsPlayback = false;
  let stageComplete = false;
  let holdTimer = null;
  let held = false;

  lessonAudio.preservesPitch = true;
  feedbackAudio.preservesPitch = true;

  const navCount = document.createElement('span');
  navCount.className = 'cort-nav-count';
  navCount.setAttribute('aria-live', 'polite');
  prevBtn.insertAdjacentElement('afterend', navCount);

  const orb = document.createElement('button');
  orb.className = 'cort-audio-orb';
  orb.type = 'button';
  orb.setAttribute('aria-label', 'Play narration. Hold for options');
  orb.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a8 8 0 0 0-8 8v6a3 3 0 0 0 3 3h2v-8H6v-1a6 6 0 0 1 12 0v1h-3v8h2a3 3 0 0 0 3-3v-6a8 8 0 0 0-8-8Z"/></svg>';

  const panel = document.createElement('div');
  panel.className = 'cort-audio-panel';
  panel.innerHTML = '<button data-rate="0.8">0.8×</button><button data-rate="1" class="active">1×</button><button data-rate="1.25">1.25×</button><button data-rate="1.5">1.5×</button><button data-cc>CC</button><button data-mute>🔊</button><button data-mode>Explore</button>';
  document.body.append(orb, panel);

  const chapterMenu = document.createElement('div');
  chapterMenu.className = 'cort-chapter-menu';
  chapterMenu.setAttribute('role', 'dialog');
  chapterMenu.setAttribute('aria-label', 'Choose lesson chapter');
  chapterMenu.innerHTML = stages.map((s,i)=>`<button type="button" data-chapter="${i}"><span class="num">${String(i+1).padStart(2,'0')}</span><span class="ttl">${s.dataset.title || `Step ${i+1}`}</span></button>`).join('');
  document.body.append(chapterMenu);

  const id = () => stages[current]?.dataset.stage || '';
  const stageScript = () => scripts[id()]?.script || [...stages[current].querySelectorAll(':scope > div:first-child > p')].map(p=>p.textContent).join(' ');
  const mediaUrl = filename => {
    const u = new URL(`audio/cortisol-chatterbox/${filename}`, document.baseURI);
    u.searchParams.set('v', REV);
    return u.href;
  };

  function setNote(text, flash=false){ note.textContent=text; orb.title=text; note.classList.toggle('show',flash); if(flash){clearTimeout(setNote.t);setNote.t=setTimeout(()=>note.classList.remove('show'),1800);} }
  function setPlayState(playing){ orb.classList.toggle('playing',playing); orb.setAttribute('aria-label',playing?'Pause narration. Hold for options':'Play narration. Hold for options'); }
  function syncPanel(){ panel.querySelectorAll('[data-rate]').forEach(b=>b.classList.toggle('active',Number(b.dataset.rate)===lessonAudio.playbackRate)); panel.querySelector('[data-cc]').classList.toggle('active',captionsOn); panel.querySelector('[data-mute]').classList.toggle('active',muted); panel.querySelector('[data-mute]').textContent=muted?'🔇':'🔊'; panel.querySelector('[data-mode]').textContent=guided?'Explore':'Guided'; panel.querySelector('[data-mode]').classList.toggle('active',!guided); }
  function setCaption(extra=''){ caption.textContent=extra?`${stageScript()}\n\n${extra}`:stageScript(); caption.classList.toggle('open',captionsOn); }
  function revealFraction(f){ if(!guided)return; const value=Math.max(0,Math.min(1,f||0)); stages[current].querySelectorAll('.cue').forEach(el=>el.classList.toggle('is-on',Number(el.dataset.cue||0)<=value+.001)); progressFill.style.width=`${((current+value)/stages.length)*100}%`; }
  function revealAll(){ stages[current].querySelectorAll('.cue').forEach(el=>el.classList.add('is-on')); progressFill.style.width=`${((current+1)/stages.length)*100}%`; }
  function resetReveals(){ stages[current].querySelectorAll('.cue').forEach(el=>el.classList.remove('is-on')); stages[current].querySelectorAll('.cue').forEach(el=>{if(!guided||Number(el.dataset.cue||0)<=.04)el.classList.add('is-on');}); }
  function resetCheckpoint(){ stages[current].querySelectorAll('.checkpoint').forEach(q=>{q.classList.remove('ready');q.querySelectorAll('button').forEach(b=>{b.disabled=false;b.classList.remove('good','bad');});const f=q.querySelector('.feedback');if(f)f.textContent='';}); }
  function showCheckpoint(){const q=stages[current].querySelector('.checkpoint');if(q)q.classList.add('ready');}
  function completeStage(){stageComplete=true;revealAll();showCheckpoint();setPlayState(false);setNote(stages[current].querySelector('.checkpoint')?'Make your prediction':'Section complete',true);}
  function stopAll(){wantsPlayback=false;lessonAudio.pause();feedbackAudio.pause();setPlayState(false);}
  function loadStageAudio(){lessonAudio.pause();lessonAudio.src=mediaUrl(`${id()}.mp3`);lessonAudio.load();}
  function updateUI(){stages.forEach((s,i)=>s.classList.toggle('active',i===current));document.body.classList.toggle('free',!guided);stepLabel.textContent=`STEP ${current+1}`;stepTitle.textContent=stages[current].dataset.title||'';navCount.textContent=`${current+1} / ${stages.length}`;prevBtn.disabled=current===0;nextBtn.disabled=current===stages.length-1;chapterMenu.querySelectorAll('[data-chapter]').forEach((b,i)=>b.classList.toggle('current',i===current));stageComplete=false;resetCheckpoint();resetReveals();setCaption();loadStageAudio();if(!guided)revealAll();}
  function go(index,autoplay=false){stopAll();current=Math.max(0,Math.min(stages.length-1,index));chapterMenu.classList.remove('open');updateUI();if(autoplay&&guided)play();}
  async function play(){if(!guided){setNote('Explore mode',true);return;}if(!lessonAudio.src)loadStageAudio();try{lessonAudio.muted=muted;await lessonAudio.play();wantsPlayback=true;setPlayState(true);setNote('Narration playing');}catch(e){wantsPlayback=false;setPlayState(false);revealAll();setNote('Narration audio unavailable',true);}}
  function togglePlay(){lessonAudio.paused?play():(lessonAudio.pause(),wantsPlayback=false,setPlayState(false));}

  lessonAudio.addEventListener('timeupdate',()=>{if(lessonAudio.duration&&isFinite(lessonAudio.duration))revealFraction(lessonAudio.currentTime/lessonAudio.duration);});
  lessonAudio.addEventListener('ended',completeStage);
  lessonAudio.addEventListener('play',()=>setPlayState(true));
  lessonAudio.addEventListener('pause',()=>{if(!lessonAudio.ended)setPlayState(false);});
  lessonAudio.addEventListener('error',()=>{revealAll();showCheckpoint();setNote('Narration audio unavailable',true);});

  function answer(button){const q=button.closest('.checkpoint');q.querySelectorAll('button').forEach(b=>b.disabled=true);const key=button.dataset.feedbackKey||(button.dataset.correct==='true'?'correct':'wrong');const correct=button.dataset.correct==='true';button.classList.add(correct?'good':'bad');const text=feedbackScripts[id()]?.[key]||(correct?'Correct.':'Not quite.');q.querySelector('.feedback').textContent=text;setCaption(text);feedbackAudio.src=mediaUrl(`${id()}-${key}.mp3`);feedbackAudio.muted=muted;feedbackAudio.playbackRate=lessonAudio.playbackRate;feedbackAudio.play().catch(()=>{});}
  document.addEventListener('click',e=>{const b=e.target.closest('.answers button');if(b)answer(b);const c=e.target.closest('[data-chapter]');if(c)go(Number(c.dataset.chapter),false);});

  prevBtn.addEventListener('click',()=>go(current-1,false));
  nextBtn.addEventListener('click',()=>go(current+1,false));
  lessonProgress.setAttribute('role','button');lessonProgress.setAttribute('tabindex','0');lessonProgress.title='Choose chapter';
  lessonProgress.addEventListener('click',()=>chapterMenu.classList.toggle('open'));
  lessonProgress.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();chapterMenu.classList.toggle('open');}});

  function openPanel(){held=true;panel.classList.add('open');}
  orb.addEventListener('pointerdown',()=>{held=false;holdTimer=setTimeout(openPanel,420);});
  orb.addEventListener('pointerup',()=>{clearTimeout(holdTimer);if(!held)togglePlay();});
  orb.addEventListener('pointercancel',()=>clearTimeout(holdTimer));
  // Once opened by a hold, the options stay visible until the learner chooses
  // an option or taps elsewhere. This makes moving to CC or a speed reliable.
  document.addEventListener('pointerdown',e=>{if(panel.classList.contains('open')&&!panel.contains(e.target)&&e.target!==orb)panel.classList.remove('open');});
  panel.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.rate){const r=Number(b.dataset.rate);lessonAudio.playbackRate=r;feedbackAudio.playbackRate=r;}if(b.hasAttribute('data-cc')){captionsOn=!captionsOn;setCaption();}if(b.hasAttribute('data-mute')){muted=!muted;lessonAudio.muted=muted;feedbackAudio.muted=muted;}if(b.hasAttribute('data-mode')){guided=!guided;stopAll();updateUI();}syncPanel();panel.classList.remove('open');});

  startGuided.addEventListener('click',()=>{guided=true;startCard.hidden=true;updateUI();syncPanel();play();});
  startFree.addEventListener('click',()=>{guided=false;startCard.hidden=true;updateUI();syncPanel();});

  fetch(`narration/cortisol-guided.json?v=${REV}`)
    .then(r=>r.json())
    .then(data=>{data.stages.forEach(s=>{scripts[s.id]=s;feedbackScripts[s.id]=s.feedback||{};});setCaption();})
    .catch(()=>setNote('Narration script unavailable',true));

  updateUI();syncPanel();
})();