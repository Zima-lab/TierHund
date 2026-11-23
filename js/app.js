/* TierHund — js/app.js
   Icone, stato salvato, ricerca, schede, Casa, Preferiti, tabella dei numeri, navigazione.
   Il ripasso (flashcard, quiz, simulazione) è in js/ripasso.js. */

const APP_VERSION = "v2 · 23.11.2026";
// Esame: marzo 2027, giorno non ancora fissato. Quando c'è la data: metterla qui e impostare EXAM_DAY_KNOWN = true.
const EXAM_DATE = new Date("2027-03-01T10:30:00+01:00");
const EXAM_DAY_KNOWN = false;
const EXAM_LABEL = EXAM_DAY_KNOWN ? EXAM_DATE.toLocaleDateString("it-IT", {weekday:"long", day:"2-digit", month:"2-digit", year:"numeric"}) + ", ore " + EXAM_DATE.toLocaleTimeString("it-IT", {hour:"2-digit", minute:"2-digit"}) : "marzo 2027 · giorno da confermare";

/* ---------- ICONE (stesso disegno di Wortabolario) ---------- */
const ICONS = {
  home:'<path d="M3.2 10.4 12 3.3l8.8 7.1"/><path d="M5.6 9.5V19a1.6 1.6 0 0 0 1.6 1.6h9.6A1.6 1.6 0 0 0 18.4 19V9.5"/><path d="M9.7 20.6v-5.2a1 1 0 0 1 1-1h2.6a1 1 0 0 1 1 1v5.2"/>',
  search:'<circle cx="10.8" cy="10.8" r="6.6"/><path d="M15.6 15.6 20.8 20.8"/>',
  target:'<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.3"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  star:'<path d="m12 3.9 2.55 5.17 5.7.83-4.13 4.02.98 5.68L12 16.92l-5.1 2.68.98-5.68L3.75 9.9l5.7-.83z"/>',
  starFill:'<path d="m12 3.9 2.55 5.17 5.7.83-4.13 4.02.98 5.68L12 16.92l-5.1 2.68.98-5.68L3.75 9.9l5.7-.83z" fill="currentColor"/>',
  clock:'<circle cx="12" cy="12" r="8.4"/><path d="M12 7.1V12l3.1 1.9"/>',
  cards:'<rect x="7.2" y="7.2" width="13.6" height="13.6" rx="3"/><path d="M17 4.2H6.2A2.9 2.9 0 0 0 3.3 7.1v10.6"/>',
  chevron:'<path d="M9.7 5.6 16 12l-6.3 6.4"/>',
  arrowUp:'<path d="M12 19.6V5.2"/><path d="M5.9 11.3 12 5.2l6.1 6.1"/>',
  close:'<path d="m6.6 6.6 10.8 10.8"/><path d="M17.4 6.6 6.6 17.4"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.9v2.2M12 18.9v2.2M21.1 12h-2.2M5.1 12H2.9M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6"/>',
  moon:'<path d="M20.3 14.7A8.6 8.6 0 1 1 9.3 3.7a6.9 6.9 0 0 0 11 11z"/>',
  export:'<path d="M12 3.6v10.8"/><path d="M7.6 10 12 14.4 16.4 10"/><path d="M4.6 17.2v1.6a2 2 0 0 0 2 2h10.8a2 2 0 0 0 2-2v-1.6"/>',
  import:'<path d="M12 14.4V3.6"/><path d="M7.6 8 12 3.6 16.4 8"/><path d="M4.6 17.2v1.6a2 2 0 0 0 2 2h10.8a2 2 0 0 0 2-2v-1.6"/>',
  book:'<path d="M12 7.2v12.3"/><path d="M12 7.2C10.4 5.9 8.4 5.2 6.1 5.2H4v12.3h2.1c2.3 0 4.3.7 5.9 2"/><path d="M12 7.2c1.6-1.3 3.6-2 5.9-2H20v12.3h-2.1c-2.3 0-4.3.7-5.9 2"/>',
  exam:'<rect x="5.2" y="4.6" width="13.6" height="16.2" rx="2.4"/><path d="M9.2 4.6V3.8a1 1 0 0 1 1-1h3.6a1 1 0 0 1 1 1v.8"/><path d="m8.8 12.6 2.2 2.2 4.4-4.6"/>',
  hash:'<path d="M9.4 4 7.6 20M16.4 4l-1.8 16M4.6 9h15.6M3.8 15h15.6"/>',
  para:'<path d="M14.6 6.2c-.6-1.5-2-2.4-3.6-2.4-2.1 0-3.6 1.3-3.6 3.1 0 4.2 8.4 3 8.4 7.4 0 1.3-.8 2.3-2 2.8"/><path d="M9.4 17.8c.6 1.5 2 2.4 3.6 2.4 2.1 0 3.6-1.3 3.6-3.1 0-4.2-8.4-3-8.4-7.4 0-1.3.8-2.3 2-2.8"/>',
  bulb:'<path d="M9.2 17.4h5.6"/><path d="M10 20.4h4"/><path d="M12 3.6a5.8 5.8 0 0 0-3.5 10.4c.6.5.9 1.2.9 2v1.4h5.2V16c0-.8.3-1.5.9-2A5.8 5.8 0 0 0 12 3.6z"/>',
  list:'<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.8" cy="6.5" r="1" fill="currentColor"/><circle cx="4.8" cy="12" r="1" fill="currentColor"/><circle cx="4.8" cy="17.5" r="1" fill="currentColor"/>',
  paw:'<ellipse cx="12" cy="15.6" rx="4.3" ry="3.6"/><ellipse cx="6" cy="10.4" rx="1.8" ry="2.3"/><ellipse cx="9.4" cy="6.4" rx="1.8" ry="2.4"/><ellipse cx="14.6" cy="6.4" rx="1.8" ry="2.4"/><ellipse cx="18" cy="10.4" rx="1.8" ry="2.3"/>',
  rotate:'<path d="M3.8 12a8.2 8.2 0 1 0 2.6-6"/><path d="M3.4 4.4v4.2h4.2"/>'
};
function ic(name, cls){ const p = ICONS[name]; return p ? `<svg class="ic ${cls||""}" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>` : ""; }
function paintIcons(root){ (root||document).querySelectorAll("[data-icon]").forEach(el => { if(!el.dataset.painted){ el.insertAdjacentHTML("afterbegin", ic(el.dataset.icon)); el.dataset.painted = "1"; } }); }
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
const $ = id => document.getElementById(id);

