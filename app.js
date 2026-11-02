(function(){
"use strict";
const MODS = window.MODULES, CALCS = window.CALCS;
const $ = (s, r=document) => r.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = (x, d=0) => isFinite(x) ? x.toLocaleString("fr-FR", {minimumFractionDigits:d, maximumFractionDigits:d}) : "—";
const pct = (x, d=1) => isFinite(x) ? (x*100).toLocaleString("fr-FR", {minimumFractionDigits:d, maximumFractionDigits:d}) + " %" : "—";
const num = v => { const x = parseFloat(String(v).replace(/\s/g,"").replace(",", ".")); return isFinite(x) ? x : NaN; };
const ALL_LESSONS = MODS.flatMap(m => m.lecons.map(l => ({...l, mod:m})));
const lessonById = id => ALL_LESSONS.find(l => l.id === id);
const modById = id => MODS.find(m => m.id === id);

function toast(msg){ const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove("show"), 2600); }

/* ---------- Statistiques ---------- */
function erfc(x){ const z=Math.abs(x), t=1/(1+0.5*z);
  const r=t*Math.exp(-z*z-1.26551223+t*(1.00002368+t*(0.37409196+t*(0.09678418+t*(-0.18628806+t*(0.27886807+t*(-1.13520398+t*(1.48851587+t*(-0.82215223+t*0.17087277)))))))));
  return x>=0 ? r : 2-r; }
const N = x => 0.5*erfc(-x/Math.SQRT2);
const phi = x => Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);
function Ninv(p){
  if(p<=0) return -Infinity; if(p>=1) return Infinity;
  const a=[-3.969683028665376e+01,2.209460984245205e+02,-2.759285104469687e+02,1.383577518672690e+02,-3.066479806614716e+01,2.506628277459239e+00],
        b=[-5.447609879822406e+01,1.615858368580409e+02,-1.556989798598866e+02,6.680131188771972e+01,-1.328068155288572e+01],
        c=[-7.784894002430293e-03,-3.223964580411365e-01,-2.400758277161838e+00,-2.549732539343734e+00,4.374664141464968e+00,2.938163982698783e+00],
        d=[7.784695709041462e-03,3.224671290700398e-01,2.445134137142996e+00,3.754408661907416e+00];
  const pl=0.02425; let q,r,x;
  if(p<pl){ q=Math.sqrt(-2*Math.log(p)); x=(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  else if(p<=1-pl){ q=p-0.5; r=q*q; x=(((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1); }
  else { q=Math.sqrt(-2*Math.log(1-p)); x=-(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  const e = N(x)-p, u = e*Math.sqrt(2*Math.PI)*Math.exp(x*x/2); return x - u/(1+x*u/2);
}

/* ---------- Progression et stockage ---------- */
const LS_KEY = "riskacademie-progress-v1";
let P = { lessons:{}, quizzes:{}, calcs:{}, updatedAt:0 };
const ctx = { db:null, user:null, uid:null, owner:false, canWrite:false, mode:"local", statique:false };
const CFG = window.RA_CONFIG || {};
const IMP_KEY = "riskacademie-imports-v1";
function loadImports(){ try{ const o = JSON.parse(localStorage.getItem(IMP_KEY)||"{}"); return Object.entries(o).map(([id,x])=>({ id, src:"import", name:String(x.name||"Sans nom"), p: normalize(x.p||{}) })); }catch(e){ return []; } }
function saveImport(id, rec){ try{ const o = JSON.parse(localStorage.getItem(IMP_KEY)||"{}"); if(rec) o[id] = rec; else delete o[id]; localStorage.setItem(IMP_KEY, JSON.stringify(o)); return true; }catch(e){ return false; } }
async function sha256(t){ const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join(""); }
function loadLocal(){ try{ const s = localStorage.getItem(LS_KEY); if(s){ const o = JSON.parse(s); if(o && typeof o==="object") P = normalize(o); } }catch(e){} }
function saveLocal(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(P)); }catch(e){} }
function normalize(o){ return { lessons: o.lessons||{}, quizzes: o.quizzes||{}, calcs: o.calcs||{}, updatedAt: o.updatedAt||0 }; }
function merge(a, b){
  const out = normalize(JSON.parse(JSON.stringify(a)));
  for(const k in (b.lessons||{})) out.lessons[k] = Math.min(out.lessons[k]||Infinity, b.lessons[k]);
  for(const k in (b.calcs||{})) out.calcs[k] = Math.min(out.calcs[k]||Infinity, b.calcs[k]);
  for(const k in (b.quizzes||{})){ const x = out.quizzes[k], y = b.quizzes[k];
    if(!x) out.quizzes[k] = y;
    else { const latest = (y.at||0) > (x.at||0) ? y : x;
      out.quizzes[k] = { best: Math.max(x.best||0, y.best||0), total: latest.total, last: latest.last, wrong: latest.wrong||[], attempts: Math.max(x.attempts||0, y.attempts||0), at: latest.at }; } }
  out.updatedAt = Math.max(a.updatedAt||0, b.updatedAt||0);
  return out;
}
let writing = false, dirty = false;
async function persist(){
  P.updatedAt = Date.now(); saveLocal();
  if(!(ctx.db && ctx.uid && ctx.canWrite)) return;
  dirty = true; if(writing) return;
  writing = true;
  while(dirty){ dirty = false;
    try{ await ctx.db.doc("progress/"+ctx.uid).set(JSON.parse(JSON.stringify(P))); setStatus("cloud"); }
    catch(e){ if(e && e.code === "invalid_argument"){ ctx.canWrite = false; setStatus("local"); } else if(e && e.code === "unavailable"){ await new Promise(r=>setTimeout(r, 800+Math.random()*800)); dirty = true; } else { setStatus("local"); } }
  }
  writing = false;
}
function setStatus(m){ ctx.mode = m; const el = $("#syncStatus");
  const txt = m==="cloud" ? "Progression synchronisée avec votre compte" : m==="local" ? "Progression enregistrée dans ce navigateur" : "Connexion…";
  el.innerHTML = `<span class="dot ${m==="cloud"?"on":m==="local"?"local":""}"></span><span>${txt}</span>`; }

function modStats(m, prog=P){
  const done = m.lecons.filter(l => prog.lessons && prog.lessons[l.id]).length;
  const qz = prog.quizzes && prog.quizzes[m.id];
  return { done, total: m.lecons.length, quiz: qz, ratio: (done + (qz ? 1 : 0)) / (m.lecons.length + 1) };
}
function globalStats(prog=P){
  const totalUnits = MODS.reduce((s,m)=>s+m.lecons.length+1,0);
  const doneUnits = MODS.reduce((s,m)=>{ const st = modStats(m, prog); return s + st.done + (st.quiz?1:0); },0);
  const scores = MODS.map(m => prog.quizzes && prog.quizzes[m.id]).filter(Boolean).map(q => q.best/q.total);
  return { ratio: doneUnits/totalUnits, doneUnits, totalUnits, avg: scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : NaN, nQuiz: scores.length };
}

/* ---------- Navigation ---------- */
function nav(){
  const h = location.hash.slice(1) || "accueil";
  const items = [["accueil","Accueil"],["parcours","Parcours"],["calculateurs","Calculateurs"],["progression","Ma progression"],["apropos","Le formateur"]];
  if(CFG.labUrl) items.splice(3, 0, ["__lab","Laboratoire"]);
  if(ctx.owner) items.push(["formateur","Espace formateur"]);
  const sec = h.startsWith("module-")||h.startsWith("lecon-")||h.startsWith("quiz-") ? "parcours" : h.startsWith("calc-") ? "calculateurs" : h;
  $("#nav").innerHTML = items.map(([k,l]) => k==="__lab" ? `<a href="${esc(CFG.labUrl)}" target="_blank" rel="noopener">${l} ↗</a>` : `<a href="#${k}" class="${k===sec?"on":""} ${k==="formateur"?"trainer":""}">${l}</a>`).join("");
}
function route(){
  const h = location.hash.slice(1) || "accueil"; const v = $("#view");
  if($("#pres").classList.contains("open")) closePres();
  nav();
  let html;
  if(h==="accueil") html = vHome();
  else if(h==="parcours") html = vParcours();
  else if(h.startsWith("module-")) html = vModule(h.slice(7));
  else if(h.startsWith("lecon-")) html = vLesson(h.slice(6));
  else if(h.startsWith("quiz-")) html = vQuiz(h.slice(5));
  else if(h==="calculateurs") html = vCalcs();
  else if(h.startsWith("calc-")) html = vCalc(h.slice(5));
  else if(h==="progression") html = vProgress();
  else if(h==="apropos") html = vAbout();
  else if(h==="formateur") html = ctx.owner ? vTrainer() : (ctx.statique && CFG.trainerHash ? vUnlock() : `<div class="empty">Cet espace est réservé au formateur.</div>`);
  else html = vHome();
  v.innerHTML = html || `<div class="empty">Page introuvable. <a href="#accueil">Retour à l'accueil</a></div>`;
  window.scrollTo(0,0);
  const after = AFTER[h.split("-")[0]]; if(after) after(h);
}
const AFTER = {};

/* ---------- Vues ---------- */
function vHome(){
  const g = globalStats();
  const next = ALL_LESSONS.find(l => !P.lessons[l.id]);
  return `
  <div class="hero">
    <div>
      <div class="eyebrow">Formation professionnelle · niveau intermédiaire</div>
      <h1>Se former au risk management bancaire et financier</h1>
      <p class="lead">${MODS.length} modules, ${ALL_LESSONS.length} leçons, des quiz corrigés et ${Object.keys(CALCS).length} calculateurs pour passer de la théorie à la pratique, du risque de marché au risque de modèle, en passant par la liquidité, la réglementation et le climat.</p>
      <p class="meta" style="margin-top:-6px">Une formation conçue par <a href="#apropos">${esc(window.ABOUT.nom)}</a>, ${esc(window.ABOUT.titre.split(" · ")[0])}.</p>
      <div class="row" style="margin-top:18px">
        ${next ? `<a class="btn" href="#lecon-${next.id}">${g.doneUnits ? "Reprendre" : "Commencer"} : ${esc(next.titre)}</a>` : `<a class="btn" href="#progression">Voir mon bilan</a>`}
        <a class="btn ghost" href="#calculateurs">Ouvrir les calculateurs</a>
      </div>
    </div>
    <div class="hero-panel">
      <div class="eyebrow" style="color:#e0a35a">Votre avancement</div>
      <div class="v">${pct(g.ratio,0)}</div>
      <div style="font-size:14px;opacity:.85">${g.doneUnits} étapes validées sur ${g.totalUnits} (leçons et quiz)</div>
      <div class="bar" style="background:#2c3846"><i style="width:${g.ratio*100}%;background:#e0a35a"></i></div>
      <div style="font-size:14px;margin-top:12px;opacity:.85">Score moyen aux quiz : <strong>${g.nQuiz ? pct(g.avg,0) : "—"}</strong></div>
    </div>
  </div>
  <h2>Les modules</h2>
  <div class="grid g2">${MODS.map(modCard).join("")}</div>`;
}
function modCard(m){
  const s = modStats(m);
  return `<a class="card link mod-card" href="#module-${m.id}" style="--mod:${m.couleur}">
    <div class="mod-num">MODULE ${m.num}</div><h3 style="margin-top:4px">${esc(m.titre)}</h3>
    <div class="meta" style="color:var(--ink2)">${esc(m.accroche)}</div>
    <div class="row meta" style="margin-top:10px;justify-content:space-between"><span>${s.done}/${s.total} leçons · quiz ${s.quiz ? `${s.quiz.best}/${s.quiz.total}` : "à faire"}</span><span>${m.lecons.reduce((a,l)=>a+l.duree,0)} min</span></div>
    <div class="bar"><i style="width:${s.ratio*100}%"></i></div></a>`;
}
function vParcours(){
  return `<div class="eyebrow">Parcours complet</div><h1>Programme de formation</h1>
  <p class="lead">Les modules peuvent être suivis dans l'ordre ou indépendamment. Chaque module se termine par un quiz de validation.</p>
  ${MODS.map(m => `<div style="--mod:${m.couleur};margin-top:28px"><div class="row" style="justify-content:space-between"><h2 style="margin:0"><span class="mod-num">MODULE ${m.num}</span><br>${esc(m.titre)}</h2><a class="btn ghost small" href="#module-${m.id}">Voir le module</a></div>
    <ul class="lesson-list" style="margin-top:12px">${lessonItems(m)}</ul></div>`).join("")}`;
}
function lessonItems(m){
  return m.lecons.map(l => `<li><a href="#lecon-${l.id}"><span class="chk ${P.lessons[l.id]?"done":""}">${P.lessons[l.id]?"✓":""}</span><span class="ttl">${esc(l.titre)}</span><span class="meta">${l.duree} min</span></a></li>`).join("")
    + `<li><a href="#quiz-${m.id}"><span class="chk ${P.quizzes[m.id]?"done":""}">${P.quizzes[m.id]?"✓":""}</span><span class="ttl">Quiz de validation (${m.quiz.length} questions)</span><span class="meta">${P.quizzes[m.id] ? `Meilleur score ${P.quizzes[m.id].best}/${P.quizzes[m.id].total}` : "Non tenté"}</span></a></li>`;
}
function vModule(id){
  const m = modById(id); if(!m) return null; const s = modStats(m);
  return `<div style="--mod:${m.couleur}">
  <div class="crumbs"><a href="#parcours">Parcours</a> › Module ${m.num}</div>
  <div class="mod-num">MODULE ${m.num}</div><h1>${esc(m.titre)}</h1><p class="lead">${esc(m.accroche)}</p>
  <div class="bar" style="max-width:420px"><i style="width:${s.ratio*100}%"></i></div>
  <div class="meta" style="margin:6px 0 22px">${s.done}/${s.total} leçons terminées${s.quiz ? ` · meilleur score au quiz ${s.quiz.best}/${s.quiz.total}` : ""}</div>
  <ul class="lesson-list">${lessonItems(m)}</ul>
  ${m.calcs.length ? `<h3 style="margin-top:30px">Mettre en pratique</h3><div class="grid g2">${m.calcs.map(calcCard).join("")}</div>` : ""}
  </div>`;
}
function vLesson(id){
  const l = lessonById(id); if(!l) return null; const m = l.mod;
  const idx = m.lecons.findIndex(x => x.id === l.id), prev = m.lecons[idx-1], next = m.lecons[idx+1];
  const done = !!P.lessons[l.id];
  return `<div style="--mod:${m.couleur}"><article class="lesson">
  <div class="crumbs"><a href="#parcours">Parcours</a> › <a href="#module-${m.id}">Module ${m.num} · ${esc(m.titre)}</a> › Leçon ${idx+1}</div>
  <div class="mod-num">LEÇON ${m.num}.${idx+1} · ${l.duree} MIN</div>
  <h1>${esc(l.titre)}</h1>
  <div class="objs"><strong>Objectifs</strong><ul>${l.objectifs.map(o=>`<li>${esc(o)}</li>`).join("")}</ul></div>
  ${l.sections.map(s => `<section><h2>${esc(s.h)}</h2>${s.html}</section>`).join("")}
  <div class="keypts"><h3>À retenir</h3><ul>${l.points.map(p=>`<li>${esc(p)}</li>`).join("")}</ul></div>
  <div class="lesson-foot">
    <div class="row">${prev ? `<a class="btn ghost small" href="#lecon-${prev.id}">← Leçon précédente</a>` : ""}</div>
    <div class="row">
      <button class="btn ${done?"ghost":""}" id="markDone" data-id="${l.id}">${done ? "✓ Leçon terminée" : "Marquer comme terminée"}</button>
      ${next ? `<a class="btn ghost" href="#lecon-${next.id}">Leçon suivante →</a>` : `<a class="btn ghost" href="#quiz-${m.id}">Passer le quiz →</a>`}
    </div>
  </div></article></div>`;
}
AFTER.lecon = () => { const b = $("#markDone"); if(!b) return; b.onclick = () => {
  const id = b.dataset.id;
  if(P.lessons[id]) delete P.lessons[id]; else P.lessons[id] = Date.now();
  persist(); b.textContent = P.lessons[id] ? "✓ Leçon terminée" : "Marquer comme terminée"; b.classList.toggle("ghost", !!P.lessons[id]);
  if(P.lessons[id]) toast("Leçon enregistrée dans votre progression");
}; };

/* ---------- Quiz ---------- */
function vQuiz(id){
  const m = modById(id); if(!m) return null; const prev = P.quizzes[m.id];
  return `<div style="--mod:${m.couleur};max-width:780px">
  <div class="crumbs"><a href="#parcours">Parcours</a> › <a href="#module-${m.id}">Module ${m.num} · ${esc(m.titre)}</a> › Quiz</div>
  <div class="mod-num">QUIZ DE VALIDATION · MODULE ${m.num}</div><h1>${esc(m.titre)}</h1>
  <p class="meta">${m.quiz.length} questions · une seule bonne réponse par question${prev ? ` · meilleur score : ${prev.best}/${prev.total} (${prev.attempts} tentative${prev.attempts>1?"s":""})` : ""}</p>
  <form id="quizForm" data-mod="${m.id}">
  ${m.quiz.map((q,i) => `<div class="q" data-i="${i}"><div class="qn">Question ${i+1}/${m.quiz.length}</div><div class="qt">${esc(q.q)}</div>
    ${q.o.map((o,j)=>`<label class="opt"><input type="radio" name="q${i}" value="${j}"><span>${esc(o)}</span></label>`).join("")}
    <div class="expl" hidden></div></div>`).join("")}
  <div class="row" id="quizActions"><button class="btn" type="submit">Valider mes réponses</button><span class="meta" id="quizMsg"></span></div>
  </form><div id="quizResult"></div></div>`;
}
AFTER.quiz = (h) => {
  const f = $("#quizForm"); if(!f) return; const m = modById(f.dataset.mod);
  f.addEventListener("change", e => { if(e.target.type==="radio"){ e.target.closest(".q").querySelectorAll(".opt").forEach(o=>o.classList.toggle("sel", o.querySelector("input").checked)); } });
  f.onsubmit = e => { e.preventDefault();
    const ans = m.quiz.map((q,i) => { const c = f.querySelector(`input[name=q${i}]:checked`); return c ? +c.value : null; });
    const missing = ans.filter(a=>a===null).length;
    if(missing){ $("#quizMsg").textContent = `Il reste ${missing} question${missing>1?"s":""} sans réponse.`; return; }
    let score = 0; const wrong = [];
    m.quiz.forEach((q,i) => { const box = f.querySelector(`.q[data-i="${i}"]`); const ok = ans[i]===q.c; if(ok) score++; else wrong.push(i);
      box.querySelectorAll(".opt").forEach((o,j)=>{ o.classList.remove("sel"); if(j===q.c) o.classList.add("right"); else if(j===ans[i]) o.classList.add("wrong"); o.querySelector("input").disabled = true; });
      const ex = box.querySelector(".expl"); ex.hidden = false; ex.innerHTML = `<strong>${ok ? "Bonne réponse." : "Réponse attendue : " + esc(q.o[q.c]) + "."}</strong> ${esc(q.e)}`; });
    const old = P.quizzes[m.id];
    P.quizzes[m.id] = { best: Math.max(score, old ? old.best : 0), last: score, total: m.quiz.length, wrong, attempts: (old ? old.attempts : 0) + 1, at: Date.now() };
    persist();
    const r = score/m.quiz.length;
    $("#quizActions").innerHTML = `<button class="btn ghost" type="button" id="retry">Recommencer le quiz</button>`;
    $("#retry").onclick = () => route();
    $("#quizResult").innerHTML = `<div class="card" style="margin-top:10px"><div class="row" style="gap:22px"><div class="score">${score}/${m.quiz.length}</div>
      <div><span class="tag ${r>=0.8?"ok":r>=0.6?"warn":"ko"}">${r>=0.8?"Module validé":r>=0.6?"Presque validé":"À retravailler"}</span>
      <div class="meta" style="margin-top:6px">${r>=0.8 ? "Excellent travail. Tu peux passer au module suivant." : "Relis les leçons concernées puis retente le quiz ; le seuil de validation est de 80 %."}</div></div></div>
      <div class="row" style="margin-top:14px">${nextModLink(m)}</div></div>`;
    $("#quizResult").scrollIntoView({behavior:"smooth", block:"center"});
  };
};
function nextModLink(m){ const n = MODS[MODS.indexOf(m)+1]; return n ? `<a class="btn" href="#module-${n.id}">Module suivant : ${esc(n.titre)} →</a>` : `<a class="btn" href="#progression">Voir mon bilan →</a>`; }

/* ---------- Calculateurs ---------- */
function calcCard(k){ const c = CALCS[k], m = modById(c.module); return `<a class="card link" href="#calc-${k}" style="border-left:4px solid ${m.couleur}"><div class="meta">Module ${m.num} · ${esc(m.titre)}</div><h3 style="margin:4px 0">${esc(c.titre)}</h3><div class="meta" style="color:var(--ink2)">${esc(c.desc)}</div></a>`; }
function vCalcs(){ return `<div class="eyebrow">Mettre en pratique</div><h1>Calculateurs interactifs</h1><p class="lead">Modifie les paramètres et observe l'effet sur les mesures de risque. Les valeurs par défaut reprennent les exemples des leçons.</p><div class="grid g2" style="margin-top:20px">${Object.keys(CALCS).map(calcCard).join("")}</div>${CFG.labUrl ? `<a class="card link" href="${esc(CFG.labUrl)}" target="_blank" rel="noopener" style="margin-top:20px;background:var(--ink);color:var(--paper);border-color:var(--ink)"><div class="eyebrow" style="color:#e0a35a">Pour aller plus loin</div><h3 style="margin:4px 0;color:var(--paper)">Laboratoire Python ↗</h3><div style="opacity:.85;font-size:15px">VaR Monte-Carlo, backtesting avec test de Kupiec, analyse de vos propres séries de prix et versions Python de tous les calculateurs.</div></a>` : ""}`; }
function field(id, label, val, hint, attrs=""){ return `<div class="fld"><label for="${id}">${label}</label><input id="${id}" value="${val}" inputmode="decimal" ${attrs}>${hint?`<span class="hint">${hint}</span>`:""}</div>`; }
function kpi(k, v, s, cls=""){ return `<div class="kpi ${cls}"><div class="k">${k}</div><div class="v">${v}</div>${s?`<div class="s">${s}</div>`:""}</div>`; }
function vCalc(k){
  const c = CALCS[k]; if(!c) return null; const m = modById(c.module);
  const body = { var: calcVarHtml, irb: calcIrbHtml, cva: calcCvaHtml, eve: calcEveHtml, lcr: calcLcrHtml, opr: calcOprHtml, clim: calcClimHtml, bin: calcBinHtml }[k]();
  return `<div class="crumbs"><a href="#calculateurs">Calculateurs</a> › ${esc(c.titre)}</div>
  <div class="meta">Module ${m.num} · <a href="#module-${m.id}">${esc(m.titre)}</a></div><h1>${esc(c.titre)}</h1><p class="lead" style="margin-bottom:22px">${esc(c.desc)}</p>${body}`;
}
AFTER.calc = (h) => { const k = h.slice(5); const fn = { var: calcVar, irb: calcIrb, cva: calcCva, eve: calcEve, lcr: calcLcr, opr: calcOpr, clim: calcClim, bin: calcBin }[k]; if(!fn) return;
  const run = () => { try{ fn(); }catch(e){ console.error(e); } };
  $("#view").querySelectorAll("input,select,textarea").forEach(el => el.addEventListener("input", run));
  $("#view").querySelectorAll(".tabs button").forEach(b => b.onclick = () => { $("#view").querySelectorAll(".tabs button").forEach(x=>x.classList.toggle("on", x===b)); $("#view").querySelectorAll("[data-pane]").forEach(p=>p.hidden = p.dataset.pane!==b.dataset.tab); run(); });
  run();
  if(!P.calcs[k]){ P.calcs[k] = Date.now(); persist(); }
};

// VaR
function sampleReturns(){ let s = 42; const rnd = () => (s = (s*16807) % 2147483647) / 2147483647;
  const out = []; for(let i=0;i<250;i++){ const u1 = rnd(), u2 = rnd(); let z = Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2); if(rnd()<0.04) z *= 2.6; out.push((z*1.1 + 0.03).toFixed(2)); } return out.join(" "); }
function calcVarHtml(){ return `<div class="tabs"><button class="on" data-tab="p">Paramétrique</button><button data-tab="h">Historique</button></div>
  <div class="calc"><div class="card">
    ${field("v_pos","Valeur du portefeuille (€)","10 000 000")}
    ${field("v_conf","Niveau de confiance (%)","99")}
    ${field("v_h","Horizon (jours ouvrés)","10","Racine du temps appliquée à partir de la VaR 1 jour")}
    <div data-pane="p">${field("v_vol","Volatilité annuelle (%)","20","Convertie en volatilité quotidienne par √252")}</div>
    <div data-pane="h" hidden><div class="fld"><label for="v_ret">Rendements quotidiens historiques (%)</label><textarea id="v_ret">${sampleReturns()}</textarea><span class="hint">Séparés par des espaces, des retours à la ligne ou des points-virgules. Exemple : 250 jours simulés avec queues épaisses.</span></div></div>
  </div><div><div class="grid g4" id="v_out"></div><div class="card" style="margin-top:16px"><div class="meta" style="margin-bottom:6px">Distribution des P&amp;L quotidiens et seuil de VaR</div><div id="v_chart"></div></div><p class="note" id="v_note" style="margin-top:14px"></p></div></div>`; }
function calcVar(){
  const V = num($("#v_pos").value), a = num($("#v_conf").value)/100, h = num($("#v_h").value);
  const hist = !$("[data-pane=h]").hidden; let var1, es1, pnl;
  if(!hist){ const sd = num($("#v_vol").value)/100/Math.sqrt(252); const z = Ninv(a);
    var1 = z*sd*V; es1 = sd*phi(z)/(1-a)*V;
    pnl = []; for(let i=-40;i<=40;i++){ const x = i/10; pnl.push([x*sd*V, phi(x)]); }
    drawDist(pnl, -var1, true);
    $("#v_note").innerHTML = `Hypothèse de normalité : z<sub>${fmt(a*100,1)} %</sub> = ${fmt(z,3)}. Sous loi normale, l'ES ${fmt(a*100,1)} % vaut ${fmt(es1/var1,3)} fois la VaR.`;
  } else {
    const r = $("#v_ret").value.split(/[\s;]+/).map(num).filter(isFinite);
    if(r.length < 20){ $("#v_out").innerHTML = `<div class="empty">Saisis au moins 20 rendements.</div>`; $("#v_chart").innerHTML=""; return; }
    const losses = r.map(x => -x/100*V).sort((x,y)=>y-x);
    const k = Math.max(1, Math.floor(r.length*(1-a)));
    var1 = losses[k-1]; es1 = losses.slice(0,k).reduce((s,x)=>s+x,0)/k;
    pnl = r.map(x => x/100*V); drawHist(pnl, -var1);
    $("#v_note").innerHTML = `${r.length} observations : la VaR correspond à la ${k}<sup>e</sup> plus forte perte, l'ES à la moyenne des ${k} plus fortes pertes. Pour comparaison, la VaR paramétrique avec la même volatilité empirique serait de ${fmt(Ninv(a)*stdev(r)/100*V)} €.`;
  }
  const sq = Math.sqrt(h);
  $("#v_out").innerHTML = kpi("VaR 1 jour", fmt(var1)+" €", pct(var1/V,2)+" du portefeuille") + kpi("ES 1 jour", fmt(es1)+" €", "Perte moyenne au-delà de la VaR") + kpi(`VaR ${fmt(h)} jours`, fmt(var1*sq)+" €", `× √${fmt(h)} = ${fmt(sq,3)}`) + kpi(`ES ${fmt(h)} jours`, fmt(es1*sq)+" €", "Même mise à l'échelle");
}
function stdev(a){ const m = a.reduce((s,x)=>s+x,0)/a.length; return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)); }
function drawDist(pts, cut){ const W=640,H=200,pad=24; const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]); const x0=Math.min(...xs),x1=Math.max(...xs),y1=Math.max(...ys);
  const X=x=>pad+(x-x0)/(x1-x0)*(W-2*pad), Y=y=>H-pad-y/y1*(H-2*pad);
  const line = pts.map((p,i)=>(i?"L":"M")+X(p[0]).toFixed(1)+","+Y(p[1]).toFixed(1)).join("");
  const tail = pts.filter(p=>p[0]<=cut); const area = tail.length ? "M"+X(tail[0][0])+","+Y(0)+tail.map(p=>"L"+X(p[0]).toFixed(1)+","+Y(p[1]).toFixed(1)).join("")+"L"+X(cut)+","+Y(0)+"Z" : "";
  $("#v_chart").innerHTML = `<svg class="svgchart" viewBox="0 0 ${W} ${H}"><path d="${area}" fill="var(--ko)" opacity=".35"/><path d="${line}" fill="none" stroke="var(--ink)" stroke-width="2"/><line x1="${X(cut)}" x2="${X(cut)}" y1="${pad-6}" y2="${H-pad}" stroke="var(--ko)" stroke-width="2" stroke-dasharray="4 3"/><text x="${X(cut)+6}" y="${pad+6}" font-size="12" fill="var(--ko)">−VaR</text><line x1="${pad}" x2="${W-pad}" y1="${H-pad}" y2="${H-pad}" stroke="var(--line)"/><text x="${W/2}" y="${H-6}" font-size="11" text-anchor="middle" fill="var(--mute)">P&amp;L quotidien (€)</text></svg>`; }
