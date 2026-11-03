/**
 * Profil lokasi untuk generator data mock. Daftar lokasinya sendiri ada di
 * ../locations.js (dipakai bersama dengan dataset Open-Meteo).
 *
 * `profile` hanya dipakai generator mock, BUKAN bagian kontrak Location.
 *   pm25 = rata-rata dasar µg/m³, uvPeak = UV maksimum siang hari cerah.
 * Profil dipilih supaya mock mencakup kelima kategori ISPU dan kelima level UV
 * (dicek oleh mockAdapter.test.js).
 */
import { LOCATIONS } from "../locations.js";

const PROFILES = {
  jakarta: { pm25: 82, uvPeak: 9 },
  serang: { pm25: 185, uvPeak: 9 },
  bandung: { pm25: 62, uvPeak: 7 },
  surabaya: { pm25: 46, uvPeak: 10 },
  yogyakarta: { pm25: 30, uvPeak: 9 },
  denpasar: { pm25: 9, uvPeak: 12 },
  // Medan sengaja punya data bolong (PM2.5 & CO null) untuk menguji state "data tidak tersedia".
  medan: { pm25: 52, uvPeak: 8, missing: ["pm25", "co"] },
  pekanbaru: { pm25: 310, uvPeak: 5 },
  ambon: { pm25: 13, uvPeak: 11 },
};

export const MOCK_LOCATIONS = LOCATIONS.map((loc) => ({ ...loc, profile: PROFILES[loc.id] }));
