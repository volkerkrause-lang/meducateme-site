(() => {
  // IDs are permanent: keep them unchanged if a lesson title, URL or section changes.
  // Access is metadata only for now; it does not lock or hide any content.
  const lessons = [
    {id:'case-dka',section:'cases',title:'Vomiting + deep breathing',listingTitles:['Vomiting + deep breathing'],href:'lesson.html?topic=dka',paths:['lesson.html'],access:'free'},
    {id:'case-hyponatraemia-pneumonia',section:'cases',title:'Hyponatraemia in pneumonia',listingTitles:['Hyponatremia','Hyponatraemia'],href:'case-hyponatremia.html',paths:['case-hyponatremia.html'],access:'free'},
    {id:'concept-hyponatraemia',section:'concepts',title:'Hyponatraemia',listingTitles:['Hyponatraemia'],href:'concept-hyponatraemia.html',paths:['concept-hyponatraemia.html'],access:'free'},
    {id:'concept-diabetes-mellitus',section:'concepts',title:'Diabetes mellitus',listingTitles:['Diabetes mellitus'],href:'concept-diabetes.html',paths:['concept-diabetes.html'],access:'free'},
    {id:'concept-paediatric-tracheostomy',section:'concepts',title:'Paediatric tracheostomy',listingTitles:['Paediatric tracheostomy'],href:'concept-tracheostomy.html',paths:['concept-tracheostomy.html'],access:'preview'},
    {id:'fundamental-cortisol-physiology',section:'fundamentals',title:'Cortisol & the adrenal gland',listingTitles:['Cortisol physiology','Cortisol & the adrenal gland'],href:'fundamental-cortisol-guided.html',paths:['fundamental-cortisol.html','fundamental-cortisol-guided.html','fundamental-cortisol-session.html'],access:'free'}
  ];
  const accessLevels=Object.freeze(['free','preview','premium']);
  lessons.forEach(lesson=>{if(!accessLevels.includes(lesson.access))throw new Error(`Invalid lesson access level: ${lesson.access}`);Object.freeze(lesson.listingTitles);Object.freeze(lesson.paths);Object.freeze(lesson);});
  const byId=id=>lessons.find(lesson=>lesson.id===id)||null;
  const byListing=(section,title)=>lessons.find(lesson=>lesson.section===section&&lesson.listingTitles.includes(title))||null;
  const byHref=href=>{if(!href)return null;const url=new URL(href,window.location.href);const path=url.pathname.split('/').pop()||'index.html';return lessons.find(lesson=>lesson.paths.includes(path))||null;};
  window.MeducateMeLessons=Object.freeze({accessLevels,all:Object.freeze(lessons),byId,byListing,byHref});
  const current=byHref(window.location.href);
  if(current){document.documentElement.dataset.lessonId=current.id;document.documentElement.dataset.lessonAccess=current.access;}

  // Draft-only tracheostomy presentation/audio adapter. This branch is intentionally
  // isolated from main. It reuses the established cortisol lesson narration-orb pattern.
  if(current?.id!=='concept-paediatric-tracheostomy') return;
  const style=document.createElement('style');
  style.textContent=`
    .audioBtn,.audioPanel{display:none!important}
    .trach-audio-orb{position:fixed;z-index:9999;right:14px;bottom:18px;width:52px;height:52px;border-radius:50%;border:1px solid #ffd978;background:radial-gradient(circle at 32% 25%,#fff8d8,#f3bd45 30%,#8a4b07 82%);color:#120d06;display:grid;place-items:center;box-shadow:0 10px 30px #000a;touch-action:manipulation;padding:0;margin:0}
    .trach-audio-orb svg{width:24px;height:24px}.trach-audio-orb.playing{box-shadow:0 0 0 7px #eabf4b24,0 10px 30px #000a}
    .trach-audio-options{position:fixed;z-index:9998;right:72px;bottom:24px;display:none;gap:4px;padding:6px;border:1px solid #eabf4b55;border-radius:999px;background:#0d0e11f2;box-shadow:0 8px 26px #0009}.trach-audio-options.open{display:flex}.trach-audio-options button{height:30px;min-width:40px;padding:0 8px;border-radius:999px;border:1px solid #ffffff22;background:#ffffff08;color:#f4f1e8;font-size:10px}.trach-audio-options button.active{background:#eabf4b;color:#090a0c}
    .trach-caption{position:fixed;z-index:9997;left:50%;bottom:82px;transform:translateX(-50%);width:min(720px,calc(100vw - 26px));max-height:28vh;overflow:auto;display:none;padding:12px 15px;border:1px solid #ffffff1f;border-radius:12px;background:#050608f5;color:#fff;font-size:13px;line-height:1.6}.trach-caption.open{display:block}
    .hero h1{overflow-wrap:normal!important;word-break:normal!important;hyphens:none!important}.hero .visual{position:relative!important;inset:auto!important;transform:none!important}.hero .routes{position:static!important;transform:none!important}
    @media(max-width:1100px){.hero{grid-template-columns:1fr 1fr!important;gap:24px!important}.hero h1{font-size:clamp(42px,6.4vw,70px)!important}}
    @media(max-width:820px){.shell{padding:72px 22px 92px!important}.hero{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:22px!important;padding:28px 0 40px!important}.hero>div:first-child{order:1}.hero>.visual{order:2;width:100%!important;margin:0!important}.hero h1{font-size:clamp(38px,8.7vw,68px)!important;line-height:.94!important;letter-spacing:-.035em!important}.hero .lead{font-size:17px!important}.hero .visual svg{display:block!important;width:min(100%,560px)!important;max-height:360px!important;margin:0 auto!important}.hero .routes{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important;margin:14px 0 0!important}.hero .route{font-size:14px!important;line-height:1.45!important}.grid{grid-template-columns:1fr!important}.trach-audio-orb{width:48px;height:48px;right:10px;bottom:10px}.trach-audio-options{right:62px;bottom:15px;max-width:calc(100vw - 76px);overflow-x:auto}.trach-caption{bottom:70px;font-size:12px}}
    @media(max-width:520px){.shell{padding-left:16px!important;padding-right:16px!important}.hero h1{font-size:clamp(31px,8.65vw,45px)!important;white-space:normal!important}.hero .routes{grid-template-columns:1fr!important}.hero .visual{padding:14px!important}.hero .visual svg{max-height:285px!important}.stage h2{font-size:clamp(30px,8.2vw,42px)!important}.topbar .wrap{font-size:11px!important;gap:8px!important}.topbar .brand{max-width:44vw!important}}
  `;
  document.head.appendChild(style);

  const ids=['01-anatomy','02-fresh-tract','03-prevention','04-red-flags','05-emergency','06-failed-replacement','07-emphysema','08-tubes','09-challenge'];
  const scripts={
    '01-anatomy':'Start with one question before you touch the tracheostomy: does this child still have a usable upper airway?',
    '02-fresh-tract':'Now think about a fresh tracheostomy and why the immature tract makes replacement more dangerous.',
    '03-prevention':'Why do these tiny tubes block so easily? Humidification, hydration and careful suction all matter.',
    '04-red-flags':'After a fresh tracheostomy, look for obstruction, displacement, surgical emphysema, pneumothorax and significant bleeding.',
    '05-emergency':'In an emergency, ask whether the tube is positioned, whether a suction catheter passes, and whether you can oxygenate the child.',
    '06-failed-replacement':'If the tube is out and will not go back easily, avoid repeated forceful attempts and use the airway route that can oxygenate the child.',
    '07-emphysema':'Surgical emphysema means air has left the airway and entered soft tissue.',
    '08-tubes':'Know the actual tube in the child because length, diameter, flexibility and cuff design affect management.',
    '09-challenge':'Now put the whole mechanism together from the fresh tract, tube position, airflow and surgical emphysema.'
  };
  const audio=document.createElement('audio');audio.preload='metadata';audio.preservesPitch=true;document.body.appendChild(audio);
  const orb=document.createElement('button');orb.className='trach-audio-orb';orb.type='button';orb.setAttribute('aria-label','Play narration. Hold for options');orb.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a8 8 0 0 0-8 8v6a3 3 0 0 0 3 3h2v-8H6v-1a6 6 0 0 1 12 0v1h-3v8h2a3 3 0 0 0 3-3v-6a8 8 0 0 0-8-8Z"/></svg>';
  const options=document.createElement('div');options.className='trach-audio-options';options.innerHTML='<button data-rate="0.8">0.8×</button><button data-rate="1" class="active">1×</button><button data-rate="1.25">1.25×</button><button data-rate="1.5">1.5×</button><button data-cc>CC</button>';
  const caption=document.createElement('div');caption.className='trach-caption';document.body.append(orb,options,caption);
  let loaded='',captions=false,holdTimer=null,held=false;
  function activeId(){const s=document.querySelector('.stage.active');return s?ids[Number(s.dataset.stage)||0]:ids[0];}
  function load(){const id=activeId();if(loaded===id)return;audio.pause();loaded=id;audio.src=new URL(`audio/tracheostomy-chatterbox/${id}.mp3`,document.baseURI).href;audio.load();caption.textContent=scripts[id]||'';orb.classList.remove('playing');}
  async function toggle(){load();if(audio.paused){try{await audio.play();orb.classList.add('playing');orb.setAttribute('aria-label','Pause narration. Hold for options');}catch(e){orb.classList.remove('playing');orb.title='Narration audio is still being generated';}}else{audio.pause();orb.classList.remove('playing');orb.setAttribute('aria-label','Play narration. Hold for options');}}
  orb.addEventListener('pointerdown',()=>{held=false;holdTimer=setTimeout(()=>{held=true;options.classList.add('open')},520)});
  orb.addEventListener('pointerup',()=>{clearTimeout(holdTimer);if(!held)toggle();setTimeout(()=>options.classList.remove('open'),80)});
  orb.addEventListener('pointercancel',()=>clearTimeout(holdTimer));
  options.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>{audio.playbackRate=Number(b.dataset.rate);options.querySelectorAll('[data-rate]').forEach(x=>x.classList.toggle('active',x===b));});
  options.querySelector('[data-cc]').onclick=e=>{captions=!captions;e.currentTarget.classList.toggle('active',captions);caption.classList.toggle('open',captions)};
  audio.addEventListener('play',()=>orb.classList.add('playing'));audio.addEventListener('pause',()=>orb.classList.remove('playing'));audio.addEventListener('ended',()=>orb.classList.remove('playing'));
  new MutationObserver(()=>{const id=activeId();if(id!==loaded&&loaded){audio.pause();loaded='';caption.classList.remove('open')}}).observe(document.querySelector('main')||document.body,{subtree:true,attributes:true,attributeFilter:['class']});
})();
