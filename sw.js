/* TierHund — funzionamento offline quando l'app è servita da un sito (http/https).
   Aprendo index.html direttamente dal disco non serve: i file sono già lì. */
const CACHE = "tierhund-v1";
const FILES = ["./","index.html","fonts.css","style.css","icon.svg","manifest.webmanifest",
  "js/app.js","js/ripasso.js","dati/recht.js","dati/transport.js","dati/hunde2a.js","dati/hunde2bc.js","dati/quiz.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
