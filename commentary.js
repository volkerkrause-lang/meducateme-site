(async()=>{
const css=`
.commentary-fab{position:fixed;z-index:160;right:24px;bottom:96px;width:58px;height:58px;border:1px solid #e9a51b;border-radius:50%;background:#e9a51b;color:#0b0b0a;display:none;place-items:center;font-size:24px;box-shadow:0 12px 35px #0008;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none}.commentary-fab.visible{display:grid}.commentary-fab.playing{animation:commentPulse 1.7s ease-in-out infinite}.commentary-fab.holding{transform:scale(.96)}
.commentary-hold{position:fixed;z-index:159;right:14px;bottom:158px;display:none;align-items:center;gap:7px;padding:8px 9px;border:1px solid #ffffff24;border-radius:999px;background:#11110ff2;color:#f0eee8;box-shadow:0 12px 34px #0009;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}.commentary-hold.open{display:flex}.commentary-hold button{height:34px;min-width:34px;padding:0 10px;border:1px solid #ffffff20;border-radius:999px;background:#ffffff08;color:#f0eee8;font:inherit;font-size:10px;font-weight:700;letter-spacing:.04em}.commentary-hold button.selected,.commentary-hold button.hovered{border-color:#e9a51b;color:#e9a51b;background:#e9a51b10}.commentary-status{max-width:145px;padding:0 8px;color:#aaa69e;font-size:9px;line-height:1.25;letter-spacing:.06em;text-transform:uppercase}.commentary-status strong{display:block;color:#e9a51b;font-size:9px}.commentary-hint{position:fixed;z-index:158;right:18px;bottom:74px;display:none;padding:5px 8px;border-radius:999px;background:#11110fe8;color:#aaa69e;font-size:9px;letter-spacing:.05em}.commentary-fab.visible+.commentary-hint{display:block}@keyframes commentPulse{50%{box-shadow:0 0 0 10px #e9a51b16,0 12px 35px #0008}}
@media(max-width:600px){.commentary-fab{right:14px;bottom:90px;width:52px;height:52px}.commentary-hold{right:10px;bottom:150px;max-width:calc(100vw - 20px)}.commentary-status{max-width:112px}.commentary-hint{right:12px;bottom:64px}}
`;
const style=document.createElement('style');style.textContent=css;document.head.append(style);
let lesson;
try{lesson=await fetch('narration/dka.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()})}catch(e){console.error('Narration source unavailable',e);return}
const stages=lesson.stages||[];
const fab=document.createElement('button');fab.className='commentary-fab';fab.type='button';fab.setAttribute('aria-label','Play or pause lecturer commentary. Press and hold for controls.');fab.innerHTML='🎧';
const hint=document.createElement('div');hint.className='commentary-hint';hint.textContent='Tap: play/pause · Hold: controls';
const hold=document.createElement('div');hold.className='commentary-hold';hold.setAttribute('aria-hidden','true');hold.innerHTML=`<button type="button" data-action="restart" aria-label="Restart">↺</button><button type="button" data-speed="0.85">0.85×</button><button type="button" data-speed="1">1×</button><button type="button" data-speed="1.15">1.15×</button><button type="button" data-speed="1.3">1.3×</button><div class="commentary-status"><strong>Audio</strong><span>Checking…</span></div>`;
document.body.append(fab,hint,hold);
const statusText=hold.querySelector('.commentary-status span');
const backdrop=document.querySelector('.backdrop');
let lastStep=-1,audio=null,utter=null,paused=false,usingRecording=false,fallbackStarted=false,rate=1,holdTimer=null,didHold=false,hovered=null;
function activeStep(){const els=[...document.querySelectorAll('.lesson-stage')];return Math.max(0,els.findIndex(s=>s.classList.contains('active')))}
function current(){return stages[activeStep()]||stages[0]}
function updateRateButtons(){hold.querySelectorAll('[data-speed]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.speed)===rate))}
function setStatus(text){statusText.textContent=text}
function resetButton(){fab.classList.remove('playing');paused=false}
function stop(){if(audio){audio.pause();audio.currentTime=0;audio=null}if('speechSynthesis'in window)window.speechSynthesis.cancel();utter=null;usingRecording=false;fallbackStarted=false;resetButton()}
function setPlaying(){fab.classList.add('playing');paused=false}
function chooseVoice(){const vs=window.speechSynthesis?.getVoices?.()||[];return vs.find(v=>/en-GB/i.test(v.lang)&&/male|daniel|george|ryan|arthur|oliver/i.test(v.name))||vs.find(v=>/en-GB/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||vs[0]}
function fallbackSpeak(){if(fallbackStarted)return;fallbackStarted=true;usingRecording=false;setStatus('Device fallback');if(!('speechSynthesis'in window)){resetButton();return}const s=current()?.script||'';window.speechSynthesis.cancel();utter=new SpeechSynthesisUtterance(s);utter.lang='en-GB';utter.rate=rate;utter.pitch=.82;const v=chooseVoice();if(v)utter.voice=v;utter.onend=()=>{utter=null;fallbackStarted=false;resetButton()};utter.onerror=()=>{utter=null;fallbackStarted=false;resetButton()};window.speechSynthesis.speak(utter);setPlaying()}
function playCurrent(restartFromStart=false){const stage=current();if(!stage)return;if(paused&&!restartFromStart){if(usingRecording&&audio){audio.playbackRate=rate;audio.play().then(setPlaying).catch(()=>fallbackSpeak());return}if(!usingRecording&&'speechSynthesis'in window){speechSynthesis.resume();setPlaying();return}}
stop();fallbackStarted=false;const path=`audio/dka/${stage.id}.mp3`;audio=new Audio(path);audio.preload='auto';audio.playbackRate=rate;usingRecording=true;setStatus('Gemini recording');let failed=false;const fail=()=>{if(failed)return;failed=true;if(audio){audio.pause();audio=null}fallbackSpeak()};audio.onerror=fail;audio.onended=()=>{audio=null;usingRecording=false;resetButton()};const p=audio.play();if(p&&p.then)p.then(setPlaying).catch(fail);else setPlaying()}
function pauseCurrent(){if(usingRecording&&audio&&!audio.paused){audio.pause();paused=true;fab.classList.remove('playing');return true}if(!usingRecording&&'speechSynthesis'in window&&speechSynthesis.speaking&&!speechSynthesis.paused){speechSynthesis.pause();paused=true;fab.classList.remove('playing');return true}return false}
function togglePlay(){if(!pauseCurrent())playCurrent(false)}
function sync(){const i=activeStep();if(i!==lastStep){stop();lastStep=i;setStatus('Ready')}}
function updateVisibility(){const open=!!backdrop?.classList.contains('open');fab.classList.toggle('visible',open);hint.style.display=open?'block':'none';if(!open){stop();hideHold()}}
function showHold(){didHold=true;fab.classList.add('holding');hold.classList.add('open');hold.setAttribute('aria-hidden','false');updateRateButtons()}
function hideHold(){clearTimeout(holdTimer);holdTimer=null;fab.classList.remove('holding');hold.classList.remove('open');hold.setAttribute('aria-hidden','true');if(hovered){hovered.classList.remove('hovered');hovered=null}}
function pickAt(x,y){const el=document.elementFromPoint(x,y)?.closest?.('.commentary-hold button');if(hovered&&hovered!==el)hovered.classList.remove('hovered');hovered=el||null;if(hovered)hovered.classList.add('hovered')}
function activate(el){if(!el)return;if(el.dataset.action==='restart'){playCurrent(true);return}if(el.dataset.speed){rate=Number(el.dataset.speed);updateRateButtons();if(usingRecording&&audio)audio.playbackRate=rate;else if('speechSynthesis'in window&&speechSynthesis.speaking){speechSynthesis.cancel();fallbackStarted=false;fallbackSpeak()}}}
fab.addEventListener('pointerdown',e=>{didHold=false;clearTimeout(holdTimer);holdTimer=setTimeout(()=>{showHold();pickAt(e.clientX,e.clientY)},430);try{fab.setPointerCapture(e.pointerId)}catch{}});
fab.addEventListener('pointermove',e=>{if(didHold)pickAt(e.clientX,e.clientY)});
fab.addEventListener('pointerup',e=>{clearTimeout(holdTimer);if(didHold){pickAt(e.clientX,e.clientY);activate(hovered);hideHold();didHold=false}else togglePlay();try{fab.releasePointerCapture(e.pointerId)}catch{}});
fab.addEventListener('pointercancel',()=>{hideHold();didHold=false});
fab.addEventListener('contextmenu',e=>e.preventDefault());
hold.querySelectorAll('button').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();activate(b)}));
const lessonScroll=document.querySelector('.lesson-scroll');if(lessonScroll)new MutationObserver(sync).observe(lessonScroll,{subtree:true,attributes:true,attributeFilter:['class']});if(backdrop)new MutationObserver(updateVisibility).observe(backdrop,{attributes:true,attributeFilter:['class']});
document.querySelector('.lesson-close')?.addEventListener('click',()=>{stop();hideHold();setTimeout(updateVisibility,0)});document.querySelector('.lesson-next')?.addEventListener('click',()=>setTimeout(sync,0));document.querySelector('.lesson-prev')?.addEventListener('click',()=>setTimeout(sync,0));
updateRateButtons();updateVisibility();sync();
})();