/* ---------- MODULI E TIPI ---------- */
const MODULES = {
  recht: { de:"Rechtsvorschriften", it:"Norme giuridiche", short:"Recht" },
  trans: { de:"Tiertransport", it:"Trasporto di animali", short:"Transport" },
  h2a:   { de:"Hunde 2a", it:"Razze · fisiologia · riproduzione · alimentazione · salute · apprendimento", short:"2a" },
  h2b:   { de:"Hunde 2b · Körpersprache", it:"Linguaggio del corpo e comunicazione", short:"2b" },
  h2c:   { de:"Hunde 2c · Welpen", it:"Sviluppo del cucciolo e comportamento sociale", short:"2c" }
};
const MOD_ORDER = ["recht","trans","h2a","h2b","h2c"];
const TYPES = {
  begriff: { de:"Begriff", it:"concetto" },
  para:    { de:"§ Norm", it:"norma" },
  zahl:    { de:"Zahl", it:"numero" },
  merke:   { de:"Merke", it:"da ricordare" },
  schema:  { de:"Schema", it:"schema d'esame" }
};
const TYPE_ORDER = ["begriff","para","zahl","merke","schema"];

/* Titoli al plurale: l'articolo «die» qui non indica il femminile */
const PLURAL = ["die Giardien","die Milben","die Flöhe","die Zecken","die Würmer","die Nährstoffe","die Vitalwerte","die Sinnesorgane",
  "die Entwicklungsphasen","die Krankheitszeichen","die Reisekrankheiten","die 4 Quadranten","die Statusverhältnisse","die Calming Signals",
  "die optischen Ausdrucksregionen","die Lebendvakzine"];

/* ---------- SCHEDE: unione e preparazione ---------- */
const ENTRIES = [].concat(SCHEDE_RECHT, SCHEDE_TRANSPORT, SCHEDE_2A, SCHEDE_2B, SCHEDE_2C).map((e, i) => {
  e.id = e.m + "-" + i;
  e.x = e.x || [];
  e.idx = i;
  return e;
});
const BY_ID = {}; ENTRIES.forEach(e => BY_ID[e.id] = e);