function drawHist(pnl, cut){ const W=640,H=200,pad=24,nb=30; const x0=Math.min(...pnl), x1=Math.max(...pnl), w=(x1-x0)/nb||1; const bins=new Array(nb).fill(0); pnl.forEach(x=>bins[Math.min(nb-1,Math.floor((x-x0)/w))]++);
  const ymax=Math.max(...bins), bw=(W-2*pad)/nb; const X=x=>pad+(x-x0)/(x1-x0)*(W-2*pad);
  const bars = bins.map((b,i)=>{ const left=x0+i*w; const hgt=b/ymax*(H-2*pad); return `<rect x="${(pad+i*bw+1).toFixed(1)}" y="${(H-pad-hgt).toFixed(1)}" width="${(bw-2).toFixed(1)}" height="${hgt.toFixed(1)}" rx="1.5" fill="${left+w<=cut+1e-9?"var(--ko)":"var(--mod)"}" opacity="${left+w<=cut+1e-9?".85":".55"}"/>`; }).join("");
  $("#v_chart").innerHTML = `<svg class="svgchart" viewBox="0 0 ${W} ${H}">${bars}<line x1="${X(cut)}" x2="${X(cut)}" y1="${pad-6}" y2="${H-pad}" stroke="var(--ko)" stroke-width="2" stroke-dasharray="4 3"/><text x="${X(cut)+6}" y="${pad+6}" font-size="12" fill="var(--ko)">−VaR</text><line x1="${pad}" x2="${W-pad}" y1="${H-pad}" y2="${H-pad}" stroke="var(--line)"/><text x="${W/2}" y="${H-6}" font-size="11" text-anchor="middle" fill="var(--mute)">P&amp;L quotidien (€)</text></svg>`; }

