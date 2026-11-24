# TierHund — prontuario Sachkunde § 11 TierSchG · Hund

**Come si apre:** doppio clic su `index.html`. Si apre nel browser e funziona senza internet.

## Cosa c'è
- **Cerca**: ricerca in tedesco e in italiano, anche con piccoli errori di battitura o scrivendo «ae» al posto di «ä». Si può filtrare per modulo (Recht, Transport, 2a, 2b, 2c) e per tipo di scheda (Begriff, § Norm, Zahl, Merke, Schema).
- **Casa**: conto alla rovescia per l'esame, moduli, tabella **Zahlen & Fristen** (tutti i numeri in una tabella), Merke-Sätze, Prüfschemata, la scheda del giorno e le ultime schede aperte.
- **Ripasso → Wortschatz**: 282 termini delle slide da scrivere in tedesco con l'articolo (e il plurale). Ripasso dilazionato: una parola che sai torna dopo 1, 3, 7, 16, 35, 75 giorni; una che sbagli torna subito. Si sceglie quante parole nuove al giorno e da quali moduli. C'è anche l'elenco completo e il mazzo Anki da scaricare.
- **Ripasso**: simulazione d'esame (30 crocette + 5 domande aperte, 60 min), allenamento per argomento, ripasso degli errori, flashcard fatte dalle schede.
- **Preferiti**: le schede segnate con la stella.

## Da dove viene il contenuto
- Schede: dai PDF DE-IT dei moduli Rechtsvorschriften, Tiertransport, Hunde 2a, 2b, 2c. Il tedesco è quello delle slide.
- **⚑ Nota** = spiegazione aggiunta, non presente nelle slide. Da verificare prima di usarla all'esame.
- Wortschatz: termini e frasi d'esempio presi dalle slide (stesso testo delle schede). **Il plurale non viene dalle slide**: è aggiunto, segnato con ⚑. Segnati anche l'articolo o il singolare quando nella slide la parola compare senza articolo o al plurale.
- Quiz: le 164 domande del quiz Sachkunde, più 16 domande nuove sul Tiertransport.

## File
```
index.html          la pagina
style.css           la grafica (stessa base di Wortabolario)
fonts.css           i caratteri, incorporati (licenze in fonts/)
js/app.js           ricerca, schede, Casa, Preferiti
js/ripasso.js       quiz, simulazione, flashcard
js/wortschatz.js    Wortschatz: ripasso dilazionato, correzione, elenco
dati/*.js           IL CONTENUTO: per correggere una scheda, una domanda o un termine si toccano solo questi
dati/wortschatz.js  i termini (articolo, plurale, frase d'esempio)
tools/genera_anki.py   crea anki/TierHund_Wortschatz.apkg da dati/wortschatz.js
anki/               il mazzo Anki pronto da scaricare
```

## Da sapere
- Mazzo Anki: si rigenera da solo su GitHub quando cambia `dati/wortschatz.js`. A mano: `pip install genanki` e poi `python3 tools/genera_anki.py`. Reimportandolo in Anki le carte si aggiornano e i progressi restano. I progressi di Anki e quelli della pagina sono separati.
- Preferiti, errori, flashcard e Wortschatz restano salvati **solo nel browser** con cui apri il file. Per spostarli: Casa → Backup → Esporta / Importa.
- Su iPhone, aprendo il file dall'app File, il JavaScript non parte. Per usarla sul telefono va pubblicata online (es. GitHub Pages, come Wortabolario): la cartella è già pronta, funziona anche offline e si installa nella Home.
