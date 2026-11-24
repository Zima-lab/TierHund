/* TierHund — js/wortschatz.js
   Wortschatz: leggi l'italiano, scrivi il termine tedesco con l'articolo (e, se vuoi, il plurale).
   Ripasso dilazionato: una parola che sai torna dopo 1, 3, 7, 16, 35, 75 giorni; una che sbagli torna nello stesso giro
   e il giorno dopo riparte da capo. I progressi restano in questo browser (chiave tierhund_ws) e finiscono nel Backup di Casa.
   I dati sono in dati/wortschatz.js. */

const WS_STEPS = [0, 1, 3, 7, 16, 35, 75];   // giorni di attesa per livello 1–6
const WS_LEARNED = 4;                          // da questo livello in su la parola conta come «imparata»
const WS_ITEMS = WORTSCHATZ.map((e, i) => { e.id = e.w; e.idx = i; return e; });
const WS_BY = {}; WS_ITEMS.forEach(e => WS_BY[e.id] = e);
const WS_SCHEDA = {}; ENTRIES.forEach(e => { if(!WS_SCHEDA[e.de]) WS_SCHEDA[e.de] = e.id; });

function wsDate(offset){ const d = new Date(); d.setDate(d.getDate() + (offset || 0)); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function wsFmt(iso){ const p = iso.split("-"); return p[2] + "." + p[1] + "."; }

let wsStore = store.get("ws", {});
wsStore.c = wsStore.c || {};
wsStore.perDay = wsStore.perDay || 10;
if(typeof wsStore.pl !== "boolean") wsStore.pl = true;
wsStore.mods = (wsStore.mods || MOD_ORDER).filter(m => MOD_ORDER.includes(m));
Object.keys(wsStore.c).forEach(id => { if(!WS_BY[id]) delete wsStore.c[id]; });
function wsSave(){ store.set("ws", wsStore); }
function wsDay(){ const t = wsDate(); if(wsStore.day !== t){ wsStore.day = t; wsStore.nw = 0; wsSave(); } }

/* ---------- POOL ---------- */
const wsInMods = e => wsStore.mods.includes(e.m);
function wsDueList(day){ const t = day || wsDate(); return WS_ITEMS.filter(e => wsInMods(e) && wsStore.c[e.id] && wsStore.c[e.id].d <= t).sort((a, b) => wsStore.c[a.id].d < wsStore.c[b.id].d ? -1 : 1); }
function wsNewList(){ return WS_ITEMS.filter(e => wsInMods(e) && !wsStore.c[e.id]); }
function wsNewLeft(){ wsDay(); return Math.max(0, wsStore.perDay - (wsStore.nw || 0)); }
function wsTodayCount(){ return wsDueList().length + Math.min(wsNewLeft(), wsNewList().length); }
/* per la Casa: quante parole oggi, su tutti i moduli scelti */
function wsDueCount(){ return wsTodayCount(); }
function wsLearned(){ return WS_ITEMS.filter(e => wsInMods(e) && wsStore.c[e.id] && wsStore.c[e.id].b >= WS_LEARNED).length; }

/* ---------- PANNELLO NEL TAB RIPASSO ---------- */
function wsPanelHtml(){
  const due = wsDueList().length, nl = Math.min(wsNewLeft(), wsNewList().length), tot = WS_ITEMS.filter(wsInMods).length;
  const today = due + nl;
  return `<div class="panel ws-panel">
      <h2>${ic("book")}Wortschatz</h2>
      <p class="small" style="margin:0 0 10px">Leggi l'italiano e scrivi il termine tedesco <b>con l'articolo</b>. Ogni parola torna quando stai per dimenticarla: se la sai dopo 1, 3, 7, 16, 35 giorni; se sbagli, subito. Bastano 15 minuti al giorno.</p>
      <div class="stats" style="margin-bottom:12px">
        <div class="stat"><b>${today}</b><span>oggi (${due} ripasso · ${nl} nuove)</span></div>
        <div class="stat"><b>${wsLearned()}</b><span>imparate su ${tot}</span></div>
        <div class="stat"><b>${wsDueList(wsDate(1)).length - due}</b><span>in scadenza domani</span></div>
      </div>
      <div class="modes">
        <button class="mode" id="wsGo" type="button" ${today ? "" : "disabled"}><h3>Ripasso di oggi</h3><p>${today ? `${today} parole: prima quelle in scadenza, poi ${nl} nuove.` : "Per oggi hai finito. Domani ci sono altre parole; intanto puoi fare un allenamento libero."}</p><span class="go">Inizia →</span></button>
        <button class="mode" id="wsFree" type="button"><h3>Allenamento libero</h3><p>20 parole a caso dai moduli scelti. Non cambia il calendario del ripasso.</p><span class="go">Inizia →</span></button>
      </div>
      <div class="section-h">Moduli</div>
      <div class="chips" id="wsMods"></div>
      <div class="opts-row">
        <label>Nuove al giorno <select id="wsPer">${[5, 10, 15, 20, 30].map(n => `<option value="${n}"${n === wsStore.perDay ? " selected" : ""}>${n}</option>`).join("")}</select></label>
        <label><input type="checkbox" id="wsPl" ${wsStore.pl ? "checked" : ""}> chiedi anche il plurale</label>
      </div>
      <div class="qactions" style="justify-content:flex-start">
        <button class="btn ghost" type="button" id="wsList">${ic("list")} Elenco dei termini</button>
        <a class="btn ghost" id="wsAnki" href="anki/TierHund_Wortschatz.apkg" download>${ic("export")} Scarica mazzo Anki</a>
      </div>
      <p class="small" style="margin:8px 0 0">Anki: su iPhone tocca «Scarica mazzo Anki» e apri il file con AnkiMobile. Il mazzo contiene le stesse parole; i progressi di Anki e quelli di questa pagina sono separati: per il ripasso quotidiano usane uno solo.</p>
    </div>`;
}
function wsBind(){
  const paint = () => {
    $("wsMods").innerHTML = MOD_ORDER.map(m => `<button class="chip${wsStore.mods.includes(m) ? " active" : ""}" data-m="${m}"><span class="dot" style="background:var(--m-${m})"></span>${esc(MODULES[m].short)}<span class="chip-n">${WS_ITEMS.filter(e => e.m === m).length}</span></button>`).join("");
    $("wsMods").querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => {
      const m = b.dataset.m;
      wsStore.mods = wsStore.mods.includes(m) ? wsStore.mods.filter(x => x !== m) : MOD_ORDER.filter(x => x === m || wsStore.mods.includes(x));
      wsSave(); renderRipasso();
    }));
  };
  paint();
  $("wsGo").addEventListener("click", wsStartToday);
  $("wsFree").addEventListener("click", wsStartFree);
  $("wsFree").disabled = !WS_ITEMS.some(wsInMods);
  $("wsPer").addEventListener("change", ev => { wsStore.perDay = +ev.target.value; wsSave(); renderRipasso(); });
  $("wsPl").addEventListener("change", ev => { wsStore.pl = ev.target.checked; wsSave(); });
  $("wsList").addEventListener("click", wsOpenList);
}