/* ---------- STATO SALVATO (solo in questo browser) ---------- */
const store = {
  get(k, d){ try{ const v = localStorage.getItem("tierhund_" + k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem("tierhund_" + k, JSON.stringify(v)); }catch(e){} }
};
let favIds = new Set(store.get("favs", []).filter(id => BY_ID[id]));
let recent = store.get("recent", []).filter(id => BY_ID[id]);
function saveFavs(){ store.set("favs", [...favIds]); }
function pushRecent(id){ recent = [id].concat(recent.filter(x => x !== id)).slice(0, 8); store.set("recent", recent); }

/* ---------- RICERCA ---------- */
function norm(s){
  return String(s).toLowerCase()
    .replace(/ä/g,"a").replace(/ö/g,"o").replace(/ü/g,"u").replace(/ß/g,"ss")
    .replace(/ae/g,"a").replace(/oe/g,"o").replace(/ue/g,"u")
    .replace(/[àáâ]/g,"a").replace(/[èéê]/g,"e").replace(/[ìíî]/g,"i").replace(/[òóô]/g,"o").replace(/[ùúû]/g,"u")
    .replace(/[„“”"«»‚‘’]/g,"").replace(/\s+/g," ").trim();
}
function lev1(a, b){
  if(a === b) return true;
  const la = a.length, lb = b.length;
  if(Math.abs(la - lb) > 1) return false;
  let i = 0, j = 0, ed = 0;
  while(i < la && j < lb){
    if(a[i] === b[j]){ i++; j++; continue; }
    if(++ed > 1) return false;
    if(la > lb) i++; else if(lb > la) j++; else { i++; j++; }
  }
  return ed + (la - i) + (lb - j) <= 1;
}
ENTRIES.forEach(e => {
  e._title = norm(e.de + " " + (e.v || ""));
  e._it = norm(e.it);
  e._hay = norm([e.de, e.it, e.v, e.n, e.r, e.f, e.k, MODULES[e.m].de, MODULES[e.m].short, TYPES[e.t].de].concat(e.x.flat()).join(" "));
  e._words = (e._title + " " + e._it + " " + norm(e.k || "")).split(/[\s,.;:()'\/–—\-·→]+/).filter(w => w.length >= 3);
});
/* Punteggio: 0 = nessun riscontro. Ogni parola della ricerca deve trovarsi da qualche parte. */
function score(e, q){
  if(!q) return 1;
  const nq = norm(q), toks = nq.split(" ").filter(Boolean);
  let s = 0;
  for(const t of toks){
    if(e._title.includes(t)) s += e._title.startsWith(t) || e._title.includes(" " + t) ? 6 : 4;
    else if(e._it.includes(t)) s += 3;
    else if(e._hay.includes(t)) s += 1;
    else if(t.length >= 4 && e._words.some(w => lev1(w, t))) s += 0.5;
    else return 0;
  }
  return s;
}
function highlight(text, q){
  const t = esc(text);
  if(!q || q.trim().length < 2) return t;
  const toks = q.trim().split(/\s+/).filter(x => x.length >= 2).map(x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if(!toks.length) return t;
  try{ return t.replace(new RegExp("(" + toks.join("|") + ")", "gi"), "<mark>$1</mark>"); }catch(e){ return t; }
}

/* ---------- STATO DELLA VISTA ---------- */
let activeTab = "home", activeMod = "tutti", activeType = "tutti", query = "", openId = null, showLimit = 60;

/* ---------- SCHEDA ---------- */
function titleHtml(e, q){
  const m = e.de.match(/^(der|die|das) (.+)$/);
  if(m && e.t === "begriff"){
    const pl = PLURAL.some(p => e.de.startsWith(p));
    return `<span class="genus genus-${pl ? "pl" : m[1]}">${m[1]}${pl ? " (Pl.)" : ""}</span>${highlight(m[2], q)}`;
  }
  return highlight(e.de, q);
}
function entryHtml(e, q, open){
  const fav = favIds.has(e.id);
  const rows = e.x.length ? `<ul class="rows">${e.x.map(r => `<li><div class="rde">${highlight(r[0], q)}</div>${r[1] ? `<div class="rit">${highlight(r[1], q)}</div>` : ""}</li>`).join("")}</ul>` : "";
  const note = e.n ? `<div class="note"><b>⚑ Nota</b> <span class="small">(non dalle slide)</span><br>${highlight(e.n, q)}</div>` : "";
  const meta = `<div class="meta"><span class="mod">${esc(MODULES[e.m].de)}</span>${e.f ? `<span>${esc(e.f)}</span>` : ""}${e.r ? `<span>${esc(e.r)}</span>` : ""}</div>`;
  return `<article class="entry t-${e.t}${open ? " open" : ""}" data-id="${e.id}" style="--mc:var(--m-${e.m})">
    <div class="entry-head" role="button" tabindex="0" aria-expanded="${open}">
      <div class="left">
        <div class="line1">${e.t === "zahl" ? `<span class="vpill">${highlight(e.v, q)}</span>` : `<span class="badge ${e.t}">${TYPES[e.t].de}</span>`}<span class="de">${titleHtml(e, q)}</span></div>
        <div class="it">${highlight(e.it, q)}</div>
      </div>
      <button type="button" class="fav-btn${fav ? " on" : ""}" aria-label="${fav ? "Togli dai preferiti" : "Aggiungi ai preferiti"}" aria-pressed="${fav}">${ic(fav ? "starFill" : "star")}</button>
      <span class="chev">${ic("chevron")}</span>
    </div>
    <div class="entry-body">${rows}${note}${meta}</div>
  </article>`;
}
function bindEntries(host, rerender){
  host.querySelectorAll(".entry").forEach(card => {
    const id = card.dataset.id, head = card.querySelector(".entry-head");
    const toggle = () => {
      const willOpen = !card.classList.contains("open");
      card.classList.toggle("open", willOpen);
      head.setAttribute("aria-expanded", willOpen);
      if(willOpen){ openId = id; pushRecent(id); }
    };
    head.addEventListener("click", ev => { if(!ev.target.closest(".fav-btn")) toggle(); });
    head.addEventListener("keydown", ev => { if((ev.key === "Enter" || ev.key === " ") && ev.target === head){ ev.preventDefault(); toggle(); } });
    card.querySelector(".fav-btn").addEventListener("click", ev => {
      ev.stopPropagation();
      if(favIds.has(id)) favIds.delete(id); else favIds.add(id);
      saveFavs();
      const on = favIds.has(id), b = ev.currentTarget;
      b.classList.toggle("on", on); b.innerHTML = ic(on ? "starFill" : "star"); b.setAttribute("aria-pressed", on);
      if(rerender) rerender();
      else renderFilters();
    });
  });
}

/* ---------- FILTRI ---------- */
function pool(){ return ENTRIES.filter(e => (activeMod === "tutti" || e.m === activeMod) && (activeType === "tutti" || (activeType === "fav" ? favIds.has(e.id) : e.t === activeType))); }
function renderFilters(){
  const modCount = m => ENTRIES.filter(e => (m === "tutti" || e.m === m) && (activeType === "tutti" || (activeType === "fav" ? favIds.has(e.id) : e.t === activeType))).length;
  const typeCount = t => ENTRIES.filter(e => (activeMod === "tutti" || e.m === activeMod) && (t === "tutti" || (t === "fav" ? favIds.has(e.id) : e.t === t))).length;
  $("modFilters").innerHTML = ["tutti"].concat(MOD_ORDER).map(m =>
    `<button class="chip${activeMod === m ? " active" : ""}" data-m="${m}" aria-pressed="${activeMod === m}">${m === "tutti" ? "Tutti i moduli" : `<span class="dot" style="background:var(--m-${m})"></span>${esc(MODULES[m].short)}`}<span class="chip-n">${modCount(m)}</span></button>`).join("");
  $("typeFilters").innerHTML = ["tutti"].concat(TYPE_ORDER, ["fav"]).map(t =>
    `<button class="chip${activeType === t ? " active" : ""}" data-t="${t}" aria-pressed="${activeType === t}">${t === "tutti" ? "Tutti i tipi" : t === "fav" ? ic("star") + "Preferiti" : esc(TYPES[t].de)}<span class="chip-n">${typeCount(t)}</span></button>`).join("");
  $("modFilters").querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => { activeMod = b.dataset.m; showLimit = 60; renderFilters(); renderResults(); }));
  $("typeFilters").querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => { activeType = b.dataset.t; showLimit = 60; renderFilters(); renderResults(); }));
}

/* ---------- RISULTATI ---------- */
function renderResults(){
  const host = $("results");
  let list = pool();
  if(query){
    list = list.map(e => [e, score(e, query)]).filter(x => x[1] > 0)
      .sort((a, b) => b[1] - a[1] || MOD_ORDER.indexOf(a[0].m) - MOD_ORDER.indexOf(b[0].m) || a[0].idx - b[0].idx).map(x => x[0]);
  }
  $("count").textContent = query ? `${list.length} risultat${list.length === 1 ? "o" : "i"}` : "";
  if(!list.length){
    host.innerHTML = `<div class="empty">${ic("search")}Nessuna scheda trovata${query ? ` per «${esc(query)}»` : ""}.<br><span class="small">Prova con meno parole, in tedesco o in italiano, o togli i filtri.</span></div>`;
    return;
  }
  let html = "", lastMod = null;
  const shown = list.slice(0, showLimit);
  shown.forEach(e => {
    if(!query && activeMod === "tutti" && e.m !== lastMod){ html += `<div class="section-h" style="color:var(--m-${e.m})">${esc(MODULES[e.m].de)}</div>`; lastMod = e.m; }
    html += entryHtml(e, query, e.id === openId || (query && list.length === 1));
  });
  if(list.length > showLimit) html += `<button class="btn ghost more-btn" id="moreBtn">Mostra altre ${Math.min(60, list.length - showLimit)} (di ${list.length - showLimit})</button>`;
  host.innerHTML = html;
  bindEntries(host);
  const mb = $("moreBtn"); if(mb) mb.addEventListener("click", () => { showLimit += 60; renderResults(); });
}

/* ---------- SUGGERIMENTI ---------- */
let sugIdx = -1, sugList = [];
function renderSuggest(){
  const box = $("suggestList"), inp = $("search");
  if(!query || query.trim().length < 2){ box.hidden = true; inp.setAttribute("aria-expanded","false"); return; }
  sugList = ENTRIES.map(e => [e, score(e, query)]).filter(x => x[1] >= 3).sort((a, b) => b[1] - a[1]).slice(0, 7).map(x => x[0]);
  if(!sugList.length){ box.hidden = true; inp.setAttribute("aria-expanded","false"); return; }
  box.innerHTML = sugList.map((e, i) => `<div class="suggest-item${i === sugIdx ? " active" : ""}" role="option" data-id="${e.id}"><span class="sde">${e.t === "zahl" ? esc(e.v) + " · " : ""}${highlight(e.de, query)}</span><span class="sit">${esc(e.it)}</span></div>`).join("");
  box.hidden = false; inp.setAttribute("aria-expanded","true");
  box.querySelectorAll(".suggest-item").forEach(it => it.addEventListener("mousedown", ev => { ev.preventDefault(); openEntry(it.dataset.id); }));
}
function openEntry(id){
  const e = BY_ID[id]; if(!e) return;
  $("suggestList").hidden = true;
  query = ""; $("search").value = ""; $("clearBtn").hidden = true;
  activeMod = e.m; activeType = "tutti"; openId = id; pushRecent(id);
  const p = pool(); showLimit = Math.max(60, p.indexOf(e) + 10);
  switchTab("cerca");
  requestAnimationFrame(() => { const el = document.querySelector(`.entry[data-id="${id}"]`); if(el) el.scrollIntoView({block:"center"}); });
}

/* ---------- CASA ---------- */
function daysToExam(){
  const now = new Date();
  const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const e0 = new Date(EXAM_DATE.getFullYear(), EXAM_DATE.getMonth(), EXAM_DATE.getDate());
  return Math.round((e0 - d0) / 86400000);
}
function examText(){
  const d = daysToExam();
  if(!EXAM_DAY_KNOWN){
    if(d > 1) return [String(d), "giorni all'inizio di marzo"];
    if(d >= -30) return ["Marzo", "esame questo mese"];
    return ["✓", "esame passato"];
  }
  if(d > 1) return [String(d), "giorni all'esame"];
  if(d === 1) return ["1", "giorno: l'esame è domani"];
  if(d === 0) return ["Oggi", "esame alle " + EXAM_DATE.toLocaleTimeString("it-IT", {hour:"2-digit", minute:"2-digit"})];
  return ["✓", "esame passato"];
}
function dailyEntry(){
  const pool = ENTRIES.filter(e => e.t === "zahl" || e.t === "merke");
  const d = new Date(); const seed = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate();
  return pool[seed % pool.length];
}
function renderHome(){
  const [big, lbl] = examText();
  const qs = (typeof quizStats === "function") ? quizStats() : {wrong:0, last:null, total:0};
  const counts = m => ENTRIES.filter(e => e.m === m).length;
  const zCount = ENTRIES.filter(e => e.t === "zahl").length;
  const daily = dailyEntry();
  $("v-home").innerHTML = `
    <div class="panel exam-card">
      <div><h2>Sachkundeprüfung § 11</h2><div class="lbl">IHK Potsdam · ${EXAM_LABEL}</div></div>
      <div style="text-align:right"><div class="big">${big}</div><div class="lbl">${lbl}</div></div>
    </div>
    <div class="panel">
      <h2>${ic("book")}Moduli</h2>
      <div class="mod-grid">${MOD_ORDER.map(m => `<button class="mod-tile" data-m="${m}" style="--mc:var(--m-${m})"><div><b lang="de">${esc(MODULES[m].de)}</b><span>${esc(MODULES[m].it)}</span></div><span>${counts(m)} schede</span></button>`).join("")}</div>
    </div>
    <div class="panel">
      <h2>${ic("list")}Consultazione rapida</h2>
      <div class="quick">
        <button class="quick-btn" id="qZahlen">${ic("hash")}<div><b>Zahlen & Fristen</b><small>${zCount} numeri in una tabella</small></div></button>
        <button class="quick-btn" data-type="para">${ic("para")}<div><b>§ Normen</b><small>TierSchG, TierSchHuV, BGB, VO 1/2005</small></div></button>
        <button class="quick-btn" data-type="merke">${ic("bulb")}<div><b>Merke-Sätze</b><small>le frasi da sapere a memoria</small></div></button>
        <button class="quick-btn" data-type="schema">${ic("list")}<div><b>Prüfschemata</b><small>schemi d'esame e casi TierZeit</small></div></button>
      </div>
    </div>
    <div class="panel">
      <h2>${ic("exam")}Ripasso</h2>
      <div class="stats">
        <div class="stat"><b>${qs.total}</b><span>domande quiz</span></div>
        <div class="stat"><b>${qs.wrong}</b><span>errori da rifare</span></div>
        <div class="stat"><b>${qs.last == null ? "–" : qs.last + " %"}</b><span>ultima simulazione</span></div>
      </div>
      <div class="qactions" style="justify-content:flex-start"><button class="btn" id="goSim">Simulazione d'esame</button><button class="btn ghost" id="goRip">Flashcard e allenamento</button></div>
    </div>
    <div class="panel">
      <h2>${ic("star")}Scheda del giorno</h2>
      <div id="dailyHost">${entryHtml(daily, "", false)}</div>
    </div>
    ${recent.length ? `<div class="panel"><h2>${ic("clock")}Ultime consultate</h2><div class="recent">${recent.map(id => `<button data-id="${id}">${esc(BY_ID[id].t === "zahl" ? BY_ID[id].v + " · " + BY_ID[id].de : BY_ID[id].de)}</button>`).join("")}</div></div>` : ""}
    <div class="panel">
      <h2>${ic("export")}Backup dei progressi</h2>
      <p class="small" style="margin:0 0 10px">Preferiti, errori del quiz e flashcard restano solo in questo browser. Esporta un file per spostarli su un altro dispositivo.</p>
      <div class="backup"><button class="btn ghost" id="bkExp">${ic("export")} Esporta</button><label class="btn ghost" style="display:inline-flex;align-items:center;gap:6px">${ic("import")} Importa<input type="file" id="bkImp" accept="application/json" hidden></label></div>
    </div>`;
  $("v-home").querySelectorAll(".mod-tile").forEach(b => b.addEventListener("click", () => { activeMod = b.dataset.m; activeType = "tutti"; openId = null; showLimit = 60; switchTab("cerca"); }));
  $("v-home").querySelectorAll(".quick-btn[data-type]").forEach(b => b.addEventListener("click", () => { activeMod = "tutti"; activeType = b.dataset.type; openId = null; showLimit = 400; switchTab("cerca"); }));
  $("qZahlen").addEventListener("click", openZahlen);
  $("v-home").querySelectorAll(".recent button").forEach(b => b.addEventListener("click", () => openEntry(b.dataset.id)));
  $("goSim").addEventListener("click", () => { if(typeof startSim === "function") startSim(); });
  $("goRip").addEventListener("click", () => switchTab("ripasso"));
  bindEntries($("dailyHost"));
  $("bkExp").addEventListener("click", exportBackup);
  $("bkImp").addEventListener("change", importBackup);
}

/* ---------- PREFERITI ---------- */
function renderFavs(){
  const host = $("v-preferiti");
  const list = ENTRIES.filter(e => favIds.has(e.id));
  if(!list.length){ host.innerHTML = `<div class="empty">${ic("star")}Nessun preferito.<br><span class="small">Tocca la stella su una scheda per salvarla qui.</span></div>`; return; }
  let html = "", last = null;
  list.forEach(e => { if(e.m !== last){ html += `<div class="section-h" style="color:var(--m-${e.m})">${esc(MODULES[e.m].de)}</div>`; last = e.m; } html += entryHtml(e, "", false); });
  host.innerHTML = html;
  bindEntries(host, renderFavs);
}

/* ---------- TABELLA ZAHLEN & FRISTEN ---------- */
function openZahlen(){
  let html = `<p class="small" style="margin-top:0">Tutti i numeri delle schede, per modulo. Tocca una riga per aprire la scheda. ⚑ = dato da una nota, non dalle slide.</p>`;
  MOD_ORDER.forEach(m => {
    const list = ENTRIES.filter(e => e.m === m && e.t === "zahl");
    if(!list.length) return;
    html += `<div class="zgroup" style="--mc:var(--m-${m})">${esc(MODULES[m].de)}</div><table class="ztable"><thead><tr><th>Wert</th><th>Deutsch · italiano</th><th>Quelle</th></tr></thead><tbody>` +
      list.map(e => `<tr data-id="${e.id}" style="cursor:pointer"><td class="zv">${esc(e.v)}</td><td><div class="zde">${esc(e.de)}${e.n && e.n.includes("⚑") ? " ⚑" : ""}</div><div class="zit">${esc(e.it)}</div></td><td class="zsrc">${esc(e.r || "")}${e.r ? "<br>" : ""}${esc(e.f)}</td></tr>`).join("") + `</tbody></table>`;
  });
  openSheet("Zahlen & Fristen", html);
  $("sheetBody").querySelectorAll("tr[data-id]").forEach(tr => tr.addEventListener("click", () => { closeSheet(); openEntry(tr.dataset.id); }));
}

/* ---------- PANNELLO A COMPARSA ---------- */
let onSheetClose = null;
function openSheet(title, html, extra, onClose){
  $("sheetTitle").textContent = title; $("sheetBody").innerHTML = html; $("sheetExtra").innerHTML = extra || "";
  $("overlay").classList.add("show"); document.body.classList.add("lock"); $("sheetBody").scrollTop = 0;
  onSheetClose = onClose || null;
}
function closeSheet(){
  $("overlay").classList.remove("show"); document.body.classList.remove("lock");
  const f = onSheetClose; onSheetClose = null; if(f) f();
}

/* ---------- BACKUP ---------- */
function exportBackup(){
  const data = {};
  try{ for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); if(k.startsWith("tierhund_")) data[k] = localStorage.getItem(k); } }catch(e){}
  const blob = new Blob([JSON.stringify({app:"TierHund", date:new Date().toISOString(), data}, null, 1)], {type:"application/json"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "TierHund_backup.json"; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function importBackup(ev){
  const f = ev.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = () => {
    try{
      const j = JSON.parse(r.result);
      if(j.app !== "TierHund" || !j.data) throw new Error();
      Object.keys(j.data).forEach(k => { if(k.startsWith("tierhund_")) localStorage.setItem(k, j.data[k]); });
      location.reload();
    }catch(e){ alert("File non valido: serve un backup esportato da TierHund."); }
  };
  r.readAsText(f);
}

/* ---------- NAVIGAZIONE ----------
   Su desktop (≥1024px) la tab bar diventa un menu laterale e la ricerca resta sempre visibile
   (come l'attuale Wortabolario). Il valore deve coincidere con la sez. 13 di style.css. */
const desktopMQ = typeof window.matchMedia === "function" ? window.matchMedia("(min-width: 1024px)") : { matches: false };
function isDesktop(){ return !!desktopMQ.matches; }
function switchTab(t){
  activeTab = t;
  document.querySelectorAll(".tabbar .tab").forEach(b => { const on = b.dataset.tab === t; b.classList.toggle("active", on); b.setAttribute("aria-selected", on); });
  ["home","cerca","ripasso","preferiti"].forEach(v => $("v-" + v).classList.toggle("hidden", v !== t));
  $("searchbar").classList.toggle("hidden", t === "ripasso" && !isDesktop());
  if(t === "home") renderHome();
  if(t === "cerca"){ renderFilters(); renderResults(); }
  if(t === "ripasso" && typeof renderRipasso === "function") renderRipasso();
  if(t === "preferiti") renderFavs();
  if(t !== "cerca" || !openId) window.scrollTo(0, 0);
}

/* ---------- TEMA ---------- */
function applyTheme(t){
  document.documentElement.dataset.theme = t;
  document.querySelectorAll("#themeToggle .opt").forEach(o => o.classList.toggle("active", o.dataset.theme === t));
  const m = document.querySelector('meta[name="theme-color"]'); if(m) m.content = t === "dark" ? "#10141c" : "#191f56";
}

/* ---------- AVVIO ---------- */
function init(){
  paintIcons();
  $("logo").innerHTML = ic("paw", "paw");
  $("appVersion").textContent = "TierHund " + APP_VERSION + " · " + ENTRIES.length + " schede · " + (typeof QUIZ !== "undefined" ? QUIZ.length : 0) + " domande";
  let theme = store.get("theme_v", null);
  if(!theme) theme = (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  applyTheme(theme);
  $("themeToggle").addEventListener("click", () => { const t = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; applyTheme(t); store.set("theme_v", t); try{ localStorage.setItem("tierhund_theme", t); }catch(e){} });

  const inp = $("search");
  inp.addEventListener("input", () => {
    query = inp.value; sugIdx = -1; showLimit = 60; $("clearBtn").hidden = !query;
    if(query && activeTab !== "cerca"){ activeMod = "tutti"; activeType = "tutti"; switchTab("cerca"); inp.focus(); }
    openId = null;
    if(activeTab === "cerca"){ renderFilters(); renderResults(); }
    renderSuggest();
  });
  inp.addEventListener("keydown", ev => {
    const box = $("suggestList");
    if(ev.key === "ArrowDown" && !box.hidden){ ev.preventDefault(); sugIdx = Math.min(sugIdx + 1, sugList.length - 1); renderSuggest(); }
    else if(ev.key === "ArrowUp" && !box.hidden){ ev.preventDefault(); sugIdx = Math.max(sugIdx - 1, -1); renderSuggest(); }
    else if(ev.key === "Enter"){ if(sugIdx >= 0 && sugList[sugIdx]) openEntry(sugList[sugIdx].id); else { box.hidden = true; inp.blur(); } }
    else if(ev.key === "Escape"){ box.hidden = true; }
  });
  inp.addEventListener("blur", () => setTimeout(() => { $("suggestList").hidden = true; }, 120));
  $("clearBtn").addEventListener("click", () => { inp.value = ""; query = ""; $("clearBtn").hidden = true; $("suggestList").hidden = true; $("count").textContent = ""; if(activeTab === "cerca"){ renderFilters(); renderResults(); } inp.focus(); });

  document.querySelectorAll(".tabbar .tab").forEach(b => b.addEventListener("click", () => {
    if(b.dataset.tab === "cerca" && activeTab === "cerca"){ inp.focus(); return; }
    if(b.dataset.tab === "cerca"){ openId = null; }
    switchTab(b.dataset.tab);
  }));
  $("sheetClose").addEventListener("click", closeSheet);
  $("overlay").addEventListener("click", ev => { if(ev.target === $("overlay")) closeSheet(); });
  document.addEventListener("keydown", ev => { if(ev.key === "Escape" && $("overlay").classList.contains("show")) closeSheet(); });

  const bt = $("backTop");
  window.addEventListener("scroll", () => { bt.hidden = window.scrollY < 600; }, {passive:true});
  bt.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));

  switchTab("home");

  /* Offline: il service worker funziona solo se l'app è servita da un sito (http/https), non aprendo il file */
  if("serviceWorker" in navigator && /^https?:$/.test(location.protocol)){ navigator.serviceWorker.register("sw.js").catch(() => {}); }
}
document.addEventListener("DOMContentLoaded", init);
