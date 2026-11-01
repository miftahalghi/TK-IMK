import { FeaturePlaceholder, useActiveLocation, useDaily, useHourly } from "@shared";
import styles from "./outlook.module.css";

/** PLACEHOLDER: ganti seluruh isi file ini (SPEC.md). */
export function OutlookPanel() {
  const { locationId } = useActiveLocation();
  const hourly = useHourly(locationId, { hours: 24 });
  const daily = useDaily(locationId, { days: 7 });

  return (
    <div className={styles.panel}>
      <FeaturePlaceholder
        feature="outlook"
        owner="Anggota 7"
        title="Per jam dan 7 hari"
        items={[
          "Pilihan “Hari Ini” / “7 Hari” (ganti “< Week >” di Figma)",
          "Kartu per jam: ISPU + warna kategori + UV (node 29:139)",
          "Tanda “Waktu terbaik keluar” (06.00–21.00)",
          "7 baris harian: hari, tanggal, ISPU rata-rata, UV maks (node 39:151)",
        ]}
      />
      <p className={styles.check}>
        Cek data: {hourly.status === "success" ? `${hourly.data.length} jam` : "…"} ·{" "}
        {daily.status === "success" ? `${daily.data.length} hari` : "…"} untuk {locationId}.
      </p>
    </div>
  );
}
