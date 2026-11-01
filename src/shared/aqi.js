/**
 * Aturan ISPU dan UV Index. SATU-SATUNYA tempat perhitungan indeks.
 * Sumber: PermenLHK No. P.14/MENLHK/SETJEN/KUM.1/7/2020 (ISPU) dan WHO (UV Index).
 *
 * ⚠ Angka BREAKPOINTS wajib dicocokkan dengan lampiran resmi PermenLHK sebelum rilis
 *   (lihat docs/PRD.md §A8). Kalau ada koreksi, ubah di sini saja dan jalankan `npm test`.
 */

/** Urutan juga dipakai sebagai pemecah seri polutan dominan. */
export const POLLUTANT_KEYS = ["pm25", "pm10", "co", "no2", "so2"];

export const POLLUTANTS = {
  pm25: { key: "pm25", label: "PM2.5", name: "Partikulat halus", unit: "µg/m³", averaging: "24 jam" },
  pm10: { key: "pm10", label: "PM10", name: "Partikulat kasar", unit: "µg/m³", averaging: "24 jam" },
  co: { key: "co", label: "CO", name: "Karbon monoksida", unit: "µg/m³", averaging: "8 jam" },
  no2: { key: "no2", label: "NO₂", name: "Nitrogen dioksida", unit: "µg/m³", averaging: "1 jam" },
  so2: { key: "so2", label: "SO₂", name: "Sulfur dioksida", unit: "µg/m³", averaging: "24 jam" },
};

/** Batas ISPU per rentang. Batas bawah rentang pertama = 0. */
export const ISPU_BREAKS = [50, 100, 200, 300, 500];

/** Batas atas konsentrasi (µg/m³) yang bersesuaian dengan ISPU_BREAKS. */
export const BREAKPOINTS = {
  pm25: [15.5, 55.4, 150.4, 250.4, 500],
  pm10: [50, 150, 350, 420, 500],
  co: [4000, 8000, 15000, 30000, 45000],
  no2: [80, 200, 1130, 2260, 3000],
  so2: [52, 180, 400, 800, 1200],
};

export const CATEGORY_KEYS = ["baik", "sedang", "tidak-sehat", "sangat-tidak-sehat", "berbahaya"];

export const CATEGORIES = {
  baik: {
    key: "baik",
    label: "Baik",
    min: 0,
    max: 50,
    colorVar: "--cat-baik",
    onColorVar: "--cat-baik-on",
    meaning: "Udara bersih, aman untuk semua aktivitas.",
  },
  sedang: {
    key: "sedang",
    label: "Sedang",
    min: 51,
    max: 100,
    colorVar: "--cat-sedang",
    onColorVar: "--cat-sedang-on",
    meaning: "Masih dapat diterima. Kelompok sensitif perlu waspada.",
  },
  "tidak-sehat": {
    key: "tidak-sehat",
    label: "Tidak Sehat",
    min: 101,
    max: 200,
    colorVar: "--cat-tidak-sehat",
    onColorVar: "--cat-tidak-sehat-on",
    meaning: "Merugikan kelompok sensitif dan mulai berdampak pada umum.",
  },
  "sangat-tidak-sehat": {
    key: "sangat-tidak-sehat",
    label: "Sangat Tidak Sehat",
    min: 201,
    max: 300,
    colorVar: "--cat-sangat-tidak-sehat",
    onColorVar: "--cat-sangat-tidak-sehat-on",
    meaning: "Berisiko bagi kesehatan semua orang.",
  },
  berbahaya: {
    key: "berbahaya",
    label: "Berbahaya",
    min: 301,
    max: 500,
    colorVar: "--cat-berbahaya",
    onColorVar: "--cat-berbahaya-on",
    meaning: "Berbahaya serius bagi kesehatan semua orang.",
  },
};

export const UV_LEVEL_KEYS = ["rendah", "sedang", "tinggi", "sangat-tinggi", "ekstrem"];

