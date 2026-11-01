# PRD: Dashboard Kualitas Udara

**Status:** v0.3 · 1 November 2026
**Konteks:** tugas mata kuliah **Interaksi Manusia dan Komputer (IMK)**. Yang dinilai adalah **website**.
**Prinsip desain:** 10 heuristik **Nielsen** (N1–N10) dan 8 aturan emas **Shneiderman** (S1–S8). Lihat `CONTRACT.md` §8.

## Peta dokumen

| Dokumen | Untuk | Isi |
|---|---|---|
| **`docs/PRD.md`** (ini) | semua anggota | apa yang dibangun, untuk siapa, kenapa, proses IMK, dan aturan domain ISPU |
| **`CONTRACT.md`** | anggota + AI agent | aturan teknis yang mengikat, termasuk **prinsip IMK** (§8) |
| **`src/features/<id>/SPEC.md`** | pemilik fitur + AI agent | tugas satu fitur: kebutuhan, **checklist IMK**, kriteria selesai, prompt awal |
| `AGENTS.md` / `CLAUDE.md` | AI agent | penunjuk otomatis ke CONTRACT.md dan SPEC.md |

**Figma** `Cuaca_part1` (Desktop - 1) hanya **sketsa kasar** dan tidak dinilai. Kalau Figma bertentangan dengan prinsip IMK, prinsip yang diikuti.

### Keputusan

| Kode | Keputusan | Status |
|---|---|---|
| D1 | Tech stack: **React 18 + Vite**, CSS Modules + token CSS, tanpa UI framework | ✅ diterapkan |
| D2 | Standar indeks: **ISPU** (PermenLHK P.14/2020), bukan US AQI | ✅ diterapkan |
| D3 | Data cuaca di Figma (suhu, kelembapan, angin, "Cloudy") **dihapus** karena tidak ada datanya | ✅ diterapkan |
| D4 | **Bentuk data asli kelompok:** format, frekuensi, daftar lokasi, ada prakiraan atau tidak | ⏳ **harus dijawab sebelum Fase 3** |
| D5 | Autentikasi **mock**. Beranda, Peta, Tips terbuka untuk tamu; Pengaturan butuh login | ✅ diterapkan |
| D6 | Bahasa UI: **Bahasa Indonesia** sehari-hari | ✅ diterapkan |
| D7 | Kartu kosong kiri bawah Figma diisi **Rincian Polutan** | ✅ masuk fitur `insights` |
| D8 | **Tanggal tenggat** tiap fase | ⏳ **harus diisi kelompok** |
| D9 | Nama produk (Figma masih "Program") | ⏳ ganti `APP_NAME` di `src/app/config.js` |
| D10 | Figma = sketsa kasar; website dan prinsip IMK yang menjadi acuan | ✅ diterapkan |

---

## 1. Latar belakang dan masalah

Pekerja kantoran dan mahasiswa beraktivitas di luar ruangan setiap hari: berjalan ke halte atau stasiun, naik motor ke kampus, makan siang di luar, olahraga sore. Data polutan mentah (misalnya "PM2.5 = 65 µg/m³") tidak langsung menjawab pertanyaan mereka:

1. Apakah udara di lokasi saya aman sekarang?
2. Perlu pakai masker atau sunscreen?
3. Kapan waktu terbaik untuk keluar atau olahraga hari ini?
4. Bagaimana kondisi di rumah, kantor, dan kampus saya?

Produk ini menerjemahkan enam data milik kelompok (**PM2.5, PM10, CO, NO2, SO2, UV Index**) menjadi jawaban yang bisa langsung ditindaklanjuti.

## 2. Tujuan dan non-tujuan

| Kode | Tujuan | Ukuran (diuji di Fase 4) |
|---|---|---|
| G1 | Tahu kategori udara dan tindakan yang disarankan dalam sekali lihat | Tugas T1 selesai ≤ 10 detik |
| G2 | Keenam data tampil dan bisa dipahami | Tugas T4 berhasil ≥ 80% |
| G3 | Bisa membandingkan beberapa lokasi | Tugas T3 berhasil ≥ 80% |
| G4 | Bisa merencanakan waktu keluar | Tugas T2 berhasil ≥ 80% |
| G5 | Mudah dipakai secara keseluruhan | Skor **SUS ≥ 68** (rata-rata industri) |

**Bukan tujuan:** aplikasi cuaca, alat medis, pengukuran sendiri, aplikasi mobile native.

## 3. Pengguna

