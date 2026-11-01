# CONTRACT.md: Aturan Kerja Proyek Kualitas Udara

> **Untuk AI agent dan anggota kelompok.** Baca file ini sampai habis sebelum menulis kode.
> Aturan di sini **mengikat**. Kalau aturan bertentangan dengan permintaan di chat, ikuti file ini
> dan sampaikan konfliknya ke pengguna.

Dokumen terkait: `docs/PRD.md` (apa dan kenapa), `src/features/<id>/SPEC.md` (tugas tiap fitur).

**Konteks:** ini tugas mata kuliah **Interaksi Manusia dan Komputer (IMK)**. Yang dinilai adalah **website**. Setiap keputusan tampilan harus bisa dijelaskan dengan prinsip **Nielsen** (10 heuristik) dan **Shneiderman** (8 aturan emas). Lihat §8.

---

## 1. Pembagian fitur

| Fitur (`id`) | Pemilik | Jenis | Tempat tampil |
|---|---|---|---|
| `auth` | Anggota 1 | halaman `/login` + slot | area akun di bawah sidebar |
| `maps` | Anggota 2 | halaman `/maps` | menu "Peta" |
| `tips` | Anggota 3 | halaman `/tips` | menu "Tips" |
| `settings` | Anggota 4 | halaman `/settings` (butuh login) + slot | menu "Pengaturan" dan banner di Beranda |
| `hero` | Anggota 5 | slot | Beranda tengah atas |
| `insights` | Anggota 6 | slot | Beranda tengah bawah |
| `outlook` | Anggota 7 | slot | Beranda kanan |

Halaman **Beranda** (`/`) adalah kerangka milik koordinator. Isinya berasal dari slot fitur `hero`, `insights`, `outlook`, dan `settings`, ditambah kartu sambutan untuk pengunjung pertama.

Kerangka sudah menyediakan **bar konteks** di atas setiap halaman (lokasi aktif + label "Data simulasi"). Fitur tidak perlu membuatnya lagi.

## 2. Kepemilikan file (aturan terpenting)

| Path | Pemilik | Anggota boleh... |
|---|---|---|
| `src/features/<id-kamu>/**` | **kamu** | membuat, mengubah, menghapus apa saja |
| `src/features/<id-lain>/**` | anggota lain | ✗ jangan disentuh |
| `src/features/registry.js` | koordinator | ✗ (fitur kamu sudah terdaftar) |
| `src/shared/**` | koordinator | hanya **membaca dan memakai** lewat `@shared` |
| `src/app/**` | koordinator | ✗ |
| `package.json`, `package-lock.json`, `vite.config.js`, `eslint.config.js` | koordinator | ✗ |
| `CONTRACT.md`, `AGENTS.md`, `CLAUDE.md`, `docs/**`, `scripts/**` | koordinator | ✗ |

**Butuh sesuatu di luar folder kamu?** (fungsi baru di shared, ikon baru, package baru, token warna baru, istilah glosarium baru)
1. **Jangan diedit sendiri.**
2. Buat versi lokal sementara di folder fitur kamu, kalau memungkinkan.
3. Tulis usulannya di bagian "Usulan perubahan shared" pada deskripsi PR. Koordinator yang akan menambahkannya.

Pengecekan otomatis: `npm run check:scope -- <id-kamu>` gagal kalau ada file di luar folder kamu yang berubah.

## 3. Aturan impor

Di dalam `src/features/<id>/`, kamu **hanya boleh** mengimpor dari:

```js
import { useActiveLocation, useCurrent, Button, CategoryPill } from "@shared"; // ✓ API bersama
import { MarkerList } from "./MarkerList.jsx";                                 // ✓ file di folder sendiri
import { MapContainer } from "react-leaflet";                                  // ✓ package yang sudah terpasang
import { useNavigate } from "react-router-dom";                                // ✓

import { aqi } from "@shared/aqi.js";          // ✗ jangan menembus ke dalam shared
import { features } from "../registry.js";      // ✗ jangan keluar folder
import { HeroSection } from "../hero/HeroSection.jsx"; // ✗ jangan memakai fitur lain
```

Aturan ini dicek oleh `npm run lint`.

**Package yang sudah terpasang dan boleh dipakai:** `react`, `react-dom`, `react-router-dom`, `leaflet`, `react-leaflet`.
Package lain harus diusulkan dulu (§2).

