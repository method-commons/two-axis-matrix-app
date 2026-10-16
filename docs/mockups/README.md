# Mockups – 2-Achsen-Matrix

Statische Entwürfe (keine Funktion) – inzwischen umgesetzt, siehe [README](../../README.md) – für eine App, in der man die gängigsten **2-Achsen-Methoden** anwendet: Eisenhower, Wert/Aufwand, Macht/Interesse (Stakeholder), Risikomatrix und Stacey-Matrix. Gestaltet im Stil der Schwester-Apps [Morphologische Matrix](https://github.com/method-commons/morphological-matrix-app), [User Stories](https://github.com/method-commons/user-story-app) und [5 Warum](https://github.com/method-commons/5-why-app): gleiche Design-Tokens, Kopfzeile mit Tabs je geöffneter Matrix, Kennzahl-Kacheln, Hinweis-Seitenleiste, Bericht zum Drucken, mobile Ansicht mit Navigation unten. Quelle: [`mockups.html`](mockups.html) – im Browser öffnen.

| # | Ansicht | Datei |
|---|---------|-------|
| 1 | **Übersicht** aller Matrizen: Karte je Matrix mit Vorschaubild, Methode, Kennzahlen und dem wichtigsten Hinweis; Filter nach Methode; darunter die fünf Methoden mit ihren Achsen | `s1-uebersicht.png` |
| 2 | **Neue Matrix**: Methode wählen (Vorlage mit Achsen, Skala, Quadranten, Leitfrage) oder eigene Matrix mit freien Achsen | `s2-neu.png` |
| 3 | **Eisenhower**: Eingang für Unsortiertes, Aufgaben per Ziehen (oder Taste 1–4) in *Sofort · Einplanen · Delegieren · Weglassen*; Termin bzw. Person je Feld; Verteilung, Hinweise und Leitfragen | `s3-eisenhower.png` |
| 4 | **Wert / Aufwand**: Ideen stufenlos auf 1–10 platzieren (Ziehen, Regler, Pfeiltasten), Begründung je Idee; Liste mit Werten und Feld (*Quick Win · Großprojekt · Lückenfüller · Zeitfresser*) | `s4-wert-aufwand.png` |
| 5 | **Macht / Interesse**: Stakeholder mit Haltung (unterstützend / neutral / kritisch) als Farbe, Ziel-Position als Pfeil (Ist → Ziel); je Stakeholder Anliegen, Strategie und Kommunikation | `s5-stakeholder.png` |
| 6 | **Risikomatrix 5×5**: Wahrscheinlichkeit × Auswirkung mit Risikostufen, Brutto- und Netto-Bewertung, Risikoregister mit Strategie (vermeiden / vermindern / übertragen / akzeptieren) und Maßnahme | `s6-risiko.png` |
| 7 | **Stacey-Matrix**: Vorhaben nach Einigkeit über das *Was* und Gewissheit über das *Wie*; Einordnung per Fragen oder Ziehen; Zonen *einfach · kompliziert · komplex · chaotisch* mit empfohlenem Vorgehen | `s7-stacey.png` |
| 8 | **Bericht**: Matrix als Bild, Empfehlung und Rangfolge, Einträge je Quadrant; Export als PDF, PNG, Markdown, CSV, JSON | `s8-bericht.png` |
| 9 | **Achsen & Quadranten anpassen**: Name, Pole und Skala je Achse, Raster (2×2, 3×3, 5×5, Zonen), Quadranten mit Farbe, Felder je Eintrag, optionale Erweiterungen | `s9-anpassen.png` |
| 10 | **Mobil** (Eisenhower): Quadranten als Kacheln, Liste des gewählten Feldes, Wischen zum Verschieben | `s10-mobil.png` |

Beispieldaten: durchgehend der fiktive **Food-Truck** der Schwester-Apps – Wochenplanung des Teams, Ideen für die Saison 2027, Stakeholder für einen festen Stellplatz am Domplatz, Risiken beim Stadtfest (R7 „Fritteuse fällt aus“ verweist auf die Analyse in der 5-Warum-App) und Vorhaben 2027.

Screenshots neu erzeugen: jede `<section class="screen">` mit Playwright aufnehmen (Faktor 1,5).

## Grundidee

Alle fünf Methoden sind **Vorlagen desselben Modells**: eine Matrix hat zwei Achsen (Name, Pole, Skala), ein Raster (2×2, 3×3, 5×5 oder Zonen), benannte Felder mit Farbe und Einträge mit x/y-Wert. Was die Methoden unterscheidet, sind Voreinstellungen und wenige Zusatzfelder:

| Vorlage | X-Achse | Y-Achse | Skala | Raster | Zusätzlich |
|---|---|---|---|---|---|
| Eisenhower | Dringlichkeit | Wichtigkeit | 2 Stufen | 2 × 2 | Eingang, Person (Delegieren), Termin (Einplanen), erledigt |
| Wert / Aufwand | Aufwand | Wert / Nutzen | 1–10 | 2 × 2 | Begründung, Rangfolge Wert ÷ Aufwand |
| Macht / Interesse | Interesse | Macht / Einfluss | 1–5 | 2 × 2 | Haltung, Ziel-Position, Strategie, Kommunikation |
| Risikomatrix | Auswirkung | Wahrscheinlichkeit | 1–5 | 5 × 5 | Risikostufen, Strategie, Maßnahme, Netto-Bewertung |
| Stacey | Gewissheit über das Wie | Einigkeit über das Was | 1–5 (Fragen) | Zonen | Vorgehen je Zone |

Die Achsenrichtung folgt der jeweils üblichen Darstellung (bei Eisenhower steht „dringend“ links).

## Entscheidungen (umgesetzt wie empfohlen; von den Erweiterungen in Punkt 5 bisher nur die zweite Position)

1. **Eine App mit fünf Vorlagen statt fünf Apps** – empfohlen; gemeinsames Datenmodell, Bericht und Export, eigene Matrizen ohne Mehraufwand.
2. **Eisenhower als Karten-Board (diskret), die anderen als Streudiagramm (stufenlos)** – empfohlen; bei Eisenhower zählt nur das Feld, bei Wert/Aufwand die genaue Lage.
3. **Risikomatrix mit Netto-Bewertung** (Restrisiko nach Maßnahme) – empfohlen, abschaltbar; ohne sie fehlt der Sinn der Maßnahmen.
4. **Stacey per Fragen einordnen** (Position aus Antworten, Ziehen überschreibt) – empfohlen; die Achsen sind sonst schwer zu schätzen.
5. **Optionale Erweiterungen standardmäßig aus** (Wert aus Kriterien, Punktgröße, Ziel-Position, mehrere Bewertende) – wie in den Schwester-Apps; Ausblenden löscht nichts.
6. **Einträge zwischen Matrizen kopieren** (z. B. Maßnahmen aus der Risikomatrix nach Wert/Aufwand) – vorgeschlagen, kann auch später kommen.

## Abgrenzung

Die App unterstützt das **Einordnen und Priorisieren** mit der jeweiligen Methode und ist kein Aufgaben-, Projekt- oder Risikomanagement-Werkzeug: Person und Termin sind optional, es gibt keine Erinnerungen oder Benachrichtigungen.

## Abweichungen in der Umsetzung

- Der Dialog heißt „Achsen & Bereiche“; zusätzlich zu den vier Feldern gibt es die Aufteilungen „Raster mit Stufen“ und „Zonen“ für alle Matrizen.
- „Wert aus Kriterien“, „Punktgröße als dritte Kennzahl“ und „Mehrere Bewertende“ sind noch nicht umgesetzt (siehe [docs/METHODEN.md](../METHODEN.md)); „Zweite Position“ (Ziel-Position, Bewertung nach Maßnahme) ist eine Feldart, die jede Matrix nutzen kann.
- Mobil stehen die Felder der Karten-Darstellung untereinander statt als Kacheln.

## Logo-Vorschläge (offen)

„2×2“ passt nur zu vier Feldern. Vorschläge A–G für ein methodenneutrales Symbol in der Form der Schwester-Apps: [`logo.html`](logo.html), Bild `logo.png`. Empfehlung: **A – Achsen mit Punkten**.
