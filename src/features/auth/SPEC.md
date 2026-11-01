# SPEC: Fitur `auth` (Masuk dan Akun)

**Pemilik:** Anggota 1 · **Folder:** `src/features/auth/` · **Branch:** `fitur/auth`
**Baca dulu:** `CONTRACT.md` (terutama §8 Prinsip IMK)

## Tujuan
Pengguna bisa masuk dan keluar akun. Login **tidak wajib**: Beranda, Peta, dan Tips bisa dibuka sebagai tamu. Login hanya dibutuhkan untuk Pengaturan dan lokasi tersimpan, dan pengguna harus tahu alasannya.

## Tampil di
- Halaman `/login` (`LoginPage.jsx`, default export)
- Slot `sidebar-account`, yaitu area akun di bawah sidebar (`AccountSlot.jsx`)

## Desain
Belum ada desain di Figma, dan **tidak perlu dibuat**. Pakai pola halaman bersama: `PageHeader` di atas, lalu konten di dalam `Card`. Kontrol memakai `TextField` dan `Button` dari `@shared`, supaya tampilannya otomatis sama dengan halaman lain (N4).
Referensi area akun di Figma (opsional): avatar `22:128`, teks `22:130`, ikon keluar `22:134`.

## Yang sudah tersedia (`@shared`)
- `useAuth()` → `{ user, login(email, password), logout() }`. `login` melempar `Error` dengan pesan siap tampil ("Format email belum benar.", "Kata sandi minimal 6 karakter.").
- Mock: email valid + kata sandi ≥ 6 karakter = berhasil. Yang disimpan hanya `{ name, email }`.
- Rute `/settings` otomatis mengarahkan tamu ke `/login?next=/settings`.
- Komponen: `PageHeader`, `Card`, `TextField` (dengan `error` dan `hint`), `Button` (dengan `loading`), `ButtonLink`, `Icon`.
- `useToast()` untuk umpan balik "Berhasil masuk" dan "Anda telah keluar".
- `AccountSlot.jsx` dan `LoginPage.jsx` sudah berisi starter yang berfungsi. Boleh diubah total.

## Kebutuhan
1. **Penjelasan di atas form**: kenapa perlu masuk ("Masuk untuk menyimpan lokasi rumah, kantor, dan kampus serta mengatur peringatan. Data disimpan di perangkat ini.").
2. **Form**: `TextField` email (`type="email"`, `autoComplete="email"`) dan kata sandi (`autoComplete="current-password"`), tombol "Masuk" (`variant="primary"`, `type="submit"`). Enter mengirim form.
3. **Validasi sebelum memanggil `login()`.** Pesan error di bawah field lewat `TextField error`, berisi apa yang salah **dan** contoh benarnya ("Format email belum benar. Contoh: nama@kampus.ac.id"). Fokus pindah ke field pertama yang salah.
4. **Tampilkan/sembunyikan kata sandi**: tombol dengan `aria-pressed` dan label yang berubah ("Tampilkan" / "Sembunyikan").
5. **State memuat**: `Button loading` selama `login()` berjalan.
6. **Setelah berhasil**: toast "Berhasil masuk sebagai Nama.", lalu arahkan ke `?next=` (default `/`). Abaikan nilai `next` yang bukan path internal (tidak diawali `/` atau diawali `//`).
7. **"Lanjut sebagai tamu"**: `ButtonLink` sekunder ke `/` yang selalu terlihat. Pengguna tidak boleh merasa terjebak di halaman login (N3).
8. Sudah login lalu membuka `/login`: "Anda sudah masuk sebagai …" + `ButtonLink` ke Beranda + tombol "Keluar".
9. **Area akun di sidebar**: tamu melihat "Masuk"; pengguna yang login melihat avatar (inisial), nama, dan tombol keluar (`aria-label="Keluar"`). Nama panjang terpotong dengan `title` berisi nama lengkap.
10. **Keluar**: `logout()`, toast "Anda telah keluar.", kembali ke `/`. Tanpa dialog konfirmasi, karena pengguna bisa langsung masuk lagi.
11. Opsional: mode "Daftar" (form yang sama + nama). Cukup memakai `login()` yang sama karena backend masih mock.

## Di luar scope
- Backend sungguhan atau penyimpanan kata sandi (**kata sandi tidak boleh disimpan di mana pun**).
- Lupa kata sandi dan login dengan Google.

## Checklist IMK
| Kode | Harus terlihat di fitur ini |
|---|---|
| N1 / S3 | Tombol memuat saat proses; toast setelah masuk dan keluar; area akun menunjukkan status login |
| N2 | "Masuk"/"Keluar" (bukan Login/Logout); pesan error bahasa sehari-hari |
| N3 / S7 | "Lanjut sebagai tamu" selalu terlihat; login tidak dipaksakan untuk fitur publik |
| N4 / S1 | `PageHeader`, `Card`, `TextField`, `Button` dari `@shared` |
| N5 / S5 | Validasi sebelum kirim; `type="email"` dan `autoComplete` |
| N9 | Pesan error di bawah field: apa yang salah + contoh benar; fokus ke field yang salah |
| N10 | Penjelasan singkat kenapa perlu masuk |
| S4 | Setelah berhasil, jelas ke mana pengguna dibawa (halaman asal) |
| S2 | Label pada setiap input; error diumumkan ke pembaca layar; bisa penuh dengan keyboard |

## Kriteria selesai
- [ ] Email salah atau kata sandi < 6 karakter menampilkan pesan error yang jelas tanpa memuat ulang halaman, dan fokus pindah ke field tersebut.
- [ ] Login berhasil kembali ke halaman asal (uji: buka `/settings` sebagai tamu → masuk → kembali ke `/settings`).
- [ ] "Lanjut sebagai tamu" berfungsi.
- [ ] Sesi bertahan setelah halaman dimuat ulang.
- [ ] Kata sandi tidak muncul di localStorage, console, atau URL.
- [ ] Area akun benar untuk tamu dan pengguna login.
- [ ] Semua baris di checklist IMK terpenuhi.
- [ ] Rapi di 390 px dan 1440 px, terang dan gelap.
- [ ] Checklist Definition of Done di `CONTRACT.md` §9.

## Prompt awal untuk AI agent
```
Kerjakan fitur "auth" di repo ini. Ini tugas mata kuliah IMK: ikuti prinsip Nielsen
dan Shneiderman di CONTRACT.md §8. Baca AGENTS.md, CONTRACT.md, dan
src/features/auth/SPEC.md dulu. Tulis kode hanya di src/features/auth/.
Ganti placeholder LoginPage.jsx dengan halaman masuk sesuai SPEC memakai PageHeader,
Card, TextField, dan Button dari "@shared", lalu sempurnakan AccountSlot.jsx. Akhiri dengan
npm run verify dan npm run check:scope -- auth, lalu isi tabel "Prinsip IMK yang diterapkan".
```