### Proto-persona (asumsi, belum divalidasi)

> Persona di bawah **disusun dari asumsi tim**, bukan hasil riset. Kelompok belum melakukan riset pengguna. Persona ini divalidasi atau direvisi dengan survei di Fase 1 (§5). Di laporan, sebut sebagai **proto-persona**.

**Rani, 26 tahun, karyawan di Jakarta Selatan.** Naik KRL lalu jalan kaki 15 menit, lari sore dua kali seminggu.
- Kebutuhan: tahu perlu masker saat berangkat atau tidak; tahu apakah lari sore aman.
- Asumsi yang perlu dicek: memeriksa udara pagi sebelum berangkat; lebih banyak memakai HP daripada laptop.

**Dimas, 20 tahun, mahasiswa di Depok.** Naik motor ke kampus, sering ada kegiatan lapangan siang hari.
- Kebutuhan: tahu seberapa terik UV siang ini; tahu kualitas udara saat pulang.
- Asumsi yang perlu dicek: belum pernah mendengar istilah ISPU; peduli UV lebih dari polusi.

### Skenario utama
1. **Pagi sebelum berangkat:** buka situs → lihat kategori dan saran di kartu utama → putuskan pakai masker atau tidak.
2. **Merencanakan olahraga:** lihat "Waktu terbaik keluar" di panel kanan.
3. **Membandingkan lokasi:** lihat daftar daerah, atau pindah antara lokasi tersimpan.
4. **Belajar istilah:** klik ⓘ di samping ISPU → baca penjelasan singkat → "Pelajari di Tips".

## 4. Fitur dan pembagian

Setiap anggota memegang **satu fitur** di foldernya sendiri. Kerangka aplikasi (shell, sidebar, routing, grid Beranda, data, aturan ISPU, komponen bersama) sudah dibuat di **initiate** oleh koordinator.

| # | Fitur (`id`) | Pemilik | User story utama | Tempat |
|---|---|---|---|---|
| 1 | Masuk dan Akun (`auth`) | Anggota 1 | Sebagai pengguna, saya bisa masuk dan keluar supaya pengaturan saya tersimpan | `/login` + area akun sidebar |
| 2 | Peta (`maps`) | Anggota 2 | Saya melihat sebaran kualitas udara di peta untuk gambaran wilayah | `/maps` |
| 3 | Tips (`tips`) | Anggota 3 | Saya paham arti angka polutan dan cara melindungi diri | `/tips` |
| 4 | Pengaturan (`settings`) | Anggota 4 | Saya menyimpan lokasi rumah/kantor/kampus dan mendapat peringatan | `/settings` + banner Beranda |
| 5 | Pencarian + Kartu Utama (`hero`) | Anggota 5 | Saya tahu ISPU dan tindakan untuk lokasi saya, dan bisa mencari lokasi lain | Beranda tengah atas |
| 6 | Rekomendasi + Polutan + Daerah (`insights`) | Anggota 6 | Saya tahu tindakan, polutan bermasalah, dan perbandingan daerah | Beranda tengah bawah |
| 7 | Per Jam + 7 Hari (`outlook`) | Anggota 7 | Saya tahu jam terbaik untuk keluar dan kondisi seminggu | Beranda kanan |

Detail kebutuhan, checklist IMK, dan kriteria selesai ada di `src/features/<id>/SPEC.md`.

### Ketergantungan antarfitur (sudah ditangani di initiate)

| Hal bersama | Disediakan di `@shared` | Dipakai oleh |
|---|---|---|
| Lokasi aktif (di URL) | `useActiveLocation()` | hero, insights, outlook, tips, maps, settings |
| Status login | `useAuth()` (mock berfungsi) | auth, settings, hero, insights |
| Pengaturan | `useSettings()` (per akun, tema langsung berlaku) | settings, hero, insights, banner |
| Umpan balik | `useToast()` | semua |
| Data | hooks `useCurrent`, `useHourly`, `useDaily`, ... | semua |
| Aturan ISPU/UV | `assess()`, `CATEGORIES`, `UV_LEVELS` | semua |
| Teks dan istilah | `getRecommendations()`, `ISPU_ADVICE`, `PARAMETER_INFO`, `GLOSSARY` | hero, insights, tips, InfoTip |
| Komponen | `Button`, `TextField`, `SegmentedControl`, `ConfirmDialog`, `InfoTip`, `PageHeader`, `CategoryLegend`, `Card`, ... | semua |

## 5. Proses IMK dan fase