/* ---------- SESSIONE ---------- */
let WS = null;
function wsStartToday(){
  const due = wsDueList(), nw = shuffle(wsNewList().slice(0, wsNewLeft()));
  const list = shuffle(due).concat(nw);
  if(list.length) wsStart(list, false);
}
function wsStartFree(){ const list = shuffle(WS_ITEMS.filter(wsInMods)).slice(0, 20); if(list.length) wsStart(list, true); }
function wsStart(list, practice){
  WS = {list: list.slice(), i:0, practice, firstTry:0, seen:new Set(), failed:new Set(), res:null};
  openSheet(practice ? "Wortschatz · allenamento libero" : "Wortschatz · ripasso di oggi", `<div id="wsHost"></div>`, "",
    () => { WS = null; if(activeTab === "ripasso") renderRipasso(); if(activeTab === "home") renderHome(); });
  wsRender();
}
function wsAskPlural(e){ return wsStore.pl && e.g && e.pl && e.pl !== "-" && e.pl !== "*"; }
function wsGenus(g, pl){ return g ? `<span class="genus genus-${pl ? "pl" : g}">${g}${pl ? " (Pl.)" : ""}</span>` : ""; }
function wsSentence(e, reveal){
  if(!e.s) return "";
  const parts = e.s.split(/\[|\]/);
  return `<div class="ws-s" lang="de">${esc(parts[0])}${reveal ? `<b class="ws-hit">${esc(parts[1])}</b>` : `<span class="ws-gap" aria-label="parola da completare"></span>`}${esc(parts[2] || "")}</div>${e.si ? `<div class="ws-si">${esc(e.si)}</div>` : ""}`;
}
function wsLevel(e){ const c = wsStore.c[e.id]; return !c ? "nuova" : c.b >= WS_LEARNED ? "imparata · livello " + c.b : "livello " + c.b; }
function wsRender(){
  const host = $("wsHost");
  if(WS.i >= WS.list.length) return wsFinish();
  const e = WS.list[WS.i], askPl = wsAskPlural(e);
  WS.res = null;
  host.innerHTML = `<div class="qtop"><span>Parola ${WS.i + 1} di ${WS.list.length}</span><span>${WS.practice ? "allenamento" : esc(wsLevel(e))}</span></div>
    <div class="bar"><i style="width:${WS.i / WS.list.length * 100}%"></i></div>
    <div class="qcard ws-card" style="--mc:var(--m-${e.m})">
      <span class="tag">${esc(MODULES[e.m].short)} · ${e.g ? "sostantivo" : "aggettivo / verbo"}</span>
      <div class="ws-it">${esc(e.it)}</div>
      ${wsSentence(e, false)}
      <label class="ws-lbl" for="wsA">${e.pl === "*" ? "Tedesco, con l'articolo (si usa al plurale)" : e.g ? "Tedesco, con l'articolo" : "Tedesco"}</label>
      <input id="wsA" class="ws-input" type="text" lang="de" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="${e.g ? "der / die / das …" : "…"}">
      ${askPl ? `<label class="ws-lbl" for="wsP">Plurale</label><input id="wsP" class="ws-input" type="text" lang="de" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="die …">` : ""}
      <div class="ws-keys" aria-label="Lettere tedesche">${["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü"].map(k => `<button type="button" class="ws-key" data-k="${k}" tabindex="-1">${k}</button>`).join("")}</div>
      <div id="wsFb"></div>
      <div class="qactions" id="wsAct">
        <button class="btn ghost" type="button" id="wsSkip">Non lo so</button>
        <button class="btn" type="button" id="wsCheck">Controlla</button>
      </div>
    </div>`;
  $("sheetBody").scrollTop = 0;
  let lastInput = $("wsA");
  host.querySelectorAll(".ws-input").forEach(inp => {
    inp.addEventListener("focus", () => { lastInput = inp; });
    inp.addEventListener("keydown", ev => { if(ev.key === "Enter"){ ev.preventDefault(); if(inp.id === "wsA" && $("wsP") && !WS.res){ $("wsP").focus(); return; } wsEnter(); } });
  });
  host.querySelectorAll(".ws-key").forEach(b => {
    b.addEventListener("mousedown", ev => ev.preventDefault());
    b.addEventListener("click", () => {
      const inp = lastInput; if(!inp || inp.readOnly) return;
      const s = inp.selectionStart ?? inp.value.length, t = inp.selectionEnd ?? inp.value.length;
      inp.value = inp.value.slice(0, s) + b.dataset.k + inp.value.slice(t);
      inp.focus(); inp.setSelectionRange(s + 1, s + 1);
    });
  });
  $("wsCheck").addEventListener("click", () => wsCheck(false));
  $("wsSkip").addEventListener("click", () => wsCheck(true));
  setTimeout(() => { const a = $("wsA"); if(a) a.focus(); }, 60);
}
function wsEnter(){ if(!WS) return; if(WS.res){ wsNext(); } else wsCheck(false); }

