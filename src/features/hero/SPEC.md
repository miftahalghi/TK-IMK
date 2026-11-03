# SPEC: Fitur `hero` (Pencarian dan Kartu Utama)

**Pemilik:** Anggota 5 · **Folder:** `src/features/hero/` · **Branch:** `fitur/hero`
**Baca dulu:** `CONTRACT.md` (terutama §8 Prinsip IMK)

## Tujuan
Dalam sekali lihat, pengguna tahu **seberapa aman udara di lokasinya sekarang** dan **apa yang harus dilakukan**. Pengguna juga bisa mencari lokasi lain.

Ini bagian paling penting di situs. Uji usability akan menanyakan "Perlu pakai masker hari ini?", dan jawabannya harus ditemukan di sini dalam ≤ 10 detik.

## Tampil di
Slot `dashboard-top` (`HeroSection.jsx`): bagian tengah atas Beranda.

## Referensi Figma (opsional, sketsa kasar)
`Cuaca_part1` → Desktop - 1: search bar `12:39` (pill abu, tinggi ±63 px), kartu utama `12:37` (±680 × 299, radius 15), kotak ISPU `48:278`.
Ambil gambaran umumnya saja. **Hierarki di Figma tidak dipakai**: di Figma jam "12.00" (64 px) lebih menonjol daripada ISPU, padahal yang utama adalah ISPU dan tindakan (N8).

## Yang sudah tersedia (`@shared`)
- `useActiveLocation()` → `{ locationId, location, setLocationId }`. Mengganti lokasi tercatat di URL, jadi tombol Back membatalkannya, dan otomatis memperbarui fitur lain.
- `useLocations()`, `useCurrent(locationId)` → `{ data: Reading, assessment, status, reload }`.
- `getSummary(assessment)`, `ISPU_ADVICE`, `UV_ADVICE`, `POLLUTANTS`.
- Komponen: `Card`, `CategoryPill`, `UvPill`, `CategoryLegend`, `InfoTip`, `Skeleton`, `ErrorState`, `Icon` (`search`, `pin`, `sun`, `clock`, `keyboard`).
- `useSettings().savedLocations`, `useAuth().user` untuk chip lokasi tersimpan.
- `useToast()` untuk umpan balik.
- `formatTime`, `formatDate`.
- Placeholder saat ini berisi `<select>` sementara. **Hapus** dan ganti dengan pencarian sungguhan.

## Kebutuhan

### Pencarian
1. Input dengan ikon search, `<label>` (boleh `visually-hidden`), placeholder "Cari lokasi, misalnya Bandung".
2. Saran muncul saat mengetik: cocokkan `name`, `region`, dan `aliases` (jika ada) tanpa membedakan huruf besar-kecil. Contoh: mengetik "Bogor" menemukan Jabodetabek. Saat input kosong dan fokus, tampilkan semua lokasi. Setiap saran menampilkan nama, wilayah, dan `CategoryPill` kecil. Jika yang cocok adalah alias, tampilkan keterangan "mencakup Bogor".
3. **Pola combobox ARIA:** `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`; daftar `role="listbox"`, item `role="option"`.
4. Keyboard: ↑/↓ memilih, Enter menetapkan, Esc menutup. Klik di luar juga menutup.
5. Tidak ada hasil → "Lokasi tidak ditemukan. Coba nama kota lain." beserta daftar lokasi yang tersedia.
6. Memilih lokasi → `setLocationId(id)`, input dikosongkan, daftar ditutup, fokus kembali ke input.
7. **Jalan pintas `/`**: menekan `/` di mana pun di Beranda (kecuali saat mengetik di input lain) memfokuskan pencarian. Tampilkan petunjuk kecil di dalam input: "Tekan / untuk mencari".
8. **Chip lokasi tersimpan** di bawah pencarian (hanya saat login dan `savedLocations` tidak kosong): "Rumah · Bandung". Klik chip → `setLocationId`. Chip yang aktif ditandai (`aria-pressed`).

