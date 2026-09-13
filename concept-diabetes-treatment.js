(()=>{
const stages=[...document.querySelectorAll('.stage')];
const s=stages[8];
if(!s)return;
s.innerHTML=`
<span class="kicker">09 · TREATMENT · START WITH THE MECHANISM</span>
<h2>How do we actually <em>treat diabetes?</em></h2>
<p class="lead">There is no single “diabetes treatment”. First decide whether the problem is <b>Type 1 insulin deficiency</b> or <b>Type 2 insulin resistance with progressive β-cell failure</b>. The treatment follows from that distinction.</p>

<div class="mechanism-section t1-only">
  <span class="kicker">PART A · TYPE 1 DIABETES</span>
  <h3>The missing hormone has to be replaced</h3>
  <div class="why-chain">
    <div class="why-step"><b>1</b><div><strong>Basal insulin</strong><p>A long-acting insulin provides background insulin between meals and overnight. Its main jobs are to restrain hepatic glucose output and suppress inappropriate lipolysis and ketogenesis.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step"><b>2</b><div><strong>Meal insulin</strong><p>A rapid-acting insulin is given for carbohydrate intake. The dose is matched to the amount of carbohydrate using an individual insulin-to-carbohydrate ratio.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step"><b>3</b><div><strong>Correction insulin</strong><p>If glucose is above target, extra rapid-acting insulin may be added using an individual correction factor: how far 1 unit of insulin is expected to lower glucose.</p></div></div>
  </div>
  <div class="takehome"><b>So basal–bolus is trying to copy normal physiology:</b> basal insulin replaces the continuous background signal; bolus insulin deals with meals and corrections.</div>
</div>

<div class="grid">
  <div class="card"><span class="kicker">MULTIPLE DAILY INJECTIONS</span><h3>Basal–bolus injections</h3><p>NICE recommends intensive insulin therapy from diagnosis: usually a long-acting basal insulin once or twice daily plus rapid-acting insulin before meals and snacks. It is flexible because food drives the insulin dose rather than insulin dictating when and how much the child must eat.</p></div>
  <div class="card"><span class="kicker">PUMP / HYBRID CLOSED LOOP</span><h3>Continuous insulin delivery</h3><p>A pump delivers rapid-acting insulin continuously as basal delivery and gives boluses for meals and corrections. Modern systems can combine CGM with an algorithm that automatically adjusts insulin delivery, reducing some of the day-to-day burden.</p></div>
</div>

<div class="mechanism-section">
  <span class="kicker">HOW DO YOU DECIDE THE INSULIN DOSE?</span>
  <h3>Do not prescribe one fixed dose to every child</h3>
  <p class="lead small-lead">Initial insulin requirements depend on age, pubertal stage, weight, illness, ketosis, residual β-cell function and the honeymoon phase. The specialist diabetes team chooses an initial total daily dose and then adjusts it rapidly from glucose trends.</p>
  <div class="dose-logic">
    <div class="dose-card"><small>STEP 1</small><strong>Estimate total daily insulin requirement</strong><p>Use weight and clinical context as the starting framework — not as a permanent dose.</p></div>
    <div class="dose-card"><small>STEP 2</small><strong>Split into basal + bolus</strong><p>Basal covers fasting needs. The remainder is available for meals and corrections.</p></div>
    <div class="dose-card"><small>STEP 3</small><strong>Build an insulin:carbohydrate ratio</strong><p>This tells the family how many grams of carbohydrate are covered by 1 unit of rapid insulin. It is then refined from real glucose responses.</p></div>
    <div class="dose-card"><small>STEP 4</small><strong>Build a correction factor</strong><p>This estimates how much 1 unit lowers glucose. Again, it must be individualized and adjusted from CGM or capillary glucose data.</p></div>
  </div>
  <div class="takehome"><b>The important teaching point:</b> insulin dosing is dynamic. A sensible starting estimate is followed by repeated adjustment based on fasting glucose, post-meal excursions, hypoglycaemia, activity, illness and growth.</div>
</div>

<div class="mechanism-section">
  <span class="kicker">MONITORING · TYPE 1</span>
  <h3>Insulin only works safely if glucose is measured</h3>
  <div class="compare">
    <div class="card"><h3>CGM</h3><p>Continuous glucose monitoring shows the current glucose, direction of travel and overnight patterns. It helps identify whether the problem is basal insulin, meal insulin, timing or activity.</p></div>
    <div class="card"><h3>Carbohydrate counting</h3><p>NICE recommends level-3 carbohydrate-counting education at diagnosis so meal insulin can be matched to the actual carbohydrate eaten.</p></div>
    <div class="card"><h3>Ketone testing</h3><p>During illness or unexplained hyperglycaemia, ketones help identify insufficient insulin and risk of DKA. Insulin must never simply be stopped because a child is not eating.</p></div>
    <div class="card"><h3>HbA1c and time-in-range</h3><p>HbA1c shows longer-term glycaemia; CGM adds day-to-day information such as time in range, variability and hypoglycaemia.</p></div>
  </div>
</div>

<div class="mechanism-section type2-section">
  <span class="kicker">PART B · TYPE 2 DIABETES</span>
  <h3>Start by asking how severe the presentation is</h3>
  <div class="why-chain">
    <div class="why-step"><b>1</b><div><strong>No ketosis, not severely hyperglycaemic</strong><p>Start lifestyle intervention plus metformin, assuming there is no contraindication.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step"><b>2</b><div><strong>HbA1c ≥69 mmol/mol (8.5%) at diagnosis</strong><p>NICE recommends insulin in addition to metformin because glucose is already markedly elevated.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step"><b>3</b><div><strong>Ketosis without DKA</strong><p>NICE recommends basal–bolus insulin plus metformin.</p></div></div>
    <div class="why-arrow">↓</div>
    <div class="why-step key"><b>4</b><div><strong>DKA</strong><p>This is no longer routine outpatient Type 2 treatment. Treat DKA using the paediatric DKA pathway with intravenous fluids, electrolytes and insulin, then reassess the longer-term regimen.</p></div></div>
  </div>
</div>

<div class="med-grid">
  <div class="med-card"><span class="kicker">METFORMIN · FIRST LINE</span><h3>Reduce hepatic glucose production and improve insulin sensitivity</h3><p><b>Typical paediatric start, age ≥10:</b> 500 mg or 850 mg once daily with or after food. Increase gradually after about 10–15 days according to glucose and tolerability; licensed maximum is 2 g/day in 2–3 divided doses.</p><p><b>Why start low?</b> Gastrointestinal adverse effects are common, especially if titrated too quickly.</p></div>
  <div class="med-card"><span class="kicker">GLP-1 RECEPTOR AGONISTS · AGE ≥10</span><h3>Liraglutide or dulaglutide</h3><p>Increase glucose-dependent insulin secretion, suppress glucagon, slow gastric emptying and reduce appetite. NICE offers one of these in addition to metformin when targets are not met.</p><p><b>Liraglutide:</b> 0.6 mg subcutaneously daily initially; increase after at least 1 week to 1.2 mg, and if needed to 1.8 mg daily.</p><p><b>Dulaglutide:</b> 0.75 mg subcutaneously once weekly; if needed increase after at least 4 weeks to 1.5 mg weekly.</p></div>
  <div class="med-card"><span class="kicker">SGLT2 INHIBITOR · AGE ≥10</span><h3>Empagliflozin</h3><p>Blocks renal glucose reabsorption so more glucose is excreted in urine. NICE considers it when GLP-1 therapy is not tolerated or the young person clearly prefers it.</p><p><b>Typical licensed starting dose:</b> 10 mg orally once daily.</p><p><b>Important:</b> because this class promotes glycosuria, dehydration and ketoacidosis risk must be understood, particularly during illness or reduced intake.</p></div>
  <div class="med-card"><span class="kicker">INSULIN</span><h3>Use when endogenous insulin is no longer enough</h3><p>Add insulin if glycaemic targets cannot be achieved with metformin plus an additional agent, or use it from diagnosis when HbA1c is very high or ketosis is present. The exact insulin regimen depends on severity and the pattern of hyperglycaemia.</p></div>
</div>

<div class="mechanism-section">
  <span class="kicker">HOW DO YOU KNOW WHETHER TREATMENT IS WORKING?</span>
  <h3>Use targets, not guesswork</h3>
  <div class="number-grid">
    <div class="number-card normal"><small>HbA1c target · Type 2</small><strong>≤48</strong><span>mmol/mol</span><p>NICE target where achievable.</p></div>
    <div class="number-card normal"><small>Fasting / pre-meal</small><strong>4–7</strong><span>mmol/L</span><p>Target on at least 4 days each week.</p></div>
    <div class="number-card normal"><small>2 hours after meals</small><strong>5–9</strong><span>mmol/L</span><p>Target on at least 4 days each week.</p></div>
  </div>
  <p class="lead small-lead">If these are not being met, ask <b>why</b>: adherence? meal pattern? puberty? insufficient metformin? need a GLP-1 drug or SGLT2 inhibitor? falling β-cell function? need insulin? Treatment should answer the mechanism that is currently limiting control.</p>
</div>

<div class="takehome final-takehome"><b>Keep the whole treatment section anchored to one idea:</b><br><b>Type 1:</b> replace insulin intelligently and match it to physiology.<br><b>Type 2:</b> reduce insulin resistance and hepatic glucose output first, then add agents that improve glucose handling; use insulin when endogenous secretion is insufficient or the presentation is severe.</div>
<div class="treatment-footnote">Educational treatment framework based on NICE NG18 and current UK product information. Exact prescribing in children should follow the paediatric diabetes team, BNFc/product licence and local protocol.</div>
<div class="audio-row"><audio controls preload="none" src="audio/diabetes-chatterbox/09-treatment-logic.mp3"></audio></div>
<div class="navline"><button class="btn ghost" data-prev>← Back</button><a class="btn" href="clinical-concepts.html">Finish →</a></div>`;

const style=document.createElement('style');
style.textContent=`
.dose-logic,.med-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:16px 0}.dose-card,.med-card{border:1px solid var(--line);border-radius:16px;padding:17px;background:#ffffff03}.dose-card small,.med-card>.kicker{display:block}.dose-card strong{display:block;font-size:17px;margin:7px 0}.dose-card p,.med-card p{color:var(--muted);line-height:1.55}.med-card h3{font-size:22px;margin:8px 0 10px}.type2-section{border-color:#e9a51b55}.treatment-footnote{font-size:11px;color:var(--muted);line-height:1.5;margin:14px 0 4px}@media(max-width:800px){.dose-logic,.med-grid{grid-template-columns:1fr}.med-card h3{font-size:20px}}
`;
document.head.appendChild(style);
})();