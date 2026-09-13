(()=>{
const stages=[...document.querySelectorAll('.stage')];
const s=stages[6];
if(!s)return;
s.innerHTML=`
<span class="kicker">07 · CLINICAL FEATURES · DERIVE THEM</span>
<h2>Why does diabetes cause <em>polyuria, thirst and Kussmaul breathing?</em></h2>
<p class="lead">Do not memorise a symptom list. Follow the physiology. First derive the symptoms caused by <b>hyperglycaemia</b>. Then add the extra consequences of <b>severe insulin deficiency in Type 1 diabetes</b>.</p>

<div class="mechanism-section">
  <span class="kicker">PART A · BOTH TYPES — HYPERGLYCAEMIA</span>
  <h3>Start with the kidney</h3>
  <div class="why-chain">
    <div class="why-step"><b>1</b><div><strong>Plasma glucose rises</strong><p>The higher the plasma glucose, the more glucose is filtered through the glomerulus into the renal tubule.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step"><b>2</b><div><strong>The proximal tubule tries to reclaim it</strong><p>Normally, filtered glucose is reabsorbed back into the blood, mainly through sodium–glucose cotransporters. But that reabsorptive system has a finite capacity.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step key"><b>3</b><div><strong>That capacity is exceeded → glycosuria</strong><p>Once more glucose is filtered than the tubule can reabsorb, glucose remains in the tubular fluid and appears in the urine.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step key"><b>4</b><div><strong>Glucose keeps water in the tubule → osmotic diuresis</strong><p>Glucose is osmotically active. Water therefore stays in the tubular fluid instead of being reabsorbed normally. Urine volume rises: <b>polyuria</b>.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step"><b>5</b><div><strong>Water loss → dehydration and increased thirst</strong><p>Ongoing urinary water loss reduces circulating volume and raises effective osmolality. Hypothalamic osmoreceptors and volume signals stimulate thirst, producing <b>polydipsia</b>.</p></div></div>
  </div>
  <div class="takehome"><b>So the chain is:</b> hyperglycaemia → filtered glucose load rises → tubular reabsorption saturates → glycosuria → osmotic diuresis → polyuria → dehydration → polydipsia.</div>
</div>

<div class="mechanism-section t1-only">
  <span class="kicker">PART B · TYPE 1 — WHEN INSULIN DEFICIENCY BECOMES SEVERE</span>
  <h3>Now add ketones and acidosis</h3>
  <div class="why-chain">
    <div class="why-step"><b>1</b><div><strong>Insulin falls profoundly</strong><p>The normal anti-lipolytic signal is lost, while counter-regulatory hormones such as glucagon become relatively dominant.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step"><b>2</b><div><strong>Fat is broken down → free fatty acids</strong><p>Adipose tissue releases free fatty acids, which are delivered to the liver.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step"><b>3</b><div><strong>The liver converts fatty acids into ketone bodies</strong><p>β-hydroxybutyrate and acetoacetate accumulate. They are acids, so bicarbonate is consumed buffering the hydrogen ions.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step key"><b>4</b><div><strong>Metabolic acidosis develops</strong><p>As bicarbonate falls and hydrogen ion concentration rises, blood pH falls.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step key"><b>5</b><div><strong>The respiratory system compensates → Kussmaul breathing</strong><p>The brain senses the acidaemia and drives deep, laboured, often rapid breathing. By exhaling more carbon dioxide, the body lowers carbonic acid and partially raises the pH. This is why Kussmaul breathing is a sign of significant metabolic acidosis, not simply “breathlessness from diabetes”.</p></div></div>
  </div>
</div>

<div class="grid clinical-why-grid">
  <div class="card"><span class="kicker">WEIGHT LOSS</span><h3>Why?</h3><p>Part is water loss from osmotic diuresis. In marked insulin deficiency, the body also breaks down fat and protein for fuel, producing true catabolic weight loss.</p></div>
  <div class="card"><span class="kicker">POLYPHAGIA</span><h3>Why can hunger increase?</h3><p>Despite abundant glucose in the blood, insulin-dependent fuel handling is impaired. The body is signalling inadequate usable fuel, which can increase appetite before severe illness suppresses it.</p></div>
  <div class="card"><span class="kicker">NAUSEA, VOMITING & ABDOMINAL PAIN</span><h3>Why in DKA?</h3><p>Ketonaemia, acidosis, dehydration and altered gut perfusion all contribute. These symptoms therefore suggest metabolic decompensation rather than uncomplicated hyperglycaemia.</p></div>
  <div class="card"><span class="kicker">FRUITY / ACETONE BREATH</span><h3>Why?</h3><p>Acetoacetate can spontaneously form acetone, a volatile ketone that is exhaled through the lungs.</p></div>
</div>

<div class="takehome final-takehome"><b>Separate the mechanisms:</b> polyuria and polydipsia come mainly from <b>hyperglycaemia and osmotic diuresis</b>, so either type can cause them. Kussmaul breathing, marked ketosis and rapid catabolic weight loss point toward <b>severe insulin deficiency and DKA</b>, classically Type 1 diabetes.</div>
<div class="audio-row"><audio controls preload="none" src="audio/diabetes-chatterbox/07-clinical-patterns.mp3"></audio></div>
<div class="navline"><button class="btn ghost" data-prev>← Back</button><button class="btn" data-next>Continue →</button></div>`;

const style=document.createElement('style');
style.textContent=`
.mechanism-section{margin:24px 0 30px;padding:22px;border:1px solid var(--line);border-radius:18px;background:linear-gradient(180deg,#121419,#0d0f13)}
.mechanism-section>h3{font-size:28px;margin:8px 0 18px}.t1-only{border-color:#70cbd855}.why-chain{display:grid;gap:7px}.why-step{display:grid;grid-template-columns:42px 1fr;gap:12px;align-items:start;padding:14px;border:1px solid var(--line);border-radius:14px;background:#ffffff03}.why-step>b{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#ffffff08;color:var(--a)}.why-step strong{font-size:17px}.why-step p{margin:5px 0 0;color:var(--muted);line-height:1.55}.why-step.key{border-color:#e9a51b66;background:#e9a51b08}.why-arrow{text-align:center;color:var(--a);font-size:20px;line-height:1}.takehome{margin-top:16px;padding:15px 17px;border-left:3px solid var(--a);background:#e9a51b08;line-height:1.55}.clinical-why-grid{margin-top:22px}.final-takehome{margin:24px 0 10px;font-size:16px}
@media(max-width:800px){.mechanism-section{padding:15px;margin:18px 0 22px}.mechanism-section>h3{font-size:23px}.why-step{grid-template-columns:34px 1fr;padding:12px 10px}.why-step>b{width:28px;height:28px}.why-step strong{font-size:15px}.why-step p{font-size:14px}.final-takehome{font-size:14px}}
`;
document.head.appendChild(style);
})();