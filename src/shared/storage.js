/**
 * localStorage yang aman: setiap baca/tulis dibungkus try/catch, jadi aplikasi
 * tetap jalan di mode privat atau saat penyimpanan diblokir.
 * Semua key otomatis diberi awalan "ku:" supaya tidak bentrok.
 */
const PREFIX = "ku:";

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = globalThis.localStorage?.getItem(PREFIX + key);
      return raw === null || raw === undefined ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      globalThis.localStorage?.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      globalThis.localStorage?.removeItem(PREFIX + key);
    } catch {
      /* diabaikan */
    }
  },
};