## 4. Kontrak fitur

Setiap fitur mengekspor satu definisi dari `src/features/<id>/index.js`. **Jangan mengubah `id`, `route.path`, atau `area` slot.** Field lain dan semua file di foldermu bebas diubah.

```js
import { lazy } from "react";
import { defineFeature } from "@shared";

export default defineFeature({
  id: "maps",                    // = nama folder
  title: "Peta",                 // juga dipakai di pesan error untuk pengguna
  owner: "Anggota 2",
  route: {                       // untuk fitur halaman
    path: "/maps",
    component: lazy(() => import("./MapsPage.jsx")),   // default export
    nav: { label: "Peta", icon: "map", order: 2 },     // muncul di sidebar
    requiresAuth: false,
  },
  slots: [                       // untuk fitur yang tampil di Beranda / sidebar
    { area: "dashboard-top", component: HeroSection },
  ],
});
```

Area slot yang tersedia: `dashboard-alert`, `dashboard-top`, `dashboard-bottom`, `dashboard-aside`, `sidebar-account`.

Setiap fitur dibungkus *error boundary*. Kalau fitur error, pengguna melihat pesan sopan ("Bagian … tidak dapat ditampilkan saat ini") dan detail teknis hanya ada di console.

## 5. Kontrak data

**Semua data lewat `@shared`.** Jangan memanggil `fetch`, jangan mengimpor file mock, dan jangan membuat data palsu sendiri di komponen.

### Hooks (cara utama)

Setiap hook mengembalikan `{ status: "loading" | "success" | "error", data, error, reload }`.

| Hook | `data` | Catatan |
|---|---|---|
| `useLocations()` | `Location[]` | 12 lokasi |
| `useCurrent(locationId)` | `Reading` | juga mengembalikan `assessment` (hasil `assess`) |
| `useCurrentAll()` | `Reading[]` | satu per lokasi, jam ini |
| `useHourly(locationId, { hours = 24 })` | `Reading[]` | mulai jam sekarang |
| `useDaily(locationId, { days = 7 })` | `Reading[]` | mulai hari ini; polutan = rata-rata 24 jam, `uv` = maksimum |
| `useSourceInfo()` | `{ kind, label, hasForecast, updatedAt }` | `hasForecast` menentukan label "Prakiraan" atau "Riwayat" |

Fungsi async yang sama tersedia di `dataService` (misalnya `dataService.getCurrent(id)`) untuk kebutuhan di luar render.

### Bentuk data

```js
// Location
{ id: "jakarta", name: "Jakarta", region: "DKI Jakarta", lat: -6.2088, lon: 106.8456 }

// Reading: satu pembacaan (per jam atau rata-rata harian)
{
  locationId: "jakarta",
  time: "2026-10-22T12:00:00+07:00",   // ISO 8601, WIB
  pm25: 65.2, pm10: 110, co: 5200, no2: 45, so2: 20,   // µg/m³
  uv: 8                                                 // indeks
}
// Nilai yang tidak tersedia = null (bukan 0). Selalu tangani null.

// Assessment = assess(reading)
{
  ispu: 110,                       // number | null
  category: "tidak-sehat",         // "baik" | "sedang" | "tidak-sehat" | "sangat-tidak-sehat" | "berbahaya" | null
  dominant: "pm25",                // "pm25" | "pm10" | "co" | "no2" | "so2" | null
  pollutants: { pm25: { value: 65.2, ispu: 110, category: "tidak-sehat" }, ... },
  uv: { value: 8, level: "sangat-tinggi" }   // "rendah" | "sedang" | "tinggi" | "sangat-tinggi" | "ekstrem" | null
}
```

### Menguji state UI

Tambahkan ke alamat di browser (bisa digabung dengan `&lokasi=...`):
- `?simulasi=lambat`: setiap permintaan ±3 detik (cek skeleton)
- `?simulasi=gagal`: semua permintaan gagal (cek pesan error + tombol coba lagi)
- `?simulasi=kosong`: semua nilai null (cek "data tidak tersedia")

Lokasi **Medan** selalu punya PM2.5 dan CO bernilai `null`.

## 6. State global