Tanggal diisi kelompok (D8). H = hari kerja.

| Fase | Waktu | Kegiatan | Keluaran | Penanggung jawab |
|---|---|---|---|---|
| 0. Initiate | ✅ selesai | Kerangka, `@shared` (komponen + prinsip IMK), registry 7 fitur, CONTRACT, SPEC | Repo siap dibagikan | Koordinator |
| 1. Riset ringan | H1–H5, **paralel dengan Fase 2** | Survei Google Form (±10 pertanyaan, 15–30 responden pekerja dan mahasiswa) | Ringkasan temuan; revisi proto-persona; daftar penyesuaian | 1–2 anggota |
| 2. Bangun | H1–H7 | Setiap anggota mengerjakan fiturnya dengan mock data, mengikuti checklist IMK | 7 PR ke `main` | Semua |
| 3. Data asli | H8 | `realAdapter` sesuai D4; fitur tidak perlu berubah | Situs memakai data kelompok | Koordinator |
| 4. Evaluasi heuristik | H8–H9 | Setiap anggota menilai 2 fitur milik anggota lain dengan 10 heuristik Nielsen, skala keparahan 0–4 | Daftar temuan berprioritas | Dipimpin Anggota 4 |
| 5. Uji usability | H9–H10 | 5 peserta (pekerja/mahasiswa), skenario tugas + *think-aloud* + kuesioner SUS | Tingkat keberhasilan, waktu per tugas, skor SUS, kutipan peserta | 2 anggota (fasilitator + pencatat) |
| 6. Iterasi | H10–H11 | Perbaiki temuan berkeparahan 3–4 dari Fase 4 dan 5 | Versi final + catatan "sebelum/sesudah" untuk laporan | Pemilik fitur |

### 5.1 Survei (Fase 1)
Topik pertanyaan: seberapa sering beraktivitas di luar, moda perjalanan, jam berangkat dan pulang, apakah pernah memeriksa kualitas udara (pakai apa), apakah tahu istilah ISPU/AQI, informasi apa yang paling dibutuhkan, perangkat yang dipakai, dan kebiasaan memakai masker dan sunscreen.
Hasilnya dipakai untuk: memvalidasi proto-persona, mengurutkan prioritas isi kartu utama, dan menentukan istilah yang perlu dijelaskan.

### 5.2 Skenario uji usability (Fase 5)

| Kode | Tugas untuk peserta | Berhasil jika | Mengukur |
|---|---|---|---|
| T1 | "Kamu akan berangkat ke kantor/kampus di Jakarta. Perlu pakai masker hari ini?" | Menjawab sesuai kategori, ≤ 10 detik | G1 |
| T2 | "Kamu ingin lari sore di Depok. Jam berapa waktu terbaik?" | Menyebut jam yang ditandai "Terbaik" | G4 |
| T3 | "Mana yang udaranya lebih baik sekarang, Bandung atau Bekasi?" | Jawaban benar | G3 |
| T4 | "Apa arti PM2.5, dan berapa nilainya di lokasi ini?" | Menemukan penjelasan dan nilainya | G2 |
| T5 | (Setelah masuk) "Simpan Depok sebagai lokasi 'Kampus', lalu hapus lagi." | Berhasil menyimpan dan menghapus | N3/S6, N5 |

Catat per tugas: berhasil/gagal, waktu, jumlah salah klik, dan ucapan peserta. Setelah semua tugas, peserta mengisi **SUS** (10 pertanyaan, skala 1–5). Gunakan terjemahan Bahasa Indonesia yang sudah divalidasi (Sharfina & Santoso, 2016).

## 6. Keterlacakan prinsip IMK

Keputusan desain yang sudah diterapkan di initiate, beserta prinsip yang dipenuhinya. Tabel ini bisa langsung dipakai di laporan. Pemilik fitur menambahkan baris untuk fiturnya lewat tabel di deskripsi PR.

