/**
 * Teks rekomendasi bersama. Dipakai fitur hero, insights, dan tips supaya kalimatnya sama.
 * Konteks: pekerja kantoran dan mahasiswa (perjalanan, di dalam ruangan, olahraga di luar).
 * Perubahan teks diusulkan lewat PR ke koordinator (CONTRACT.md §2).
 */
import { CATEGORIES, POLLUTANTS, UV_LEVELS } from "../aqi.js";

/** Panduan per kategori ISPU untuk tiga konteks aktivitas. */
export const ISPU_ADVICE = {
  baik: {
    summary: "Udara bersih. Aman untuk semua aktivitas di luar.",
    commute: "Aman, tidak perlu masker.",
    indoor: "Buka jendela untuk ventilasi.",
    exercise: "Aman untuk olahraga di luar.",
  },
  sedang: {
    summary: "Udara cukup baik. Kelompok sensitif sebaiknya membatasi aktivitas berat di luar.",
    commute: "Masker opsional. Disarankan bagi yang punya asma atau alergi.",
    indoor: "Ventilasi seperti biasa.",
    exercise: "Aman. Kelompok sensitif sebaiknya mengurangi intensitas.",
  },
  "tidak-sehat": {
    summary: "Udara tidak sehat. Pakai masker dan kurangi aktivitas berat di luar.",
    commute: "Pakai masker, sebaiknya KN95 atau N95.",
    indoor: "Tutup jendela. Nyalakan air purifier jika ada.",
    exercise: "Pindah ke dalam ruangan atau kurangi durasi.",
  },
  "sangat-tidak-sehat": {
    summary: "Udara sangat tidak sehat. Kurangi waktu di luar dan wajib pakai masker.",
    commute: "Wajib masker KN95 atau N95. Kurangi waktu di luar.",
    indoor: "Tutup jendela dan pintu.",
    exercise: "Hindari olahraga di luar.",
  },
  berbahaya: {
    summary: "Udara berbahaya. Tetap di dalam ruangan bila memungkinkan.",
    commute: "Tunda perjalanan yang tidak penting. Pertimbangkan kerja atau kuliah dari rumah.",
    indoor: "Tetap di dalam ruangan dengan jendela tertutup.",
    exercise: "Hindari sepenuhnya aktivitas fisik di luar.",
  },
};

/** Panduan per level UV. */
export const UV_ADVICE = {
  rendah: "Tidak perlu perlindungan khusus.",
  sedang: "Pakai sunscreen SPF 30+ dan topi atau payung saat siang.",
  tinggi: "Kurangi berada di bawah matahari pukul 10.00–16.00.",
  "sangat-tinggi": "Hindari matahari pukul 10.00–16.00. Ulangi sunscreen tiap 2 jam.",
  ekstrem: "Sebisa mungkin tetap di dalam ruangan saat siang.",
};

/** Penjelasan singkat tiap parameter (untuk fitur tips dan tooltip). */
export const PARAMETER_INFO = {
  pm25: {
    ...POLLUTANTS.pm25,
    what: "Partikel sangat halus (≤ 2,5 mikrometer) yang bisa masuk jauh ke paru-paru dan aliran darah.",
    sources: "Asap kendaraan, pembakaran sampah dan biomassa, industri, kebakaran hutan.",
    health: "Iritasi saluran napas, memperburuk asma, dan meningkatkan risiko penyakit jantung dan paru.",
  },
  pm10: {
    ...POLLUTANTS.pm10,
    what: "Partikel kasar (≤ 10 mikrometer) seperti debu yang terhirup ke saluran napas atas.",
    sources: "Debu jalan dan konstruksi, kendaraan, industri.",
    health: "Batuk, iritasi mata dan tenggorokan, memperburuk penyakit pernapasan.",
  },
  co: {
    ...POLLUTANTS.co,
    what: "Gas tidak berwarna dan tidak berbau yang mengurangi kemampuan darah membawa oksigen.",
    sources: "Pembakaran tidak sempurna pada kendaraan dan genset.",
    health: "Pusing, sakit kepala, dan lelah. Berbahaya pada konsentrasi tinggi.",
  },
  no2: {
    ...POLLUTANTS.no2,
    what: "Gas kecokelatan hasil pembakaran bersuhu tinggi.",
    sources: "Kendaraan bermotor dan pembangkit listrik.",
    health: "Peradangan saluran napas dan menurunnya fungsi paru.",
  },
  so2: {
    ...POLLUTANTS.so2,
    what: "Gas berbau tajam dari pembakaran bahan bakar yang mengandung belerang.",
    sources: "PLTU batu bara, industri, kapal.",
    health: "Sesak napas dan iritasi, terutama pada penderita asma.",
  },
  uv: {
    key: "uv",
    label: "UV Index",
    name: "Indeks sinar ultraviolet",
    unit: "",
    what: "Ukuran kekuatan sinar ultraviolet matahari yang bisa merusak kulit dan mata.",
    sources: "Matahari. Paling kuat sekitar pukul 10.00–16.00.",
    health: "Kulit terbakar, penuaan kulit, kerusakan mata, dan risiko kanker kulit jangka panjang.",
  },
};

