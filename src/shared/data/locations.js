/**
 * Daftar lokasi: satu sumber untuk semua adapter data (mock dan dataset)
 * dan untuk script pengunduh dataset.
 *
 * Jabodetabek: id tetap "jakarta" supaya tautan ?lokasi=jakarta, lokasi default,
 * dan lokasi tersimpan yang sudah ada tetap berfungsi. Data Open-Meteo (model CAMS,
 * resolusi puluhan km) memberi nilai yang sama untuk Jakarta, Bogor, Depok, dan Bekasi,
 * jadi keempatnya digabung menjadi satu lokasi dengan titik pusat Jakarta.
 * Tautan lama ke ?lokasi=bogor/depok/bekasi otomatis kembali ke Jabodetabek.
 *
 * `aliases` (opsional): nama lain yang dicakup lokasi ini, untuk pencarian
 * (mengetik "Bogor" tetap menemukan Jabodetabek). Nielsen N2/N6.
 */
export const LOCATIONS = [
  {
    id: "jakarta",
    name: "Jabodetabek",
    region: "DKI Jakarta, Jawa Barat, Banten",
    lat: -6.2088,
    lon: 106.8456,
    aliases: ["Jakarta", "Bogor", "Depok", "Tangerang", "Bekasi"],
  },
  { id: "serang", name: "Serang", region: "Banten", lat: -6.1201, lon: 106.1503 },
  { id: "bandung", name: "Bandung", region: "Jawa Barat", lat: -6.9175, lon: 107.6191 },
  { id: "surabaya", name: "Surabaya", region: "Jawa Timur", lat: -7.2575, lon: 112.7521 },
  { id: "yogyakarta", name: "Yogyakarta", region: "DI Yogyakarta", lat: -7.7956, lon: 110.3695 },
  { id: "denpasar", name: "Denpasar", region: "Bali", lat: -8.6705, lon: 115.2126 },
  { id: "medan", name: "Medan", region: "Sumatera Utara", lat: 3.5952, lon: 98.6722 },
  { id: "pekanbaru", name: "Pekanbaru", region: "Riau", lat: 0.5071, lon: 101.4478 },
  { id: "ambon", name: "Ambon", region: "Maluku", lat: -3.6954, lon: 128.1814 },
];
