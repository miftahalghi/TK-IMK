# SPEC: Fitur `insights` (Rekomendasi, Polutan, dan Daerah)

**Pemilik:** Anggota 6 · **Folder:** `src/features/insights/` · **Branch:** `fitur/insights`
**Baca dulu:** `CONTRACT.md` (terutama §8 Prinsip IMK)

## Tujuan
Pengguna tahu **tindakan apa** yang perlu dilakukan, **polutan mana** yang bermasalah, dan **bagaimana lokasinya dibanding daerah lain**.

## Tampil di
Slot `dashboard-bottom` (`InsightsSection.jsx`): bagian tengah bawah Beranda. Berisi **tiga kartu**.

## Referensi Figma (opsional, sketsa kasar)
`Cuaca_part1` → Desktop - 1: Rekomendasi `12:43` (kiri atas), kartu kosong `12:46` (kiri bawah, diisi Rincian Polutan), daerah `12:48` (kanan, setinggi dua kartu kiri).
Grid tiga kartu sudah disiapkan di `insights.module.css`. Boleh disesuaikan.
Yang **tidak** diikuti dari Figma: kolom ikon cuaca, suhu "35°", angin "27 KM/H", dan warna pill yang tidak konsisten (159 kadang merah, kadang oranye).

## Yang sudah tersedia (`@shared`)
- `useActiveLocation()`, `useCurrent(locationId)` (dengan `assessment`), `useCurrentAll()`, `useLocations()`.
- `getRecommendations(assessment)` → `[{ id, icon, title, detail }]`, 3–5 item. `icon` bisa langsung dipakai di `<Icon name={icon} />`.
- `assess`, `POLLUTANTS` (`label`, `name`, `unit`), `POLLUTANT_KEYS`, `ISPU_BREAKS`, `categoryInfo`.
- Komponen: `Card`, `CategoryPill`, `UvPill`, `CategoryLegend`, `InfoTip`, `Button`, `Skeleton`, `ErrorState`, `EmptyState`.
- `useToast()` untuk umpan balik saat lokasi diganti dari daftar.
- `useSettings().savedLocations`, `useAuth().user` untuk menyematkan lokasi tersimpan.

## Kebutuhan

### A. Rekomendasi Sehat
1. Judul "Rekomendasi Sehat".
2. Carousel satu rekomendasi per tampilan: ikon besar, judul, detail.
3. Tombol ◀ ▶ memakai `Button` (`aria-label` "Rekomendasi sebelumnya"/"Rekomendasi berikutnya") dan indikator posisi ("2 dari 4").
4. **Tidak bergeser otomatis.** Panah kiri/kanan berfungsi saat carousel fokus.
5. `aria-live="polite"` pada isi agar perubahan diumumkan.
6. Kembali ke item pertama saat lokasi aktif berubah.
7. Alternatif yang juga boleh (dan lebih minimalis): daftar 3–5 rekomendasi tanpa carousel. Pilih salah satu dan tulis alasannya di PR.

### B. Rincian Polutan (mengisi kartu kosong Figma)
8. Judul "Rincian Polutan" dengan `<InfoTip term="sub-indeks" />`.
9. Lima baris (urutan `POLLUTANT_KEYS`): label **dan nama lengkap** ("NO₂ · Nitrogen dioksida"), nilai + satuan (`<InfoTip term="satuan" />` sekali), indeks per polutan.
10. **Bar horizontal** indeks dengan skala **0–500 yang sama untuk semua polutan**, berwarna kategori indeksnya. Tanda batas 50/100/200/300 (`ISPU_BREAKS`) opsional.
11. Polutan dominan diberi penanda teks "Dominan" (bukan hanya warna atau ikon).
12. Nilai `null` → "–" dan bar kosong bertuliskan "Tidak ada data".

