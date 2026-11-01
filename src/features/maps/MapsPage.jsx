import { FeaturePlaceholder, PageHeader, useCurrentAll } from "@shared";
import styles from "./maps.module.css";

/** PLACEHOLDER: ganti seluruh isi file ini (SPEC.md). */
export default function MapsPage() {
  const all = useCurrentAll();

  return (
    <div className={styles.page}>
      <PageHeader title="Peta Kualitas Udara" description="Bandingkan kualitas udara di berbagai kota." />
      <FeaturePlaceholder
        feature="maps"
        owner="Anggota 2"
        title="Peta ISPU per lokasi"
        items={[
          "Peta Leaflet + tile OpenStreetMap (sudah terpasang)",
          "Marker berwarna sesuai kategori ISPU, angka ISPU di marker",
          "Panel detail lokasi + tombol “Lihat di Beranda”",
          "CategoryLegend dan daftar lokasi (untuk layar kecil dan keyboard)",
        ]}
      />
      <p className={styles.check}>
        Cek data: {all.status === "success" ? `${all.data.length} lokasi siap ditampilkan.` : "memuat…"}
      </p>
    </div>
  );
}
