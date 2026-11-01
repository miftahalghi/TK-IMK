/**
 * Daftar lokasi mock. Diambil dari daftar daerah di Figma Desktop - 1, dengan
 * provinsi dirapikan menjadi kota (Riau → Pekanbaru, Maluku → Ambon, Bali → Denpasar,
 * Banten → Serang, Jogja → Yogyakarta). Lihat PRD §A10 butir 7.
 *
 * `profile` hanya dipakai generator mock, BUKAN bagian kontrak Location.
 *   pm25 = rata-rata dasar µg/m³, uvPeak = UV maksimum siang hari cerah.
 */
export const MOCK_LOCATIONS = [
  { id: "jakarta", name: "Jakarta", region: "DKI Jakarta", lat: -6.2088, lon: 106.8456, profile: { pm25: 82, uvPeak: 9 } },
  { id: "bogor", name: "Bogor", region: "Jawa Barat", lat: -6.595, lon: 106.8166, profile: { pm25: 58, uvPeak: 8 } },
  { id: "depok", name: "Depok", region: "Jawa Barat", lat: -6.4025, lon: 106.7942, profile: { pm25: 70, uvPeak: 9 } },
  { id: "bekasi", name: "Bekasi", region: "Jawa Barat", lat: -6.2383, lon: 106.9756, profile: { pm25: 185, uvPeak: 9 } },
  { id: "serang", name: "Serang", region: "Banten", lat: -6.1201, lon: 106.1503, profile: { pm25: 74, uvPeak: 9 } },
  { id: "bandung", name: "Bandung", region: "Jawa Barat", lat: -6.9175, lon: 107.6191, profile: { pm25: 62, uvPeak: 7 } },
  { id: "surabaya", name: "Surabaya", region: "Jawa Timur", lat: -7.2575, lon: 112.7521, profile: { pm25: 46, uvPeak: 10 } },
  { id: "yogyakarta", name: "Yogyakarta", region: "DI Yogyakarta", lat: -7.7956, lon: 110.3695, profile: { pm25: 30, uvPeak: 9 } },
  { id: "denpasar", name: "Denpasar", region: "Bali", lat: -8.6705, lon: 115.2126, profile: { pm25: 9, uvPeak: 12 } },
  // Medan sengaja punya data bolong (PM2.5 & CO null) untuk menguji state "data tidak tersedia".
  { id: "medan", name: "Medan", region: "Sumatera Utara", lat: 3.5952, lon: 98.6722, profile: { pm25: 52, uvPeak: 8, missing: ["pm25", "co"] } },
  { id: "pekanbaru", name: "Pekanbaru", region: "Riau", lat: 0.5071, lon: 101.4478, profile: { pm25: 310, uvPeak: 5 } },
  { id: "ambon", name: "Ambon", region: "Maluku", lat: -3.6954, lon: 128.1814, profile: { pm25: 13, uvPeak: 11 } },
];