### C. Kualitas Udara Daerah
13. Judul "Kualitas Udara Daerah" (atau "Prakiraan Daerah" hanya jika `useSourceInfo().data.hasForecast` dan memang menampilkan prakiraan).
14. Daftar semua lokasi dari `useCurrentAll()`: nama, `CategoryPill` (angka + kategori), polutan dominan, UV.
15. Diurutkan dari ISPU tertinggi, dengan keterangan urutan di atas daftar ("Diurutkan dari udara terburuk"). Kalau login, lokasi tersimpan **disematkan di atas** dengan labelnya ("Kantor").
16. Lokasi aktif disorot dan diberi `aria-current="true"`.
17. Setiap baris berupa `<button>`. Klik → `setLocationId(id)` lalu **toast**: "Menampilkan Bandung." **Tanpa scroll otomatis** (S7). Pengguna menggulir sendiri atau memakai Back.
18. `<CategoryLegend compact />` di bawah judul daftar.
19. Daftar bisa di-scroll di dalam kartu bila lebih tinggi dari kartu, dengan tinggi maksimal yang jelas.

### Untuk ketiga kartu
20. Masing-masing memakai `Card` dari `@shared`.
21. State memuat, gagal, dan kosong per kartu. Satu kartu gagal tidak menghilangkan kartu lain.

## Di luar scope
- Grafik tren (fitur `outlook`).
- Mengubah teks rekomendasi. Usulkan lewat PR (`CONTRACT.md` §2).

## Checklist IMK
| Kode | Harus terlihat di fitur ini |
|---|---|
| N1 / S3 | Skeleton per kartu; toast saat lokasi diganti dari daftar; lokasi aktif disorot |
| N2 | Nama lengkap polutan; "Indeks per polutan" dengan InfoTip |
| N3 / S7 | Carousel tidak bergeser sendiri; **tanpa scroll otomatis** saat klik daerah; Back membatalkan pergantian lokasi |
| N4 / S1 | Ketiga kartu memakai `Card`; tombol memakai `Button`; pill memakai `CategoryPill` |
| N6 / S8 | `CategoryLegend` di kartu daerah; perbandingan semua lokasi berdampingan dalam satu daftar |
| N8 | Tanpa kolom suhu/angin/ikon cuaca; satu informasi utama per baris (ISPU) |
| N9 | Pesan per kartu yang jelas saat gagal, dengan tombol coba lagi |
| N10 | InfoTip pada indeks per polutan dan satuan |
| S2 | Penanda "Dominan" berupa teks; baris daerah berupa `<button>`; carousel bisa dengan keyboard |

## Kriteria selesai
- [ ] Ketiga kartu tampil berdampingan di ≥ 1200 px dan tersusun satu kolom di 390 px.
- [ ] Kolom suhu, angin, dan ikon cuaca tidak muncul.
- [ ] Carousel (atau daftar) bisa dipakai dengan mouse dan keyboard, tanpa geser otomatis.
- [ ] Bar polutan memakai skala yang sama dan warna kategori dari token.
- [ ] Medan menampilkan "–" untuk PM2.5 dan CO tanpa crash.
- [ ] Klik daerah mengganti kartu utama dan panel kanan, memunculkan toast, **tanpa** scroll otomatis. Back mengembalikan lokasi sebelumnya.
- [ ] Semua baris di checklist IMK terpenuhi.
- [ ] Rapi di terang dan gelap.
- [ ] Checklist Definition of Done di `CONTRACT.md` §9.

## Prompt awal untuk AI agent
```
Kerjakan fitur "insights" di repo ini. Ini tugas mata kuliah IMK: ikuti prinsip Nielsen
dan Shneiderman di CONTRACT.md §8. Baca AGENTS.md, CONTRACT.md, dan
src/features/insights/SPEC.md dulu. Tulis kode hanya di src/features/insights/.
Ganti placeholder InsightsSection.jsx dengan tiga kartu (Rekomendasi Sehat, Rincian
Polutan, Kualitas Udara Daerah) sesuai SPEC, memakai Card dan komponen lain dari "@shared".
Buat tiap kartu sebagai komponen terpisah di folder ini. Akhiri dengan npm run verify dan
npm run check:scope -- insights, lalu isi tabel "Prinsip IMK yang diterapkan".
```
