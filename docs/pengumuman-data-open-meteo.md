# Pengumuman untuk grup: data Open-Meteo + Jabodetabek

**Ringkasnya:** sekarang ada data asli dari Open-Meteo. Bogor, Depok, dan Bekasi digabung ke Jakarta menjadi satu lokasi "Jabodetabek". **Kode fitur kalian tidak perlu diubah.**

## Yang perlu kalian lakukan
```bash
git checkout main
git pull origin main
git checkout fitur/<id-kamu>
git merge main          # atau: git rebase main
npm install             # tidak ada package baru, tapi aman dijalankan
```
Selesai. Situs kalian tetap memakai **data simulasi (mock)** seperti sebelumnya.

## Apa yang berubah
1. **Lokasi menjadi 9** (sebelumnya 12): Jabodetabek, Serang, Bandung, Surabaya, Yogyakarta, Denpasar, Medan, Pekanbaru, Ambon.
   - Kenapa digabung: data Open-Meteo memakai model dengan resolusi puluhan km, jadi Jakarta, Bogor, Depok, dan Bekasi bernilai sama persis.
   - **Id Jabodetabek tetap `jakarta`.** Kalau kode kalian memakai `"jakarta"`, tetap jalan.
   - **Jangan memakai id `bogor`, `depok`, atau `bekasi`** lagi. Kalau ada di kode atau tes kalian, ganti dengan lokasi lain.
   - Lokasi Jabodetabek punya field baru `aliases` (Jakarta, Bogor, Depok, Tangerang, Bekasi) untuk pencarian. Field ini opsional; lokasi lain tidak punya.
2. **Data asli tersedia:** rekaman Open-Meteo **1 Okt–1 Nov 2026**, per jam. Situs menganggap "sekarang" adalah **26 Okt 2026, 12.00 WIB**.
3. **Bar sumber data** di atas halaman otomatis menulis "Data simulasi" atau "Data Open-Meteo per 26 Okt 2026, 12.00 WIB". Fitur tidak perlu menampilkan sumber data sendiri.

## Apa yang TIDAK berubah
- Hooks (`useCurrent`, `useHourly`, `useDaily`, `useCurrentAll`, `useLocations`), bentuk data, `assess()`, dan semua komponen `@shared`.
- Default tetap **mock**. Uji tampilan "Berbahaya" dan data kosong tetap di mock (Pekanbaru dan Medan).

## Mencoba data asli di komputer sendiri (opsional)
1. Salin `.env.example` menjadi `.env`.
2. Ubah baris menjadi `VITE_DATA_SOURCE=dataset`.
3. Hentikan lalu jalankan ulang `npm run dev`.

File `.env` tidak ikut ter-commit, jadi tidak memengaruhi anggota lain.

## SPEC yang ikut diperbarui
- `hero`: contoh pencarian ("bogor" → Jabodetabek), dan pencarian juga mencocokkan `aliases`.
- `maps`: 9 marker.
- `settings`: contoh uji banner memakai Serang atau Pekanbaru di mode mock.

Detail lengkap: `CONTRACT.md` §5 dan `src/shared/data/dataset/README.md`.
