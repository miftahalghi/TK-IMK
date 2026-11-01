/**
 * Setup tes. Node 22+ punya `localStorage` global eksperimental yang menimpa milik
 * jsdom (bernilai undefined tanpa --localstorage-file). Pasang versi di memori
 * supaya tes yang memakai penyimpanan berjalan sama di semua versi Node.
 */
class MemoryStorage {
  #data = new Map();
  get length() {
    return this.#data.size;
  }
  key(i) {
    return [...this.#data.keys()][i] ?? null;
  }
  getItem(k) {
    return this.#data.has(k) ? this.#data.get(k) : null;
  }
  setItem(k, v) {
    this.#data.set(String(k), String(v));
  }
  removeItem(k) {
    this.#data.delete(k);
  }
  clear() {
    this.#data.clear();
  }
}

for (const name of ["localStorage", "sessionStorage"]) {
  Object.defineProperty(globalThis, name, { value: new MemoryStorage(), configurable: true, writable: true });
}
