import { categoryInfo, Icon, useActiveLocation, useCurrent, useSettings } from "@shared";
import styles from "./settings.module.css";

/**
 * STARTER: banner peringatan di atas dashboard (slot "dashboard-alert").
 * Muncul saat ISPU lokasi aktif ≥ ambang di pengaturan. Sudah berfungsi minimal;
 * Anggota 4 boleh menyempurnakan tampilan dan perilakunya.
 */
export function AlertBanner() {
  const { alertThreshold } = useSettings();
  const { locationId } = useActiveLocation();
  const { assessment } = useCurrent(locationId);

  if (alertThreshold === null || !assessment || assessment.ispu === null || assessment.ispu < alertThreshold) {
    return null;
  }

  const info = categoryInfo(assessment.category);
  return (
    <div className={styles.banner} role="status">
      <Icon name="alert" />
      <p>
        <strong>Peringatan kualitas udara.</strong> ISPU di lokasi Anda {assessment.ispu} ({info.label}), melewati batas{" "}
        {alertThreshold} yang Anda atur.
      </p>
    </div>
  );
}
