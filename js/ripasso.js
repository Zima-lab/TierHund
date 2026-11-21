/* TierHund — js/ripasso.js
   Tab «Ripasso»: quiz (simulazione d'esame, allenamento, errori) e flashcard delle schede.
   La logica del quiz è quella di Quiz_Sachkunde_§11_Hund.html, con le stesse domande (dati/quiz.js). */

QUIZ.forEach((q, i) => { q.id = q.c + "-" + i; });
const Q_BY_ID = {}; QUIZ.forEach(q => Q_BY_ID[q.id] = q);

let qStore = store.get("quiz", {wrong:[], last:null, hist:[]});
qStore.wrong = (qStore.wrong || []).filter(id => Q_BY_ID[id]);
qStore.hist = qStore.hist || [];
function saveQ(){ store.set("quiz", qStore); }
function quizStats(){ return {total: QUIZ.length, wrong: qStore.wrong.length, last: qStore.last}; }

function shuffle(a){ a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ---------- TAB RIPASSO ---------- */
const qSelected = new Set(Object.keys(QUIZ_CATS));
const fMods = new Set(MOD_ORDER), fTypes = new Set(["zahl","merke"]);
let fOnlyHard = false, fSide = "de";
let fHard = new Set(store.get("flash_hard", []).filter(id => BY_ID[id]));
function saveHard(){ store.set("flash_hard", [...fHard]); }

function renderRipasso(){
  const host = $("v-ripasso");
  const hist = qStore.hist.slice(-5).reverse();
  host.innerHTML = `
  <div class="home">
    <div class="panel">
      <h2>${ic("exam")}Quiz d'esame</h2>
      <div class="stats" style="margin-bottom:12px">
        <div class="stat"><b>${QUIZ.length}</b><span>domande</span></div>
        <div class="stat"><b>${qStore.wrong.length}</b><span>errori da rifare</span></div>
        <div class="stat"><b>${qStore.last == null ? "–" : qStore.last + " %"}</b><span>ultima simulazione</span></div>
      </div>
      <div class="modes">
        <button class="mode" id="mSim" type="button"><h3>Simulazione d'esame</h3><p>30 crocette + 5 domande aperte da tutti gli argomenti, 60 minuti. Correzione solo alla fine, come all'esame.</p><span class="go">Inizia →</span></button>
        <button class="mode" id="mTrain" type="button"><h3>Allenamento</h3><p>Argomenti scelti qui sotto. Correzione e spiegazione subito dopo ogni risposta.</p><span class="go">Inizia →</span></button>
        <button class="mode" id="mErr" type="button" ${qStore.wrong.length ? "" : "disabled"}><h3>Ripassa gli errori</h3><p>${qStore.wrong.length ? `Hai ${qStore.wrong.length} domande sbagliate. Escono dalla lista quando rispondi giusto.` : "Nessun errore salvato: fai prima un allenamento o una simulazione."}</p><span class="go">Inizia →</span></button>
      </div>
      <div class="section-h">Argomenti per l'allenamento</div>
      <div class="chips" id="qChips"></div>
      <div class="opts-row">
        <label>Domande <select id="qN"><option value="10">10</option><option value="20" selected>20</option><option value="40">40</option><option value="0">tutte</option></select></label>
        <label><input type="checkbox" id="qOpen" checked> includi domande aperte</label>
        <button class="btn ghost" type="button" id="qAll">Tutti / nessuno</button>
      </div>
      ${hist.length ? `<div class="section-h">Ultime simulazioni</div><p class="small" style="margin:0">${hist.map(h => `${h.d}: <b>${h.p} %</b>`).join(" · ")}</p>` : ""}
    </div>

    <div class="panel">
      <h2>${ic("cards")}Flashcard dalle schede</h2>
      <p class="small" style="margin:0 0 8px">Numeri con il valore nascosto, Merke-Sätze da dire in tedesco, concetti e norme da spiegare. Le carte che non sai finiscono in «da ripassare».</p>
      <div class="section-h">Moduli</div>
      <div class="chips" id="fModChips"></div>
      <div class="section-h">Tipi</div>
      <div class="chips" id="fTypeChips"></div>
      <div class="opts-row">
        <label>Lato davanti <select id="fSide"><option value="de">tedesco</option><option value="it">italiano</option></select></label>
        <label><input type="checkbox" id="fHardOnly" ${fOnlyHard ? "checked" : ""}> solo «da ripassare» (${fHard.size})</label>
        ${fHard.size ? `<button class="btn ghost" type="button" id="fHardReset">Svuota «da ripassare»</button>` : ""}
      </div>
      <div class="qactions" style="justify-content:flex-start"><button class="btn" id="fStart">Inizia <span id="fN"></span></button></div>
    </div>
  </div>`;

  const chips = $("qChips");
  chips.innerHTML = Object.keys(QUIZ_CATS).map(k => `<button class="chip${qSelected.has(k) ? " active" : ""}" data-k="${k}">${esc(QUIZ_CATS[k])}<span class="chip-n">${QUIZ.filter(q => q.c === k).length}</span></button>`).join("");
  chips.querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => { const k = b.dataset.k; if(qSelected.has(k)) qSelected.delete(k); else qSelected.add(k); b.classList.toggle("active"); $("mTrain").disabled = !qSelected.size; }));
  $("qAll").addEventListener("click", () => { if(qSelected.size === Object.keys(QUIZ_CATS).length) qSelected.clear(); else Object.keys(QUIZ_CATS).forEach(k => qSelected.add(k)); renderRipasso(); });
  $("mTrain").disabled = !qSelected.size;
  $("mSim").addEventListener("click", startSim);
  $("mTrain").addEventListener("click", () => {
    let p = QUIZ.filter(q => qSelected.has(q.c) && ($("qOpen").checked || q.t !== "open"));
    const n = +$("qN").value; p = shuffle(p); if(n) p = p.slice(0, n);
    if(p.length) startQuiz(p, "train");
  });
  $("mErr").addEventListener("click", () => { const p = shuffle(qStore.wrong.map(id => Q_BY_ID[id])); if(p.length) startQuiz(p, "train"); });

  const fCount = () => flashPool().length;
  const paintF = () => {
    $("fModChips").innerHTML = MOD_ORDER.map(m => `<button class="chip${fMods.has(m) ? " active" : ""}" data-m="${m}"><span class="dot" style="background:var(--m-${m})"></span>${esc(MODULES[m].short)}</button>`).join("");
    $("fTypeChips").innerHTML = TYPE_ORDER.map(t => `<button class="chip${fTypes.has(t) ? " active" : ""}" data-t="${t}">${esc(TYPES[t].de)}</button>`).join("");
    $("fModChips").querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => { const m = b.dataset.m; fMods.has(m) ? fMods.delete(m) : fMods.add(m); paintF(); }));
    $("fTypeChips").querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => { const t = b.dataset.t; fTypes.has(t) ? fTypes.delete(t) : fTypes.add(t); paintF(); }));
    const n = fCount(); $("fN").textContent = `(${n} carte)`; $("fStart").disabled = !n;
  };
  paintF();
  $("fSide").value = fSide;
  $("fSide").addEventListener("change", ev => { fSide = ev.target.value; });
  $("fHardOnly").addEventListener("change", ev => { fOnlyHard = ev.target.checked; paintF(); });
  const hr = $("fHardReset"); if(hr) hr.addEventListener("click", () => { fHard.clear(); saveHard(); fOnlyHard = false; renderRipasso(); });
  $("fStart").addEventListener("click", startFlash);
}