// IRB
function irbK(PD, LGD, M){ PD = Math.max(PD, 0.0005); const e = (1-Math.exp(-50*PD))/(1-Math.exp(-50));
  const R = 0.12*e + 0.24*(1-e); const b = Math.pow(0.11852 - 0.05478*Math.log(PD), 2);
  const K = (LGD*N((Ninv(PD) + Math.sqrt(R)*Ninv(0.999))/Math.sqrt(1-R)) - PD*LGD) * (1+(M-2.5)*b)/(1-1.5*b);
  return { K, R, b, PD }; }
function calcIrbHtml(){ return `<div class="calc"><div class="card">
  ${field("i_pd","PD à un an (%)","1","Plancher CRR3 de 0,05 % appliqué")}
  ${field("i_lgd","LGD (%)","45","45 % : valeur F-IRB historique pour le senior non garanti (40 % sous CRR3 pour les entreprises non financières)")}
  ${field("i_m","Maturité effective M (années)","2,5","Entre 1 et 5 ans")}
  ${field("i_ead","EAD (€)","10 000 000")}
  </div><div><div class="grid g4" id="i_out"></div><div class="card" style="margin-top:16px"><div class="meta" style="margin-bottom:6px">Pondération en risque selon la PD (LGD et M constantes)</div><div id="i_chart"></div></div><p class="note" style="margin-top:14px">Formule IRB pour les expositions sur entreprises (article 153 du CRR), sans ajustement de taille pour les PME ni facteur de soutien. Outil pédagogique : ne remplace pas un moteur de calcul réglementaire.</p></div></div>`; }
