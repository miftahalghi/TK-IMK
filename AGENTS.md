# Instruksi untuk AI coding agent

Proyek ini adalah tugas mata kuliah **Interaksi Manusia dan Komputer**. Yang dinilai adalah website, jadi setiap keputusan tampilan harus mengikuti prinsip **Nielsen** dan **Shneiderman** (`CONTRACT.md` §8).

Proyek dikerjakan oleh tujuh anggota. Setiap anggota memegang **satu fitur** di `src/features/<id>/`.

Sebelum menulis kode, baca berurutan:

1. **`CONTRACT.md`**: aturan yang mengikat (kepemilikan file, impor, kontrak data, **prinsip IMK**).
2. **`src/features/<id>/SPEC.md`**: tugas fitur yang sedang dikerjakan, termasuk checklist IMK.
3. Bila perlu konteks produk: `docs/PRD.md`.

Aturan inti (detail di CONTRACT.md):

- Tulis **hanya** di `src/features/<id>/`. Jangan mengubah `src/shared/`, `src/app/`, `src/features/registry.js`, folder fitur lain, `package.json`, atau file konfigurasi.
- Impor kode bersama **hanya** dari `"@shared"`.
- **Pakai komponen `@shared`** (`Button`, `TextField`, `SegmentedControl`, `ConfirmDialog`, `InfoTip`, `PageHeader`, `CategoryLegend`, `Card`, ...). Jangan membuat versi sendiri.
- Data hanya lewat hooks `@shared` (`useCurrent`, `useHourly`, ...). Tanpa `fetch`, tanpa data palsu.
- Lokasi aktif hanya lewat `useActiveLocation()` (tersimpan di URL). Umpan balik aksi lewat `useToast()`.
- ISPU dan kategori hanya lewat `assess()`. Warna hanya lewat token CSS (`var(--...)`), tanpa kode hex.
- Teks UI dalam Bahasa Indonesia sehari-hari. Istilah teknis diberi `<InfoTip term="...">`. Tidak ada data cuaca.
- Tidak ada perubahan otomatis tanpa aksi pengguna (tanpa auto-scroll, tanpa carousel otomatis).
- Sebelum selesai: `npm run verify` dan `npm run check:scope -- <id>` harus lulus, dan isi tabel "Prinsip IMK yang diterapkan" di laporan.

Figma hanya sketsa kasar. Kalau bertentangan dengan prinsip IMK, ikuti prinsip.

Kalau tugas butuh perubahan di luar folder fitur, **jangan lakukan**. Tulis usulannya untuk koordinator.
