import { Methods } from '../../js/methods.js';
import { Model } from '../../js/model.js';

/** Neue, leere Matrix nach einer Methode (deutsche Texte). @param {string} id */
export function matrixOf(id) {
  const def = Methods.get(id);
  return Model.create({ name: 'Test', method: def.id, config: Methods.config(def, 'de') });
}

/** Einfacher localStorage für Node (mit aufzählbaren Schlüsseln wie im Browser). */
export function memoryStorage() {
  const data = new Map();
  const api = {
    getItem: k => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)); },
    removeItem: k => { data.delete(k); },
    clear: () => data.clear(),
  };
  return new Proxy(api, {
    ownKeys: () => [...data.keys()],
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
  });
}