function calcIrb(){
  const PD = num($("#i_pd").value)/100, LGD = num($("#i_lgd").value)/100, M = Math.min(5, Math.max(1, num($("#i_m").value))), EAD = num($("#i_ead").value);
  const r = irbK(PD, LGD, M), RW = r.K*12.5, RWA = RW*EAD, EL = r.PD*LGD*EAD;
  $("#i_out").innerHTML = kpi("Pondération (RW)", pct(RW,1), `K = ${pct(r.K,2)}`) + kpi("RWA", fmt(RWA)+" €", "K × 12,5 × EAD") + kpi("Capital à 8 %", fmt(RWA*0.08)+" €", "= K × EAD") + kpi("Perte attendue", fmt(EL)+" €", `Corrélation R = ${pct(r.R,2)}`);
  const W=640,H=210,pad=34; const pts=[]; for(let i=0;i<=60;i++){ const pd=Math.pow(10, -3.3 + i*(3.3-0.7)/60); pts.push([pd, irbK(pd,LGD,M).K*12.5]); }
  const xL=v=>pad+(Math.log10(v)+3.3)/(3.3-0.7)*(W-2*pad); const ymax=Math.max(...pts.map(p=>p[1]))*1.1; const Y=v=>H-pad-v/ymax*(H-2*pad);
  const line=pts.map((p,i)=>(i?"L":"M")+xL(p[0]).toFixed(1)+","+Y(p[1]).toFixed(1)).join("");
  const ticks=[0.001,0.01,0.05,0.2].map(t=>`<text x="${xL(t)}" y="${H-pad+16}" font-size="11" text-anchor="middle" fill="var(--mute)">${fmt(t*100, t<0.01?1:0)} %</text>`).join("");
  const yt=[0,0.5,1,1.5,2,2.5].filter(v=>v<ymax).map(v=>`<line x1="${pad}" x2="${W-pad}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="${pad-6}" y="${Y(v)+4}" font-size="11" text-anchor="end" fill="var(--mute)">${fmt(v*100)}%</text>`).join("");
  const cx = xL(Math.min(Math.max(r.PD,0.0005),0.2)), cy = Y(RW);
  $("#i_chart").innerHTML = `<svg class="svgchart" viewBox="0 0 ${W} ${H}">${yt}<path d="${line}" fill="none" stroke="var(--mod)" stroke-width="2.5"/>${r.PD<=0.2?`<circle cx="${cx}" cy="${cy}" r="5.5" fill="var(--accent)" stroke="var(--card)" stroke-width="2"/>`:""}${ticks}<text x="${W/2}" y="${H-2}" font-size="11" text-anchor="middle" fill="var(--mute)">PD (échelle logarithmique)</text></svg>`;
}

// CVA
function calcCvaHtml(){ return `<div class="calc"><div class="card">
  ${field("c_ee","Profil d'exposition attendue EE (€, une valeur par année)","1,2 1,8 2,0 1,7 1,0","En millions d'euros, séparés par des espaces : EE en fin d'année 1, 2, 3…")}
  ${field("c_s","Spread de CDS de la contrepartie (pb)","150")}
  ${field("c_lgd","LGD de marché (%)","60","Convention usuelle : recouvrement de 40 %")}
  ${field("c_r","Taux sans risque (%)","2,5")}
  </div><div><div class="grid g4" id="c_out"></div><div class="card" style="margin-top:16px;overflow-x:auto"><table class="t" id="c_tab"></table></div><p class="note" style="margin-top:14px">CVA unilatérale, discrétisation annuelle, intensité de défaut constante λ = spread / LGD, sans corrélation entre exposition et défaut (pas de wrong-way risk).</p></div></div>`; }
function calcCva(){
  const ee = $("#c_ee").value.split(/[\s;]+/).map(num).filter(isFinite).map(x=>x*1e6);
  const s = num($("#c_s").value)/1e4, L = num($("#c_lgd").value)/100, r = num($("#c_r").value)/100;
  if(!ee.length || !(L>0)){ $("#c_out").innerHTML = `<div class="empty">Paramètres incomplets.</div>`; return; }
  const lam = s/L; let cva = 0, rows = "";
  ee.forEach((e,i)=>{ const t=i+1, pdm = Math.exp(-lam*(t-1)) - Math.exp(-lam*t), df = Math.exp(-r*t), c = L*e*df*pdm; cva += c;
    rows += `<tr><td>${t}</td><td class="num">${fmt(e)}</td><td class="num">${pct(pdm,2)}</td><td class="num">${fmt(df,4)}</td><td class="num">${fmt(c)}</td></tr>`; });
  const epe = ee.reduce((a,b)=>a+b,0)/ee.length;
  $("#c_out").innerHTML = kpi("CVA", fmt(cva)+" €", "Ajustement à déduire de la juste valeur") + kpi("Intensité λ", pct(lam,2), "par an") + kpi("PD cumulée", pct(1-Math.exp(-lam*ee.length),2), `sur ${ee.length} an${ee.length>1?"s":""}`) + kpi("EPE", fmt(epe)+" €", `CVA en pb de l'EPE : ${fmt(cva/epe*1e4,0)} pb`);
  $("#c_tab").innerHTML = `<thead><tr><th>Année</th><th class="num">EE (€)</th><th class="num">PD marginale</th><th class="num">Actualisation</th><th class="num">Contribution CVA (€)</th></tr></thead><tbody>${rows}</tbody>`;
}

// EVE
function calcEveHtml(){ return `<div class="calc"><div class="card">
  ${field("e_a","Actifs sensibles aux taux (M€)","1 000")}
  ${field("e_da","Duration modifiée des actifs","4,5")}
  ${field("e_p","Passifs sensibles aux taux (M€)","920")}
  ${field("e_dp","Duration modifiée des passifs","1,8")}
  ${field("e_t1","Fonds propres Tier 1 (M€)","80")}
  ${field("e_shock","Choc parallèle (pb)","200","Positif pour une hausse, négatif pour une baisse")}
  </div><div><div class="grid g4" id="e_out"></div><div class="card" style="margin-top:16px"><div class="meta" style="margin-bottom:6px">ΔEVE en % du Tier 1 selon l'amplitude du choc parallèle</div><div id="e_chart"></div></div><p class="note" style="margin-top:14px">Approximation au premier ordre (duration), sans convexité ni options comportementales. Le SOT réglementaire porte sur six scénarios, dont des chocs non parallèles.</p></div></div>`; }
function calcEve(){
  const A=num($("#e_a").value), DA=num($("#e_da").value), Pp=num($("#e_p").value), DP=num($("#e_dp").value), T1=num($("#e_t1").value), sh=num($("#e_shock").value)/1e4;
  const d = x => -(DA*A - DP*Pp)*x; const dEVE = d(sh), ratio = dEVE/T1, gapD = DA - DP*Pp/A;
  const breach = ratio < -0.15;
  $("#e_out").innerHTML = kpi("ΔEVE", fmt(dEVE,1)+" M€", `pour ${fmt(sh*1e4)} pb`) + kpi("En % du Tier 1", pct(ratio,1), breach ? `<span class="tag ko">Au-delà du seuil SOT (−15 %)</span>` : `<span class="tag ok">Sous le seuil SOT</span>`) + kpi("Gap de duration", fmt(gapD,2), "D_A − D_P × P/A") + kpi("Choc de rupture", isFinite(-0.15*T1/(DA*A-DP*Pp)) && (DA*A-DP*Pp)!==0 ? fmt(Math.abs(0.15*T1/(DA*A-DP*Pp))*1e4,0)+" pb" : "—", "Amplitude qui atteint −15 % du Tier 1");
  const W=640,H=220,pad=40; const xs=[]; for(let b=-300;b<=300;b+=10) xs.push(b);
  const vals = xs.map(b=>d(b/1e4)/T1); const lim = Math.max(0.3, ...vals.map(Math.abs))*1.05;
  const X=b=>pad+(b+300)/600*(W-2*pad), Y=v=>H/2 - v/lim*(H/2-pad/1.5);
  const line = xs.map((b,i)=>(i?"L":"M")+X(b).toFixed(1)+","+Y(vals[i]).toFixed(1)).join("");
  $("#e_chart").innerHTML = `<svg class="svgchart" viewBox="0 0 ${W} ${H}"><rect x="${pad}" y="${Y(-0.15)}" width="${W-2*pad}" height="${Math.max(0,H-pad/1.5-Y(-0.15))}" fill="var(--ko)" opacity=".08"/><line x1="${pad}" x2="${W-pad}" y1="${Y(-0.15)}" y2="${Y(-0.15)}" stroke="var(--ko)" stroke-dasharray="5 4"/><text x="${W-pad}" y="${Y(-0.15)-5}" font-size="11" text-anchor="end" fill="var(--ko)">Seuil SOT −15 %</text><line x1="${pad}" x2="${W-pad}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--line)"/><line x1="${X(0)}" x2="${X(0)}" y1="${pad/2}" y2="${H-pad/2}" stroke="var(--line)"/><path d="${line}" fill="none" stroke="var(--mod)" stroke-width="2.5"/><circle cx="${X(Math.max(-300,Math.min(300,sh*1e4)))}" cy="${Y(Math.max(-lim,Math.min(lim,ratio)))}" r="5.5" fill="var(--accent)" stroke="var(--card)" stroke-width="2"/>${[-300,-200,-100,0,100,200,300].map(b=>`<text x="${X(b)}" y="${H-4}" font-size="11" text-anchor="middle" fill="var(--mute)">${b>0?"+":""}${b} pb</text>`).join("")}</svg>`;
}

