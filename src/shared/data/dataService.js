/**
 * Pintu tunggal data. Fitur memanggil fungsi di sini (atau hooks di hooks.js),
 * TIDAK PERNAH memanggil fetch atau mengimpor file mock secara langsung.
 *
 * Mengganti sumber data: set VITE_DATA_SOURCE=real di .env setelah realAdapter
 * dibuat (Fase 2). Komponen fitur tidak perlu berubah.
 *
 * Simulasi untuk menguji state UI (tambahkan ke URL):
 *   ?simulasi=gagal   → semua permintaan data gagal
 *   ?simulasi=lambat  → setiap permintaan butuh ±3 detik
 *   ?simulasi=kosong  → semua nilai polutan dan UV null
 */
import { createMockAdapter } from "./mockAdapter.js";

function readSimulation() {
  try {
    return new URLSearchParams(globalThis.location?.search ?? "").get("simulasi");
  } catch {
    return null;
  }
}

function createAdapter() {
  const source = import.meta.env?.VITE_DATA_SOURCE ?? "mock";
  if (source === "real") {
    // Fase 2: ganti dengan `createRealAdapter()` dari ./realAdapter.js.
    console.warn("VITE_DATA_SOURCE=real belum tersedia. Memakai data simulasi.");
  }
  const simulation = readSimulation();
  return createMockAdapter({ latency: simulation === "lambat" ? [2800, 3200] : [200, 600] });
}

const EMPTY_KEYS = ["pm25", "pm10", "co", "no2", "so2", "uv"];

function withSimulation(adapter) {
  const mode = readSimulation();
  if (mode === "gagal") {
    const fail = async () => {
      await new Promise((r) => setTimeout(r, 400));
      throw new Error("Gagal memuat data (simulasi). Hapus ?simulasi=gagal dari alamat untuk kembali normal.");
    };
    return { ...adapter, getLocations: fail, getCurrent: fail, getCurrentAll: fail, getHourly: fail, getDaily: fail };
  }
  if (mode === "kosong") {
    const blank = (r) => ({ ...r, ...Object.fromEntries(EMPTY_KEYS.map((k) => [k, null])) });
    return {
      ...adapter,
      getCurrent: async (...a) => blank(await adapter.getCurrent(...a)),
      getCurrentAll: async (...a) => (await adapter.getCurrentAll(...a)).map(blank),
      getHourly: async (...a) => (await adapter.getHourly(...a)).map(blank),
      getDaily: async (...a) => (await adapter.getDaily(...a)).map(blank),
    };
  }
  return adapter;
}

const adapter = withSimulation(createAdapter());

/** @returns {Promise<{kind: string, label: string, hasForecast: boolean, updatedAt: string}>} */
export const getSourceInfo = () => adapter.getSourceInfo();
/** @returns {Promise<Location[]>} */
export const getLocations = () => adapter.getLocations();
/** @returns {Promise<Reading>} pembacaan jam ini */
export const getCurrent = (locationId) => adapter.getCurrent(locationId);
/** @returns {Promise<Reading[]>} satu pembacaan jam ini per lokasi */
export const getCurrentAll = () => adapter.getCurrentAll();
/** @returns {Promise<Reading[]>} per jam, mulai jam sekarang */
export const getHourly = (locationId, options) => adapter.getHourly(locationId, options);
/** @returns {Promise<Reading[]>} per hari mulai hari ini; nilai = rata-rata 24 jam, uv = maksimum */
export const getDaily = (locationId, options) => adapter.getDaily(locationId, options);
