import { describe, expect, it } from 'vitest';
import { TextsDe } from '../../js/i18n/de.js';
import { TextsEn } from '../../js/i18n/en.js';
import { Methods } from '../../js/methods.js';
import { Languages, Texts } from '../../js/texts.js';

/** Struktur (Schlüssel und Arten) eines Textobjekts; Listen nur mit ihrer Art. */
function shape(v) {
  if (Array.isArray(v)) return `array:${v.length ? typeof v[0] : 'empty'}`;
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map(k => [k, shape(v[k])]));
  return typeof v;
}
/** Platzhalter je Text. */
function placeholders(v, path = '', out = {}) {
  if (typeof v === 'string') out[path] = [...v.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  else if (v && typeof v === 'object') for (const k of Object.keys(v)) placeholders(v[k], `${path}.${k}`, out);
  return out;
}

describe('Sprachdateien', () => {
  it('haben dieselbe Struktur', () => {
    expect(shape(TextsEn)).toEqual(shape(TextsDe));
  });

  it('haben dieselben Platzhalter', () => {
    expect(placeholders(TextsEn)).toEqual(placeholders(TextsDe));
  });

  it('Texte jeder Methode haben in allen Sprachen dieselbe Struktur und Platzhalter', () => {
    for (const def of Methods.list()) {
      expect(Object.keys(def.texts).sort(), def.id).toEqual(['de', 'en']);
      expect(shape(def.texts.en), def.id).toEqual(shape(def.texts.de));
      expect(placeholders(def.texts.en), def.id).toEqual(placeholders(def.texts.de));
    }
  });

  it('wählen Deutsch in den Tests', () => {
    expect(Languages.detect()).toBe('de');
    expect(Texts).toBe(TextsDe);
    Languages.choose('en');
  });
});
