# SPEC: Fitur `outlook` (Per Jam dan 7 Hari)

**Pemilik:** Anggota 7 · **Folder:** `src/features/outlook/` · **Branch:** `fitur/outlook`
**Baca dulu:** `CONTRACT.md` (terutama §8 Prinsip IMK)

## Tujuan
Pengguna bisa **merencanakan waktu keluar**: jam berapa udara paling baik hari ini, dan bagaimana kondisi tujuh hari ke depan.

## Tampil di
Slot `dashboard-aside` (`OutlookPanel.jsx`): panel kanan Beranda. Di layar < 1200 px panel ini otomatis turun ke bawah kartu utama.

## Referensi Figma (opsional, sketsa kasar)
`Cuaca_part1` → Desktop - 1: panel `12:38`, kartu per jam `29:139` (±102 × 184, radius 30, mint), baris harian `39:151`.
Yang **tidak** diikuti dari Figma: angka suhu (30°, 33°, 29°), ikon cuaca, header "< Week >", baris yang semuanya bertuliskan "Tomorrow, 23 Oct", dan panel yang melebihi lebar frame.

## Yang sudah tersedia (`@shared`)
- `useActiveLocation()`, `useHourly(locationId, { hours: 24 })`, `useDaily(locationId, { days: 7 })`.
- `useSourceInfo()` → `data.hasForecast`. Kalau `true`, judul memakai "Prakiraan"; kalau `false`, "Riwayat".
- `assess`, `categoryInfo`, `formatTime`, `formatDay`, `formatShortDate`, `wibParts`.
- Komponen: `SegmentedControl`, `CategoryPill`, `UvPill`, `CategoryLegend`, `InfoTip`, `Button`, `Skeleton`, `ErrorState`.
- Mock data: `hourly[0]` = jam sekarang; `daily[0]` = hari ini, nilai polutan = rata-rata 24 jam, `uv` = maksimum hari itu.

## Kebutuhan
1. **Header panel:** judul ("Prakiraan" / "Riwayat") + `SegmentedControl` dengan pilihan "Hari Ini" dan "7 Hari".
2. **Waktu terbaik keluar**, ditaruh **paling atas** di tampilan Hari Ini karena paling berguna: dari jam **06.00–21.00** hari ini (jam WIB, pakai `wibParts(time).hour`), pilih ISPU terendah. **Seri → jam paling awal.** Jam dengan ISPU `null` dilewati. Tampilkan sebagai kalimat: "Waktu terbaik keluar: **14.00** (ISPU 62, Sedang)". Kalau tidak ada jam yang memenuhi: "Belum ada rekomendasi waktu untuk hari ini."
3. **Tulis logika waktu terbaik sebagai fungsi murni** (`bestHour(readings)`) di file terpisah, dengan **unit test** (`*.test.js` di folder ini). Kasus uji: seri, null, di luar jendela 06–21, semua null.
4. **Kartu per jam** yang bisa digeser horizontal (scroll di dalam panel, **bukan** halaman). Setiap kartu berisi jam ("Sekarang" untuk yang pertama, lalu "13.00"…), ISPU + warna kategori + label kategori, dan UV. Kartu jam terbaik diberi tanda ★ **dan** teks "Terbaik".
5. **Terlihat bisa digeser** (S8): kartu terakhir di tepi terpotong sebagian, **dan** ada tombol ◀ ▶ (`Button` ghost, `aria-label`) untuk menggeser.
6. **7 Hari:** tujuh baris berisi hari ("Hari ini", "Besok", lalu `formatDay`) + tanggal (`formatShortDate`), ISPU rata-rata + `CategoryPill`, dan UV maksimum (`UvPill`).
7. **Keterangan "nilai per jam"**: teks kecil "Nilai per jam bersifat perkiraan" + `<InfoTip term="indikatif" />`.
8. `<CategoryLegend compact />` di bagian bawah panel.
9. Container scroll bisa difokus (`tabIndex={0}`, `aria-label="Kualitas udara per jam"`) dan digeser dengan panah kiri/kanan. Juga bisa digeser dengan sentuhan.
10. State memuat (skeleton kartu), gagal (`ErrorState`), dan kosong.
11. Pilihan tab tetap sama saat lokasi diganti. Data ikut berubah.

## Di luar scope
- Grafik garis kompleks (boleh sebagai tambahan setelah semua kriteria terpenuhi, dengan SVG sendiri; **tanpa** package chart baru).
- Data suhu atau cuaca.

## Checklist IMK
| Kode | Harus terlihat di fitur ini |
|---|---|
| N1 | Label "Prakiraan"/"Riwayat" sesuai data; skeleton kartu saat memuat |
| N2 | "Sekarang", "Hari ini", "Besok", nama hari dalam Bahasa Indonesia; jam format "14.00" |
| N4 / S1 | Toggle memakai `SegmentedControl`; pill memakai `CategoryPill`/`UvPill` |
| N6 / S8 | Waktu terbaik ditulis sebagai kalimat (tidak perlu membandingkan 15 kartu sendiri); legenda kategori; tanda "Terbaik" berupa teks |
| N7 | Tombol ◀ ▶ dan panah keyboard untuk menggeser kartu |
| N8 | Tanpa suhu dan ikon cuaca; satu angka utama per kartu (ISPU) |
| N10 | InfoTip untuk "nilai per jam" |
| S2 | Kartu bisa digeser dengan keyboard, mouse, dan sentuhan; tanda terbaik tidak hanya ikon |
| S7 | Tidak ada pergeseran kartu otomatis |

## Kriteria selesai
- [ ] Tidak ada angka suhu atau ikon cuaca dari Figma.
- [ ] `bestHour` punya unit test yang lulus (seri → paling awal, null dilewati, di luar 06–21 diabaikan, semua null → tidak ada rekomendasi).
- [ ] Tanggal tujuh hari berurutan dan benar.
- [ ] Panel tidak melebar keluar kolom di 1440 px, dan tidak menyebabkan scroll horizontal halaman di 390 px.
- [ ] Kartu per jam terlihat bisa digeser dan bisa digeser dengan keyboard.
- [ ] Label "Prakiraan"/"Riwayat" mengikuti `hasForecast`.
- [ ] Semua baris di checklist IMK terpenuhi.
- [ ] Rapi di terang dan gelap.
- [ ] Checklist Definition of Done di `CONTRACT.md` §9.

## Prompt awal untuk AI agent
```
Kerjakan fitur "outlook" di repo ini. Ini tugas mata kuliah IMK: ikuti prinsip Nielsen
dan Shneiderman di CONTRACT.md §8. Baca AGENTS.md, CONTRACT.md, dan
src/features/outlook/SPEC.md dulu. Tulis kode hanya di src/features/outlook/.
Ganti placeholder OutlookPanel.jsx dengan panel per jam / 7 hari sesuai SPEC, memakai
SegmentedControl dan komponen lain dari "@shared". Buat fungsi murni bestHour() + unit test
di folder ini. Akhiri dengan npm run verify dan npm run check:scope -- outlook, lalu isi
tabel "Prinsip IMK yang diterapkan".
```
