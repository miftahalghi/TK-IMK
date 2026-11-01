import { FeaturePlaceholder, GLOSSARY, PageHeader } from "@shared";
import styles from "./tips.module.css";

/** PLACEHOLDER: ganti seluruh isi file ini (SPEC.md). */
export default function TipsPage() {
  return (
    <div className={styles.page}>
      <PageHeader title="Tips Kualitas Udara" description="Arti setiap angka dan cara melindungi diri." />
      <FeaturePlaceholder
        feature="tips"
        owner="Anggota 3"
        title="Edukasi polutan dan tips harian"
        items={[
          "“Untuk hari ini”: tips sesuai kondisi lokasi aktif",
          "Kartu penjelasan 6 parameter (PM2.5, PM10, CO, NO₂, SO₂, UV)",
          "Panduan per kategori ISPU dan level UV",
          "Setiap istilah di GLOSSARY punya jangkar id=tips-<istilah> (tujuan tautan InfoTip)",
          "Daftar sumber (KLHK, WHO)",
        ]}
      />
      <p className={styles.check}>Cek data: {Object.keys(GLOSSARY).length} istilah glosarium tersedia di @shared.</p>
    </div>
  );
}
