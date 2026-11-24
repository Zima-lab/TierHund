/* TierHund — funzionamento offline quando l'app è servita da un sito (http/https).
   Aprendo index.html direttamente dal disco non serve: i file sono già lì.
   Strategia: prima la rete (così gli aggiornamenti arrivano subito), la cache solo se si è offline.
   Cambiare CACHE a ogni modifica importante dei file. */
const CACHE = "tierhund-v4";
const FILES = ["./","index.html","fonts.css","style.css","icon.svg","manifest.webmanifest",
  "js/app.js","js/ripasso.js","js/wortschatz.js","dati/recht.js","dati/transport.js","dati/hunde2a.js","dati/hunde2bc.js","dati/quiz.js","dati/wortschatz.js",
  "esercizi/Quiz_Sachkunde.html"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(r => {
      if(r.ok && new URL(e.request.url).origin === location.origin){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch:true}))
  );
});
