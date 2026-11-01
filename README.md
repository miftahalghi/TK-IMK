# Kualitas Udara

Dashboard kualitas udara (ISPU) dan UV Index untuk pekerja kantoran dan mahasiswa.
Data: PM2.5, PM10, CO, NO₂, SO₂, UV Index.

Tugas mata kuliah **Interaksi Manusia dan Komputer**. Website dibangun mengikuti 10 heuristik **Nielsen** dan 8 aturan emas **Shneiderman** ([CONTRACT.md §8](CONTRACT.md)).

## Mulai

Butuh Node.js 20 atau lebih baru.

```bash
npm install
npm run dev        # buka http://localhost:5173
```

## Untuk anggota kelompok

Setiap anggota mengerjakan **satu fitur** di foldernya sendiri:

| Fitur | Pemilik | Folder | Tugas |
|---|---|---|---|
| Masuk dan Akun | Anggota 1 | `src/features/auth/` | [SPEC](src/features/auth/SPEC.md) |
| Peta | Anggota 2 | `src/features/maps/` | [SPEC](src/features/maps/SPEC.md) |
| Tips | Anggota 3 | `src/features/tips/` | [SPEC](src/features/tips/SPEC.md) |
| Pengaturan | Anggota 4 | `src/features/settings/` | [SPEC](src/features/settings/SPEC.md) |
| Pencarian + Kartu Utama | Anggota 5 | `src/features/hero/` | [SPEC](src/features/hero/SPEC.md) |
| Rekomendasi + Polutan + Daerah | Anggota 6 | `src/features/insights/` | [SPEC](src/features/insights/SPEC.md) |
| Per Jam + 7 Hari | Anggota 7 | `src/features/outlook/` | [SPEC](src/features/outlook/SPEC.md) |

Tidak perlu membuat desain di Figma dulu. Langsung coding dengan komponen `@shared`, supaya tampilan ketujuh fitur otomatis seragam.

**Langkah kerja:**

1. Clone repo, `npm install`, `npm run dev`.
2. Buat branch: `git checkout -b fitur/<id>` (misalnya `fitur/maps`).
3. Baca **[CONTRACT.md](CONTRACT.md)** (terutama §8 Prinsip IMK) dan `SPEC.md` fiturmu.
4. Vibe coding. Agent (Claude Code, Cursor, Copilot, dll.) otomatis membaca `AGENTS.md`/`CLAUDE.md`. Prompt awal ada di bagian bawah setiap SPEC.md.
5. Sebelum PR:
   ```bash
   npm run verify                 # lint + test + build
   npm run check:scope -- <id>    # pastikan hanya folder fiturmu yang berubah
   ```
6. Push dan buat Pull Request ke `main`. Isi template PR, termasuk tabel **Prinsip IMK yang diterapkan**.

**Aturan paling penting:** ubah file **hanya** di `src/features/<id-kamu>/`. Butuh sesuatu di luar itu? Tulis usulan di PR.

## Struktur

```
src/
├── app/              kerangka: shell + sidebar, bar konteks, routing, grid Beranda   (koordinator)
├── shared/           API bersama, diimpor lewat "@shared"                  (koordinator)
│   ├── aqi.js            aturan ISPU & UV (+ tes)
│   ├── data/             dataService, mock data, hooks
│   ├── state/            lokasi aktif (di URL), auth (mock), pengaturan, toast
│   ├── content/          teks rekomendasi, edukasi, dan glosarium
│   ├── components/       Button, TextField, SegmentedControl, ConfirmDialog, InfoTip,
│   │                     PageHeader, CategoryLegend, Card, CategoryPill, UvPill, Skeleton, Icon
│   └── styles/           tokens.css (warna, font, jarak; kontras dites), base.css
└── features/
    ├── registry.js       daftar 7 fitur                                    (koordinator)
    └── <id>/             satu folder per anggota: index.js, SPEC.md, komponen
```

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | server pengembangan |
| `npm run build` | build produksi ke `dist/` |
| `npm run preview` | menjalankan hasil build |
| `npm run lint` | ESLint, termasuk aturan batas impor fitur |
| `npm test` | unit test (Vitest) |
| `npm run verify` | lint + test + build |
| `npm run check:scope -- <id>` | cek perubahan branch hanya di folder fitur |

## Menguji state UI

Tambahkan ke alamat di browser: `?simulasi=lambat`, `?simulasi=gagal`, atau `?simulasi=kosong`.

## Dokumen

- [docs/PRD.md](docs/PRD.md): kebutuhan produk dan aturan ISPU
- [CONTRACT.md](CONTRACT.md): aturan kerja yang mengikat
- `src/features/<id>/SPEC.md`: tugas per fitur

Desain awal: Figma `Cuaca_part1` → frame Desktop - 1 (sketsa kasar; website dan prinsip IMK yang menjadi acuan).
