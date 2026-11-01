# SPEC: Fitur `settings` (Pengaturan dan Banner Peringatan)

**Pemilik:** Anggota 4 · **Folder:** `src/features/settings/` · **Branch:** `fitur/settings`
**Baca dulu:** `CONTRACT.md` (terutama §8 Prinsip IMK)

## Tujuan
Pengguna yang login bisa menyimpan lokasi rumah, kantor, dan kampus, memilih lokasi default, mengatur tema, dan mendapat peringatan saat udara memburuk.

## Tampil di
- Halaman `/settings` (`SettingsPage.jsx`, default export). Menu sidebar "Pengaturan". **Butuh login**: tamu otomatis diarahkan ke `/login`.
- Slot `dashboard-alert`, yaitu banner di Beranda (`AlertBanner.jsx`, starter sudah berfungsi).

## Desain
Belum ada desain di Figma, dan **tidak perlu dibuat**. Pakai pola halaman bersama: `PageHeader`, lalu setiap kelompok pengaturan di dalam `Card` dengan judul.

## Yang sudah tersedia (`@shared`)
- `useSettings()` → `{ defaultLocationId, savedLocations, theme, alertThreshold, update(patch), reset() }`
  - Sudah tersimpan otomatis per akun di localStorage (aman di mode privat).
  - `theme` (`"system" | "light" | "dark"`) **langsung diterapkan** ke seluruh situs.
  - `savedLocations`: `[{ label, locationId }]`, dipotong otomatis ke `MAX_SAVED_LOCATIONS` (5).
  - `defaultLocationId` dipakai sebagai lokasi awal saat situs dibuka tanpa `?lokasi=` di alamat.
- `useAuth()` → `user` (`{ name, email }`).
- `useLocations()` untuk pilihan lokasi. `CATEGORIES` untuk pilihan ambang.
- `useToast()` → `show(message, { action: { label: "Urungkan", onClick } })`.
- Komponen: `PageHeader`, `Card`, `Button`, `TextField`, `SegmentedControl`, `ConfirmDialog`, `InfoTip`, `CategoryPill`.
- Untuk menguji tanpa menunggu fitur auth: buka `/login` lalu klik "Masuk sebagai demo".

## Kebutuhan
1. `PageHeader` berjudul "Pengaturan" dengan deskripsi singkat.
2. **Profil** (`Card`): nama dan email pengguna (hanya baca).
3. **Lokasi default** (`Card`): `<select>` berlabel dari `useLocations()`, ditambah opsi "Lokasi terakhir dibuka" (`null`). Petunjuk: "Dipakai saat Anda membuka situs ini."
4. **Lokasi tersimpan** (`Card`):
   - Daftar berisi label + nama lokasi, dengan tombol ubah dan hapus (`Button` ghost + `aria-label` "Hapus Kantor").
   - Form tambah: `TextField` label + `<select>` lokasi + `Button` "Tambah". Saran label sebagai chip yang bisa diklik: Rumah, Kantor, Kampus (N6).
   - Validasi: label wajib, maksimal 20 karakter, tidak boleh duplikat. Pesan lewat `TextField error`.
   - Maksimal 5: tombol "Tambah" nonaktif **dengan penjelasan** "Maksimal 5 lokasi. Hapus salah satu untuk menambah."
   - **Hapus tanpa dialog**: hapus langsung, lalu toast "“Kantor” dihapus." dengan tombol **"Urungkan"** yang mengembalikannya ke posisi semula (S6).
5. **Tampilan** (`Card`): `SegmentedControl` Terang / Gelap / Ikuti sistem.
6. **Peringatan** (`Card`): pilihan ambang dari kategori, yaitu Sedang (51), Tidak Sehat (101, default), Sangat Tidak Sehat (201), Berbahaya (301), atau Mati (`null`). Setiap pilihan menampilkan `CategoryPill`. Petunjuk: "Banner muncul di Beranda saat ISPU lokasi Anda mencapai batas ini."
7. **Kembalikan ke awal**: `Button variant="danger"` → **`ConfirmDialog`** berjudul "Kembalikan semua pengaturan?" dengan isi yang menyebut apa saja yang hilang ("3 lokasi tersimpan akan dihapus.") dan tombol "Kembalikan". Ini satu-satunya aksi yang tidak bisa diurungkan.
8. **Umpan balik**: setiap perubahan langsung tersimpan; toast "Pengaturan disimpan." untuk perubahan yang hasilnya tidak terlihat langsung (lokasi default, ambang). Tema tidak perlu toast karena perubahannya terlihat.
9. **Banner peringatan** (`AlertBanner.jsx`): sempurnakan isinya.
   - Sebutkan nama lokasi, ISPU, kategori (`CategoryPill`), dan satu saran dari `ISPU_ADVICE`.
   - Tombol tutup yang menyembunyikan banner sampai lokasi atau kategori berubah (state lokal).
   - Tautan "Ubah batas peringatan" ke `/settings`.