export const SOURCES = [
  { label: "PermenLHK No. P.14/2020 tentang Indeks Standar Pencemar Udara", url: "https://jdih.menlhk.go.id/" },
  { label: "WHO: Ultraviolet (UV) index", url: "https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index" },
  { label: "WHO Global Air Quality Guidelines (2021)", url: "https://www.who.int/publications/i/item/9789240034228" },
  { label: "Data: Open-Meteo Air Quality API (CC BY 4.0)", url: "https://open-meteo.com/en/docs/air-quality-api" },
  { label: "Model: Copernicus Atmosphere Monitoring Service (CAMS)", url: "https://atmosphere.copernicus.eu/" },
];

/**
 * Glosarium istilah untuk orang awam (Nielsen N2 bahasa pengguna, N10 bantuan).
 * Dipakai komponen <InfoTip term="..."> dan halaman Tips.
 * `short` = penjelasan satu-dua kalimat. Halaman Tips wajib punya elemen
 * dengan id = tipsAnchor(term) untuk setiap istilah, supaya tautan "Pelajari" berfungsi.
 */
export const GLOSSARY = {
  ispu: {
    term: "ISPU",
    short:
      "Indeks Standar Pencemar Udara: angka 0–500 dari Kementerian Lingkungan Hidup yang merangkum kualitas udara. Makin tinggi, makin buruk.",
  },
  kategori: {
    term: "Kategori ISPU",
    short: "Lima tingkat: Baik (0–50), Sedang (51–100), Tidak Sehat (101–200), Sangat Tidak Sehat (201–300), Berbahaya (di atas 300).",
  },
  "polutan-dominan": {
    term: "Polutan dominan",
    short: "Polutan yang paling buruk saat ini. Angka ISPU sebuah lokasi diambil dari polutan ini.",
  },
  "sub-indeks": {
    term: "Indeks per polutan",
    short: "Angka 0–500 untuk satu polutan saja. ISPU lokasi adalah angka tertinggi di antara semua polutan.",
  },
  satuan: {
    term: "µg/m³",
    short: "Mikrogram per meter kubik: berat polutan di dalam satu meter kubik udara.",
  },
  indikatif: {
    term: "Nilai per jam",
    short:
      "Nilai per jam adalah perkiraan kasar. ISPU resmi dihitung dari rata-rata beberapa jam (PM2.5 dan PM10: 24 jam).",
  },
  "data-simulasi": {
    term: "Data simulasi",
    short: "Angka di situs ini masih data contoh untuk pengembangan, belum hasil pengukuran asli.",
  },
  "sumber-data": {
    term: "Sumber data",
    short:
      "Data berasal dari Open-Meteo (model Copernicus CAMS), rekaman 1 Oktober–1 November 2026. Ini perkiraan model, bukan alat ukur di kota. Satu nilai mewakili wilayah sekitar puluhan kilometer, jadi Jakarta, Bogor, Depok, dan Bekasi digabung menjadi Jabodetabek.",
  },
  pm25: { term: "PM2.5", short: PARAMETER_INFO.pm25.what },
  pm10: { term: "PM10", short: PARAMETER_INFO.pm10.what },
  co: { term: "CO (karbon monoksida)", short: PARAMETER_INFO.co.what },
  no2: { term: "NO₂ (nitrogen dioksida)", short: PARAMETER_INFO.no2.what },
  so2: { term: "SO₂ (sulfur dioksida)", short: PARAMETER_INFO.so2.what },
  uv: { term: "UV Index", short: PARAMETER_INFO.uv.what },
};

/** id elemen di halaman Tips untuk sebuah istilah, misalnya "tips-pm25". */
export function tipsAnchor(term) {
  return `tips-${term}`;
}

/** Satu kalimat ringkasan untuk kartu utama. */
export function getSummary(assessment) {
  if (!assessment || assessment.category === null) return "Data kualitas udara belum tersedia untuk lokasi ini.";
  return ISPU_ADVICE[assessment.category].summary;
}

/**
 * 3–5 rekomendasi tindakan dari kondisi ISPU + UV.
 * @returns {{id: string, icon: string, title: string, detail: string}[]}
 */
export function getRecommendations(assessment) {
  if (!assessment) return [];
  const items = [];
  const cat = assessment.category;
  if (cat) {
    const a = ISPU_ADVICE[cat];
    const catLabel = CATEGORIES[cat].label;
    items.push({ id: "commute", icon: "mask", title: "Perjalanan", detail: `${a.commute} ISPU ${assessment.ispu} (${catLabel}).` });
    items.push({ id: "exercise", icon: "run", title: "Olahraga di luar", detail: a.exercise });
    items.push({ id: "indoor", icon: "window", title: "Di kantor atau kampus", detail: a.indoor });
  }
  const level = assessment.uv?.level;
  if (level) {
    items.push({
      id: "uv",
      icon: "sun",
      title: `UV ${UV_LEVELS[level].label}`,
      detail: UV_ADVICE[level],
    });
  }
  if (cat && cat !== "baik" && assessment.dominant) {
    const p = POLLUTANTS[assessment.dominant];
    items.push({
      id: "dominant",
      icon: "info",
      title: `Polutan dominan: ${p.label}`,
      detail: PARAMETER_INFO[assessment.dominant].sources,
    });
  }
  return items.slice(0, 5);
}