// LCR
function calcLcrHtml(){ return `<div class="calc"><div class="card">
  ${field("l_1","Actifs de niveau 1 (M€)","600","Aucune décote")}
  ${field("l_2a","Actifs de niveau 2A, avant décote (M€)","250","Décote de 15 %")}
  ${field("l_2b","Actifs de niveau 2B, avant décote (M€)","150")}
  <div class="fld"><label for="l_h2b">Décote moyenne du niveau 2B</label><select id="l_h2b"><option value="0.25">25 % (titrisations éligibles)</option><option value="0.5" selected>50 % (obligations d'entreprises, actions)</option></select></div>
  ${field("l_out","Sorties de trésorerie pondérées sur 30 jours (M€)","900")}
  ${field("l_in","Entrées de trésorerie pondérées sur 30 jours (M€)","400")}
  </div><div><div class="grid g4" id="l_out_k"></div><div class="card" style="margin-top:16px;overflow-x:auto"><table class="t" id="l_tab"></table></div><p class="note" style="margin-top:14px">Calcul simplifié selon la méthodologie de Bâle : plafonds de 40 % (niveau 2) et 15 % (niveau 2B) appliqués après décotes, sans retraitement des opérations de financement sécurisées à court terme.</p></div></div>`; }
function calcLcr(){
  const L1=num($("#l_1").value), L2A=num($("#l_2a").value)*0.85, L2B=num($("#l_2b").value)*(1-num($("#l_h2b").value)), out=num($("#l_out").value), inn=num($("#l_in").value);
  const adj15 = Math.max(L2B - 15/85*(L1+L2A), L2B - 15/60*L1, 0);
  const adj40 = Math.max(L2A + L2B - adj15 - 2/3*L1, 0);
  const hqla = L1 + L2A + L2B - adj15 - adj40;
  const inCap = Math.min(inn, 0.75*out), net = out - inCap, lcr = hqla/net;
  $("#l_out_k").innerHTML = kpi("LCR", pct(lcr,0), lcr>=1 ? `<span class="tag ok">Exigence de 100 % respectée</span>` : `<span class="tag ko">Sous l'exigence de 100 %</span>`) + kpi("Stock de HQLA", fmt(hqla,0)+" M€", "Après décotes et plafonds") + kpi("Sorties nettes", fmt(net,0)+" M€", inn>0.75*out ? "Plafond des entrées à 75 % appliqué" : "Entrées sous le plafond de 75 %") + kpi(lcr>=1?"Excédent":"Besoin de HQLA", fmt(Math.abs(hqla-net),0)+" M€", lcr>=1 ? "Marge au-dessus de 100 %" : "Actifs de niveau 1 à acquérir");
  $("#l_tab").innerHTML = `<thead><tr><th>Composante</th><th class="num">M€</th></tr></thead><tbody>
    <tr><td>Niveau 1</td><td class="num">${fmt(L1,1)}</td></tr><tr><td>Niveau 2A après décote</td><td class="num">${fmt(L2A,1)}</td></tr><tr><td>Niveau 2B après décote</td><td class="num">${fmt(L2B,1)}</td></tr>
    <tr><td>Ajustement plafond 15 % (2B)</td><td class="num">−${fmt(adj15,1)}</td></tr><tr><td>Ajustement plafond 40 % (niveau 2)</td><td class="num">−${fmt(adj40,1)}</td></tr>
    <tr><th>Stock de HQLA</th><th class="num">${fmt(hqla,1)}</th></tr><tr><td>Sorties</td><td class="num">${fmt(out,1)}</td></tr><tr><td>Entrées retenues (min(entrées ; 75 % des sorties))</td><td class="num">−${fmt(inCap,1)}</td></tr>
    <tr><th>Sorties nettes</th><th class="num">${fmt(net,1)}</th></tr></tbody>`;
}

// Risque opérationnel (BIC)
function calcOprHtml(){ return `<div class="calc"><div class="card">
  ${field("o_ildc","ILDC — intérêts, locations et dividendes (M€)","2 400","Moyenne sur trois ans, après plafonnement à 2,25 % des actifs productifs")}
  ${field("o_sc","SC — services (M€)","1 800")}
  ${field("o_fc","FC — composante financière (M€)","800")}
  </div><div><div class="grid g4" id="o_out"></div><div class="card" style="margin-top:16px;overflow-x:auto"><table class="t" id="o_tab"></table></div><p class="note" style="margin-top:14px">Approche standard CRR3 avec ILM = 1 (choix européen) : l'exigence est égale à la BIC. Les sous-composantes doivent être calculées selon les articles 314 et 315 du CRR et les normes techniques de l'EBA.</p></div></div>`; }
function calcOpr(){
  const BI = num($("#o_ildc").value) + num($("#o_sc").value) + num($("#o_fc").value);
  const tr = [[0,1000,0.12],[1000,30000,0.15],[30000,Infinity,0.18]]; let bic = 0, rows = "";
  tr.forEach(([a,b,c]) => { const part = Math.max(0, Math.min(BI,b)-a), v = part*c; bic += v;
    rows += `<tr><td>${b===Infinity?`Au-delà de ${fmt(a/1000)} Md€`:`De ${fmt(a/1000)} à ${fmt(b/1000)} Md€`}</td><td class="num">${fmt(part,0)}</td><td class="num">${pct(c,0)}</td><td class="num">${fmt(v,1)}</td></tr>`; });
  $("#o_out").innerHTML = kpi("Indicateur d'activité (BI)", fmt(BI,0)+" M€") + kpi("BIC = exigence", fmt(bic,1)+" M€", `Taux moyen ${pct(bic/BI,2)}`) + kpi("RWA risque opérationnel", fmt(bic*12.5,0)+" M€", "Exigence × 12,5") + kpi("Tranche marginale", BI>30000?"18 %":BI>1000?"15 %":"12 %", "Coefficient appliqué au dernier euro");
  $("#o_tab").innerHTML = `<thead><tr><th>Tranche de BI</th><th class="num">Montant dans la tranche (M€)</th><th class="num">Coefficient</th><th class="num">Contribution (M€)</th></tr></thead><tbody>${rows}<tr><th colspan="3">Composante BIC</th><th class="num">${fmt(bic,1)}</th></tr></tbody>`;
}

// Choc carbone
function calcClimHtml(){ return `<div class="calc"><div class="card">
  ${field("k_em","Émissions directes et indirectes retenues (tCO2e / an)","2 000 000","Périmètre à définir : scope 1, voire scope 2")}
  ${field("k_dp","Hausse du prix du carbone (€ / tCO2e)","100")}
  ${field("k_pt","Part répercutée sur les clients (%)","30","Capacité à augmenter les prix")}
  ${field("k_eb","EBITDA initial (M€)","600")}
  ${field("k_nd","Dette nette (M€)","2 100")}
  ${field("k_int","Charges d'intérêts (M€)","90")}
  </div><div><div class="grid g4" id="k_out"></div><div class="card" style="margin-top:16px"><div class="meta" style="margin-bottom:6px">Levier (dette nette / EBITDA) selon la hausse du prix du carbone</div><div id="k_chart"></div></div><p class="note" style="margin-top:14px">Illustration d'une étape de stress test climatique (impact direct, sans effets sur les volumes ni investissements de décarbonation). Le seuil de 6× correspond au niveau de levier au-delà duquel la BCE considère qu'une opération à effet de levier appelle une vigilance particulière.</p></div></div>`; }
function calcClim(){
  const em=num($("#k_em").value), dp=num($("#k_dp").value), pt=num($("#k_pt").value)/100, eb=num($("#k_eb").value), nd=num($("#k_nd").value), it=num($("#k_int").value);
  const cost = c => em*c*(1-pt)/1e6; const ebA = eb - cost(dp);
  const levB = nd/eb, levA = ebA>0 ? nd/ebA : Infinity;
  $("#k_out").innerHTML = kpi("Coût carbone net", fmt(cost(dp),1)+" M€", `${pct(cost(dp)/eb,1)} de l'EBITDA`) + kpi("EBITDA après choc", fmt(ebA,0)+" M€") + kpi("Levier", (isFinite(levA)?fmt(levA,1)+"×":"EBITDA ≤ 0"), `avant : ${fmt(levB,1)}× ${levA>6?'<span class="tag ko">&gt; 6×</span>':levA>4?'<span class="tag warn">&gt; 4×</span>':'<span class="tag ok">≤ 4×</span>'}`) + kpi("Couverture des intérêts", ebA>0?fmt(ebA/it,1)+"×":"—", `EBITDA / intérêts, avant : ${fmt(eb/it,1)}×`);
  const W=640,H=210,pad=36, xs=[]; for(let c=0;c<=300;c+=5) xs.push(c);
  const lv = xs.map(c=>{ const e = eb-cost(c); return e>0 ? nd/e : NaN; }); const ymax = Math.max(8, ...lv.filter(isFinite).filter(v=>v<20))*1.05;
  const X=c=>pad+c/300*(W-2*pad), Y=v=>H-pad-Math.min(v,ymax)/ymax*(H-2*pad);
  let d=""; lv.forEach((v,i)=>{ if(isFinite(v) && v<ymax) d += (d?"L":"M")+X(xs[i]).toFixed(1)+","+Y(v).toFixed(1); });
  $("#k_chart").innerHTML = `<svg class="svgchart" viewBox="0 0 ${W} ${H}"><line x1="${pad}" x2="${W-pad}" y1="${Y(6)}" y2="${Y(6)}" stroke="var(--ko)" stroke-dasharray="5 4"/><text x="${W-pad}" y="${Y(6)-5}" font-size="11" text-anchor="end" fill="var(--ko)">6×</text><line x1="${pad}" x2="${W-pad}" y1="${Y(4)}" y2="${Y(4)}" stroke="var(--warn)" stroke-dasharray="3 4"/><text x="${W-pad}" y="${Y(4)-5}" font-size="11" text-anchor="end" fill="var(--warn)">4×</text><line x1="${pad}" x2="${W-pad}" y1="${H-pad}" y2="${H-pad}" stroke="var(--line)"/><path d="${d}" fill="none" stroke="var(--mod)" stroke-width="2.5"/>${dp<=300&&isFinite(levA)&&levA<ymax?`<circle cx="${X(dp)}" cy="${Y(levA)}" r="5.5" fill="var(--accent)" stroke="var(--card)" stroke-width="2"/>`:""}${[0,50,100,150,200,250,300].map(c=>`<text x="${X(c)}" y="${H-pad+16}" font-size="11" text-anchor="middle" fill="var(--mute)">${c} €</text>`).join("")}</svg>`;
}