## Di luar scope
- Notifikasi push atau email.
- Mengubah email atau kata sandi.

## Checklist IMK
| Kode | Harus terlihat di fitur ini |
|---|---|
| N1 / S3 | Toast "Pengaturan disimpan"; tema berubah seketika; banner menyebut nilai yang memicunya |
| N3 / S6 | **Hapus lokasi bisa diurungkan**; banner bisa ditutup |
| N4 / S1 | Semua kontrol dari `@shared` (`Card`, `TextField`, `SegmentedControl`, `Button`, `ConfirmDialog`) |
| N5 / S5 | Validasi label; batas 5 dengan penjelasan; `ConfirmDialog` untuk reset |
| N6 / S8 | Chip saran label; `CategoryPill` di pilihan ambang; nama lokasi (bukan id) di daftar |
| N7 | Lokasi tersimpan menjadi jalan pintas di Beranda (lewat fitur `hero`) |
| N9 | Pesan validasi yang menyebut cara memperbaiki |
| N10 | Petunjuk singkat di bawah setiap pengaturan |
| S4 | Dialog reset punya judul berupa pertanyaan dan tombol bertuliskan aksinya |
| S2 | Setiap kontrol berlabel; bisa penuh dengan keyboard; dialog mengunci fokus |

## Kriteria selesai
- [ ] Semua pengaturan bertahan setelah halaman dimuat ulang.
- [ ] Dua akun berbeda punya pengaturan terpisah (uji: login A → ubah → keluar → login B).
- [ ] Tema berubah seketika tanpa memuat ulang, di semua halaman.
- [ ] Lokasi default dipakai saat situs dibuka ulang tanpa `?lokasi=`.
- [ ] Batas 5 lokasi tersimpan dan validasi label berjalan.
- [ ] Hapus lokasi → "Urungkan" mengembalikannya ke posisi yang sama.
- [ ] Reset hanya terjadi setelah konfirmasi di `ConfirmDialog`.
- [ ] Banner muncul di Beranda saat ISPU ≥ ambang (uji dengan Bekasi atau Pekanbaru) dan hilang saat ambang "Mati".
- [ ] Semua baris di checklist IMK terpenuhi.
- [ ] Rapi di 390 px dan 1440 px, terang dan gelap.
- [ ] Checklist Definition of Done di `CONTRACT.md` §9.

## Tugas tambahan (karena fitur ini relatif ringan)
Setelah fiturmu selesai, Anggota 4 memimpin **evaluasi heuristik lintas fitur** sebelum uji pengguna. Langkahnya:
- Bagikan tabel 10 heuristik Nielsen ke semua anggota.
- Setiap anggota menilai **dua fitur milik anggota lain** dan memberi skala keparahan 0–4.
- Kumpulkan temuannya sebagai issue untuk pemilik fitur. Jangan memperbaiki sendiri di folder orang lain.

Cek juga semua halaman di 1440 / 1024 / 768 / 390 px, terang dan gelap, dan ketiga mode `?simulasi=`.

## Prompt awal untuk AI agent
```
Kerjakan fitur "settings" di repo ini. Ini tugas mata kuliah IMK: ikuti prinsip Nielsen
dan Shneiderman di CONTRACT.md §8. Baca AGENTS.md, CONTRACT.md, dan
src/features/settings/SPEC.md dulu. Tulis kode hanya di src/features/settings/.
Ganti placeholder SettingsPage.jsx sesuai SPEC memakai useSettings(), useToast(), dan
komponen dari "@shared" (Card, TextField, SegmentedControl, Button, ConfirmDialog).
Hapus lokasi tersimpan harus bisa diurungkan lewat toast. Sempurnakan AlertBanner.jsx.
Akhiri dengan npm run verify dan npm run check:scope -- settings, lalu isi tabel
"Prinsip IMK yang diterapkan".
```
