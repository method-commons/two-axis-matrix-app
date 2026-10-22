# CLAUDE.md – Hinweise für Claude Code

2-Achsen-Matrix (Eisenhower, Wert/Aufwand, Macht/Interesse, Risikomatrix, Stacey, eigene) als Web-App ohne
Server: Vite 8, Preact 10 + @preact/signals, Daten nur im Browser (localStorage), veröffentlicht über GitHub
Pages. Technische Vorlage sind die Schwester-Apps
[5 Warum](https://github.com/method-commons/5-why-app), [User Stories](https://github.com/method-commons/user-story-app)
und [Morphologische Matrix](https://github.com/method-commons/morphological-matrix-app). Funktionen und Module
stehen in der [README](README.md), das Datenformat in [docs/DATENFORMAT.md](docs/DATENFORMAT.md), das Ergänzen
von Methoden und Beispielen in [docs/METHODEN.md](docs/METHODEN.md).

## Zusammenarbeit

- **Sprache:** Antworten, Code-Kommentare, Commit-Nachrichten und PR-Texte auf **Deutsch**.
- **Erst zeigen, dann bauen:** neue Funktionen zuerst als Mockup (`docs/mockups/`), umsetzen nach „Ja“.
- **Erweiterbarkeit:** Methoden und Beispiele sind Daten (je eine Datei, automatisch eingelesen). Methoden-spezifisches
  Verhalten gehört in die Methoden-Datei (Hinweise) oder wird als allgemeine Fähigkeit gebaut (Feldart, Aufteilung,
  Darstellung, Fragen), die jede Methode nutzen kann – keine `if (method === '…')` in Oberfläche oder Logik.
- **Pull Requests nur auf Nachfrage.** Keine Modellbezeichnungen in Commits, PRs oder Code.
- **Fertig heißt:** `npm test` grün, README/DATENFORMAT/METHODEN aktualisiert, Commit und Push.

## Befehle

```sh
npm test                       # Lint, Typprüfung, Unit, Build, E2E
npx eslint .                   # Lint
npx tsc --noEmit -p jsconfig.json && node scripts/typecheck-logic.js
npx vitest run [datei]         # Unit-Tests (tests/unit/)
npx vite build && npx playwright test [datei]   # E2E gegen den Build (Port 4173)
```

E2E-Tests laufen gegen `dist/` – nach Codeänderungen vorher bauen. Chromium ist vorinstalliert; kein `playwright install`.

## Architektur

- **Logik ohne DOM** in `js/*.js` (`Model`, `Layout`, `Methods`, `Ops`, `Store`, `IO`, `Examples`) und `js/methods/*.js`, Oberfläche in `js/ui/*.jsx`.
- **Eine Matrix trägt ihre Einstellungen selbst** (`config`); die Methode liefert nur Voreinstellungen, Texte, Hinweise, Leitfragen und Hilfe.
- **Zustand:** `matrix` in `js/ui/core.js` ist ein normales Objekt; neu gezeichnet wird über das Signal `revision`, Komponenten lesen es mit `useMatrix()`. Neuzeichnen ist synchron (`options.debounceRendering = cb => cb()`).
- **Änderungen:** strukturell mit `mutate(fn)` (Verlaufseintrag, Speichern, Neuzeichnen); Eingabefelder mit `{...fieldProps(get, set)}` (Verlaufseintrag beim Verlassen).
- **Ziehen:** `js/ui/drag.js` mit Zeiger-Ereignissen; Ablageziele tragen `data-drop` (`plot`, `cell`, `region`, `inbox`).
- **Texte** der Oberfläche nur in `js/i18n/de.js` (maßgeblich) und `en.js` (gleiche Struktur, wird geprüft); Texte der Methoden in deren Datei (`texts.de`/`texts.en`, ebenfalls geprüft).
- **CSS** in `css/*.css`, eingebunden in `styles.css` mit Kaskaden-Ebenen. Farben der Bereiche über Klassen `c-<Farbe>` (Variablen `--c`, `--c-bg`, `--c-line`, `--c-strong`, hell/dunkel).

## Datenformat

- Aktuell **Version 1** (`Model.SCHEMA_VERSION`). Bei inkompatiblen Erweiterungen Version erhöhen, in `MIGRATIONS[n]` umwandeln, `docs/DATENFORMAT.md` und alle `examples/*.json` anpassen.
- Beispiele müssen exakt der Ausgabe von `normalize` entsprechen (Test `examples.test.js`).

## Ablage (method-commons/sync)

- Abhängigkeit `@method-commons/sync` über `git+https://github.com/method-commons/sync.git#<Tag oder Commit>` (nicht `github:` – npm schreibt sonst `git+ssh` ins Lockfile, das scheitert in der CI). Neue Version des Kerns: `package.json` und Lockfile anheben.
- Fest eingebunden nur `@method-commons/sync/config`; Kern, Oberfläche und Stile lädt `loadSync()` in `js/ui/sync.jsx` erst bei Bedarf.
- Änderungen meldet die Speicherschicht (`Store.observe`: Schreiben und Löschen) – auch Import, Duplizieren, Beispiele.
- Übernahmen aus der Ablage: abgelehnt, solange die geöffnete Datei ungespeicherte Eingaben hat (`hasPendingSave`, dann meldet der Kern einen Konflikt), sonst sofort angezeigt (`adoptStored(id, true)`).
- `resolve.dedupe: ['preact']` in `vite.config.js` – sonst zwei Preact-Instanzen (Hooks der Oberfläche brechen).
- **Versionen:** früherer Stand nur lesend über `showPreview`/`endPreview` (`core.js`): Speichern, `mutate`, Rückgängig und Eingaben (`beforeinput` in `fieldProps`) sind gesperrt, Wechsel zu einem anderen Dokument beendet das Ansehen, Übernahmen aus der Ablage werden solange abgelehnt.
- **Teilen zum Ansehen:** Link `#g=<gist>` öffnet `openSharedFromHash` (`sync.jsx`, beim Start und bei `hashchange`) → `showShared` (`core.js`): eigene Route, nur lesend, **nichts wird gespeichert**; „Schließen“ führt zum vorher geöffneten Dokument bzw. zur Übersicht, erst „Als Kopie speichern“ (Kern) legt ein Dokument an.
- E2E: `tests/e2e/github.js` bildet die GitHub-API mit `page.route` nach (Dateien mit `sha`, Commits je Datei, Tags, geheime Gists; `fakeGitHub(page, { gh })` teilt den Zustand mit einer zweiten Seite), genutzt von `sync.spec.js`, `versions.spec.js` und `share.spec.js`; `tests/e2e/tabs.spec.js` prüft die Übernahme aus einem anderen Browser-Tab.

## Bekannte Fallstricke

- **Auswahlfelder und `mutate`:** Den Wert eines `<select>` **vor** `mutate` lesen (`const v = e.currentTarget.value; mutate(() => … v …)`), sonst setzt das synchrone Neuzeichnen ihn zurück.
- **Globale SVG-Größen:** SVGs brauchen `width`/`height` zusätzlich als Inline-Style.
- **Zahlenfelder** (`type=number`) zeigen Punkt statt Komma; Werte werden bei Enter bzw. Verlassen übernommen.
- **Stufen:** Positionen werden immer auf die Skala gerundet (`Util.snap`); stufenlose Achsen auf eine Nachkommastelle. Tests mit Positionen daher mit gerundeten Werten.
