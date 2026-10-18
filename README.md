# 2-Achsen-Matrix

Responsive Web-App, mit der man die gängigsten **2-Achsen-Methoden** anwendet: **Eisenhower-Matrix**, **Wert/Aufwand**, **Macht/Interesse** (Stakeholder), **Risikomatrix**, **Stacey-Matrix**, **BCG-Matrix**, **GE-/McKinsey-Matrix**, **Kraljic-Matrix**, **Ansoff-Matrix**, **SWOT-Analyse**, **Dringlichkeit/Auswirkung**, **Wichtigkeit/Zufriedenheit**, **Situatives Führen** und **Porters Wettbewerbsstrategien** – dazu eigene Matrizen mit frei wählbaren Achsen. Einträge erfassen, per Ziehen oder Tastatur einordnen, Hinweise zur Methode bekommen, als Bericht drucken oder exportieren.

Läuft im Browser ohne Server-Backend; die Oberfläche nutzt [Preact](https://preactjs.com) mit [Signals](https://preactjs.com/guide/v10/signals/), gebaut wird mit [Vite](https://vite.dev) – technisch und gestalterisch wie die Schwester-Apps [Morphologische Matrix](https://github.com/method-commons/morphological-matrix-app), [User Stories](https://github.com/method-commons/user-story-app) und [5 Warum](https://github.com/method-commons/5-why-app).

![Übersicht](docs/mockups/s1-uebersicht.png)

## Starten

Lokal (Node.js ≥ 22):

```sh
npm install      # einmalig
npm run dev      # Entwicklungsserver, http://localhost:5173/
npm run build    # Build nach dist/
npm run preview  # gebaute App ansehen, http://localhost:4173/
npm test         # Lint, Typprüfung, Unit-Tests, Build, Browser-Tests
```

Auf `main` veröffentlicht die CI die App auf GitHub Pages, sobald alle Prüfungen grün sind (einmalig: *Settings → Pages → Source: „GitHub Actions“*).

## Funktionen

- **Übersicht** aller Matrizen als Karten mit Vorschaubild, Methode, Einträgen je Bereich, Eingang und wichtigstem Hinweis; Filter nach Methode; Duplizieren und Löschen (mit Rückgängig). Darunter die Methoden im Überblick (Anwenden, Erklärung).
- **Neue Matrix**: Methode wählen – Vorschau mit Achsen, Skala und Bereichen – oder eine eigene Vorlage bzw. „Eigene Matrix“.
- **Methoden** (Vorlagen):
  - **Eisenhower** – Karten in vier Feldern (*Sofort erledigen · Einplanen · Delegieren · Weglassen*), „dringend“ links; Person, Termin (überschrittene rot) und Erledigt je Aufgabe; Hinweise zu Delegieren ohne Person, Einplanen ohne Termin, Verhältnis Sofort/Einplanen.
  - **Wert/Aufwand** – Punkte stufenlos (0–10 in halben Schritten): *Quick Wins · Großprojekte · Lückenfüller · Zeitfresser*; Begründung je Idee; Rangfolge nach Wert ÷ Aufwand; Hinweis auf Ideen knapp an der Grenze. (Die Rangfolge heißt in jeder Matrix nach ihren Achsen, z. B. „Wichtigkeit ÷ Zufriedenheit“.)
  - **Macht/Interesse** – Stakeholder mit Haltung (unterstützend/neutral/kritisch, als Farbe), Ziel-Haltung, Ziel-Position (Pfeil, ziehbar), Strategie, Kommunikation und Ansprechperson; Hinweis auf kritische Stakeholder mit viel Einfluss.
  - **Risikomatrix** – Raster 5 × 5 mit Stufen nach Wahrscheinlichkeit × Auswirkung; Strategie (vermeiden/vermindern/übertragen/akzeptieren), Maßnahme, Verantwortlich, Bewertung nach Maßnahme (gestrichelt); Rangfolge nach Risikowert; Hinweise zu hohen Risiken ohne Maßnahme und Maßnahmen ohne Wirkung.
  - **Stacey** – Zonen *einfach · kompliziert · komplex · chaotisch* um den Ursprung mit empfohlenem Vorgehen; Einordnen per vier Fragen (Position aus den Antworten) oder Ziehen.
  - **BCG-Matrix** – Produkte nach relativem Marktanteil (hoch links) und Marktwachstum: *Stars · Question Marks · Cash Cows · Poor Dogs*; Umsatzanteil, Normstrategie, Verantwortlich; Hinweise zur Finanzierung durch Cash Cows, unentschiedenen Question Marks und Poor Dogs.
  - **GE-/McKinsey-Matrix** – Raster 3 × 3 nach Wettbewerbsstärke und Marktattraktivität mit den Normstrategien *Investieren · Selektiv vorgehen · Abschöpfen* auf den Diagonalen; Maßnahme je Geschäftsfeld; Rangfolge.
  - **Kraljic-Matrix** – Einkauf nach Versorgungsrisiko und Ergebniseinfluss: *Strategische · Engpass- · Hebel- · Unkritische Produkte*; Lieferant, Einkaufsstrategie; Hinweise zu kritischen Produkten ohne Strategie.
  - **Ansoff-Matrix** – Wachstumsideen als Karten nach Produkt und Markt (bestehend/neu): *Marktdurchdringung · Produktentwicklung · Marktentwicklung · Diversifikation*; Hinweise zum Risiko.
  - **SWOT-Analyse** – Faktoren als Karten: *Stärken · Schwächen · Chancen · Risiken*; Strategie je Faktor (TOWS); Hinweis auf leere Felder.
  - **Dringlichkeit/Auswirkung** – Raster 3 × 3 mit Priorität P1–P5 wie in der üblichen ITIL-Tabelle; Verantwortlich, Fällig, Erledigt; Hinweise zu offenen P1 und hoher Priorität ohne Verantwortung.
  - **Wichtigkeit/Zufriedenheit** (Importance-Performance-Analyse) – Befragungswerte 1–5: *Hier konzentrieren · Weiter so · Geringe Priorität · Zu viel des Guten*; Rangfolge nach Wichtigkeit ÷ Zufriedenheit; Maßnahme je Merkmal.
  - **Situatives Führen** – Kompetenz × Motivation je Person und Aufgabe: *Anleiten · Überzeugen · Unterstützen · Delegieren*; Einordnen per vier Fragen; nächster Schritt.
  - **Porters Wettbewerbsstrategien** – Optionen als Karten: *Kostenführerschaft · Differenzierung · Kostenfokus · Differenzierungsfokus*; Hinweis „zwischen den Stühlen“.
  - **Eigene Matrix** – freie Achsen und vier Felder als Ausgangspunkt.
- **Arbeiten in der Matrix**: Eingang für neue Einträge (Enter), Ziehen mit Maus, Stift oder Finger (auch zurück in den Eingang), Tastatur (Pfeiltasten verschieben, 1–9 legt in einen Bereich, 0 in den Eingang, Entf löscht, Esc hebt die Auswahl auf). Seitenleiste: gewählter Eintrag (Titel, Bereich, Werte, Fragen, Notiz, Felder) bzw. Verteilung, Hinweise (anklicken markiert die Einträge), Rangfolge und Leitfragen. Namen oder nur Nummern an den Punkten; zweite Positionen ein-/ausblendbar.
- **Liste**: alle Einträge als Tabelle (Titel, Werte, Bereich, Notiz, Felder), sortierbar nach Nummer, Bereich oder Rangfolge.
- **Bericht**: Matrix als Bild, Achsen, Rangfolge, Einträge je Bereich mit Notiz und Feldern – Drucken/PDF, Bild (PNG), Markdown (kopieren, herunterladen), CSV, JSON.
- **Achsen & Bereiche** (je Matrix anpassbar): Name und Beschreibung, Bezeichnung der Einträge, Achsen (Name, Pole, Skala, Schritte, Richtung), Aufteilung (vier Felder, Raster mit Stufen, Zonen) und Darstellung (Karten, Punkte, Zellen), Trennlinien, Bereiche (Name, Hinweis, Farbe, Grenzen), Felder je Eintrag (Person, Termin, Erledigt, Text, Textfeld, Auswahl, zweite Position) – bei Auswahlfeldern Optionen umbenennen, ergänzen, entfernen und einfärben –, Rangfolge. Positionen werden bei geänderter Skala umgerechnet; ausgeblendete Felder behalten ihre Werte. **Als eigene Vorlage speichern** für neue Matrizen.
- **Einträge übernehmen** aus einer anderen Matrix (z. B. Maßnahmen aus der Risikomatrix nach Wert/Aufwand bewerten).
- **Speichern** automatisch im Browser (localStorage), Rückgängig/Wiederholen (Knöpfe bzw. `Strg+Z` / `Strg+Umschalt+Z`), Export/Import je Matrix als JSON (identische werden übersprungen, abweichende als Kopie angelegt), Sicherung aller Matrizen. Änderungen aus einem anderen Browser-Tab werden übernommen.
- **Beispiele** für jede Methode (Food-Truck wie in den Schwester-Apps), Deutsch und Englisch.
- **Methodik-Hilfe** je Methode (Zweck, Bereiche, Vorgehen, Leitfragen) und zur Bedienung.
- **Sprachen**: Deutsch und Englisch (Menü „Datei“). Hell/dunkel nach Systemeinstellung, mobil mit Navigation unten und Feldern untereinander.

## Erweitern

Neue Methoden und Beispiele sind je **eine zusätzliche Datei** und werden automatisch eingelesen – Anleitung in [docs/METHODEN.md](docs/METHODEN.md):

- Methode: `js/methods/<id>.js` (Achsen, Aufteilung, Bereiche, Felder, Fragen, Texte in Deutsch/Englisch, Hinweise).
- Beispiel: `examples/<name>.<sprache>.json` (Matrix im Exportformat).

Die Tests prüfen jede Methode und jedes Beispiel automatisch (vollständige Texte in beiden Sprachen, gültige Einstellungen, Bereiche erreichbar, Beispiele im normalisierten Format).

## Aufbau

| Datei | Inhalt |
|---|---|
| `js/model.js` | Datenmodell, Farben, Normalisieren (inkl. Versionen), Anlegen |
| `js/layout.js` | Geometrie: Werte ↔ Fläche, Bereich eines Punkts je Aufteilung, Mitte eines Bereichs, Umrechnen, Position aus Antworten, Rangfolge, Flächen zum Zeichnen |
| `js/methods.js`, `js/methods/*.js` | Verzeichnis der Methoden (automatisch eingelesen), Einstellungen aus einer Methode, Hinweise (mit Hilfen für die Methoden), Leitfragen; je Methode eine Datei |
| `js/ops.js` | Änderungen (Einträge, Position, Bereich, Felder, Antworten, Einstellungen übernehmen, duplizieren, Einträge übernehmen) |
| `js/storage.js` | Speicherung im localStorage (Matrizen, eigene Vorlagen) |
| `js/io.js` | JSON-Export/-Import, Sicherung, Markdown-Bericht, CSV; Formatierung von Zahlen, Titeln und Rangwerten |
| `js/examples.js`, `examples/` | Beispiele (automatisch gefunden, erst beim Öffnen der Beispiele und nur in der benötigten Sprache geladen) |
| `js/texts.js`, `js/i18n/` | Texte der Oberfläche (Deutsch maßgeblich, Englisch gleiche Struktur) |
| `js/ui/core.js` | Route, geöffnete Matrix, Speichern, Verlauf, Auswahl, Dialoge, Meldungen |
| `js/ui/surfaces.jsx`, `js/ui/drag.js` | Arbeitsflächen (Karten, Punkte, Zellen) und Ziehen |
| `js/ui/*.jsx` | Ansichten: Start, Matrix, Eintrag, Liste, Bericht, Achsen & Bereiche, Einträge übernehmen, Hilfe; `svg.jsx` zeichnet Vorschaubilder und das Bild im Bericht |
| `css/` | Design-Tokens (aus den Schwester-Apps) mit Farben der Bereiche, Bausteine, Ansichten, mobil, Druck |
| `tests/unit/`, `tests/e2e/` | Vitest (Logik, Mindestabdeckung) und Playwright (gegen den Build) |

Datenformat: [docs/DATENFORMAT.md](docs/DATENFORMAT.md). Entwürfe: [docs/mockups/](docs/mockups/).
