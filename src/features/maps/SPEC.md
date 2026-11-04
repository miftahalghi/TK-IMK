# SPEC: Fitur `maps` (Peta Kualitas Udara)

**Pemilik:** Anggota 2 · **Folder:** `src/features/maps/` · **Branch:** `fitur/maps`
**Baca dulu:** `CONTRACT.md` (terutama §8 Prinsip IMK)

## Tujuan
Pengguna melihat sebaran kualitas udara di semua lokasi dalam satu peta, lalu bisa membuka detail lokasi dan berpindah ke Beranda untuk lokasi itu.

## Tampil di
Halaman `/maps` (`MapsPage.jsx`, default export). Menu sidebar "Peta".

## Desain
Belum ada desain di Figma, dan **tidak perlu dibuat**. Pakai pola halaman bersama: `PageHeader` di atas, lalu peta dan daftar lokasi berdampingan (bertumpuk di layar sempit). Panel detail memakai `Card`.

## Yang sudah tersedia (`@shared`)
- `useCurrentAll()` → pembacaan jam ini untuk 9 lokasi. `useLocations()` → `{ id, name, region, lat, lon }`.
- `assess(reading)` → `{ ispu, category, dominant, pollutants, uv }`.
- `categoryInfo(category)` → `{ label, colorVar, onColorVar }`. Pakai `var(${info.colorVar})` untuk warna marker.
- `useActiveLocation()` → `{ locationId, setLocationId }`. `setLocationId(id, { to: "/" })` mengganti lokasi sekaligus membuka Beranda.
- Komponen: `PageHeader`, `Card`, `Button`, `CategoryPill`, `UvPill`, `CategoryLegend`, `InfoTip`, `Skeleton`, `ErrorState`.
- `POLLUTANTS` (label + nama lengkap + satuan), `formatConcentration`, `formatDateTime`.
- Package terpasang: **`leaflet@1.9.4`** dan **`react-leaflet@4.2.1`**. Impor CSS-nya di file fitur: `import "leaflet/dist/leaflet.css";`
- Halaman sudah di-*lazy load*, jadi Leaflet tidak membebani halaman lain.

## Kebutuhan
1. `PageHeader` berjudul "Peta Kualitas Udara" dengan deskripsi singkat ("Pilih lokasi di peta atau di daftar untuk melihat detailnya.").
2. **Peta** berpusat di Indonesia (sekitar `[-2.5, 118]`, zoom 5), tile OpenStreetMap dengan **atribusi wajib tampil**: `© OpenStreetMap contributors`.
3. **Marker per lokasi:** lingkaran berwarna kategori ISPU dengan angka ISPU di dalamnya. Pakai `L.divIcon` dengan className dari CSS Module, atau `CircleMarker` + `Tooltip permanent`. Warna dari token, **bukan** hex.
4. **Lokasi aktif** (`useActiveLocation`) dipilih saat halaman dibuka: marker diperbesar atau bergaris tepi, dan panel detailnya terbuka.
5. **Klik marker** membuka panel detail (`Card`) berisi nama dan wilayah, ISPU + `CategoryPill`, polutan dominan (label + nama lengkap), nilai kelima polutan + UV (`formatConcentration`, `UvPill`), dan waktu pembaruan (`formatDateTime`). Panel punya tombol tutup dan bisa ditutup dengan Esc.
6. **Tombol "Lihat di Beranda"** (`Button variant="primary"`): `setLocationId(id, { to: "/" })`. Tombol Back browser kembali ke Peta.
7. **Legenda**: `<CategoryLegend />` selalu terlihat di atas atau samping peta.
8. **Daftar lokasi** di samping peta (di atas peta pada layar sempit): diurutkan dari ISPU tertinggi, setiap baris berupa `<button>` dengan nama + `CategoryPill`. Memilih baris = memilih marker dan membuka panel. Ini juga jalur akses untuk keyboard dan pembaca layar.
9. State memuat (skeleton peta dan daftar), gagal (`ErrorState`), kosong.
10. Opsional: `SegmentedControl` untuk memilih parameter yang diwarnai (ISPU / PM2.5 / UV).

## Di luar scope
- Heatmap atau interpolasi antarlokasi.
- Geolokasi perangkat ("lokasi saya").

## Catatan teknis
- Leaflet butuh tinggi eksplisit. Beri container peta `height` (misalnya `min(70vh, 640px)`) di CSS Module.
- Ikon marker bawaan Leaflet sering rusak di Vite. `divIcon` atau `CircleMarker` menghindari masalah ini.
- Jangan memasang package ikon atau peta lain.

## Checklist IMK
| Kode | Harus terlihat di fitur ini |
|---|---|
| N1 | Lokasi aktif ditandai di peta dan daftar; waktu pembaruan di panel detail |
| N2 | Nama kota (bukan provinsi); nama lengkap polutan |
| N3 / S6 | Panel detail bisa ditutup (tombol + Esc); Back dari Beranda kembali ke Peta |
| N4 / S1 | `PageHeader`, `Card`, `Button`, `CategoryPill`, `CategoryLegend` dari `@shared` |
| N6 / S8 | Angka ISPU tertulis di marker (tidak perlu klik untuk tahu); legenda selalu terlihat |
| N8 | Panel detail ringkas; data lengkap tidak ditumpuk di atas peta |
| N10 | InfoTip pada ISPU di panel detail |
| S2 | Daftar lokasi sebagai alternatif peta untuk keyboard dan pembaca layar; warna marker selalu disertai angka |
| S4 | "Lihat di Beranda" menutup alur dengan jelas (pindah ke Beranda dengan lokasi itu) |

## Kriteria selesai
- [x] 9 marker tampil dengan warna dan angka ISPU yang benar (bandingkan dengan `assess`). Marker Jabodetabek mewakili satu wilayah, jadi boleh diberi keterangan "mencakup Jakarta, Bogor, Depok, Bekasi".
- [x] Di mode `mock`, Medan (data bolong) tetap tampil dengan benar.
- [x] "Lihat di Beranda" membuka `/` dengan lokasi itu aktif, dan Back kembali ke Peta.
- [x] Legenda dan atribusi OSM terlihat.
- [x] Semua lokasi bisa dipilih dengan keyboard lewat daftar.
- [x] Di 390 px: daftar dan peta bertumpuk, tidak ada scroll horizontal.
- [x] Hasil `npm run build` menunjukkan Leaflet hanya ada di chunk `MapsPage`.
- [x] Semua baris di checklist IMK terpenuhi.
- [x] Rapi di terang dan gelap.
- [x] Checklist Definition of Done di `CONTRACT.md` §9.

## Prompt awal untuk AI agent
```
Kerjakan fitur "maps" di repo ini. Ini tugas mata kuliah IMK: ikuti prinsip Nielsen
dan Shneiderman di CONTRACT.md §8. Baca AGENTS.md, CONTRACT.md, dan
src/features/maps/SPEC.md dulu. Tulis kode hanya di src/features/maps/.
Ganti placeholder MapsPage.jsx dengan peta Leaflet (react-leaflet sudah terpasang) dan
daftar lokasi sesuai SPEC, memakai PageHeader, Card, Button, CategoryPill, CategoryLegend
dari "@shared". Warna hanya dari token CSS dan categoryInfo(). Akhiri dengan
npm run verify dan npm run check:scope -- maps, lalu isi tabel "Prinsip IMK yang diterapkan".
```
