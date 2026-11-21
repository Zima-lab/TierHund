# TierHund — prontuario Sachkunde § 11 TierSchG · Hund

**Come si apre:** doppio clic su `index.html`. Si apre nel browser e funziona senza internet.

## Cosa c'è
- **Cerca**: ricerca in tedesco e in italiano, anche con piccoli errori di battitura o scrivendo «ae» al posto di «ä». Si può filtrare per modulo (Recht, Transport, 2a, 2b, 2c) e per tipo di scheda (Begriff, § Norm, Zahl, Merke, Schema).
- **Casa**: conto alla rovescia per l'esame, moduli, tabella **Zahlen & Fristen** (tutti i numeri in una tabella), Merke-Sätze, Prüfschemata, la scheda del giorno e le ultime schede aperte.
- **Ripasso**: simulazione d'esame (30 crocette + 5 domande aperte, 60 min), allenamento per argomento, ripasso degli errori, flashcard fatte dalle schede.
- **Preferiti**: le schede segnate con la stella.

## Da dove viene il contenuto
- Schede: dai PDF DE-IT dei moduli Rechtsvorschriften, Tiertransport, Hunde 2a, 2b, 2c. Il tedesco è quello delle slide.
- **⚑ Nota** = spiegazione aggiunta, non presente nelle slide. Da verificare prima di usarla all'esame.
- Quiz: le 164 domande del quiz Sachkunde, più 16 domande nuove sul Tiertransport.

## File
```
index.html          la pagina
style.css           la grafica (stessa base di Wortabolario)
fonts.css           i caratteri, incorporati (licenze in fonts/)
js/app.js           ricerca, schede, Casa, Preferiti
js/ripasso.js       quiz, simulazione, flashcard
dati/*.js           IL CONTENUTO: per correggere una scheda o una domanda si toccano solo questi
```

## Da sapere
- Preferiti, errori e flashcard restano salvati **solo nel browser** con cui apri il file. Per spostarli: Casa → Backup → Esporta / Importa.
- Su iPhone, aprendo il file dall'app File, il JavaScript non parte. Per usarla sul telefono va pubblicata online (es. GitHub Pages, come Wortabolario): la cartella è già pronta, funziona anche offline e si installa nella Home.