| Keputusan | Di mana | Prinsip |
|---|---|---|
| Bar konteks di setiap halaman: lokasi aktif + label "Data simulasi" | kerangka | N1 |
| Skeleton saat memuat, pesan gagal + "Coba lagi" di setiap komponen data | `@shared` | N1, N9 |
| Toast untuk umpan balik aksi, dengan tombol "Urungkan" | `useToast` | S3, S6, N3 |
| Lokasi aktif di URL: tombol Back membatalkan pergantian lokasi, link bisa dibagikan | `useActiveLocation` | N3, S6 |
| Lokasi default hanya dipakai saat situs dibuka, tidak menimpa pilihan pengguna | `useActiveLocation` | S7 |
| ISPU (istilah resmi Indonesia), Bahasa Indonesia sehari-hari, format waktu WIB | seluruh situs | N2 |
| Data cuaca dari Figma dihapus; ISPU + tindakan menjadi informasi utama | SPEC hero, outlook | N8 |
| Komponen interaktif bersama yang wajib dipakai semua fitur | `@shared` | N4, S1 |
| Menu sidebar seragam Bahasa Indonesia ("Beranda", "Peta", "Tips", "Pengaturan") | kerangka | N4 |
| `ConfirmDialog` hanya untuk aksi yang tidak bisa dibatalkan | `@shared`, SPEC settings | N5, S5, S4 |
| Legenda kategori (`CategoryLegend`) di setiap bagian yang memakai warna | `@shared`, semua SPEC | N6, S8 |
| Kartu sambutan untuk pengunjung pertama (arti ISPU dan warnanya) | Beranda | N10, S8 |
| `InfoTip` + glosarium untuk istilah teknis, tertaut ke halaman Tips | `@shared`, SPEC tips | N2, N10 |
| Jalan pintas `/` untuk pencarian, chip lokasi tersimpan | SPEC hero | N7 |
| Pesan error fitur memakai bahasa pengguna, detail teknis hanya di console | kerangka | N9 |
| Kontras teks ≥ 4,5:1 dan batas kontrol ≥ 3:1 di terang dan gelap, dijaga tes otomatis | `tokens.css` + `tokens.test.js` | S2 |
| Kategori selalu dengan label teks; semua bisa dengan keyboard; responsif 390 px | `@shared`, CONTRACT §8.9 | S2 |
| Tidak ada carousel otomatis, scroll otomatis, atau pindah halaman tanpa aksi | CONTRACT §8.3 | S7, N3 |

## 7. Persyaratan non-fungsional

| Area | Persyaratan |
|---|---|
| Responsif | ≥ 1200 px: tata letak dua kolom. < 1200 px: panel kanan turun. < 900 px: sidebar menjadi laci. 390 px: satu kolom tanpa scroll horizontal. |
| Aksesibilitas | WCAG 2.1 AA: kontras (sudah dites), keyboard penuh, fokus terlihat, label teks untuk kategori, target sentuh 44 px. |
| State | Setiap komponen data menangani memuat, gagal, dan kosong/null. Error di satu fitur tidak merusak fitur lain. |
| Format | `id-ID`: desimal koma, jam "12.00", tanggal "22 Okt 2026", zona WIB. |
| Tema | Terang dan gelap lewat token CSS. |
| Performa | Halaman fitur di-*lazy load*. Leaflet hanya dimuat di halaman Peta. |

## 8. Aturan domain

> **Wajib verifikasi.** Tabel ISPU di bawah disusun berdasarkan PermenLHK No. P.14/MENLHK/SETJEN/KUM.1/7/2020, tetapi **belum dicocokkan ulang** dengan lampiran resminya. Koordinator wajib mencocokkan angka di `src/shared/aqi.js` (`BREAKPOINTS`) dengan dokumen resmi. Kalau ada koreksi, cukup ubah di file itu lalu jalankan `npm test`.

### Kategori ISPU

| Kategori | Rentang | Warna | Arti |
|---|---|---|---|
| Baik | 0–50 | Hijau | Aman untuk semua aktivitas |
| Sedang | 51–100 | Biru | Masih dapat diterima; kelompok sensitif waspada |
| Tidak Sehat | 101–200 | Kuning | Merugikan kelompok sensitif, mulai berdampak pada umum |
| Sangat Tidak Sehat | 201–300 | Merah | Berisiko bagi semua orang |
| Berbahaya | > 300 | Hitam | Berbahaya serius bagi semua orang |

Warna mengikuti standar resmi ISPU. Biru untuk "Sedang" bisa asing bagi orang yang terbiasa skala lain. Karena itu kategori **selalu disertai label teks** dan legenda.

### Batas konsentrasi (µg/m³)

| Batas atas ISPU | PM2.5 (24 jam) | PM10 (24 jam) | CO (8 jam) | NO2 (1 jam) | SO2 (24 jam) |
|---|---|---|---|---|---|
| 50 | 15,5 | 50 | 4.000 | 80 | 52 |
| 100 | 55,4 | 150 | 8.000 | 200 | 180 |
| 200 | 150,4 | 350 | 15.000 | 1.130 | 400 |
| 300 | 250,4 | 420 | 30.000 | 2.260 | 800 |
| 500 | 500 | 500 | 45.000 | 3.000 | 1.200 |

