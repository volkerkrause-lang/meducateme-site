(()=>{
  const synth=window.speechSynthesis;
  const supported=!!(synth&&window.SpeechSynthesisUtterance);
  const player=document.getElementById('audioGuide');
  if(!player)return;

  const playBtn=document.getElementById('guidePlay');
  const prevBtn=document.getElementById('guidePrev');
  const nextBtn=document.getElementById('guideNext');
  const transcriptBtn=document.getElementById('guideTranscriptBtn');
  const transcript=document.getElementById('guideTranscript');
  const transcriptText=document.getElementById('guideTranscriptText');
  const titleEl=document.getElementById('guideTitle');
  const statusEl=document.getElementById('guideStatus');
  const progressEl=document.getElementById('guideProgressBar');
  const voiceSelect=document.getElementById('guideVoice');
  const rateSelect=document.getElementById('guideRate');

  const steps=[
    {id:'case-intro',title:'Meet the child',selector:'#case-intro',text:`Welcome to the flagship case. You are seeing a twelve-year-old child before a diagnosis has been made. The child has had three days of increasing thirst and frequent urination. Since yesterday there has been vomiting, abdominal discomfort and lethargy. Today the breathing has become deep and rapid. Heart rate is one hundred and twenty-eight, respiratory rate thirty-two, oxygen saturation ninety-nine percent, and hydration is reduced. Do not name the disease yet. Start with the pattern in front of you. The first question is deliberately simple: which feature most strongly tells you this is more than straightforward gastroenteritis?`,waitFor:'#q-first'},
    {id:'problem',title:'Build the problem representation',selector:'#problem-representation',text:`Now compress the case rather than repeating the history. Polyuria and polydipsia started first. Dehydration followed. Vomiting and lethargy appeared later. Deep rapid breathing is present now, despite a normal oxygen saturation. That time sequence matters. The breathing is unlikely to be explained by hypoxaemic lung disease. Ask yourself for one broad mechanism that can connect excessive urine production, thirst, dehydration and an unusual breathing pattern.`,waitFor:'#q-differential'},
    {id:'investigate',title:'Investigate with purpose',selector:'#investigations',text:`The differential should now drive the investigations. We need to know whether the child is hyperglycaemic, ketotic and acidotic, and we also need to assess electrolytes and dehydration. The capillary glucose is twenty-eight millimoles per litre. Blood ketones are five point six. Venous pH is seven point one two, bicarbonate eight, and carbon dioxide two point eight kilopascals. Potassium is four point eight. Before revealing a diagnosis, interpret the acid-base pattern. A low pH with a profoundly low bicarbonate indicates a primary metabolic acidosis. The low carbon dioxide is the lungs compensating by increasing ventilation.`,waitFor:'#q-acidbase'},
    {id:'diagnosis',title:'Reveal the diagnosis',selector:'#diagnosis-stage',text:`You have now earned the diagnosis. Hyperglycaemia, significant ketosis and metabolic acidosis together make diabetic ketoacidosis. Notice the sequence: the diagnosis was not given to you at the start. It emerged from the presentation, the problem representation and the investigations. Now we can ask the more important teaching question: why does insulin deficiency generate this entire clinical picture?`},
    {id:'glucose-path',title:'Insulin deficiency and glucose',selector:'#mechanism',text:`Start with glucose. Insulin normally promotes glucose uptake in insulin-sensitive tissues and suppresses hepatic glucose production. When insulin is severely deficient, peripheral uptake falls while hepatic glucose output rises. Blood glucose therefore climbs. Once the filtered glucose load exceeds the kidney's reabsorptive capacity, glucose remains in the urine. Glucose in the tubular fluid holds water with it. This is osmotic diuresis. The child loses water and electrolytes in the urine, producing polyuria, dehydration and intense thirst. So the dehydration did not begin with the vomiting. It was already being created by glycosuria.`},
    {id:'ketone-path',title:'Insulin deficiency and ketones',selector:'#mechanism',text:`At the same time, insulin deficiency removes an important brake on lipolysis. Adipose tissue releases free fatty acids. The liver converts these fatty acids into ketone bodies. Ketones are acids, so as they accumulate, bicarbonate is consumed buffering the hydrogen ions and the blood pH falls. This produces a high anion-gap metabolic acidosis. The respiratory system responds by increasing alveolar ventilation to remove carbon dioxide. That is why the breathing becomes deep and rapid. Kussmaul breathing is not a primary lung problem. It is compensation for metabolic acidosis.`},
    {id:'findings',title:'Return to every clinical finding',selector:'#findings',text:`Now return to the child and account for every important finding. Polyuria comes from osmotic diuresis. Thirst follows water loss and rising osmolality. Dehydration reflects ongoing urinary water loss, often compounded later by vomiting. Vomiting and abdominal pain are common consequences of ketosis and acidaemia. Lethargy reflects dehydration, acidosis and systemic metabolic disturbance. The deep breathing is respiratory compensation. Potassium deserves special attention: total body potassium is depleted because of urinary losses, even if the initial serum concentration looks normal or high. Insulin deficiency and acidaemia shift potassium out of cells, masking that total-body deficit.`},
    {id:'management',title:'Management follows physiology',selector:'#management',text:`Treatment now becomes easier to understand because each intervention maps onto a physiological problem. Fluids restore circulation and replace the water deficit, but paediatric DKA requires careful calculation and monitoring. Insulin suppresses lipolysis and ketogenesis and reverses the underlying metabolic process. Potassium must be watched closely because insulin drives potassium back into cells and the serum concentration can fall rapidly. Neurological observations matter because cerebral injury is a feared complication. Glucose, ketones, electrolytes, acid-base status, fluid balance and clinical state are followed repeatedly. The exact prescription must follow current paediatric DKA guidance and local protocol.`},
    {id:'reconstruct',title:'Reconstruct the whole case',selector:'#reconstruction',text:`Reconstruct the case as one causal story. Severe insulin deficiency produces hyperglycaemia and removes the brake on lipolysis. Hyperglycaemia causes glycosuria, osmotic diuresis, polyuria, thirst and dehydration. Lipolysis supplies free fatty acids to the liver, generating ketones and metabolic acidosis. The lungs compensate for that acidosis with deep rapid breathing. What originally looked like separate symptoms are therefore different consequences of one physiological disturbance. That connected model is the main thing to remember.`},
    {id:'extensions',title:'Optional deeper learning',selector:'#extensions',text:`The core case is now complete. Only at this point do we branch into connected material. You can go deeper into insulin and fuel metabolism as a Fundamental, study diabetic ketoacidosis as a Clinical Concept, or open the current BSPED and NICE guidance for detailed management. These are extensions to the lesson, not interruptions to it.`}
  ];

  let index=0;
  let state='idle'; // idle, speaking, paused, waiting, complete
  let currentUtterance=null;
  let pendingAdvance=false;
  let voices=[];

  function getPreferredVoice(){
    const chosen=voices.find(v=>v.name===voiceSelect?.value);
    if(chosen)return chosen;
    return voices.find(v=>/^en-GB/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang))||voices[0]||null;
  }

  function loadVoices(){
    if(!supported||!voiceSelect)return;
    voices=synth.getVoices().filter(v=>/^en/i.test(v.lang));
    voiceSelect.innerHTML='';
    voices.forEach(v=>{
      const o=document.createElement('option');
      o.value=v.name;o.textContent=`${v.name} (${v.lang})`;
      voiceSelect.appendChild(o);
    });
    const preferred=voices.find(v=>/^en-GB/i.test(v.lang))||voices[0];
    if(preferred)voiceSelect.value=preferred.name;
  }

  function setActiveSection(selector){
    document.querySelectorAll('.guide-active').forEach(el=>el.classList.remove('guide-active'));
    const el=document.querySelector(selector);
    if(el){
      el.classList.add('guide-active');
      const top=el.getBoundingClientRect().top+window.scrollY-120;
      window.scrollTo({top,behavior:'smooth'});
    }
  }

  function updateUI(){
    const step=steps[index]||steps[steps.length-1];
    titleEl.textContent=step?step.title:'Audio guide';
    transcriptText.textContent=step?step.text:'';
    const pct=state==='complete'?100:Math.round(((index+1)/steps.length)*100);
    progressEl.style.width=`${pct}%`;
    progressEl.parentElement?.setAttribute('aria-valuenow',String(pct));
    prevBtn.disabled=index===0;
    nextBtn.disabled=state==='waiting';
    if(!supported){
      playBtn.disabled=true;
      playBtn.textContent='Audio unavailable';
      statusEl.textContent='This browser does not provide speech synthesis. The full transcript remains available.';
      return;
    }
    if(state==='speaking'){playBtn.textContent='Pause';statusEl.textContent=`Narrating ${index+1} of ${steps.length}`;}
    else if(state==='paused'){playBtn.textContent='Resume';statusEl.textContent='Paused';}
    else if(state==='waiting'){playBtn.textContent='Replay prompt';statusEl.textContent='Your turn — answer the highlighted question to continue';}
    else if(state==='complete'){playBtn.textContent='Replay lesson';statusEl.textContent='Guided lesson complete';}
    else {playBtn.textContent='Start guided lesson';statusEl.textContent='Interactive narration · pauses for your answers';}
  }

  function cancelSpeech(){
    if(supported)synth.cancel();
    currentUtterance=null;
  }

  function speakCurrent(){
    if(!supported)return;
    cancelSpeech();
    const step=steps[index];
    if(!step)return;
    state='speaking';
    setActiveSection(step.selector);
    updateUI();
    const u=new SpeechSynthesisUtterance(step.text);
    const voice=getPreferredVoice();
    if(voice)u.voice=voice;
    u.lang=voice?.lang||'en-GB';
    u.rate=parseFloat(rateSelect?.value||'0.95');
    u.pitch=1;
    u.volume=1;
    currentUtterance=u;
    u.onend=()=>{
      if(currentUtterance!==u)return;
      currentUtterance=null;
      if(step.waitFor){
        state='waiting';
        const q=document.querySelector(step.waitFor);
        if(q){q.classList.add('guide-question-waiting');q.scrollIntoView({behavior:'smooth',block:'center'});}
        updateUI();
      }else if(index<steps.length-1){
        index++;
        speakCurrent();
      }else{
        state='complete';
        document.querySelectorAll('.guide-active').forEach(el=>el.classList.remove('guide-active'));
        updateUI();
      }
    };
    u.onerror=(e)=>{
      if(e.error==='canceled'||e.error==='interrupted')return;
      state='paused';
      statusEl.textContent='Narration stopped. Tap Resume to continue.';
      updateUI();
    };
    synth.speak(u);
  }

  function speakFeedback(text,thenAdvance=true){
    if(!supported||!text){if(thenAdvance)advanceAfterAnswer();return;}
    cancelSpeech();
    state='speaking';updateUI();
    const u=new SpeechSynthesisUtterance(text);
    const voice=getPreferredVoice(); if(voice)u.voice=voice;
    u.lang=voice?.lang||'en-GB';u.rate=parseFloat(rateSelect?.value||'0.95');
    currentUtterance=u;
    u.onend=()=>{if(currentUtterance!==u)return;currentUtterance=null;if(thenAdvance)advanceAfterAnswer();};
    synth.speak(u);
  }

  function advanceAfterAnswer(){
    document.querySelectorAll('.guide-question-waiting').forEach(el=>el.classList.remove('guide-question-waiting'));
    if(index<steps.length-1){index++;speakCurrent();}else{state='complete';updateUI();}
  }

  playBtn.addEventListener('click',()=>{
    if(!supported)return;
    if(state==='complete'){index=0;state='idle';speakCurrent();return;}
    if(state==='speaking'){
      // cancel/restart is more reliable than pause/resume on iOS Safari
      cancelSpeech();state='paused';updateUI();return;
    }
    if(state==='waiting'){speakCurrent();return;}
    speakCurrent();
  });

  prevBtn.addEventListener('click',()=>{if(index>0){cancelSpeech();index--;state='idle';speakCurrent();}});
  nextBtn.addEventListener('click',()=>{if(state==='waiting')return;if(index<steps.length-1){cancelSpeech();index++;state='idle';speakCurrent();}});
  transcriptBtn.addEventListener('click',()=>{
    const open=transcript.hidden;
    transcript.hidden=!open;
    transcriptBtn.setAttribute('aria-expanded',String(open));
    transcriptBtn.textContent=open?'Hide transcript':'Transcript';
  });
  voiceSelect?.addEventListener('change',()=>{if(state==='speaking')speakCurrent();});
  rateSelect?.addEventListener('change',()=>{if(state==='speaking')speakCurrent();});

  document.querySelectorAll('.question .answers button').forEach(button=>{
    button.addEventListener('click',()=>{
      const q=button.closest('.question');
      const f=q?.querySelector('.feedback');
      const text=button.dataset.feedback||'';
      if(f)f.textContent=text;
      q?.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b===button));
      if(state==='waiting'&&q?.classList.contains('guide-question-waiting')){
        const spoken=text.replace(/→/g,' leads to ').replace(/↑/g,' rises ').replace(/↓/g,' falls ');
        speakFeedback(spoken,true);
      }
    });
  });

  const revealBtn=document.getElementById('revealBtn');
  revealBtn?.addEventListener('click',()=>{
    document.getElementById('diagnosis')?.classList.add('show');
    revealBtn.style.display='none';
  });

  if(!supported){player.classList.add('guide-unsupported');}
  else{
    loadVoices();
    if(typeof synth.onvoiceschanged!=='undefined')synth.onvoiceschanged=loadVoices;
  }
  updateUI();
})();