// Test binomial
function lgamma(x){ const g=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5]; let y=x, t=x+5.5; t-=(x+0.5)*Math.log(t); let s=1.000000000190015; for(const c of g) s+=c/++y; return -t+Math.log(2.5066282746310005*s/x); }
function betacf(a,b,x){ let qab=a+b,qap=a+1,qam=a-1,c=1,d=1-qab*x/qap; if(Math.abs(d)<1e-300)d=1e-300; d=1/d; let h=d;
  for(let m=1;m<=300;m++){ const m2=2*m; let aa=m*(b-m)*x/((qam+m2)*(a+m2)); d=1+aa*d; if(Math.abs(d)<1e-300)d=1e-300; c=1+aa/c; if(Math.abs(c)<1e-300)c=1e-300; d=1/d; h*=d*c;
    aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2)); d=1+aa*d; if(Math.abs(d)<1e-300)d=1e-300; c=1+aa/c; if(Math.abs(c)<1e-300)c=1e-300; d=1/d; const del=d*c; h*=del; if(Math.abs(del-1)<3e-12) break; } return h; }
function betai(a,b,x){ if(x<=0) return 0; if(x>=1) return 1; const bt=Math.exp(lgamma(a+b)-lgamma(a)-lgamma(b)+a*Math.log(x)+b*Math.log(1-x));
  return x<(a+1)/(a+b+2) ? bt*betacf(a,b,x)/a : 1-bt*betacf(b,a,1-x)/b; }
function calcBinHtml(){ return `<div class="calc"><div class="card">
  ${field("b_n","Nombre d'emprunteurs dans la classe","1 000")}
  ${field("b_pd","PD prévue (%)","1")}
  ${field("b_d","Défauts observés","16")}
  ${field("b_a","Niveau de confiance du test (%)","95","Rejet si la p-value est inférieure à 1 − niveau")}
  </div><div><div class="grid g4" id="b_out"></div><div class="card" style="margin-top:16px"><div class="meta" style="margin-bottom:6px">Distribution binomiale du nombre de défauts sous l'hypothèse de PD correcte</div><div id="b_chart"></div></div><p class="note" style="margin-top:14px">Test unilatéral de sous-estimation de la PD. Le test de Jeffreys utilise la loi a posteriori Beta(d + ½ ; n − d + ½). Les deux tests supposent l'indépendance des défauts.</p></div></div>`; }
function calcBin(){
  const n=Math.round(num($("#b_n").value)), p=num($("#b_pd").value)/100, d=Math.round(num($("#b_d").value)), a=num($("#b_a").value)/100;
  if(!(n>0&&p>0&&p<1&&d>=0&&d<=n)){ $("#b_out").innerHTML=`<div class="empty">Paramètres incohérents.</div>`; $("#b_chart").innerHTML=""; return; }
  const pv = d===0 ? 1 : betai(d, n-d+1, p); const pj = betai(d+0.5, n-d+0.5, p);
  let crit = 0; while(crit<=n && (crit===0?1:betai(crit, n-crit+1, p)) >= 1-a) crit++;
  const rej = pv < 1-a;
  $("#b_out").innerHTML = kpi("Taux de défaut observé", pct(d/n,2), `PD prévue ${pct(p,2)}`) + kpi("Défauts attendus", fmt(n*p,1), `Seuil de rejet : ${crit} défauts ou plus`) + kpi("p-value binomiale", fmt(pv,4), rej?'<span class="tag ko">Calibration rejetée</span>':'<span class="tag ok">Calibration non rejetée</span>') + kpi("p-value de Jeffreys", fmt(pj,4), pj<1-a?'<span class="tag ko">Rejet</span>':'<span class="tag ok">Non rejet</span>');
  const W=640,H=200,pad=28, kmax=Math.min(n, Math.max(d+3, Math.ceil(n*p+5*Math.sqrt(n*p*(1-p))+3))); const pm=[];
  for(let k=0;k<=kmax;k++) pm.push(Math.exp(lgamma(n+1)-lgamma(k+1)-lgamma(n-k+1)+k*Math.log(p)+(n-k)*Math.log(1-p)));
  const ym=Math.max(...pm), bw=(W-2*pad)/(kmax+1);
  $("#b_chart").innerHTML = `<svg class="svgchart" viewBox="0 0 ${W} ${H}">${pm.map((v,k)=>{ const h=v/ym*(H-2*pad); return `<rect x="${(pad+k*bw+1).toFixed(1)}" y="${(H-pad-h).toFixed(1)}" width="${Math.max(1,bw-2).toFixed(1)}" height="${h.toFixed(1)}" rx="1" fill="${k>=crit?"var(--ko)":"var(--mod)"}" opacity="${k===d?1:.55}"/>`; }).join("")}<line x1="${pad+d*bw+bw/2}" x2="${pad+d*bw+bw/2}" y1="${pad-8}" y2="${H-pad}" stroke="var(--accent)" stroke-width="2"/><text x="${pad+d*bw+bw/2+5}" y="${pad}" font-size="12" fill="var(--accent)">observé : ${d}</text><line x1="${pad}" x2="${W-pad}" y1="${H-pad}" y2="${H-pad}" stroke="var(--line)"/>${[0,Math.round(kmax/4),Math.round(kmax/2),Math.round(3*kmax/4),kmax].map(k=>`<text x="${pad+k*bw+bw/2}" y="${H-pad+15}" font-size="11" text-anchor="middle" fill="var(--mute)">${k}</text>`).join("")}</svg>`;
}

/* ---------- À propos ---------- */
function vAbout(){ const A = window.ABOUT;
  return `<div class="hero" style="grid-template-columns:1.5fr 1fr;align-items:start">
  <div><div class="eyebrow">À propos du formateur</div><h1>${esc(A.nom)}</h1><p class="lead" style="margin-top:-4px">${esc(A.titre)}</p>
  <p>Professionnel de la gestion quantitative des risques depuis plus de vingt-cinq ans, j'ai exercé en banque d'investissement, en gestion d'actifs, dans l'édition de logiciels financiers et en conseil, notamment chez RiskMetrics/JPMorgan, Algorithmics/Fitch, WestLB, Ostrum Asset Management, Nasdaq/Calypso, EY, KPMG et la Banque européenne d'investissement.</p>
  <p>Mon parcours international (Paris, Londres, Abou Dhabi, Riyad) m'a conduit à travailler sur le risque de marché et la FRTB, le risque de contrepartie et les xVA, l'ALM et la liquidité, ainsi que sur le reporting réglementaire. J'ai notamment été formateur sur l'ensemble des modules de la plateforme Calypso chez Nasdaq, avec un accent sur le risque de marché et la FRTB, et auteur d'un cursus de formation ALM.</p>
  <p>Titulaire d'un DEA de mathématiques appliquées (Université Paris VII) et formé à la data science (Artefact School of Data, 2025), je conçois des formations qui relient la théorie, la réglementation et la pratique des outils.</p>
  <h3 style="margin-top:22px">Formations proposées</h3>
  <ul><li>Sessions intra-entreprise ou individuelles, en français ou en anglais, en présentiel ou à distance</li><li>Parcours sur mesure à partir des modules de RiskAcadémie (risque de marché, crédit et contrepartie, ALM et liquidité, réglementation, risque opérationnel, climat et ESG, risque de modèle)</li><li>Ateliers pratiques sur les calculateurs et études de cas</li></ul></div>
  <div class="hero-panel"><div class="eyebrow" style="color:#e0a35a">Contact</div>
  <p style="margin:6px 0 14px;opacity:.9">Pour une demande de formation ou d'intervention :</p>
  <div style="display:grid;gap:10px">
    <a class="btn" style="background:#e0a35a;border-color:#e0a35a;color:#16202e" href="mailto:${esc(A.email)}">Écrire un e-mail</a>
    <span style="font-family:var(--mono);font-size:14px;opacity:.9;word-break:break-all">${esc(A.email)}</span>
    <a class="btn ghost" style="color:#f2efe9;border-color:#4a5666" href="${esc(A.linkedin)}" target="_blank" rel="noopener">Profil LinkedIn</a>
    <a class="btn ghost" style="color:#f2efe9;border-color:#4a5666" href="${esc(A.site)}" target="_blank" rel="noopener">Publications et articles</a>
  </div></div></div>`; }

