(()=>{
const stages=[...document.querySelectorAll('.stage')];
const s=stages[9];
if(!s)return;
s.innerHTML=`
<span class="kicker">10 · RECONSTRUCT THE WHOLE DISEASE</span>
<h2>Can you work backwards from the child to the <em>broken physiology?</em></h2>
<p class="lead">A useful final test is not “Can I repeat the facts?” It is: <b>Can I derive them from one mechanism?</b></p>

<div class="recon-case">
  <span class="kicker">THE CHILD IN FRONT OF YOU</span>
  <h3>12-year-old · thirst · passing urine all night · 5 kg weight loss · vomiting · deep breathing</h3>
  <div class="recon-labs">
    <div><small>Glucose</small><strong>28 mmol/L</strong></div>
    <div><small>Blood ketones</small><strong>5.6 mmol/L</strong></div>
    <div><small>pH</small><strong>7.16</strong></div>
    <div><small>HCO₃⁻</small><strong>10 mmol/L</strong></div>
  </div>
</div>

<div class="mechanism-section">
  <span class="kicker">FIRST CHAIN · WHY IS THE CHILD THIRSTY AND POLYURIC?</span>
  <div class="why-chain">
    <div class="why-step"><b>1</b><div><strong>Insulin effect is insufficient → plasma glucose rises</strong><p>In Type 1, insulin is profoundly deficient. Glucose uptake falls and hepatic glucose production is no longer adequately suppressed.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step"><b>2</b><div><strong>Filtered glucose load rises</strong><p>The kidney filters more glucose as plasma glucose rises.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step key"><b>3</b><div><strong>Renal glucose reabsorption is exceeded → glycosuria</strong><p>Glucose remains in tubular fluid because the transport system cannot reclaim it all.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step key"><b>4</b><div><strong>Glucose retains water → osmotic diuresis</strong><p>Water stays in the tubule and urine volume rises.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step"><b>5</b><div><strong>Polyuria → dehydration → thirst</strong><p>Water loss raises effective osmolality and reduces circulating volume, stimulating thirst.</p></div></div>
  </div>
</div>

<div class="mechanism-section t1-only">
  <span class="kicker">SECOND CHAIN · WHY IS THE CHILD LOSING WEIGHT AND MAKING KETONES?</span>
  <div class="why-chain">
    <div class="why-step"><b>1</b><div><strong>Insulin no longer signals “fed state”</strong><p>Muscle and adipose tissue are no longer receiving a strong anabolic signal.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step"><b>2</b><div><strong>Lipolysis increases</strong><p>Fat is mobilised and free fatty acids enter the circulation.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step"><b>3</b><div><strong>The liver converts fatty acids to ketone bodies</strong><p>β-hydroxybutyrate and acetoacetate accumulate.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step key"><b>4</b><div><strong>Ketone acids consume bicarbonate → metabolic acidosis</strong><p>The bicarbonate falls and the pH drops.</p></div></div>
  </div>
</div>

<div class="mechanism-section t1-only">
  <span class="kicker">THIRD CHAIN · WHY IS THE CHILD BREATHING LIKE THIS?</span>
  <div class="why-chain">
    <div class="why-step"><b>1</b><div><strong>Metabolic acidosis lowers pH</strong><p>The respiratory system now has to compensate for a metabolic problem.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step key"><b>2</b><div><strong>Ventilation rises → CO₂ falls</strong><p>Deep, rapid Kussmaul breathing blows off carbon dioxide. Less CO₂ means less carbonic acid, which partially raises the pH.</p></div></div>
  </div>
  <div class="takehome"><b>Kussmaul breathing is therefore not a respiratory disease.</b> It is the visible respiratory compensation for severe metabolic acidosis.</div>
</div>

<div class="mechanism-section">
  <span class="kicker">NOW DISTINGUISH TYPE 1 FROM TYPE 2</span>
  <h3>Same hyperglycaemia. Different reason.</h3>
  <div class="compare">
    <div class="mechanism-card type1-card"><span class="kicker">TYPE 1</span><h3>Insulin is missing</h3><p>Autoimmune β-cell destruction → severe insulin deficiency → hyperglycaemia + catabolism + ketosis risk.</p></div>
    <div class="mechanism-card type2-card"><span class="kicker">TYPE 2</span><h3>Insulin is resisted</h3><p>Insulin is present, often high initially → tissues respond poorly → compensation eventually becomes inadequate → hyperglycaemia.</p></div>
  </div>
</div>

<div class="mechanism-section">
  <span class="kicker">THE FINAL TEST</span>
  <h3>If you understand diabetes, you should be able to answer these without memorising them</h3>
  <div class="recon-questions">
    <div class="recon-q"><b>Why is the glucose high?</b><p>Because glucose disposal is impaired and hepatic glucose production is insufficiently suppressed.</p></div>
    <div class="recon-q"><b>Why is there glucose in the urine?</b><p>Because the filtered glucose load exceeds tubular reabsorptive capacity.</p></div>
    <div class="recon-q"><b>Why is there polyuria and thirst?</b><p>Because glycosuria causes osmotic diuresis, water loss and increased thirst drive.</p></div>
    <div class="recon-q"><b>Why are there ketones in Type 1?</b><p>Because loss of insulin releases the brake on lipolysis and hepatic ketogenesis.</p></div>
    <div class="recon-q"><b>Why Kussmaul breathing?</b><p>Because metabolic acidosis drives respiratory compensation by lowering CO₂.</p></div>
    <div class="recon-q"><b>Why are treatments different?</b><p>Because Type 1 needs replacement of missing insulin, while Type 2 initially needs treatment of insulin resistance and inappropriate glucose output.</p></div>
  </div>
</div>

<div class="takehome final-takehome"><b>The whole lesson in one sentence:</b> understand what insulin normally tells the body to do, then ask whether that signal is <b>missing</b> or <b>resisted</b>; every major symptom, investigation and treatment follows from that distinction.</div>
<div class="audio-row"><audio controls preload="none" src="audio/diabetes-chatterbox/10-reconstruct.mp3"></audio></div>
<div class="navline"><button class="btn ghost" data-prev>← Back</button><a class="btn" href="clinical-concepts.html">Finish →</a></div>`;

const style=document.createElement('style');
style.textContent=`
.recon-case{padding:22px;border:1px solid #e9a51b55;border-radius:18px;background:#e9a51b08;margin:20px 0 26px}.recon-case h3{font-size:25px;line-height:1.25;margin:8px 0 18px}.recon-labs{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.recon-labs>div{padding:14px;border:1px solid var(--line);border-radius:14px;background:#0c0e12}.recon-labs small{display:block;color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.08em}.recon-labs strong{display:block;font-size:20px;margin-top:4px}.recon-questions{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.recon-q{padding:16px;border:1px solid var(--line);border-radius:14px;background:#ffffff03}.recon-q b{font-size:16px}.recon-q p{color:var(--muted);line-height:1.5;margin:7px 0 0}@media(max-width:800px){.recon-labs{grid-template-columns:1fr 1fr}.recon-questions{grid-template-columns:1fr}.recon-case h3{font-size:21px}}
`;
document.head.appendChild(style);
})();