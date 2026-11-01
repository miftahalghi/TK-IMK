import { FeaturePlaceholder, useActiveLocation, useCurrent, getRecommendations } from "@shared";
import styles from "./insights.module.css";

/**
 * PLACEHOLDER: ganti seluruh isi file ini (SPEC.md).
 * Tata letak mengikuti Figma: dua kartu kiri (12:43, 12:46) dan satu kartu kanan (12:48).
 */
export function InsightsSection() {
  const { locationId } = useActiveLocation();
  const { assessment } = useCurrent(locationId);
  const recs = getRecommendations(assessment);

  return (
    <div className={styles.grid}>
      <div className={styles.health}>
        <FeaturePlaceholder
          feature="insights"
          owner="Anggota 6"
          title="Rekomendasi Sehat"
          items={[`Carousel ${recs.length || "3–5"} rekomendasi dari getRecommendations()`, "Figma node 12:43"]}
        />
      </div>
      <div className={styles.pollutants}>
        <FeaturePlaceholder
          feature="insights"
          owner="Anggota 6"
          title="Rincian Polutan"
          items={["PM2.5, PM10, CO, NO₂, SO₂ + bar sub-indeks", "Mengisi kartu kosong di Figma (node 12:46)"]}
        />
      </div>
      <div className={styles.regions}>
        <FeaturePlaceholder
          feature="insights"
          owner="Anggota 6"
          title="Kualitas Udara Daerah"
          items={["Daftar lokasi: ISPU + kategori, polutan dominan, UV", "Klik baris → ganti lokasi aktif", "Figma node 12:48"]}
        />
      </div>
    </div>
  );
}