/* ---------- CORREZIONE ---------- */
const wsClean = s => String(s || "").replace(/[„“"«»]/g, "").trim().replace(/\s+/g, " ");
const wsFold = s => s.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
/* una lettera in più, in meno, diversa, o due lettere vicine scambiate */
function wsNear(a, b){
  if(lev1(a, b)) return true;
  if(a.length !== b.length) return false;
  const d = [...a].map((c, i) => c !== b[i] ? i : -1).filter(i => i >= 0);
  return d.length === 2 && d[1] === d[0] + 1 && a[d[0]] === b[d[1]] && a[d[1]] === b[d[0]];
}
/* confronta solo la parola (senza articolo) */
function wsWord(got, want, noun){
  if(got === want) return {ok:true};
  if(!noun && got.toLowerCase() === want.toLowerCase()) return {ok:true};
  if(got.toLowerCase() === want.toLowerCase()) return {ok:false, why:"Maiuscola: i sostantivi tedeschi si scrivono con l'iniziale maiuscola."};
  if(wsFold(got) === wsFold(want)) return {ok:false, why:"Quasi: controlla le lettere ä / ö / ü / ß."};
  if(wsNear(wsFold(got), wsFold(want))) return {ok:false, why:"Quasi: c'è un errore di battitura."};
  return {ok:false, why:""};
}
function wsGradeMain(e, raw){
  const a = wsClean(raw);
  if(!a) return {ok:false, why:"Nessuna risposta."};
  if(!e.g) return wsWord(a, e.w, false);
  const m = a.match(/^(der|die|das)\s+(.+)$/i);
  const word = m ? m[2] : a, art = m ? m[1].toLowerCase() : "";
  const w = wsWord(word, e.w, true);
  if(!art) return {ok:false, why:(w.ok ? "Parola giusta, ma manca l'articolo." : "Manca l'articolo.") + (w.why ? " " + w.why : "")};
  if(art !== e.g) return {ok:false, why:`Articolo sbagliato: «${e.g}», non «${art}».` + (w.ok ? " La parola è giusta." : w.why ? " " + w.why : "")};
  return w;
}
function wsGradePl(e, raw){
  const a = wsClean(raw).replace(/^die\s+/i, "");
  if(!a) return {ok:false, why:"Plurale non scritto."};
  const w = wsWord(a, e.pl, true);
  return w.ok ? w : {ok:false, why:"Plurale: " + (w.why || "non è questa la forma.")};
}
function wsCheck(skip){
  if(!WS || WS.res) return;
  const e = WS.list[WS.i];
  let ok, why = [];
  if(skip){ ok = false; }
  else {
    const g = wsGradeMain(e, $("wsA").value);
    ok = g.ok; if(g.why) why.push(g.why);
    if($("wsP")){ const p = wsGradePl(e, $("wsP").value); if(!p.ok){ ok = false; why.push(p.why); } }
  }
  WS.res = {ok, override:false};
  document.querySelectorAll("#wsHost .ws-input").forEach(i => i.readOnly = true);
  document.querySelector("#wsHost .ws-keys").classList.add("hidden");
  const sc = e.sc && WS_SCHEDA[e.sc];
  const plLine = e.pl === "*" ? `<div class="ws-pl">si usa al plurale</div>` : e.pl === "-" ? `<div class="ws-pl">di solito solo singolare</div>` : e.pl ? `<div class="ws-pl">Plurale: <span class="genus genus-pl">die</span>${esc(e.pl)}</div>` : "";
  const flags = [];
  if(e.pl && e.pl !== "*") flags.push("il plurale");
  if(e.ga) flags.push(e.pl === "*" ? "l'articolo" : "l'articolo o il singolare");
  $("wsFb").innerHTML = `<div class="fb ${ok ? "ok" : "no"}"><b class="v">${ok ? "Giusto." : skip ? "Ecco la risposta." : "Non ancora."}</b> ${esc(why.join(" "))}</div>
    <div class="ws-answer"><div class="ws-de" lang="de">${e.pl === "*" ? wsGenus(e.g, true) : wsGenus(e.g)}${esc(e.w)}</div>${plLine}</div>
    ${e.s ? wsSentence(e, true).replace(/<div class="ws-si">.*<\/div>$/, "") : ""}
    ${flags.length ? `<div class="small ws-flag">⚑ Non vengono dalle slide: ${esc(flags.join(" e "))}.</div>` : ""}
    ${sc ? `<button class="linklike" type="button" id="wsOpen">Apri la scheda «${esc(e.sc)}» →</button>` : ""}`;
  $("wsAct").innerHTML = (ok ? "" : `<button class="btn ghost" type="button" id="wsOver">Era giusta, contala</button>`) + `<button class="btn" type="button" id="wsNext">Avanti →</button>`;
  $("wsNext").addEventListener("click", wsNext);
  const ov = $("wsOver"); if(ov) ov.addEventListener("click", () => { WS.res.ok = true; WS.res.override = true; wsNext(); });
  const op = $("wsOpen"); if(op) op.addEventListener("click", () => { wsRecord(e, WS.res.ok); const id = sc; closeSheet(); openEntry(id); });
  setTimeout(() => { const n = $("wsNext"); if(n) n.focus(); }, 30);
}
function wsRecord(e, ok){
  const first = !WS.seen.has(e.id);
  WS.seen.add(e.id);
  if(first && ok) WS.firstTry++;
  if(!ok) WS.failed.add(e.id);
  if(WS.practice) return;
  wsDay();
  let c = wsStore.c[e.id];
  const isNew = !c;
  if(isNew){ c = wsStore.c[e.id] = {b:0, d:wsDate(), n:0, l:0}; wsStore.nw = (wsStore.nw || 0) + 1; }
  c.n++;
  if(ok){
    c.b = WS.failed.has(e.id) ? 1 : isNew ? 2 : Math.min(c.b + 1, WS_STEPS.length - 1);
    c.d = wsDate(WS_STEPS[c.b]);
  } else {
    if(first && !isNew) c.l++;
    c.b = 1; c.d = wsDate();
  }
  wsSave();
}
function wsNext(){
  if(!WS || !WS.res) return;
  const e = WS.list[WS.i], ok = WS.res.ok;
  wsRecord(e, ok);
  if(!ok) WS.list.splice(Math.min(WS.list.length, WS.i + 4), 0, e);   // torna qualche parola più avanti
  WS.i++; wsRender();
}
function wsFinish(){
  const n = WS.seen.size, pct = n ? Math.round(WS.firstTry / n * 100) : 0;
  const wrong = WS_ITEMS.filter(e => WS.failed.has(e.id));
  $("wsHost").innerHTML = `<div class="qcard">
      <div class="score"><b>${pct} %</b><div><h3>${WS.practice ? "Allenamento finito" : "Ripasso di oggi finito"}</h3><div class="small">${WS.firstTry} parole giuste al primo colpo su ${n}${WS.practice ? "" : ` · domani: ${wsDueList(wsDate(1)).length} in scadenza`}</div></div></div>
      ${wrong.length ? `<div class="section-h">Da rivedere</div><div class="ws-wrong">${wrong.map(e => `<div><span lang="de">${wsGenus(e.g, e.pl === "*")}${esc(e.w)}</span> <span class="small">— ${esc(e.it)}</span></div>`).join("")}</div>` : ""}
      <div class="qactions"><button class="btn ghost" type="button" id="wsClose">Chiudi</button>${wrong.length ? `<button class="btn" type="button" id="wsAgain">Ripeti queste ${wrong.length}</button>` : ""}</div>
    </div>`;
  $("sheetBody").scrollTop = 0;
  $("wsClose").addEventListener("click", closeSheet);
  const ag = $("wsAgain"); if(ag) ag.addEventListener("click", () => wsStart(shuffle(wrong), true));
}

/* ---------- ELENCO ---------- */
function wsOpenList(){
  const t = wsDate();
  let html = `<p class="small" style="margin-top:0">Tutti i termini, per modulo. Plurale ⚑ = aggiunto, non dalle slide. Tocca una riga per aprire la scheda collegata.</p>`;
  MOD_ORDER.forEach(m => {
    const list = WS_ITEMS.filter(e => e.m === m);
    if(!list.length) return;
    html += `<div class="zgroup" style="--mc:var(--m-${m})">${esc(MODULES[m].de)}</div><table class="ztable"><thead><tr><th>Deutsch · italiano</th><th>Plural ⚑ · ripasso</th></tr></thead><tbody>` +
      list.map(e => {
        const c = wsStore.c[e.id], st = !c ? "nuova" : c.d <= t ? "oggi" : (c.b >= WS_LEARNED ? "✓ " : "") + wsFmt(c.d);
        const pl = e.pl === "*" ? "(Pl.)" : e.pl === "-" ? "—" : e.pl ? "die " + esc(e.pl) : "";
        return `<tr${e.sc && WS_SCHEDA[e.sc] ? ` data-id="${WS_SCHEDA[e.sc]}" style="cursor:pointer"` : ""}><td><div class="zde" lang="de">${wsGenus(e.g, e.pl === "*")}${esc(e.w)}</div><div class="zit">${esc(e.it)}</div></td><td><div class="zit" lang="de">${pl}</div><div class="zsrc">${st}</div></td></tr>`;
      }).join("") + `</tbody></table>`;
  });
  openSheet(`Wortschatz · ${WS_ITEMS.length} termini`, html);
  $("sheetBody").querySelectorAll("tr[data-id]").forEach(tr => tr.addEventListener("click", () => { closeSheet(); openEntry(tr.dataset.id); }));
}