| Hook | Isi | Siapa mengubah |
|---|---|---|
| `useActiveLocation()` | `{ locationId, location, setLocationId(id, { to? }) }` | hero (pencarian), insights (klik daerah), maps ("Lihat di Beranda") |
| `useAuth()` | `{ user, login(email, password), logout() }` | auth |
| `useSettings()` | `{ defaultLocationId, savedLocations, theme, alertThreshold, update(patch), reset() }` | settings |
| `useToast()` | `{ show(message, { action?, tone? }), dismiss(id) }` | semua fitur, untuk umpan balik |

**Lokasi aktif disimpan di URL** (`?lokasi=bandung`):
- `setLocationId(id)` membuat entri riwayat baru, jadi **tombol Back browser membatalkannya** (Nielsen N3).
- `setLocationId(id, { to: "/" })` mengganti lokasi sekaligus pindah ke Beranda (dipakai Peta).
- `location` berisi objek lokasi lengkap (`name`, `region`) atau `null` selama memuat.
- Lokasi default dari Pengaturan hanya dipakai saat aplikasi dibuka tanpa `?lokasi=`.
- **Jangan** mengubah URL sendiri dan **jangan** menyimpan lokasi aktif di state lokal.

`savedLocations` berbentuk `[{ label: "Kantor", locationId: "jakarta" }]`, maksimal `MAX_SAVED_LOCATIONS` (5).

Jangan membuat context atau state global baru untuk data yang sudah disediakan di sini.

## 7. Aturan domain (ISPU dan UV)

- **Perhitungan ISPU, kategori, dan level UV hanya lewat `assess()`, `subIndex()`, `categoryOf()`, dan `uvLevelOf()`.** Jangan menyalin tabel batas atau menulis rumus sendiri.
- Label dan warna kategori diambil dari `CATEGORIES`/`categoryInfo()` dan `UV_LEVELS`/`uvLevelInfo()`.
- Nama dan satuan polutan diambil dari `POLLUTANTS` (`label: "PM2.5"`, `name: "Partikulat halus"`, `unit: "µg/m³"`).
- Teks rekomendasi diambil dari `getRecommendations()`, `getSummary()`, `ISPU_ADVICE`, `UV_ADVICE`, dan `PARAMETER_INFO`.
- Penjelasan istilah diambil dari `GLOSSARY` (lewat `<InfoTip term="...">`).
- Indeks yang dipakai adalah **ISPU** (standar Indonesia). Jangan tulis "AQI" di UI.
- **Tidak ada data cuaca.** Jangan menampilkan suhu, "Cloudy", kelembapan, atau kecepatan angin.

## 8. Prinsip IMK (wajib)

Setiap aturan di bawah diberi kode prinsipnya: **N1–N10** = heuristik Nielsen, **S1–S8** = aturan emas Shneiderman. Kode ini dipakai di SPEC.md, review PR, dan laporan.

| Kode | Prinsip |
|---|---|
| N1 | Visibilitas status sistem |
| N2 | Kesesuaian sistem dengan dunia nyata |
| N3 | Kontrol dan kebebasan pengguna |
| N4 | Konsistensi dan standar |
| N5 | Pencegahan error |
| N6 | Mengenali lebih baik daripada mengingat |
| N7 | Fleksibilitas dan efisiensi penggunaan |
| N8 | Desain estetis dan minimalis |
| N9 | Membantu pengguna mengenali, mendiagnosis, dan memulihkan error |
| N10 | Bantuan dan dokumentasi |
| S1 | Usahakan konsistensi |
| S2 | Kegunaan universal (aksesibilitas, pemula dan mahir) |
| S3 | Umpan balik yang informatif |
| S4 | Rancang dialog yang punya penutupan jelas |
| S5 | Cegah error |
| S6 | Izinkan pembalikan aksi dengan mudah |
| S7 | Pengguna memegang kendali |
| S8 | Kurangi beban memori jangka pendek |

### 8.1 Konsistensi (N4, S1)
- **Wajib memakai komponen `@shared`** bila tersedia: `Button`/`ButtonLink`, `TextField`, `SegmentedControl`, `ConfirmDialog`, `InfoTip`, `PageHeader`, `CategoryLegend`, `Card`, `CategoryPill`, `UvPill`, `Skeleton`, `ErrorState`, `EmptyState`. **Dilarang** membuat versi sendiri dari komponen-komponen ini. Kalau komponen tidak cukup, usulkan perubahan (§2).
- Halaman fitur dibuka dengan `<PageHeader title description />`.
- Istilah sama di seluruh situs: "ISPU" (bukan AQI), "Beranda", "Peta", "Tips", "Pengaturan", "Masuk", "Keluar", "lokasi" (bukan kota/daerah/tempat secara bergantian).
- Tombol aksi utama memakai `variant="primary"`, maksimal **satu** per bagian.

