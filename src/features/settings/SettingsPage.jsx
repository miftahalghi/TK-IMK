import { FeaturePlaceholder, PageHeader, useSettings } from "@shared";
import styles from "./settings.module.css";

/** PLACEHOLDER: ganti seluruh isi file ini (SPEC.md). */
export default function SettingsPage() {
  const settings = useSettings();

  return (
    <div className={styles.page}>
      <PageHeader title="Pengaturan" description="Lokasi tersimpan, tampilan, dan peringatan." />
      <FeaturePlaceholder
        feature="settings"
        owner="Anggota 4"
        title="Pengaturan akun"
        items={[
          "Lokasi default saat aplikasi dibuka",
          "Lokasi tersimpan berlabel (Rumah, Kantor, Kampus), maksimal 5; hapus bisa diurungkan",
          "Tema: Terang / Gelap / Ikuti sistem (SegmentedControl)",
          "Ambang banner peringatan ISPU",
          "“Kembalikan ke awal” dengan ConfirmDialog",
        ]}
      />
      <p className={styles.check}>
        Cek data: tema “{settings.theme}”, ambang peringatan {settings.alertThreshold ?? "mati"}.
      </p>
    </div>
  );
}
