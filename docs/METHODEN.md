# Methoden und Beispiele ergänzen

Die App ist so gebaut, dass neue 2-Achsen-Methoden und neue Beispiele **nur eine zusätzliche Datei** brauchen. Beide werden beim Bauen automatisch eingelesen (`import.meta.glob`); es gibt keine Liste, die man zusätzlich pflegen muss.

| Was | Wo | Registrierung |
|---|---|---|
| Methode (Vorlage) | `js/methods/<id>.js` | automatisch (`js/methods.js`) |
| Beispiel | `examples/<name>.<sprache>.json` | automatisch (`js/examples.js`) |
| Neue Aufteilung der Fläche | `js/layout.js` (`RESOLVERS`, `shapes`, `labelAnchors`, `centerOf`) | Typ `LayoutKind` in `types.d.ts`, `Model.LAYOUTS` |
| Neue Darstellung | `js/ui/surfaces.jsx` (`Surface`) | Typ `ViewKind`, `Model.VIEWS` |
| Neue Art von Feld je Eintrag | `js/ui/editor.jsx` (`FieldInput`), `js/io.js` (`formatValue`) | Typ `FieldType`, `Model.FIELD_TYPES` |

## Grundidee

Eine Matrix trägt ihre Einstellungen (`config`) vollständig selbst: zwei Achsen, eine Aufteilung in Bereiche, Felder je Eintrag, optionale Fragen, Rangfolge. Eine **Methode** ist nur eine Vorlage dafür – sie liefert beim Anlegen die Voreinstellungen und Texte, danach Hinweise, Leitfragen und die Erklärung in der Hilfe. Deshalb lassen sich Matrizen später frei anpassen, und eine Matrix bleibt lesbar, auch wenn ihre Methode einmal entfernt wird (sie fällt dann auf „Eigene Matrix“ zurück).

Drei Aufteilungen decken die gängigen Methoden ab:

| Aufteilung | Bereich eines Punkts | Beispiele |
|---|---|---|
| `quadrants` – vier Felder | Trennlinien `split.x`/`split.y`; Bereich mit `qx`/`qy` = `high`/`low` (auf der Linie zählt „hoch“) | Eisenhower, Wert/Aufwand, Macht/Interesse, BCG, Kraljic, Dringlichkeit/Auswirkung |
| `grid` – Raster mit Stufen | Wert X × Y; Bereich mit dem größten `min` ≤ Wert | Risikomatrix, Priorität = Häufigkeit × Schwere |
| `zones` – Zonen um den Ursprung | Abstand vom Ursprung (Anteile der Achsen, 0 … 1,42); erster Bereich mit `r` ≥ Abstand | Stacey, Cynefin-ähnliche Einordnungen |

Darstellungen: `board` (Karten in vier Feldern, nur bei `quadrants`), `plot` (Punkte, stufenlos ziehen), `heatmap` (Zellen, nur bei `grid` mit Stufen auf beiden Achsen).

## Eine Methode ergänzen

1. Datei `js/methods/<id>.js` anlegen, z. B. durch Kopieren von `value-effort.js` (vier Felder) oder `risk.js` (Raster).
2. `export const method = { … }` ausfüllen (Typ `MethodDef` in `types.d.ts`):

```js
/** @type {MethodDef} */
export const method = {
  id: 'kraljic',               // eindeutig, wird in jeder Matrix gespeichert – nicht mehr ändern
  order: 60,                   // Reihenfolge in Auswahl und Übersicht (Eigene Matrix: 1000)
  icon: '◇',                   // Kurzzeichen
  color: 'teal',               // Farbe des Methoden-Chips (siehe Model.PALETTE)
  layout: 'quadrants',
  view: 'plot',
  x: { min: 1, max: 5, step: 0.5 },          // reverse: true = hohe Werte links
  y: { min: 1, max: 5, step: 0.5 },
  split: { x: 3, y: 3 },
  regions: [
    { id: 'leverage', color: 'green', qx: 'low', qy: 'high' },
    { id: 'strategic', color: 'blue', qx: 'high', qy: 'high' },
    { id: 'routine', color: 'gray', qx: 'low', qy: 'low' },
    { id: 'bottleneck', color: 'red', qx: 'high', qy: 'low' },
  ],
  fields: [                    // Felder je Eintrag (zusätzlich zu Titel und Notiz)
    { key: 'owner', type: 'person' },
    { key: 'supplier', type: 'text' },
  ],
  rank: 'none',                // 'ratio' (Y ÷ X), 'product' (X × Y) oder 'none'
  texts: { de: { … }, en: { … } },
  hints(m, ctx) { return []; },  // optional
};
```