### 8.2 Status dan umpan balik (N1, S3, S4)
- Setiap data yang dimuat menampilkan **skeleton** dengan bentuk serupa isi akhirnya, bukan layar kosong.
- Setiap data menampilkan **waktu pembaruan** atau berada di bagian yang menampilkannya.
- Setiap aksi pengguna yang mengubah sesuatu memberi umpan balik. Pakai **`useToast().show(...)`** untuk aksi yang hasilnya tidak langsung terlihat di layar ("Lokasi diganti ke Bandung.", "Pengaturan disimpan.").
- Alur bertahap (login, tambah lokasi) diakhiri keadaan yang jelas: pesan berhasil dan ke mana pengguna diarahkan.

### 8.3 Kendali dan pembalikan (N3, S6, S7)
- **Tidak ada perubahan otomatis tanpa aksi pengguna:** tidak ada carousel yang bergeser sendiri, tidak ada scroll otomatis setelah klik, tidak ada pindah halaman tiba-tiba.
- Aksi yang **bisa dibatalkan** (hapus lokasi tersimpan, ganti lokasi): kerjakan langsung, lalu tampilkan toast dengan tombol **"Urungkan"**.
- Aksi yang **tidak bisa dibatalkan** (kembalikan semua pengaturan): pakai **`ConfirmDialog`** dengan judul berupa pertanyaan dan tombol bertuliskan aksinya ("Kembalikan", bukan "OK").
- Setiap panel, laci, popover, dan dialog bisa ditutup dengan **Esc** dan punya tombol tutup yang terlihat.

### 8.4 Mencegah dan memulihkan error (N5, N9, S5)
- Utamakan **pilihan** daripada ketikan bebas (select, saran pencarian, SegmentedControl).
- Validasi input sebelum dikirim. Pesan error **di bawah field**, berisi apa yang salah dan cara memperbaikinya ("Format email belum benar. Contoh: nama@kampus.ac.id"). Gunakan `TextField error="..."`.
- Pesan error **tanpa istilah teknis** (bukan "Error 500", "undefined", "fetch failed"). `ErrorState` selalu punya tombol "Coba lagi" (`onRetry={result.reload}`).
- Tombol yang tidak bisa dipakai diberi penjelasan kenapa (misalnya "Maksimal 5 lokasi"), bukan hanya dinonaktifkan.

### 8.5 Mengenali, bukan mengingat (N6, S8)
- **Di mana pun warna kategori dipakai, harus ada `CategoryLegend`** di bagian yang sama atau terlihat tanpa pindah halaman.
- Polutan ditulis dengan label + nama lengkap minimal sekali per bagian ("NO₂ · Nitrogen dioksida"). Ambil dari `POLLUTANTS[key].name`.
- Jangan memaksa pengguna mengingat angka saat berpindah layar. Tampilkan perbandingan berdampingan.
- Elemen yang bisa digeser horizontal harus terlihat bisa digeser (kartu terakhir terpotong sebagian, atau tombol panah).

### 8.6 Bahasa pengguna dan bantuan (N2, N10)
- **Bahasa Indonesia sehari-hari** untuk semua teks UI. Kalimat pendek, kalimat aktif.
- Setiap istilah teknis (ISPU, polutan dominan, µg/m³, indeks per polutan, nilai per jam) didampingi **`<InfoTip term="...">`** saat pertama kali muncul di satu bagian. Daftar istilah ada di `GLOSSARY`.
- Format angka dan waktu pakai helper: `formatNumber`, `formatTime` ("12.00"), `formatDate` ("22 Okt 2026"), `formatDay` ("Kamis").

### 8.7 Estetis dan minimalis (N8)
- Setiap bagian punya **satu informasi utama** yang paling menonjol. Di kartu utama, itu adalah **ISPU + tindakan yang disarankan**, bukan jam atau tanggal.
- Jangan menampilkan data yang tidak membantu keputusan pengguna. Lebih baik tersembunyi di "Lihat detail" daripada memenuhi layar.
- Maksimal satu warna aksen per bagian, di luar warna kategori.

