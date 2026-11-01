# SPEC: Fitur `tips` (Tips dan Edukasi)

**Pemilik:** Anggota 3 · **Folder:** `src/features/tips/` · **Branch:** `fitur/tips`
**Baca dulu:** `CONTRACT.md` (terutama §8 Prinsip IMK)

## Tujuan
Pekerja kantoran dan mahasiswa paham arti setiap angka di situs dan tahu tindakan yang tepat: kapan pakai masker, kapan sunscreen, kapan menunda olahraga.

Halaman ini adalah **pusat bantuan** situs (Nielsen N10). Setiap ikon ⓘ (`InfoTip`) di halaman lain punya tautan "Pelajari di Tips" yang menuju bagian tertentu di halaman ini.

## Tampil di
Halaman `/tips` (`TipsPage.jsx`, default export). Menu sidebar "Tips".

## Desain
Belum ada desain di Figma, dan **tidak perlu dibuat**. Pakai pola halaman bersama: `PageHeader`, lalu bagian-bagian berjudul `h2` dengan konten di dalam `Card`.

## Yang sudah tersedia (`@shared`)
- `GLOSSARY` → `{ [istilah]: { term, short } }` untuk ispu, kategori, polutan-dominan, sub-indeks, satuan, indikatif, data-simulasi, pm25, pm10, co, no2, so2, uv.
- `tipsAnchor(istilah)` → id jangkar, misalnya `tipsAnchor("pm25")` = `"tips-pm25"`. **`InfoTip` menautkan ke `/tips#tips-<istilah>`.**
- `PARAMETER_INFO` → untuk keenam parameter: `{ label, name, unit, what, sources, health }`.
- `ISPU_ADVICE[category]` → `{ summary, commute, indoor, exercise }` untuk 5 kategori.
- `UV_ADVICE[level]` → kalimat saran untuk 5 level UV.
- `CATEGORIES`, `CATEGORY_KEYS`, `UV_LEVELS`, `UV_LEVEL_KEYS` (label, rentang `min`–`max`, warna).
- `SOURCES` → daftar sumber `{ label, url }`.
- `useActiveLocation()` (dengan `location`), `useCurrent(locationId)` (dengan `assessment`).
- Komponen: `PageHeader`, `Card`, `CategoryPill`, `UvPill`, `CategoryLegend`, `Skeleton`, `ErrorState`.

> Teks di `@shared/content/advice.js` juga dipakai fitur `hero` dan `insights`. **Jangan menyalin dan mengubahnya di foldermu.** Kalau ingin memperbaiki atau menambah kalimat, tulis usulan di PR (`CONTRACT.md` §2). Teks yang khusus untuk halaman Tips (pengantar, FAQ) boleh ditulis di foldermu.

## Kebutuhan
1. `PageHeader` berjudul "Tips Kualitas Udara".
2. **Daftar isi** di atas halaman: tautan ke setiap bagian (`<nav aria-label="Daftar isi">`).
3. **"Untuk hari ini"**: nama lokasi aktif, ISPU + `CategoryPill`, UV + `UvPill`, lalu tiga tips (perjalanan, di kantor/kampus, olahraga) dari `ISPU_ADVICE` dan saran UV dari `UV_ADVICE`. Ikut berubah saat lokasi aktif berubah.
4. **Apa itu ISPU?** (`id={tipsAnchor("ispu")}`): penjelasan singkat + `<CategoryLegend />` + arti tiap kategori (`CATEGORIES[k].meaning`).
5. **Istilah penting**: satu entri untuk setiap istilah non-polutan di `GLOSSARY` (kategori, polutan-dominan, sub-indeks, satuan, indikatif, data-simulasi), **masing-masing dengan `id={tipsAnchor(key)}`**.
6. **Kenali polutan**: enam kartu dari `PARAMETER_INFO`, **masing-masing dengan `id={tipsAnchor(key)}`**, berisi nama, label, satuan, penjelasan, sumber, dan dampak kesehatan.
7. **Panduan per kategori ISPU**: tabel atau kartu untuk kelima kategori: rentang, `CategoryPill`, dan tiga tips.
8. **Panduan UV**: kelima level dengan rentang, `UvPill`, dan saran.
9. **Sumber**: daftar `SOURCES` sebagai tautan (`target="_blank" rel="noreferrer"`).
10. Catatan: "Informasi ini bersifat umum dan bukan pengganti saran medis."
11. Saat dibuka dengan `#tips-...` di alamat, bagian itu terlihat (kerangka sudah menggulir ke jangkar) dan **disorot sebentar** supaya pengguna tahu sampai di mana (N1).
12. Opsional: FAQ singkat ("Masker kain cukup?", "Apakah AC menyaring PM2.5?").

## Di luar scope
- Konten medis yang spesifik atau diagnosis.
- Mengubah teks `@shared` secara langsung.

## Checklist IMK
| Kode | Harus terlihat di fitur ini |
|---|---|
| N1 | Bagian tujuan disorot saat dibuka dari InfoTip; "Untuk hari ini" menyebut nama lokasi aktif |
| N2 | Bahasa sehari-hari; istilah selalu dijelaskan; contoh situasi pekerja dan mahasiswa |
| N4 / S1 | `PageHeader`, `Card`, `CategoryPill`, `UvPill`, `CategoryLegend` dari `@shared` |
| N6 / S8 | Daftar isi; legenda kategori; rentang angka ditulis di setiap kategori |
| N8 | Penjelasan pendek dulu, detail bisa dibuka (`<details>`) |
| N10 | **Semua istilah di `GLOSSARY` punya jangkar** yang benar (tujuan tautan InfoTip) |
| S2 | Struktur heading rapi (satu `h1`, lalu `h2`/`h3`); tautan eksternal diberi tanda |

## Kriteria selesai
- [ ] Keenam parameter, kelima kategori ISPU, dan kelima level UV tercakup.
- [ ] **Setiap kunci di `GLOSSARY` punya elemen dengan `id={tipsAnchor(key)}`**. Uji: klik InfoTip ISPU di Beranda → "Pelajari di Tips" → bagian ISPU terlihat dan disorot.
- [ ] "Untuk hari ini" berubah saat lokasi aktif diganti.
- [ ] Rentang kategori diambil dari `CATEGORIES`/`UV_LEVELS`, tidak ditulis manual.
- [ ] Sumber tercantum dan tautan berfungsi.
- [ ] Semua baris di checklist IMK terpenuhi.
- [ ] Rapi di 390 px dan 1440 px, terang dan gelap.
- [ ] Checklist Definition of Done di `CONTRACT.md` §9.

## Prompt awal untuk AI agent
```
Kerjakan fitur "tips" di repo ini. Ini tugas mata kuliah IMK: ikuti prinsip Nielsen
dan Shneiderman di CONTRACT.md §8. Baca AGENTS.md, CONTRACT.md, dan
src/features/tips/SPEC.md dulu. Tulis kode hanya di src/features/tips/.
Ganti placeholder TipsPage.jsx sesuai SPEC. Semua teks edukasi diambil dari GLOSSARY,
PARAMETER_INFO, ISPU_ADVICE, UV_ADVICE, CATEGORIES di "@shared". Setiap istilah GLOSSARY
wajib punya jangkar id={tipsAnchor(key)}. Akhiri dengan npm run verify dan
npm run check:scope -- tips, lalu isi tabel "Prinsip IMK yang diterapkan".
```
