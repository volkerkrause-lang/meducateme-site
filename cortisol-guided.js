(() => {
  const REV = '20260915-cortisol-fundamentals';
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
  let suppressClick = false;

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
  const stageScript = () => scripts[id()]?.script || '';
  const mediaUrl = filename => {
    const u = new URL(`audio/cortisol-chatterbox/${filename}`, document.baseURI);
    u.searchParams.set('v', REV);
    return u.href;
  };

  function setNote(text, flash=false){
    note.textContent = text;
    orb.title = text;
    note.classList.toggle('show', flash);
    if (flash) { clearTimeout(setNote.t); setNote.t=setTimeout(()=>note.classList.remove('show'),1800); }
  }
  function setPlayState(playing){
    orb.classList.toggle('playing', playing);
    orb.setAttribute('aria-label', playing ? 'Pause narration. Hold for options' : 'Play narration. Hold for options');
  }
  function syncPanel(){
    panel.querySelectorAll('[data-rate]').forEach(b=>b.classList.toggle('active', Number(b.dataset.rate)===lessonAudio.playbackRate));
    panel.querySelector('[data-cc]').classList.toggle('active',captionsOn);
    panel.querySelector('[data-mute]').classList.toggle('active',muted);
    panel.querySelector('[data-mute]').textContent=muted?'🔇':'🔊';
    panel.querySelector('[data-mode]').textContent=guided?'Explore':'Guided';
    panel.querySelector('[data-mode]').classList.toggle('active',!guided);
    orb.classList.toggle('free-mode',!guided);
  }
  function setCaption(extra=''){
    caption.textContent = extra ? `${stageScript()}\n\n${extra}` : stageScript();
    caption.classList.toggle('open', captionsOn);
  }
  function revealFraction(f){
    if (!guided) return;
    const value=Math.max(0,Math.min(1,f||0));
    stages[current].querySelectorAll('.cue').forEach(el=>el.classList.toggle('is-on',Number(el.dataset.cue||0)<=value+.001));
    progressFill.style.width=`${((current+value)/stages.length)*100}%`;
  }
  function revealAll(){
    stages[current].querySelectorAll('.cue').forEach(el=>el.classList.add('is-on'));
    progressFill.style.width=`${((current+1)/stages.length)*100}%`;
  }
  function resetReveals(){
    stages[current].querySelectorAll('.cue').forEach(el=>el.classList.remove('is-on'));
    stages[current].querySelectorAll('.cue').forEach(el=>{if(!guided || Number(el.dataset.cue||0)<=.04) el.classList.add('is-on');});
  }
  function resetCheckpoint(){
    stages[current].querySelectorAll('.checkpoint').forEach(q=>{
      q.classList.remove('ready');
      q.querySelectorAll('button').forEach(b=>{b.disabled=false;b.classList.remove('good','bad');});
      const f=q.querySelector('.feedback'); if(f) f.textContent='';
    });
  }
  function showCheckpoint(){ const q=stages[current].querySelector('.checkpoint'); if(q) q.classList.add('ready'); }
  function completeStage(){ stageComplete=true; revealAll(); showCheckpoint(); setPlayState(false); setNote(stages[current].querySelector('.checkpoint')?'Make your prediction':'Section complete',true); }
  function stopAll(){ wantsPlayback=false; lessonAudio.pause(); feedbackAudio.pause(); setPlayState(false); }
  function loadStageAudio(){
    lessonAudio.pause();
    lessonAudio.src=mediaUrl(`${id()}.mp3`);
    lessonAudio.load();
  }
  function updateUI(){
    stages.forEach((s,i)=>s.classList.toggle('active',i===current));
    document.body.classList.toggle('free',!guided);
    stepLabel.textContent=`STEP ${current+1}`;
    stepTitle.textContent=stages[current].dataset.title||'';
    navCount.textContent=`${current+1} / ${stages.length}`;
    prevBtn.disabled=current===0;
    nextBtn.disabled=current===stages.length-1;
    chapterMenu.querySelectorAll('[data-chapter]').forEach((b,i)=>b.classList.toggle('current',i===current));
    stageComplete=false;
    resetCheckpoint(); resetReveals(); setCaption(); loadStageAudio();
    if(!guided) revealAll();
  }
  function go(index,autoplay=false){
    stopAll();
    current=Math.max(0,Math.min(stages.length-1,index));
    chapterMenu.classList.remove('open');
    updateUI();
    if(autoplay && guided) play();
  }
  async function play(){
    if(!guided){setNote('Explore mode',true);return;}
    if(!lessonAudio.src) loadStageAudio();
    try{
      lessonAudio.muted=muted;
      await lessonAudio.play();
      wantsPlayback=true;
      setPlayState(true);
      setNote('Narration playing');
    }catch(e){
      wantsPlayback=false;
      setPlayState(false);
      revealAll();
      setNote('Narration audio is still being generated',true);
    }
  }
  function togglePlay(){ lessonAudio.paused ? play() : (lessonAudio.pause(),wantsPlayback=false,setPlayState(false)); }

  lessonAudio.addEventListener('timeupdate',()=>{
    if(lessonAudio.duration && isFinite(lessonAudio.duration)) revealFraction(lessonAudio.currentTime/lessonAudio.duration);
  });
  lessonAudio.addEventListener('ended',completeStage);
  lessonAudio.addEventListener('play',()=>setPlayState(true));
  lessonAudio.addEventListener('pause',()=>{if(!lessonAudio.ended)setPlayState(false);});
  lessonAudio.addEventListener('error',()=>{revealAll();showCheckpoint();setNote('Narration audio unavailable',true);});

  function answer(button){
    const q=button.closest('.checkpoint');
    q.querySelectorAll('button').forEach(b=>b.disabled=true);
    const key=button.dataset.feedbackKey || (button.dataset.correct==='true'?'correct':'wrong');
    const correct=button.dataset.correct==='true';
    button.classList.add(correct?'good':'bad');
    const text=feedbackScripts[id()]?.[key] || (correct?'Correct.':'Not quite.');
    q.querySelector('.feedback').textContent=text;
    setCaption(text);
    const src=mediaUrl(`${id()}-${key}.mp3`);
    feedbackAudio.src=src; feedbackAudio.muted=muted; feedbackAudio.playbackRate=lessonAudio.playbackRate;
    feedbackAudio.play().catch(()=>{});
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('.answers button'); if(b) answer(b);
    const c=e.target.closest('[data-chapter]'); if(c) go(Number(c.dataset.chapter),false);
  });

  prevBtn.addEventListener('click',()=>go(current-1,false));
  nextBtn.addEventListener('click',()=>go(current+1,false));
  lessonProgress.setAttribute('role','button'); lessonProgress.setAttribute('tabindex','0'); lessonProgress.title='Choose chapter';
  lessonProgress.addEventListener('click',()=>chapterMenu.classList.toggle('open'));
  lessonProgress.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();chapterMenu.classList.toggle('open');}});

  function openPanel(){held=true;panel.classList.add('open');}
  orb.addEventListener('pointerdown',()=>{held=false;holdTimer=setTimeout(openPanel,420);});
  orb.addEventListener('pointerup',()=>{clearTimeout(holdTimer);if(!held)togglePlay();else setTimeout(()=>panel.classList.remove('open'),900);});
  orb.addEventListener('pointercancel',()=>clearTimeout(holdTimer));
  panel.addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b)return;
    if(b.dataset.rate){const r=Number(b.dataset.rate);lessonAudio.playbackRate=r;feedbackAudio.playbackRate=r;syncPanel();}
    if(b.hasAttribute('data-cc')){captionsOn=!captionsOn;setCaption();syncPanel();}
    if(b.hasAttribute('data-mute')){muted=!muted;lessonAudio.muted=muted;feedbackAudio.muted=muted;syncPanel();}
    if(b.hasAttribute('data-mode')){guided=!guided;stopAll();updateUI();syncPanel();}
  });

  startGuided.addEventListener('click',()=>{guided=true;startCard.hidden=true;updateUI();syncPanel();play();});
  startFree.addEventListener('click',()=>{guided=false;startCard.hidden=true;updateUI();syncPanel();});

  fetch(`narration/cortisol-guided.json?v=${REV}`)
    .then(r=>r.json())
    .then(data=>{data.stages.forEach(s=>{scripts[s.id]=s;feedbackScripts[s.id]=s.feedback||{};});setCaption();})
    .catch(()=>setNote('Narration script unavailable',true));

  updateUI(); syncPanel();
})();