### 8.8 Efisiensi (N7)
- Fitur yang sering dipakai punya jalan pintas: chip lokasi tersimpan, Enter untuk mengirim form, tombol `/` untuk fokus ke pencarian (fitur `hero`).
- Jalan pintas bersifat tambahan. Semua hal tetap bisa dilakukan tanpa jalan pintas.

### 8.9 Kegunaan universal (S2), aturan teknis
1. **Warna, font, jarak, dan radius hanya lewat token CSS** di `src/shared/styles/tokens.css`. **Dilarang menulis kode warna (hex, rgb, nama warna) di file fitur.** Kontras token sudah dites (`tokens.test.js`).
2. **Kategori tidak boleh hanya dibedakan dengan warna.** Selalu ada label teks (`CategoryPill` sudah melakukannya).
3. Semua elemen interaktif berupa `<button>`, `<a>`, atau `<input>`, **bukan** `<div onClick>`. Fokus harus terlihat. Target sentuh minimal **44 × 44 px** untuk kontrol utama.
4. Gambar dan ikon yang bermakna punya teks alternatif (`<Icon label="...">`). Ikon dekoratif tidak perlu.
5. Satu `<h1>` per halaman (`PageHeader` sudah melakukannya), lalu `<h2>`/`<h3>` berurutan.
6. **Responsif:** tidak ada scroll horizontal halaman di lebar 390 px. Cek juga di 1440 px.
7. Mode **terang dan gelap** harus sama-sama terbaca.
8. Animasi menghormati `prefers-reduced-motion` (base.css sudah mematikannya secara global).

### 8.10 Peran Figma
Figma `Cuaca_part1` (Desktop - 1) adalah **sketsa kasar**, bukan spesifikasi. **Website adalah yang dinilai.** Kalau Figma bertentangan dengan prinsip di §8, **ikuti prinsip**. Pakai Figma hanya untuk gambaran tata letak umum. Jangan menyalin kode hasil generate Figma (posisi absolut, layer duplikat).

## 9. Definition of Done

Fitur dianggap selesai jika:

- [ ] Semua kriteria di `src/features/<id>/SPEC.md` tercentang, **termasuk checklist IMK**.
- [ ] `npm run verify` lulus (lint + test + build).
- [ ] `npm run check:scope -- <id>` lulus.
- [ ] Dicek di browser: lebar 1440 px dan 390 px, mode terang dan gelap, `?simulasi=lambat`, `?simulasi=gagal`, `?simulasi=kosong`.
- [ ] Dicoba **hanya dengan keyboard** (Tab, Shift+Tab, Enter, Spasi, Esc): semua aksi bisa dilakukan dan fokus selalu terlihat.
- [ ] Tidak ada error atau warning di console browser.
- [ ] PR dibuat ke `main` dengan template laporan (§10) dan direview koordinator.

## 10. Alur Git dan laporan

- Branch: `fitur/<id>`, misalnya `fitur/maps`.
- Commit kecil dengan pesan jelas: `feat(maps): tambah marker berwarna per kategori`.
- Tarik `main` terbaru secara rutin: `git pull origin main`.
- Deskripsi PR memakai template di `.github/pull_request_template.md`, termasuk tabel **prinsip IMK yang diterapkan** (kode N/S + contoh konkret di fitur kamu). Tabel ini dipakai untuk laporan akhir.

## 11. Perintah

```bash
npm install                     # sekali setelah clone
npm run dev                     # jalankan di http://localhost:5173
npm run verify                  # lint + test + build
npm run check:scope -- <id>     # pastikan hanya folder fitur kamu yang berubah
npm test                        # unit test saja
```

## 12. Kalau ragu

- Kontrak (§4–§8) tidak cukup? **Berhenti dan tanyakan**, jangan menebak dengan mengubah shared.
- Figma dan dokumen ini berbeda? **Ikuti dokumen ini** (§8.10).
- Butuh data yang tidak ada di kontrak (misalnya suhu)? **Jangan dibuat-buat.** Tulis di usulan PR.
- Dua prinsip IMK tampak bertentangan (misalnya minimalis vs. bantuan)? Pilih yang membantu pengguna menyelesaikan tugas, lalu tulis alasannya di PR.
