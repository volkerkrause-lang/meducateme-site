const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
function speak(text){
  if(!('speechSynthesis' in window)){return false}
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.rate=.95; u.pitch=1; u.lang='en-GB';
  const voices=speechSynthesis.getVoices();
  const preferred=voices.find(v=>/en-GB/i.test(v.lang)&&/Daniel|Sonia|Google UK English Male|Google UK English Female/i.test(v.name))||voices.find(v=>/en-GB/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang));
  if(preferred)u.voice=preferred;
  speechSynthesis.speak(u); return true;
}
window.addEventListener('DOMContentLoaded',()=>{
  qsa('[data-speak]').forEach(btn=>btn.addEventListener('click',()=>speak(btn.dataset.speak)));
  qsa('.flash').forEach(card=>card.addEventListener('click',()=>card.classList.toggle('flipped')));
  const stages=qsa('.stage'); let current=0;
  function show(i){
    if(!stages.length)return;
    current=Math.max(0,Math.min(i,stages.length-1));
    stages.forEach((s,n)=>s.classList.toggle('active',n===current));
    qsa('.progress i').forEach((d,n)=>d.classList.toggle('on',n<=current));
    window.scrollTo({top:74,behavior:'smooth'});
  }
  qsa('[data-next]').forEach(b=>b.addEventListener('click',()=>show(current+1)));
  qsa('[data-prev]').forEach(b=>b.addEventListener('click',()=>show(current-1)));
  qsa('[data-start]').forEach(b=>b.addEventListener('click',()=>{qs('.lesson-intro')?.setAttribute('hidden','');show(0)}));
  qsa('[data-answer]').forEach(b=>b.addEventListener('click',()=>{
    const q=b.closest('.question'), fb=qs('.feedback',q); const good=b.dataset.answer==='good';
    qsa('.choice',q).forEach(x=>x.disabled=true); b.classList.add(good?'good':'bad');
    const msg=good?b.dataset.good:b.dataset.bad; fb.innerHTML=(good?'<b>Exactly.</b> ':'<b>Not quite.</b> ')+msg;
    if(b.dataset.speakFeedback!=='off') speak((good?'Exactly. ':'Not quite. ')+msg);
  }));
  qsa('[data-reveal-flow]').forEach(btn=>btn.addEventListener('click',()=>{
    const flow=btn.closest('.stage')?.querySelector('.flow'); if(!flow)return;
    const nodes=qsa('.node',flow); let i=0; nodes.forEach(n=>n.classList.remove('on'));
    const timer=setInterval(()=>{if(i>=nodes.length){clearInterval(timer);return}nodes[i++].classList.add('on')},480);
  }));
  const search=qs('#site-search');
  if(search) search.addEventListener('input',()=>{
    const term=search.value.trim().toLowerCase();
    qsa('[data-searchable]').forEach(el=>el.hidden=term&&!el.dataset.searchable.includes(term));
  });
});