### Rumus

```
I = ((Ia − Ib) / (Xa − Xb)) × (Xx − Xb) + Ib
```

- `Xa`, `Xb` = batas atas dan bawah konsentrasi pada rentang tempat `Xx` berada (batas bawah rentang pertama = 0); `Ia`, `Ib` = batas ISPU rentang itu.
- Dibulatkan ke bilangan bulat; di atas batas tertinggi = 500.
- **ISPU lokasi = indeks tertinggi** di antara polutan; polutan itu = **polutan dominan**. Seri dipecah dengan urutan PM2.5, PM10, CO, NO2, SO2.
- `null` dilewati. Semua `null` → ISPU `null` ("Data tidak tersedia").
- Nilai per jam dihitung dengan tabel yang sama dan diberi keterangan "perkiraan".

Contoh (sudah menjadi unit test): PM2.5 35,45 → 75 · PM10 100 → 75 · PM2.5 15,5 → 50 · PM2.5 150,4 → 200 · PM2.5 65,2 → 110.

### UV Index (WHO)

| Level | Rentang | Saran |
|---|---|---|
| Rendah | 0–2 | Tidak perlu perlindungan khusus |
| Sedang | 3–5 | Sunscreen SPF 30+, topi atau payung saat siang |
| Tinggi | 6–7 | Kurangi di bawah matahari pukul 10.00–16.00 |
| Sangat Tinggi | 8–10 | Hindari matahari pukul 10.00–16.00; ulangi sunscreen tiap 2 jam |
| Ekstrem | ≥ 11 | Sebisa mungkin di dalam ruangan saat siang |

Teks rekomendasi dan glosarium lengkap ada di `src/shared/content/advice.js`.

## 9. Perbedaan dari Figma Desktop - 1

Figma adalah sketsa kasar. Perbedaan berikut disengaja, beserta prinsip yang mendasarinya:

| # | Di Figma | Di website | Prinsip |
|---|---|---|---|
| 1 | Data cuaca mendominasi (suhu, "Cloudy", kelembapan, angin) | Dihapus; ISPU dan tindakan yang utama | N8 |
| 2 | Jam "12.00" 64 px lebih menonjol daripada ISPU | ISPU dan tindakan paling menonjol; jam kecil | N8 |
| 3 | "AQI" + "PM2.5" tanpa keterangan | "ISPU" + "Polutan dominan: PM2.5 (Partikulat halus)" + InfoTip | N2, N10 |
| 4 | "Jakarta, West Java" | "Jakarta, DKI Jakarta" | N2 |
| 5 | Kartu kiri bawah kosong | Rincian Polutan | — |
| 6 | Semua baris harian "Tomorrow, 23 Oct" | Hari dan tanggal berurutan | N2 |
| 7 | Bahasa campur Indonesia dan Inggris | Bahasa Indonesia | N4 |
| 8 | Daftar daerah campur kota dan provinsi | Kota saja | N4 |
| 9 | Warna pill daerah tidak konsisten | Warna kategori dari token + label teks + legenda | N4, N6, S2 |
| 10 | Panel kanan melebihi frame | Muat di kolom 300 px | N8 |
| 11 | Sidebar "Program", "Dashboard" | Nama produk (D9), "Beranda" | N4 |

## 10. Tugas koordinator

- [ ] Cocokkan `BREAKPOINTS` di `src/shared/aqi.js` dengan lampiran resmi PermenLHK P.14/2020.
- [ ] Isi D4, D8, D9.
- [ ] Tentukan penanggung jawab survei (Fase 1) dan uji usability (Fase 5).
- [ ] Buat repo GitHub, push, aktifkan *branch protection* di `main` (PR wajib, minimal 1 review).
- [ ] Bagikan ke setiap anggota: link repo + nama foldernya.
- [ ] Review setiap PR: jalankan `npm run check:scope -- <id>` dan `npm run verify`, lalu cek tabel "Prinsip IMK yang diterapkan".
- [ ] Tampung usulan perubahan `@shared` dari PR anggota, lalu terapkan.
- [ ] Fase 3: buat `src/shared/data/realAdapter.js` dengan fungsi yang sama seperti `mockAdapter.js`.
- [ ] Kumpulkan tabel IMK dari semua PR ke §6 untuk laporan akhir.