/* ---------- Ma progression ---------- */
function vProgress(){
  const g = globalStats();
  return `<div class="eyebrow">Tableau de bord personnel</div><h1>Ma progression</h1>
  <div class="grid g4" style="margin:18px 0 26px">${kpi("Avancement", pct(g.ratio,0), `${g.doneUnits}/${g.totalUnits} étapes`)}${kpi("Leçons terminées", Object.keys(P.lessons).filter(lessonById).length+"/"+ALL_LESSONS.length)}${kpi("Quiz réussis (≥ 80 %)", MODS.filter(m=>P.quizzes[m.id] && P.quizzes[m.id].best/P.quizzes[m.id].total>=0.8).length+"/"+MODS.length)}${kpi("Score moyen", g.nQuiz?pct(g.avg,0):"—", "Meilleur score par quiz")}</div>
  <div class="card" style="overflow-x:auto"><table class="t" style="margin:0"><thead><tr><th>Module</th><th>Leçons</th><th>Quiz (meilleur / dernier)</th><th>Tentatives</th><th>Statut</th></tr></thead><tbody>
  ${MODS.map(m=>{ const s = modStats(m), q = s.quiz; const st = q && q.best/q.total>=0.8 && s.done===s.total ? `<span class="tag ok">Validé</span>` : s.done||q ? `<span class="tag warn">En cours</span>` : `<span class="tag neutral">Non commencé</span>`;
    return `<tr><td><a href="#module-${m.id}">${m.num}. ${esc(m.titre)}</a></td><td>${s.done}/${s.total}</td><td>${q?`${q.best}/${q.total} · ${q.last}/${q.total}`:"—"}</td><td>${q?q.attempts:0}</td><td>${st}</td></tr>`; }).join("")}
  </tbody></table></div>
  <div class="card" style="margin-top:22px"><h3>Partager mes résultats avec mon formateur</h3>
  <p class="meta" style="color:var(--ink2)">${ctx.mode==="cloud" ? "Ta progression est déjà synchronisée : ton formateur la voit dans son espace. Ce code reste utile pour la transmettre par un autre canal." : "Ta progression est enregistrée dans ce navigateur uniquement. Génère un code et envoie-le à ton formateur (courriel, messagerie) : il l'importera dans son tableau de bord."}</p>
  <div class="row"><div class="fld" style="flex:1;min-width:220px;margin:0"><label for="expName">Ton nom et prénom</label><input id="expName" placeholder="Ex. : Camille Martin"></div><button class="btn" id="expBtn" style="align-self:flex-end">Générer le code</button></div>
  <div id="expOut" style="margin-top:12px"></div></div>
  <div class="row" style="margin-top:18px"><button class="btn ghost small" id="resetBtn">Réinitialiser ma progression</button></div>`;
}
AFTER.progression = () => {
  try{ const n = localStorage.getItem("riskacademie-name"); if(n) $("#expName").value = n; }catch(e){}
  $("#expBtn").onclick = () => { const name = $("#expName").value.trim(); if(!name){ toast("Indique ton nom pour que le formateur te reconnaisse"); return; }
    try{ localStorage.setItem("riskacademie-name", name); }catch(e){}
    const code = "RA1:" + btoa(unescape(encodeURIComponent(JSON.stringify({ n: name, p: P }))));
    $("#expOut").innerHTML = `<div class="fld"><textarea id="expCode" readonly>${esc(code)}</textarea></div><button class="btn small" id="copyBtn">Copier le code</button>`;
    $("#expCode").onclick = e => e.target.select();
    $("#copyBtn").onclick = async () => { try{ await navigator.clipboard.writeText(code); toast("Code copié"); }catch(e){ $("#expCode").select(); toast("Sélectionne le code et copie-le manuellement"); } };
  };
  $("#resetBtn").onclick = () => { const b = $("#resetBtn");
    if(b.dataset.confirm){ P = { lessons:{}, quizzes:{}, calcs:{}, updatedAt:0 }; persist(); route(); toast("Progression réinitialisée"); }
    else { b.dataset.confirm = "1"; b.textContent = "Cliquer à nouveau pour confirmer"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.confirm; b.textContent = "Réinitialiser ma progression"; } }, 4000); } };
};

/* ---------- Accès formateur (version statique) ---------- */
function vUnlock(){ return `<div style="max-width:440px"><div class="eyebrow">Espace formateur</div><h1>Accès réservé</h1><p class="meta" style="color:var(--ink2)">Saisis le code formateur pour animer une session et consulter les résultats importés dans ce navigateur.</p>
  <form id="unlockForm" class="card"><div class="fld"><label for="unlockCode">Code formateur</label><input id="unlockCode" type="password" autocomplete="current-password"></div><button class="btn" type="submit">Accéder</button> <span class="meta" id="unlockMsg"></span></form></div>`; }
AFTER.formateur = () => { const f = $("#unlockForm"); if(f){ f.onsubmit = async e => { e.preventDefault();
    try{ const h = await sha256($("#unlockCode").value.trim()); if(h === CFG.trainerHash){ ctx.owner = true; try{ sessionStorage.setItem("ra-trainer", h); }catch(_){} route(); } else $("#unlockMsg").textContent = "Code incorrect."; }
    catch(_){ $("#unlockMsg").textContent = "Vérification impossible dans ce navigateur."; } }; return; }
  trainerAfter(); };

/* ---------- Espace formateur ---------- */
let learners = { cloud: [], imported: [] }, subs = [];
function vTrainer(){
  return `<div class="row" style="justify-content:space-between"><div class="eyebrow">Espace formateur</div>${ctx.statique ? `<button class="btn ghost small" id="lockBtn">Verrouiller</button>` : ""}</div><h1>Animer et suivre la formation</h1>${ctx.statique ? `<p class="note">Version hébergée : les résultats importés sont conservés dans ce navigateur uniquement. Utilise toujours le même ordinateur et le même navigateur pour ton tableau de bord.</p>` : ""}
  <div class="tabs"><button class="on" data-t="anim">Animer une session</button><button data-t="dash">Tableau de bord des apprenants</button></div>
  <div data-tp="anim">
    <p class="meta" style="color:var(--ink2)">Projette une leçon sous forme de diapositives ou un quiz en mode questions-réponses. Navigation au clavier : flèches ← →, Échap pour quitter.</p>
    ${MODS.map(m=>`<div class="card" style="margin-top:14px;border-left:4px solid ${m.couleur}"><div class="row" style="justify-content:space-between"><h3 style="margin:0">Module ${m.num} · ${esc(m.titre)}</h3><button class="btn small" data-pq="${m.id}">Projeter le quiz</button></div>
      <div class="grid" style="margin-top:10px;gap:8px">${m.lecons.map((l,i)=>`<div class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding-top:8px"><span>${m.num}.${i+1} ${esc(l.titre)} <span class="meta">· ${l.sections.length+2} diapositives</span></span><button class="btn ghost small" data-pl="${l.id}">Présenter</button></div>`).join("")}</div></div>`).join("")}
  </div>
  <div data-tp="dash" hidden>
    <div id="dashBody"><div class="empty">Chargement des données des apprenants…</div></div>
    <div class="card" style="margin-top:22px"><h3>Importer le code d'un apprenant</h3><p class="meta" style="color:var(--ink2)">Pour les apprenants qui ne peuvent pas synchroniser leur progression (accès en lecture seule), colle ici le code généré depuis leur page « Ma progression ».</p>
      <div class="fld"><textarea id="impCode" placeholder="RA1:…"></textarea></div><button class="btn small" id="impBtn">Importer</button> <span class="meta" id="impMsg"></span></div>
  </div>`;
}
function trainerAfter(){
  if(!ctx.owner) return;
  const lk = $("#lockBtn"); if(lk) lk.onclick = () => { try{ sessionStorage.removeItem("ra-trainer"); }catch(e){} ctx.owner = false; location.hash = "accueil"; route(); };
  document.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { document.querySelectorAll("[data-t]").forEach(x=>x.classList.toggle("on", x===b)); document.querySelectorAll("[data-tp]").forEach(p=>p.hidden = p.dataset.tp!==b.dataset.t); if(b.dataset.t==="dash") renderDash(); });
  document.querySelectorAll("[data-pl]").forEach(b => b.onclick = () => openPres(lessonSlides(lessonById(b.dataset.pl))));
  document.querySelectorAll("[data-pq]").forEach(b => b.onclick = () => openPres(quizSlides(modById(b.dataset.pq))));
  $("#impBtn").onclick = importCode;
  startDashSubs();
};
function startDashSubs(){
  if(!ctx.db){ learners.imported = loadImports(); learners._loaded = true; return; }
  if(subs.length) return;
  const timer = setTimeout(()=>{ if($("#dashBody") && !learners._loaded) $("#dashBody").innerHTML = `<div class="empty">Les données ne sont pas encore accessibles. Vérifie ta connexion ; la page se mettra à jour automatiquement.</div>`; }, 10000);
  const onErr = e => { clearTimeout(timer); learners._loaded = true; if($("#dashBody")) $("#dashBody").innerHTML = `<div class="empty">Impossible de charger les données (${esc(e && e.code)}).</div>`; };
  subs.push(ctx.db.collection("progress").onSnapshot(s => { if(!s.metadata.fromCache) clearTimeout(timer); learners._loaded = true; learners.cloud = s.docs.filter(d=>d.exists).map(d=>({ id:d.id, src:"cloud", p: normalize(d.data()||{}) })); renderDash(); }, onErr));
  subs.push(ctx.db.collection("imported").onSnapshot(s => { learners.imported = s.docs.filter(d=>d.exists).map(d=>{ const x = d.data()||{}; return { id:d.id, src:"import", name: String(x.name||"Sans nom"), p: normalize(x.p||{}) }; }); renderDash(); }, ()=>{}));
}
async function renderDash(){
  const el = $("#dashBody"); if(!el || el.closest("[data-tp]").hidden) return;
  const list = [...learners.cloud, ...learners.imported];
  let names = {};
  if(ctx.user && learners.cloud.length){ try{ names = await ctx.user.profiles(learners.cloud.map(l=>l.id)) || {}; }catch(e){} }
  if(!list.length){ el.innerHTML = `<div class="empty">${ctx.db ? "Aucun apprenant pour le moment. Partage l'application (niveau « Contributeur ») ou importe un code ci-dessous." : "Aucun apprenant importé. Demande à tes apprenants de t'envoyer le code généré depuis leur page « Ma progression », puis colle-le ci-dessous."}</div>`; return; }
  const rows = list.map(l => ({ ...l, label: l.src==="cloud" ? ((names[l.id] && names[l.id].name) || "Apprenant") + (l.id===ctx.uid ? " (vous)" : "") : l.name, g: globalStats(l.p) })).sort((a,b)=>b.g.ratio-a.g.ratio);
  const avgR = rows.reduce((s,r)=>s+r.g.ratio,0)/rows.length; const sc = rows.filter(r=>r.g.nQuiz); const avgS = sc.length ? sc.reduce((s,r)=>s+r.g.avg,0)/sc.length : NaN;
  const active = rows.filter(r => r.p.updatedAt && Date.now()-r.p.updatedAt < 7*864e5).length;
  // questions les plus ratées
  const miss = [];
  MODS.forEach(m => m.quiz.forEach((q,i) => { const tried = rows.filter(r=>r.p.quizzes[m.id]); if(!tried.length) return; const k = tried.filter(r=>(r.p.quizzes[m.id].wrong||[]).includes(i)).length; if(k) miss.push({ m, q, k, n: tried.length }); }));
  miss.sort((a,b)=>b.k/b.n - a.k/a.n);
  const cell = (q) => { if(!q) return `<td class="cell"><span class="meta">—</span></td>`; const r = q.best/q.total; return `<td class="cell"><span class="tag ${r>=0.8?"ok":r>=0.6?"warn":"ko"}">${q.best}/${q.total}</span></td>`; };
  el.innerHTML = `<div class="grid g4" style="margin-bottom:18px">${kpi("Apprenants", rows.length, `${learners.cloud.length} synchronisés · ${learners.imported.length} importés`)}${kpi("Avancement moyen", pct(avgR,0))}${kpi("Score moyen aux quiz", isFinite(avgS)?pct(avgS,0):"—")}${kpi("Actifs (7 jours)", active)}</div>
  <div class="card" style="overflow-x:auto"><table class="t heat" style="margin:0"><thead><tr><th>Apprenant</th><th>Avancement</th>${MODS.map(m=>`<th class="cell">Leçons M${m.num}</th><th class="cell">Quiz M${m.num}</th>`).join("")}<th>Dernière activité</th><th></th></tr></thead><tbody>
  ${rows.map(r=>`<tr><td>${esc(r.label)}${r.src==="import"?` <span class="tag neutral">importé</span>`:""}</td><td style="min-width:120px"><div class="bar" style="margin:4px 0"><i style="width:${r.g.ratio*100}%;background:var(--accent)"></i></div><span class="meta">${pct(r.g.ratio,0)}</span></td>
    ${MODS.map(m=>{ const s = modStats(m, r.p); return `<td class="cell">${s.done}/${s.total}</td>${cell(s.quiz)}`; }).join("")}
    <td class="meta">${r.p.updatedAt ? new Date(r.p.updatedAt).toLocaleDateString("fr-FR",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}) : "—"}</td>
    <td>${r.src==="import"?`<button class="btn ghost small" data-del="${esc(r.id)}">Retirer</button>`:""}</td></tr>`).join("")}
  </tbody></table></div>
  <div class="card" style="margin-top:18px"><h3>Questions les plus souvent ratées (dernière tentative)</h3>
  ${miss.length ? `<table class="t" style="margin:0"><thead><tr><th>Module</th><th>Question</th><th class="num">Taux d'échec</th></tr></thead><tbody>${miss.slice(0,8).map(x=>`<tr><td>M${x.m.num}</td><td>${esc(x.q.q)}</td><td class="num">${x.k}/${x.n} (${pct(x.k/x.n,0)})</td></tr>`).join("")}</tbody></table><p class="meta" style="margin-top:8px">Utile pour cibler les points à reprendre lors de la prochaine session en direct.</p>` : `<p class="meta">Aucune erreur enregistrée pour l'instant.</p>`}</div>`;
  el.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => { if(!b.dataset.c){ b.dataset.c="1"; b.textContent="Confirmer"; return; } if(!ctx.db){ saveImport(b.dataset.del, null); learners.imported = loadImports(); renderDash(); toast("Apprenant retiré"); return; } try{ await ctx.db.doc("imported/"+b.dataset.del).delete(); toast("Apprenant retiré"); }catch(e){ toast("Suppression impossible"); } });
}
async function importCode(){
  const raw = $("#impCode").value.trim(), msg = $("#impMsg");
  try{
    if(!raw.startsWith("RA1:")) throw 0;
    const o = JSON.parse(decodeURIComponent(escape(atob(raw.slice(4)))));
    if(!o || typeof o.n !== "string" || !o.p) throw 0;
    const p = normalize(o.p); const clean = { lessons:{}, quizzes:{}, calcs:{}, updatedAt: +p.updatedAt||Date.now() };
    for(const k in p.lessons) if(lessonById(k)) clean.lessons[k] = +p.lessons[k]||Date.now();
    for(const k in p.calcs) if(CALCS[k]) clean.calcs[k] = +p.calcs[k]||Date.now();
    for(const k in p.quizzes){ const m = modById(k), q = p.quizzes[k]; if(!m||!q) continue; const total = m.quiz.length;
      clean.quizzes[k] = { best: Math.min(total, Math.max(0, +q.best||0)), last: Math.min(total, Math.max(0, +q.last||0)), total, attempts: Math.max(1, +q.attempts||1), wrong: (Array.isArray(q.wrong)?q.wrong:[]).map(Number).filter(i=>i>=0&&i<total), at: +q.at||Date.now() }; }
    const name = o.n.slice(0,80);
    const slug = name.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60) || "apprenant";
    if(ctx.db) await ctx.db.doc("imported/"+slug).set({ name, p: clean, importedAt: Date.now() });
    else { if(!saveImport(slug, { name, p: clean, importedAt: Date.now() })) throw { code: "stockage local indisponible" }; learners.imported = loadImports(); renderDash(); }
    msg.textContent = `Progression de ${name} importée.`; $("#impCode").value = "";
  }catch(e){ msg.textContent = e && e.code ? `Import impossible (${e.code}).` : "Code invalide : vérifie qu'il a été copié en entier."; }
}