3. Texte je Sprache (`MethodTexts`): `name`, `short` (Chip, Filter), `aka` (andere Namen), `description`, `itemName` (Einzahl/Mehrzahl), `noteLabel`, Beschriftung und Pole beider Achsen, `regions` (Name und Hinweis je Bereich), `fields` (Beschriftung je Feld), `options` (Texte der Auswahlfelder), `questions`, `leadQuestions`, `help` (Absätze und Liste für die Hilfe) und – für eigene Hinweise – `hints`.
4. `npm test` ausführen. Die Unit-Tests prüfen jede Methode automatisch: Texte für alle Bereiche, Felder und Fragen in beiden Sprachen, gleiche Struktur und Platzhalter in Deutsch und Englisch, gültige Einstellungen, und dass die Mitte jedes Bereichs auch in diesem Bereich liegt (wichtig für Taste 1–9 und das Ablegen in Felder).
5. Möglichst ein Beispiel ergänzen (siehe unten) – der Beispiel-Test verlangt eines je Methode.

### Felder je Eintrag

| `type` | Eingabe | Bemerkung |
|---|---|---|
| `text`, `textarea` | Textfeld | |
| `person` | Textfeld mit Vorschlägen | `key: 'owner'` zeigt die Person als Kreis auf den Karten |
| `date` | Datum | `key: 'due'` zeigt das Datum auf den Karten, überschrittene rot |
| `check` | Haken | `key: 'done'` streicht erledigte Einträge durch und zählt sie nicht als offen |
| `choice` | Auswahl aus `options` | Optionen mit `color` färben die Punkte (das erste solche Feld zählt, z. B. Haltung bei Stakeholdern); `optionsText` teilt Texte zwischen Feldern |
| `point` | zweite Position | wird gestrichelt mit Pfeil gezeichnet und lässt sich ziehen – z. B. Ziel-Position (Stakeholder) oder Bewertung nach Maßnahme (Risiko) |

### Fragen zum Einordnen

Mit `questions: [{ id, axis: 'x' | 'y' }]` (Texte in `texts.questions`) beantwortet man je Eintrag Fragen von 1 = trifft zu bis 5 = trifft nicht zu. Der Mittelwert je Achse ergibt die Position (1 → niedrig, 5 → hoch); Ziehen überschreibt sie. Beispiel: Stacey-Matrix.

### Hinweise

`hints(m, ctx)` liefert Hinweise für die Seitenleiste: `{ key, state: 'ok' | 'warn' | 'open', title, detail, items? }`. `items` (IDs) werden beim Anklicken markiert. `ctx` enthält `regionOf`, `placed`, `value` (liefert `null`, wenn ein Feld ausgeblendet ist), `fill` (Platzhalter) und `t` (Texte der Methode). Hinweise sollten mit ausgeblendeten Feldern und umbenannten Bereichen zurechtkommen (Bereiche über `id` ansprechen). Allgemeine Hinweise (leere Matrix, Eingang, Einträge ohne Titel) kommen aus `js/methods.js`.

## Ein Beispiel ergänzen

1. Matrix in der App anlegen und füllen, dann „Datei → Matrix exportieren (JSON)“ – oder eine Datei per Skript erzeugen.
2. Als `examples/<name>.de.json` und `examples/<name>.en.json` speichern (gleicher `<name>`, Einträge an denselben Stellen). Fehlt eine Sprache, zeigt die App die deutsche Fassung.
3. Die Datei muss genau dem normalisierten Format entsprechen (`Model.normalize` ändert nichts) – das prüft `tests/unit/examples.test.js`. Feste `id`s sind erlaubt; beim Öffnen bekommt die Matrix eine neue ID.

## Was bewusst (noch) nicht drin ist

- Wert aus gewichteten Kriterien berechnen (z. B. Wert = 50 % Umsatz + 30 % Zufriedenheit + 20 % Image).
- Mehrere Bewertende je Eintrag mit Mittelwert und Streuung.
- Punktgröße als dritte Kennzahl.
- Aufteilung mit 3 × 3 benannten Feldern (z. B. 9-Box, GE-McKinsey) – als neue Aufteilung in `js/layout.js` möglich.
