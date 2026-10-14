# Datenformat

Eine Matrix wird als JSON gespeichert (localStorage, Schlüssel `two-axis:matrix:<id>`) und so auch exportiert. Typen: [`types.d.ts`](../types.d.ts). Beim Laden und Importieren bringt `Model.normalize` jede Matrix in die aktuelle Form: fehlende Angaben werden ergänzt, ungültige ersetzt, Positionen auf die Skala gerundet, ältere Versionen umgewandelt.

## Beispiel (gekürzt)

```json
{
  "version": 1,
  "id": "m8x2k…",
  "name": "Ideen Saison 2027",
  "context": "Food-Truck · Ideensammlung des Teams",
  "method": "value-effort",
  "config": {
    "x": { "label": "Aufwand", "low": "gering", "high": "hoch", "min": 0, "max": 10, "step": 0.5, "reverse": false },
    "y": { "label": "Wert / Nutzen", "low": "gering", "high": "hoch", "min": 0, "max": 10, "step": 0.5, "reverse": false },
    "layout": "quadrants",
    "view": "plot",
    "split": { "x": 5, "y": 5 },
    "regions": [
      { "id": "quick", "label": "Quick Wins", "hint": "zuerst umsetzen", "color": "green", "qx": "low", "qy": "high" },
      { "id": "major", "label": "Großprojekte", "hint": "sorgfältig planen", "color": "blue", "qx": "high", "qy": "high" },
      { "id": "fill", "label": "Lückenfüller", "hint": "nebenbei, wenn Zeit ist", "color": "gray", "qx": "low", "qy": "low" },
      { "id": "sink", "label": "Zeitfresser", "hint": "streichen", "color": "red", "qx": "high", "qy": "low" }
    ],
    "fields": [],
    "questions": [],
    "rank": "ratio",
    "itemName": { "one": "Idee", "many": "Ideen" },
    "noteLabel": "Begründung"
  },
  "items": [
    { "id": "i1…", "no": 3, "title": "Vegane Pommes-Variante", "note": "Gleiche Fritteuse, eigenes Öl", "x": 3, "y": 6.5, "values": {}, "answers": {} },
    { "id": "i2…", "no": 14, "title": "Steuerberater anrufen", "note": "", "x": null, "y": null, "values": {}, "answers": {} }
  ],
  "createdAt": "2026-10-14T08:00:00.000Z",
  "updatedAt": "2026-10-14T09:12:00.000Z"
}
```

## Felder

| Feld | Bedeutung |
|---|---|
| `method` | ID der Methode (Vorlage), z. B. `eisenhower`, `value-effort`, `stakeholder`, `risk`, `stacey`, `custom`. Unbekannte IDs bleiben erhalten; die Matrix verhält sich dann wie eine eigene Matrix. |
| `config.x`, `config.y` | Achse: Beschriftung, Pole (`low`, `high`), Skala `min`–`max`, `step` (0 = stufenlos, dann eine Nachkommastelle), `reverse` (hohe Werte links bzw. unten). |
| `config.layout` | `quadrants` (vier Felder), `grid` (Raster, Wert X × Y), `zones` (Ringe um den Ursprung). |
| `config.view` | `board` (Karten, nur `quadrants`), `plot` (Punkte), `heatmap` (Zellen, nur `grid` mit Stufen auf beiden Achsen). |
| `config.split` | Trennlinien bei vier Feldern. |
| `config.regions` | Bereiche mit `id`, `label`, `hint`, `color` (`red`, `orange`, `yellow`, `green`, `teal`, `blue`, `violet`, `gray`) und je nach Aufteilung `qx`/`qy` (`high`/`low`), `min` (ab Wert X × Y) bzw. `r` (bis Abstand). |
| `config.fields` | Felder je Eintrag: `key`, `label`, `type` (`text`, `textarea`, `person`, `date`, `check`, `choice`, `point`), bei `choice` zusätzlich `options` (`id`, `label`, optional `color`). |
| `config.questions` | Fragen zum Einordnen: `id`, `axis` (`x`/`y`), `text`. |
| `config.rank` | Rangfolge: `ratio` (Y ÷ X), `product` (X × Y), `none`. |
| `config.itemName`, `config.noteLabel` | Bezeichnung der Einträge und der Notiz (leer = allgemeine Bezeichnung). |
| `items[].no` | Laufende Nummer, bleibt beim Löschen anderer Einträge erhalten. |
| `items[].x`, `items[].y` | Position; `null` = noch nicht eingeordnet (Eingang). |
| `items[].values` | Werte der Felder (Schlüssel = `key`): Text, Datum `YYYY-MM-DD`, `true`, Options-ID oder Punkt `{ "x": …, "y": … }`. Werte ausgeblendeter Felder bleiben erhalten. |
| `items[].answers` | Antworten auf die Fragen (Frage-ID → 1 … 5). |

## Sicherung

„Sicherung aller Matrizen“ speichert `{ "type": "two-axis-backup", "version": 1, "exportedAt": "…", "matrices": [ … ] }`. Importiert werden einzelne Matrizen, Listen von Matrizen und Sicherungen; identische Matrizen werden übersprungen, abweichende mit gleicher ID als Kopie angelegt.

## Eigene Vorlagen

Unter `two-axis:templates` im localStorage: Liste von `{ "id", "name", "method", "config" }`.

## Versionen

| Version | Änderung |
|---|---|
| 1 | Erste Fassung. |

Bei inkompatiblen Änderungen: `Model.SCHEMA_VERSION` erhöhen, in `Model.MIGRATIONS[n]` die Umwandlung von Version n nach n + 1 ergänzen, diese Tabelle und alle `examples/*.json` anpassen.