/* ---------- QUIZ ---------- */
let S = null, timerId = null;
function startSim(){
  const mc = shuffle(QUIZ.filter(q => q.t !== "open"));
  const pick = [], used = new Set();
  Object.keys(QUIZ_CATS).forEach(k => { mc.filter(q => q.c === k).slice(0, k === "recht" ? 5 : 2).forEach(q => { pick.push(q); used.add(q.id); }); });
  mc.forEach(q => { if(pick.length < 30 && !used.has(q.id)){ pick.push(q); used.add(q.id); } });
  const op = shuffle(QUIZ.filter(q => q.t === "open")).slice(0, 5);
  startQuiz(shuffle(pick.slice(0, 30)).concat(op), "sim");
}
function startQuiz(list, mode){
  S = {mode, list, i:0, answers:[], checked:false, sel:new Set(), end: mode === "sim" ? Date.now() + 60 * 60000 : null};
  openSheet(mode === "sim" ? "Simulazione d'esame" : "Allenamento", `<div id="quizHost"></div>`,
    `<span class="timer${mode === "sim" ? "" : " hidden"}" id="qTimer"></span>`,
    () => { clearInterval(timerId); if(activeTab === "ripasso") renderRipasso(); if(activeTab === "home") renderHome(); });
  clearInterval(timerId);
  if(mode === "sim"){ tick(); timerId = setInterval(tick, 1000); }
  renderQ();
}
function tick(){
  if(!S || !S.end) return;
  const left = Math.max(0, S.end - Date.now()), m = Math.floor(left / 60000), s = Math.floor(left / 1000) % 60;
  const el = $("qTimer"); if(el){ el.textContent = "⏱ " + m + ":" + String(s).padStart(2, "0"); el.classList.toggle("low", left < 5 * 60000); }
  if(left === 0){ clearInterval(timerId); finish(); }
}
function renderQ(){
  const q = S.list[S.i]; S.checked = false; S.sel = new Set();
  let h = `<div class="qtop"><span>Domanda ${S.i + 1} di ${S.list.length}</span><button class="btn ghost" type="button" id="qQuit">Termina</button></div>
    <div class="bar"><i style="width:${S.i / S.list.length * 100}%"></i></div>
    <div class="qcard"><span class="tag">${esc(QUIZ_CATS[q.c])}${q.t === "open" ? " · domanda aperta" : ""}</span><p class="q">${esc(q.q)}</p>`;
  if(q.t === "multi") h += `<div class="hint">Più risposte corrette – seleziona tutte quelle giuste.</div>`;
  if(q.t === "open"){
    h += `<label class="small" for="qAns">Scrivi la risposta in tedesco, senza guardare gli appunti.</label><textarea id="qAns" placeholder="Antwort …"></textarea><div id="openFb"></div>`;
  } else {
    const order = shuffle(q.o.map((_, i) => i));
    h += `<div class="qopts">${order.map((oi, pos) => `<button type="button" class="qopt" data-oi="${oi}"><span class="k">${pos + 1}</span><span>${esc(q.o[oi])}</span></button>`).join("")}</div><div id="mcFb"></div>`;
  }
  h += `<div class="qactions"><button class="btn" type="button" id="qNext"></button></div></div>`;
  $("quizHost").innerHTML = h;
  $("sheetBody").scrollTop = 0;
  $("quizHost").querySelectorAll(".qopt").forEach(b => b.addEventListener("click", () => pick(+b.dataset.oi)));
  $("qNext").addEventListener("click", next);
  $("qQuit").addEventListener("click", () => { if(S.answers.length) finish(); else closeSheet(); });
  updateNext();
}
function pick(oi){
  if(S.checked) return;
  const q = S.list[S.i];
  if(q.t === "multi"){ S.sel.has(oi) ? S.sel.delete(oi) : S.sel.add(oi); } else S.sel = new Set([oi]);
  $("quizHost").querySelectorAll(".qopt").forEach(b => b.classList.toggle("sel", S.sel.has(+b.dataset.oi)));
  updateNext();
}
function updateNext(){
  const q = S.list[S.i], b = $("qNext"); if(!b) return;
  const last = S.i === S.list.length - 1;
  if(q.t === "open"){ b.textContent = !S.checked ? "Mostra la soluzione" : (last ? "Vedi il risultato" : "Avanti →"); b.disabled = false; }
  else if(S.mode === "sim"){ b.textContent = last ? "Vedi il risultato" : "Avanti →"; b.disabled = !S.sel.size; }
  else { b.textContent = S.checked ? (last ? "Vedi il risultato" : "Avanti →") : "Controlla"; b.disabled = !S.checked && !S.sel.size; }
}
const sameSet = (a, b) => a.size === b.length && b.every(x => a.has(x));
function next(){
  const q = S.list[S.i];
  if(q.t === "open"){
    if(!S.checked){ revealOpen(q); return; }
    const boxes = [...document.querySelectorAll("#openFb input")];
    const got = boxes.filter(x => x.checked).length;
    S.answers.push({q, score: boxes.length ? got / boxes.length : 0, text: $("qAns").value, missed: q.k.filter((_, i) => !boxes[i].checked)});
    return advance();
  }
  if(S.mode === "sim"){ S.answers.push({q, score: sameSet(S.sel, q.a) ? 1 : 0, sel:[...S.sel]}); return advance(); }
  if(!S.checked){ checkMC(q); return; }
  advance();
}
function checkMC(q){
  S.checked = true;
  const ok = sameSet(S.sel, q.a);
  $("quizHost").querySelectorAll(".qopt").forEach(b => { const oi = +b.dataset.oi; b.disabled = true; if(q.a.includes(oi)) b.classList.add("right"); else if(S.sel.has(oi)) b.classList.add("wrong"); b.classList.remove("sel"); });
  $("mcFb").innerHTML = `<div class="fb ${ok ? "ok" : "no"}"><b class="v">${ok ? "Giusto." : "Sbagliato."}</b> ${esc(q.e)}</div>`;
  S.answers.push({q, score: ok ? 1 : 0, sel:[...S.sel]});
  updateNext();
}
function revealOpen(q){
  S.checked = true; $("qAns").readOnly = true;
  $("openFb").innerHTML = `<div class="model"><h4>Risposta modello</h4>${esc(q.m)}</div><div class="model plain"><h4>Spunta i punti che hai scritto</h4><div class="checks">${q.k.map((k, i) => `<label><input type="checkbox" id="k${i}"> ${esc(k)}</label>`).join("")}</div></div>`;
  updateNext();
}
function advance(){
  const a = S.answers[S.answers.length - 1], idx = qStore.wrong.indexOf(a.q.id);
  if(a.score < 1 && idx < 0) qStore.wrong.push(a.q.id);
  if(a.score === 1 && idx >= 0) qStore.wrong.splice(idx, 1);
  saveQ();
  if(S.i < S.list.length - 1){ S.i++; renderQ(); } else finish();
}
function finish(){
  clearInterval(timerId);
  const ans = S.answers, total = ans.length, pts = ans.reduce((s, a) => s + a.score, 0), pct = total ? Math.round(pts / total * 100) : 0;
  if(S.mode === "sim"){
    qStore.last = pct;
    const d = new Date(); qStore.hist.push({d: d.toLocaleDateString("it-IT", {day:"2-digit", month:"2-digit"}) + " " + d.toLocaleTimeString("it-IT", {hour:"2-digit", minute:"2-digit"}), p: pct});
    qStore.hist = qStore.hist.slice(-20); saveQ();
  }
  const missed = ans.filter(a => a.score < 1);
  const per = {}; ans.forEach(a => { const k = a.q.c; per[k] = per[k] || {p:0, n:0}; per[k].p += a.score; per[k].n++; });
  const cats = Object.keys(QUIZ_CATS).filter(k => per[k]).map(k => {
    const v = Math.round(per[k].p / per[k].n * 100), col = v >= 80 ? "var(--accent)" : v >= 50 ? "var(--indigo)" : "var(--amber)";
    return `<div class="cat"><span>${esc(QUIZ_CATS[k])}</span><span class="track"><i style="width:${v}%;background:${col}"></i></span><em>${v} %</em></div>`;
  }).join("");
  const rev = missed.map(a => {
    const q = a.q;
    if(q.t === "open") return `<div class="rv"><span class="small">${esc(QUIZ_CATS[q.c])} · aperta · ${Math.round(a.score * 100)} %</span><p><b>${esc(q.q)}</b></p>${a.text ? `<p class="lbl">La tua risposta</p><p>${esc(a.text)}</p>` : ""}<p class="lbl">Punti mancanti</p><p>${esc(a.missed.join(" · "))}</p><p class="lbl">Risposta modello</p><p>${esc(q.m)}</p></div>`;
    const yours = a.sel && a.sel.length ? a.sel.map(i => q.o[i]).join(" · ") : "nessuna";
    return `<div class="rv"><span class="small">${esc(QUIZ_CATS[q.c])}</span><p><b>${esc(q.q)}</b></p><p class="lbl">La tua risposta</p><p>${esc(yours)}</p><p class="lbl">Corretta</p><p>${esc(q.a.map(i => q.o[i]).join(" · "))}</p><p class="small">${esc(q.e)}</p></div>`;
  }).join("");
  const review = missed.map(a => a.q);
  $("quizHost").innerHTML = `<div class="qcard">
      <div class="score"><b>${pct} %</b><div><h3>${S.mode === "sim" ? "Simulazione finita" : "Allenamento finito"}</h3><div class="small">${String(Math.round(pts * 10) / 10).replace(".", ",")} punti su ${total} domande${total < S.list.length ? " (su " + S.list.length + ")" : ""} · ${missed.length} da rivedere</div></div></div>
      <div class="cats">${cats}</div>
      <div class="qactions"><button class="btn" type="button" id="rAgain" ${review.length ? "" : "disabled"}>Ripassa gli errori di questo giro</button><button class="btn ghost" type="button" id="rClose">Chiudi</button></div>
    </div>
    ${rev ? `<div class="section-h">Da rivedere</div>${rev}` : ""}`;
  $("sheetBody").scrollTop = 0;
  const t = $("qTimer"); if(t) t.classList.add("hidden");
  $("rAgain").addEventListener("click", () => { if(review.length) startQuiz(shuffle(review), "train"); });
  $("rClose").addEventListener("click", closeSheet);
}
document.addEventListener("keydown", ev => {
  if(!$("overlay").classList.contains("show") || !$("quizHost")) return;
  if(ev.target.tagName === "TEXTAREA") return;
  const n = parseInt(ev.key, 10);
  if(n >= 1 && n <= 9){ const b = document.querySelectorAll(".qopt")[n - 1]; if(b && !b.disabled) b.click(); }
  if(ev.key === "Enter"){ const b = $("qNext"); if(b && !b.disabled){ ev.preventDefault(); b.click(); } }
});