export const UV_LEVELS = {
  rendah: { key: "rendah", label: "Rendah", min: 0, max: 2, colorVar: "--uv-rendah", onColorVar: "--uv-rendah-on" },
  sedang: { key: "sedang", label: "Sedang", min: 3, max: 5, colorVar: "--uv-sedang", onColorVar: "--uv-sedang-on" },
  tinggi: { key: "tinggi", label: "Tinggi", min: 6, max: 7, colorVar: "--uv-tinggi", onColorVar: "--uv-tinggi-on" },
  "sangat-tinggi": {
    key: "sangat-tinggi",
    label: "Sangat Tinggi",
    min: 8,
    max: 10,
    colorVar: "--uv-sangat-tinggi",
    onColorVar: "--uv-sangat-tinggi-on",
  },
  ekstrem: { key: "ekstrem", label: "Ekstrem", min: 11, max: Infinity, colorVar: "--uv-ekstrem", onColorVar: "--uv-ekstrem-on" },
};

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/**
 * Sub-indeks ISPU satu polutan.
 * I = ((Ia − Ib) / (Xa − Xb)) × (Xx − Xb) + Ib, dibulatkan, maksimum 500.
 * @returns {number|null} null jika nilai tidak tersedia atau polutan tidak dikenal.
 */
export function subIndex(pollutant, value) {
  const bp = BREAKPOINTS[pollutant];
  if (!bp || !isNum(value)) return null;
  const x = Math.max(0, value);
  if (x >= bp[bp.length - 1]) return 500;
  for (let i = 0; i < bp.length; i += 1) {
    if (x <= bp[i]) {
      const xb = i === 0 ? 0 : bp[i - 1];
      const xa = bp[i];
      const ib = i === 0 ? 0 : ISPU_BREAKS[i - 1];
      const ia = ISPU_BREAKS[i];
      return Math.round(((ia - ib) / (xa - xb)) * (x - xb) + ib);
    }
  }
  return 500;
}

/** @returns {"baik"|"sedang"|"tidak-sehat"|"sangat-tidak-sehat"|"berbahaya"|null} */
export function categoryOf(ispu) {
  if (!isNum(ispu)) return null;
  if (ispu <= 50) return "baik";
  if (ispu <= 100) return "sedang";
  if (ispu <= 200) return "tidak-sehat";
  if (ispu <= 300) return "sangat-tidak-sehat";
  return "berbahaya";
}

/** UV dibulatkan ke bilangan bulat terdekat sebelum dikategorikan (praktik WHO). */
export function uvLevelOf(uv) {
  if (!isNum(uv)) return null;
  const v = Math.max(0, Math.round(uv));
  if (v <= 2) return "rendah";
  if (v <= 5) return "sedang";
  if (v <= 7) return "tinggi";
  if (v <= 10) return "sangat-tinggi";
  return "ekstrem";
}

/**
 * Menilai satu pembacaan (Reading, lihat CONTRACT.md §5).
 * ISPU lokasi = sub-indeks tertinggi; polutan itu = polutan dominan.
 */
export function assess(reading) {
  const pollutants = {};
  let ispu = null;
  let dominant = null;
  for (const key of POLLUTANT_KEYS) {
    const value = reading && isNum(reading[key]) ? reading[key] : null;
    const idx = subIndex(key, value);
    pollutants[key] = { value, ispu: idx, category: categoryOf(idx) };
    if (idx !== null && (ispu === null || idx > ispu)) {
      ispu = idx;
      dominant = key;
    }
  }
  const uvValue = reading && isNum(reading.uv) ? reading.uv : null;
  return {
    ispu,
    category: categoryOf(ispu),
    dominant,
    pollutants,
    uv: { value: uvValue, level: uvLevelOf(uvValue) },
  };
}

/** Info tampilan kategori; aman untuk null (mengembalikan label "Tidak ada data"). */
export function categoryInfo(category) {
  return (
    CATEGORIES[category] ?? {
      key: null,
      label: "Tidak ada data",
      colorVar: "--cat-none",
      onColorVar: "--cat-none-on",
      meaning: "Data tidak tersedia.",
    }
  );
}

export function uvLevelInfo(level) {
  return UV_LEVELS[level] ?? { key: null, label: "Tidak ada data", colorVar: "--cat-none", onColorVar: "--cat-none-on" };
}