### Kartu utama (urutan prioritas visual, dari paling menonjol)
9. **ISPU**: angka besar di kotak berwarna kategori, label "ISPU" dengan `<InfoTip term="ispu" />`, dan nama kategori (teks, bukan hanya warna).
10. **Tindakan yang disarankan**: `getSummary(assessment)`, ukuran teks besar (≥ `--fs-md`). Ini jawaban untuk "perlu masker?".
11. **Polutan dominan**: "Polutan dominan: PM2.5 (Partikulat halus)" + `<InfoTip term="polutan-dominan" />`.
12. **UV Index**: `UvPill` + satu kalimat dari `UV_ADVICE[level]` + `<InfoTip term="uv" />`.
13. **Lokasi dan waktu**, teks kecil sekunder: ikon pin + "Jabodetabek, DKI Jakarta, Jawa Barat, Banten" (dari `location.name` + `location.region`), lalu "Diperbarui 12.00 · 26 Okt 2026" (dari `reading.time`).
14. **Legenda**: `<CategoryLegend compact highlight={assessment.category} />` di bawah kartu, supaya arti warna tidak perlu diingat.

### State
15. Memuat: skeleton berbentuk serupa kartu (kotak ISPU, dua baris teks).
16. Gagal: `ErrorState` dengan `onRetry={current.reload}`.
17. ISPU `null`: kotak abu "Data tidak tersedia" dan penjelasan singkat. Bagian UV tetap tampil bila ada.

## Di luar scope
- Geolokasi perangkat, lokasi di luar 9 lokasi yang tersedia.
- Grafik (ada di fitur `outlook`).

## Checklist IMK
| Kode | Harus terlihat di fitur ini |
|---|---|
| N1 / S3 | Skeleton saat memuat; waktu pembaruan terlihat; kartu berganti segera setelah lokasi dipilih |
| N2 | "ISPU", bukan "AQI"; nama polutan lengkap; kalimat tindakan dalam bahasa sehari-hari |
| N3 / S6 | Ganti lokasi lewat `setLocationId` (Back membatalkan); Esc menutup daftar saran |
| N4 / S1 | Memakai `Card`, `CategoryPill`, `UvPill`, `InfoTip`, `CategoryLegend` dari `@shared` |
| N5 / S5 | Pencarian berbasis saran (pengguna memilih, tidak harus mengetik persis) |
| N6 / S8 | Legenda kategori di bawah kartu; chip lokasi tersimpan; saran muncul saat input difokus |
| N7 | Jalan pintas `/`; navigasi saran dengan panah dan Enter |
| N8 | ISPU dan tindakan paling menonjol; jam dan tanggal kecil; tanpa data cuaca |
| N9 | Pesan "Lokasi tidak ditemukan" yang memberi jalan keluar |
| N10 | `InfoTip` pada ISPU, polutan dominan, dan UV |
| S2 | Combobox ARIA; kontras dari token; semua bisa dengan keyboard |

## Kriteria selesai
- [ ] Data cuaca dari Figma tidak muncul sama sekali.
- [ ] Mencari "ban" menampilkan Bandung dan Serang (Banten), mencari "bogor" menampilkan Jabodetabek. Memilihnya mengubah kartu utama, panel kanan, dan bagian bawah.
- [ ] Setelah memilih lokasi, tombol **Back** browser kembali ke lokasi sebelumnya.
- [ ] Tekan `/` → fokus pindah ke pencarian.
- [ ] Combobox bisa dipakai penuh dengan keyboard dan diumumkan benar oleh pembaca layar.
- [ ] Di mode `mock`, Medan (PM2.5 null) tampil benar, dengan polutan dominan dari data yang ada.
- [ ] `?simulasi=kosong` → "Data tidak tersedia", tidak crash.
- [ ] Dalam uji singkat ke 2 teman, pertanyaan "perlu masker hari ini?" terjawab ≤ 10 detik.
- [ ] Semua baris di checklist IMK terpenuhi.
- [ ] Rapi di 390 px (elemen kartu tersusun vertikal) dan 1440 px, terang dan gelap.
- [ ] Checklist Definition of Done di `CONTRACT.md` §9.

## Prompt awal untuk AI agent
```
Kerjakan fitur "hero" di repo ini. Ini tugas mata kuliah IMK: ikuti prinsip Nielsen
dan Shneiderman di CONTRACT.md §8. Baca AGENTS.md, CONTRACT.md, dan
src/features/hero/SPEC.md dulu. Tulis kode hanya di src/features/hero/.
Ganti placeholder HeroSection.jsx dengan combobox pencarian + kartu utama sesuai SPEC,
memakai komponen dari "@shared". ISPU dan tindakan harus menjadi elemen paling menonjol.
Akhiri dengan npm run verify dan npm run check:scope -- hero, lalu isi tabel
"Prinsip IMK yang diterapkan" untuk laporan PR.
```
