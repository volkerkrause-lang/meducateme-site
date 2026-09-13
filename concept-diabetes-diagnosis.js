(()=>{
const stages=[...document.querySelectorAll('.stage')];
const s=stages[7];
if(!s)return;
s.innerHTML=`
<span class="kicker">08 · DIAGNOSIS · WHAT DO THE NUMBERS MEAN?</span>
<h2>How do we actually <em>diagnose diabetes?</em></h2>
<p class="lead">Start with glucose. Then use HbA1c to understand longer-term exposure. Ketones answer a different question: <b>is the patient making excess ketones, and could this be DKA?</b></p>

<div class="mechanism-section">
  <span class="kicker">1 · FASTING PLASMA GLUCOSE</span>
  <h3>What should glucose be after an overnight fast?</h3>
  <div class="number-grid">
    <div class="number-card normal"><small>Typical fasting range</small><strong>≈ 4.0–5.5</strong><span>mmol/L</span><p>Exact laboratory reference ranges vary slightly.</p></div>
    <div class="number-card warning"><small>Impaired fasting glycaemia</small><strong>6.1–6.9</strong><span>mmol/L</span><p>Abnormal, but below the diagnostic threshold for diabetes.</p></div>
    <div class="number-card danger"><small>Diabetes threshold</small><strong>≥ 7.0</strong><span>mmol/L</span><p>A fasting plasma glucose at or above this level meets a diagnostic criterion for diabetes.</p></div>
  </div>
  <div class="takehome"><b>Why fasting?</b> Because food has been removed as a variable. You are asking whether glucose remains abnormally high even when no carbohydrate has just been absorbed.</div>
</div>

<div class="mechanism-section">
  <span class="kicker">2 · RANDOM PLASMA GLUCOSE</span>
  <h3>A random glucose depends on when the patient last ate</h3>
  <p class="lead small-lead">That means there is no single useful “normal random glucose” cut-off that works at every moment of the day.</p>
  <div class="why-chain">
    <div class="why-step"><b>1</b><div><strong>After a meal, glucose normally rises</strong><p>So a random value must be interpreted in context.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step key"><b>2</b><div><strong>Random plasma glucose ≥ 11.1 mmol/L + classic symptoms</strong><p>In a child with polyuria, polydipsia and weight loss, this is sufficient to diagnose diabetes.</p></div></div>
  </div>
  <div class="takehome"><b>Important:</b> in a symptomatic child with a clearly high random glucose, do not delay diagnosis waiting for a fasting test or HbA1c.</div>
</div>

<div class="mechanism-section">
  <span class="kicker">3 · HbA1c</span>
  <h3>HbA1c asks a different question: how high has glucose been over time?</h3>
  <div class="number-grid">
    <div class="number-card normal"><small>Usually not diabetic</small><strong>&lt; 42</strong><span>mmol/mol</span><p>Below the usual high-risk range.</p></div>
    <div class="number-card warning"><small>High-risk / prediabetes range</small><strong>42–47</strong><span>mmol/mol</span><p>Abnormal glycaemia, but below the diabetes threshold.</p></div>
    <div class="number-card danger"><small>Diabetes threshold</small><strong>≥ 48</strong><span>mmol/mol</span><p>Equivalent to 6.5% or above, when HbA1c is appropriate for diagnosis.</p></div>
  </div>
  <div class="takehome"><b>What HbA1c means:</b> glucose sticks irreversibly to haemoglobin in red cells. The more glucose the blood has been exposed to over the preceding weeks, the higher the HbA1c. It is useful for chronic glycaemia, but it does <b>not</b> tell you whether a child is currently in DKA.</div>
</div>

<div class="mechanism-section">
  <span class="kicker">4 · ORAL GLUCOSE TOLERANCE TEST</span>
  <h3>What happens if we deliberately give a glucose load?</h3>
  <div class="number-grid two-hour">
    <div class="number-card normal"><small>2-hour glucose</small><strong>&lt; 7.8</strong><span>mmol/L</span><p>Normal glucose tolerance.</p></div>
    <div class="number-card warning"><small>Impaired glucose tolerance</small><strong>7.8–11.0</strong><span>mmol/L</span><p>Abnormal handling, but not yet in the diabetic range.</p></div>
    <div class="number-card danger"><small>Diabetes threshold</small><strong>≥ 11.1</strong><span>mmol/L</span><p>At 2 hours after the glucose load.</p></div>
  </div>
  <div class="takehome">In a child with classic symptomatic Type 1 diabetes, an OGTT is usually unnecessary. It is more useful when the diagnosis is less obvious.</div>
</div>

<div class="mechanism-section t1-only">
  <span class="kicker">5 · KETONES · A DIFFERENT QUESTION</span>
  <h3>Ketones do not diagnose diabetes. They tell you about <em>fuel metabolism.</em></h3>
  <div class="number-grid ketone-grid">
    <div class="number-card normal"><small>Blood ketones</small><strong>&lt; 0.6</strong><span>mmol/L</span><p>Generally normal.</p></div>
    <div class="number-card warning"><small>Raised</small><strong>0.6–1.5</strong><span>mmol/L</span><p>Ketone production has increased.</p></div>
    <div class="number-card warning"><small>Significant</small><strong>1.6–3.0</strong><span>mmol/L</span><p>Increasing concern for evolving ketoacidosis, especially if unwell.</p></div>
    <div class="number-card danger"><small>High</small><strong>&gt; 3.0</strong><span>mmol/L</span><p>Strongly concerning for DKA in the appropriate clinical and biochemical setting.</p></div>
  </div>
  <div class="why-chain compact-chain">
    <div class="why-step"><b>A</b><div><strong>Hyperglycaemia</strong><p>BSPED uses glucose &gt;11 mmol/L as part of the biochemical picture of paediatric DKA.</p></div></div>
    <div class="why-step"><b>B</b><div><strong>Ketosis</strong><p>Blood ketones &gt;3 mmol/L, or significant urine ketones.</p></div></div>
    <div class="why-step"><b>C</b><div><strong>Acidaemia</strong><p>pH &lt;7.3 confirms that ketone production has produced metabolic acidosis.</p></div></div>
  </div>
  <div class="takehome final-takehome"><b>DKA is not “high glucose”.</b> It is the combination of diabetes/hyperglycaemia, <b>ketosis</b> and <b>metabolic acidosis</b>.</div>
</div>

<div class="mechanism-section">
  <span class="kicker">6 · THEN CLASSIFY THE DIABETES</span>
  <h3>Once diabetes is established, ask what mechanism caused it</h3>
  <div class="compare">
    <div class="mechanism-card type1-card"><span class="kicker">TYPE 1</span><h3>Think insulin deficiency</h3><p>Often rapid onset, weight loss, ketosis; pancreatic autoantibodies support autoimmune Type 1 diabetes. C-peptide can help assess endogenous insulin production when the type is uncertain.</p></div>
    <div class="mechanism-card type2-card"><span class="kicker">TYPE 2</span><h3>Think insulin resistance</h3><p>Often more gradual, commonly associated with obesity or other signs of insulin resistance, but there is overlap. Do not classify on body habitus alone.</p></div>
  </div>
</div>

<div class="audio-row"><audio controls preload="none" src="audio/diabetes-chatterbox/08-diagnose-classify.mp3"></audio></div>
<div class="navline"><button class="btn ghost" data-prev>← Back</button><button class="btn" data-next>Continue →</button></div>`;

const style=document.createElement('style');
style.textContent=`
.number-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0}.number-grid.ketone-grid{grid-template-columns:repeat(4,1fr)}.number-card{border:1px solid var(--line);border-radius:16px;padding:16px;background:#ffffff03}.number-card small{display:block;color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.1em}.number-card strong{display:block;font-size:34px;line-height:1;margin:10px 0 4px}.number-card span{font-size:11px;color:var(--muted)}.number-card p{font-size:13px;line-height:1.45;color:var(--muted);margin:10px 0 0}.number-card.normal{border-color:#7fd6a055}.number-card.warning{border-color:#e9a51b66}.number-card.danger{border-color:#ed806d77}.small-lead{font-size:16px}.compact-chain{grid-template-columns:repeat(3,1fr);gap:10px}.compact-chain .why-step{display:block}.compact-chain .why-step>b{margin-bottom:10px}.two-hour{margin-bottom:12px}@media(max-width:800px){.number-grid,.number-grid.ketone-grid,.compact-chain{grid-template-columns:1fr}.number-card strong{font-size:30px}}
`;
document.head.appendChild(style);
})();