/* ---------- FLASHCARD ---------- */
function flashPool(){ return ENTRIES.filter(e => fMods.has(e.m) && fTypes.has(e.t) && (!fOnlyHard || fHard.has(e.id))); }
/* Numeri nascosti: le cifre del valore della scheda diventano spazi da completare */
function cloze(e){
  const vals = (e.v || "").match(/\d+(?:[.,]\d+)?/g) || [];
  let s = esc(e.de);
  vals.forEach(v => { s = s.replace(new RegExp("(^|[^\\d.,])(" + v.replace(/[.]/g, "\\.") + ")(?![\\d]|[.,]\\d)", "g"), (m, a, b) => a + `<span class="cloze">${b}</span>`); });
  return s;
}
let F = null;
function startFlash(){
  const deck = shuffle(flashPool());
  if(!deck.length) return;
  F = {deck, i:0, flipped:false, known:0, seen:0};
  openSheet("Flashcard", `<div id="flashHost"></div>`, "", () => { if(activeTab === "ripasso") renderRipasso(); });
  renderCard();
}
function frontHtml(e){
  if(e.t === "zahl") return `<div class="front">${cloze(e)}</div>`;
  if(e.t === "merke") return fSide === "de" ? `<div class="front it">${esc(e.it)}</div><div class="tap">Dillo in tedesco</div>` : `<div class="front">${esc(e.de)}</div><div class="tap">Che cosa significa?</div>`;
  return fSide === "de" ? `<div class="front">${titleHtml(e, "")}</div><div class="tap">Spiega in tedesco: cosa dice, numeri, norma</div>` : `<div class="front it">${esc(e.it)}</div><div class="tap">Come si dice in tedesco? Che cosa dice?</div>`;
}
function backHtml(e){
  let h = `<div class="back">`;
  if(e.t === "zahl") h += `<div class="big">${esc(e.v)}</div><div class="bde">${esc(e.de)}</div><div class="bit">${esc(e.it)}</div>`;
  else if(e.t === "merke") h += fSide === "de" ? `<div class="bde">${esc(e.de)}</div>` : `<div class="bit" style="font-size:var(--fs-lg)">${esc(e.it)}</div>`;
  else h += fSide === "de" ? `<div class="bit" style="font-size:var(--fs-lg)">${esc(e.it)}</div>` : `<div class="bde">${titleHtml(e, "")}</div>`;
  if(e.t !== "zahl" && e.x.length) h += `<ul class="rows">${e.x.map(r => `<li><div class="rde">${esc(r[0])}</div>${r[1] ? `<div class="rit">${esc(r[1])}</div>` : ""}</li>`).join("")}</ul>`;
  if(e.n) h += `<div class="note"><b>⚑ Nota</b> ${esc(e.n)}</div>`;
  h += `<div class="meta"><span class="mod" style="--mc:var(--m-${e.m})">${esc(MODULES[e.m].short)}</span>${e.f ? `<span>${esc(e.f)}</span>` : ""}${e.r ? `<span>${esc(e.r)}</span>` : ""}</div></div>`;
  return h;
}
function renderCard(){
  const host = $("flashHost");
  if(F.i >= F.deck.length){
    host.innerHTML = `<div class="qcard"><div class="score"><b>${F.seen ? Math.round(F.known / F.seen * 100) : 0} %</b><div><h3>Mazzo finito</h3><div class="small">${F.known} sapute al primo colpo su ${F.seen} · ${fHard.size} carte in «da ripassare»</div></div></div>
      <div class="qactions"><button class="btn" id="fAgain">Rifai con le «da ripassare»</button><button class="btn ghost" id="fClose">Chiudi</button></div></div>`;
    $("fAgain").disabled = !fHard.size;
    $("fAgain").addEventListener("click", () => { fOnlyHard = true; startFlash(); });
    $("fClose").addEventListener("click", closeSheet);
    return;
  }
  const e = F.deck[F.i];
  host.innerHTML = `<div class="qtop"><span>Carta ${F.i + 1} di ${F.deck.length}</span><span>${fHard.has(e.id) ? "da ripassare" : ""}</span></div>
    <div class="bar"><i style="width:${F.i / F.deck.length * 100}%"></i></div>
    <div class="flash"><div class="fcard" id="fCard" style="--mc:var(--m-${e.m})" role="button" tabindex="0" aria-label="Gira la carta">
      <div class="ftag"><span class="badge ${e.t}">${TYPES[e.t].de}</span>${esc(MODULES[e.m].de)}</div>
      ${frontHtml(e)}
      <div id="fBack">${F.flipped ? backHtml(e) : `<div class="tap">Tocca per girare</div>`}</div>
    </div></div>
    <div class="fbtns ${F.flipped ? "" : "hidden"}" id="fBtns"><button class="btn no" id="fNo">Non lo so</button><button class="btn yes" id="fYes">Lo so</button></div>`;
  const flip = () => { if(F.flipped) return; F.flipped = true; $("fBack").innerHTML = backHtml(e); $("fBtns").classList.remove("hidden"); };
  $("fCard").addEventListener("click", flip);
  $("fCard").addEventListener("keydown", ev => { if(ev.key === "Enter" || ev.key === " "){ ev.preventDefault(); flip(); } });
  $("fNo").addEventListener("click", ev => { ev.stopPropagation(); answer(false); });
  $("fYes").addEventListener("click", ev => { ev.stopPropagation(); answer(true); });
}
function answer(ok){
  const e = F.deck[F.i];
  if(!e._retry){ F.seen++; if(ok) F.known++; }
  if(ok){ fHard.delete(e.id); }
  else {
    fHard.add(e.id);
    /* la carta torna nel mazzo qualche posizione più avanti */
    const copy = Object.assign(Object.create(Object.getPrototypeOf(e)), e, {_retry:true});
    F.deck.splice(Math.min(F.deck.length, F.i + 4), 0, copy);
  }
  saveHard();
  F.i++; F.flipped = false; renderCard();
}
document.addEventListener("keydown", ev => {
  if(!$("overlay").classList.contains("show") || !$("flashHost") || !F) return;
  if(ev.key === "ArrowRight" && F.flipped) answer(true);
  if(ev.key === "ArrowLeft" && F.flipped) answer(false);
});