/* ---------- Présentation ---------- */
let slides = [], si = 0;
function lessonSlides(l){ const m = l.mod, i = m.lecons.findIndex(x => x.id === l.id);
  return { title: `${m.num}.${i+1} ${l.titre}`, list: [
    `<div class="eyebrow">Module ${m.num} · ${esc(m.titre)}</div><h1>${esc(l.titre)}</h1><p style="color:#c9cfd6">Objectifs de la séance</p><ul>${l.objectifs.map(o=>`<li>${esc(o)}</li>`).join("")}</ul>`,
    ...l.sections.map(s => `<h2>${esc(s.h)}</h2>${s.html}`),
    `<h2>À retenir</h2><ul>${l.points.map(p=>`<li>${esc(p)}</li>`).join("")}</ul>` ] }; }
function quizSlides(m){ return { title: `Quiz · Module ${m.num}`, list: [
  `<div class="eyebrow">Module ${m.num}</div><h1>Quiz : ${esc(m.titre)}</h1><p style="color:#c9cfd6">${m.quiz.length} questions. Laissez le temps de répondre, puis révélez la réponse avec le bouton ou la touche Entrée.</p>`,
  ...m.quiz.map((q,i)=>`<div class="eyebrow">Question ${i+1}/${m.quiz.length}</div><h2 style="font-size:28px">${esc(q.q)}</h2>${q.o.map((o,j)=>`<div class="opt" data-j="${j}"><strong>${"ABCD"[j]}.</strong>&nbsp;${esc(o)}</div>`).join("")}<div style="margin-top:16px"><button class="pbtn" data-reveal="${q.c}">Révéler la réponse</button></div><div class="expl" hidden>${esc(q.e)}</div>`) ] }; }
function openPres(d){ slides = d.list; si = 0; $("#presTitle").textContent = d.title; $("#pres").classList.add("open"); showSlide(); }
function showSlide(){ $("#presSlide").innerHTML = slides[si]; $("#presCount").textContent = `${si+1} / ${slides.length}`; $("#presBar").style.width = ((si+1)/slides.length*100)+"%";
  const r = $("#presSlide [data-reveal]"); if(r) r.onclick = reveal; $(".stage").scrollTop = 0; }
function reveal(){ const r = $("#presSlide [data-reveal]"); if(!r) return false; const c = +r.dataset.reveal; if(r.dataset.done) return false; r.dataset.done="1";
  $("#presSlide").querySelectorAll(".opt").forEach(o=>{ if(+o.dataset.j===c) o.classList.add("right"); }); $("#presSlide .expl").hidden = false; r.remove(); return true; }
function closePres(){ $("#pres").classList.remove("open"); try{ if(document.fullscreenElement) document.exitFullscreen(); }catch(e){} }
$("#presNext").onclick = () => { if(si < slides.length-1){ si++; showSlide(); } };
$("#presPrev").onclick = () => { if(si > 0){ si--; showSlide(); } };
$("#presClose").onclick = closePres;
$("#presFull").onclick = async () => { try{ if(document.fullscreenElement) await document.exitFullscreen(); else await $("#pres").requestFullscreen(); }catch(e){ toast("Plein écran indisponible dans cette vue"); } };
document.addEventListener("keydown", e => { if(!$("#pres").classList.contains("open")) return;
  if(e.key==="ArrowRight"||e.key===" "||e.key==="PageDown"){ e.preventDefault(); $("#presNext").click(); }
  else if(e.key==="ArrowLeft"||e.key==="PageUp"){ e.preventDefault(); $("#presPrev").click(); }
  else if(e.key==="Enter"){ e.preventDefault(); if(!reveal()) $("#presNext").click(); }
  else if(e.key==="Escape"){ closePres(); } });

/* ---------- Initialisation ---------- */
window.addEventListener("hashchange", route);
loadLocal(); setStatus("init"); route();
(async function init(){
  for(let i=0; i<30 && !(window.claude && typeof window.claude.use === "function"); i++) await new Promise(r=>setTimeout(r,100));
  if(!(window.claude && typeof window.claude.use === "function")){ ctx.statique = true; setStatus("local"); try{ if(CFG.trainerHash && sessionStorage.getItem("ra-trainer") === CFG.trainerHash) ctx.owner = true; }catch(e){} route(); return; }
  let user = null, db = null;
  try{ [user, db] = await Promise.all([window.claude.use("user"), window.claude.use("db")]); }catch(e){}
  ctx.user = user; ctx.db = db;
  try{ ctx.owner = user ? !!(await user.isOwner()) : false; }catch(e){ ctx.owner = false; }
  try{ ctx.uid = user ? await user.id() : null; }catch(e){ ctx.uid = null; }
  let cw = null; try{ cw = user ? await user.can("data.write") : null; }catch(e){}
  ctx.canWrite = !!(db && ctx.uid) && cw !== false;
  if(db && ctx.uid){
    try{ const snap = await db.doc("progress/"+ctx.uid).get(); if(snap.exists){ P = merge(P, normalize(snap.data()||{})); saveLocal(); } }catch(e){}
    if(ctx.canWrite){ setStatus("cloud"); if(Object.keys(P.lessons).length || Object.keys(P.quizzes).length) persist(); } else setStatus("local");
  } else setStatus("local");
  route();
})();
})();
