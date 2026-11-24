#!/usr/bin/env python3
"""TierHund — genera il mazzo Anki del Wortschatz da dati/wortschatz.js.

Uso:   pip install genanki
       python3 tools/genera_anki.py          → anki/TierHund_Wortschatz.apkg

Ogni nota ha un identificativo fisso (dalla parola tedesca): se reimporti il mazzo dopo una modifica,
Anki aggiorna le carte esistenti e tiene i progressi. Su GitHub il file si rigenera da solo
quando cambia dati/wortschatz.js (.github/workflows/anki.yml).
"""
import html, json, pathlib, re, sys
import genanki

esc = lambda t: html.escape(t, quote=False)

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "dati" / "wortschatz.js"
OUT = ROOT / "anki" / "TierHund_Wortschatz.apkg"

MODULI = {"recht": "Rechtsvorschriften", "trans": "Tiertransport", "h2a": "Hunde 2a",
          "h2b": "Hunde 2b · Körpersprache", "h2c": "Hunde 2c · Welpen"}

# ID fissi: non cambiarli, altrimenti Anki crea un mazzo nuovo e i progressi non si collegano
MODEL_ID = 1732451001
DECK_ID = 1732451002

CSS = """
.card { font-family: Georgia, 'Times New Roman', serif; font-size: 20px; text-align: center; color: #1b1f3b; background: #fbfaf7; }
.tag { font-family: -apple-system, Helvetica, sans-serif; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: #6b7280; }
.it { font-size: 28px; margin: 10px 0 14px; }
.satz { font-size: 17px; text-align: left; background: #f1f1ec; border-radius: 10px; padding: 8px 12px; }
.gap { display: inline-block; min-width: 4em; border-bottom: 2px solid #b7791f; }
.satzit { font-family: -apple-system, Helvetica, sans-serif; font-size: 13px; font-style: italic; color: #6b7280; text-align: left; margin: 4px 2px 0; }
.de { font-size: 30px; font-weight: bold; }
.pl { font-size: 17px; color: #6b7280; margin-top: 2px; }
.hit { color: #1d7a5f; }
.flag { font-family: -apple-system, Helvetica, sans-serif; font-size: 12px; color: #8a6d1d; margin-top: 10px; }
input#typeans { font-size: 20px; }
.nightMode .card, .card.nightMode { color: #e6e8f5; background: #151925; }
.nightMode .satz { background: #222838; }
"""

FRONT = """<div class="tag">{{Modul}}</div>
<div class="it">{{Italiano}}</div>
{{#Satz}}<div class="satz">{{Satz}}</div><div class="satzit">{{SatzIT}}</div>{{/Satz}}
<div class="tag" style="margin-top:14px">Tedesco, con l'articolo</div>
{{type:Deutsch}}"""

BACK = """{{FrontSide}}
<hr id="answer">
<div class="de">{{Deutsch}}</div>
{{#Plural}}<div class="pl">{{Plural}}</div>{{/Plural}}
{{#SatzVoll}}<div class="satz" style="margin-top:10px">{{SatzVoll}}</div>{{/SatzVoll}}
{{#Hinweis}}<div class="flag">{{Hinweis}}</div>{{/Hinweis}}"""

MODEL = genanki.Model(
    MODEL_ID, "TierHund Wortschatz (IT → DE)",
    fields=[{"name": n} for n in ["Deutsch", "Italiano", "Plural", "Satz", "SatzVoll", "SatzIT", "Modul", "Hinweis"]],
    templates=[{"name": "Italiano → Deutsch", "qfmt": FRONT, "afmt": BACK}],
    css=CSS,
)


def load():
    src = SRC.read_text(encoding="utf-8")
    start = src.index("[", src.index("const WORTSCHATZ"))
    end = src.rindex("]")
    return json.loads(src[start:end + 1])


def satz(s, reveal):
    if not s:
        return ""
    m = re.match(r"^(.*?)\[(.+?)\](.*)$", s)
    a, w, b = (esc(x) for x in m.groups())
    return a + (f'<b class="hit">{w}</b>' if reveal else '<span class="gap"></span>') + b


def main():
    items = load()
    deck = genanki.Deck(DECK_ID, "TierHund · Wortschatz § 11")
    for e in items:
        g, w, pl = e.get("g", ""), e["w"], e.get("pl", "")
        deutsch = f"{g} {w}".strip()
        if pl == "*":
            plural = "si usa al plurale"
        elif pl == "-":
            plural = "di solito solo singolare"
        elif pl:
            plural = f"Plurale: die {pl}"
        else:
            plural = ""
        flags = []
        if pl and pl != "*":
            flags.append("il plurale")
        if e.get("ga"):
            flags.append("l'articolo" if pl == "*" else "l'articolo o il singolare")
        hinweis = ("⚑ Non vengono dalle slide: " + " e ".join(flags) + ".") if flags else ""
        note = genanki.Note(
            model=MODEL,
            fields=[esc(deutsch), esc(e["it"]), esc(plural),
                    satz(e.get("s"), False), satz(e.get("s"), True), esc(e.get("si", "")),
                    esc(MODULI.get(e["m"], e["m"])), esc(hinweis)],
            guid=genanki.guid_for("TierHund-Wortschatz", w),
            tags=["TierHund", "Wortschatz", e["m"]],
        )
        deck.add_note(note)
    OUT.parent.mkdir(exist_ok=True)
    genanki.Package(deck).write_to_file(str(OUT))
    print(f"{len(items)} carte → {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    sys.exit(main())
