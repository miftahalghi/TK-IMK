# Dataset Open-Meteo

`open-meteo.json` adalah rekaman data kualitas udara per jam untuk 9 lokasi di `../locations.js`.

| | |
|---|---|
| Rentang | 1 Oktober 2026 00.00 – 1 November 2026 23.00 WIB (768 jam) |
| Parameter | PM2.5, PM10, CO, NO₂, SO₂ (µg/m³), UV Index |
| Sumber | [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) |
| Model | Copernicus Atmosphere Monitoring Service (CAMS) |
| Lisensi | CC BY 4.0, wajib mencantumkan sumber (sudah ada di `SOURCES` dan InfoTip "Sumber data") |

## Catatan penting
- **Ini perkiraan model, bukan alat ukur di kota.** Satu nilai mewakili wilayah sekitar puluhan kilometer. Karena itu Jakarta, Bogor, Depok, dan Bekasi digabung menjadi satu lokasi "Jabodetabek" (id tetap `jakarta`).
- **Jangan diimpor langsung dari fitur.** Fitur memakai hooks `@shared` (`useCurrent`, `useHourly`, ...). File ini dibaca oleh `../datasetAdapter.js`.
- Data dipakai hanya jika `.env` berisi `VITE_DATA_SOURCE=dataset`. Default proyek tetap `mock`.

## Memperbarui
```bash
npm run fetch:dataset                            # rentang default (1 Okt–1 Nov 2026)
npm run fetch:dataset -- 2026-10-01 2026-11-01   # rentang lain
```
Mengganti rentang juga mengubah tes di `../datasetAdapter.test.js` dan teks di glosarium "sumber-data". Bicarakan dengan kelompok dulu.
