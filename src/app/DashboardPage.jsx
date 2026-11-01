import { slotsFor } from "../features/registry.js";
import { FeatureBoundary } from "./FeatureBoundary.jsx";
import { WelcomeCard } from "./ShellParts.jsx";
import styles from "./DashboardPage.module.css";

function Area({ name, className }) {
  const slots = slotsFor(name);
  if (slots.length === 0) return null;
  return (
    <div className={className} data-slot={name}>
      {slots.map(({ feature, component: Slot }) => (
        <FeatureBoundary key={feature.id} feature={feature}>
          <Slot />
        </FeatureBoundary>
      ))}
    </div>
  );
}

/**
 * Halaman Beranda (dashboard).
 *
 *   ┌──────── kartu sambutan (sekali) + dashboard-alert ──────┬─────────────────┐
 *   │ dashboard-top  (pencarian + kartu utama)                 │ dashboard-aside │
 *   ├──────────────────────────────────────────────────────────┤ (per jam/7 hari)│
 *   │ dashboard-bottom (rekomendasi, polutan, daerah)          │                 │
 *   └──────────────────────────────────────────────────────────┴─────────────────┘
 *
 * Isi tiap area berasal dari fitur (features/registry.js). File ini milik koordinator.
 */
export function DashboardPage() {
  return (
    <div className={styles.page}>
      <h1 className="visually-hidden">Beranda: kualitas udara</h1>
      <div className={styles.alert}>
        <WelcomeCard />
        <Area name="dashboard-alert" className={styles.alertSlot} />
      </div>
      <Area name="dashboard-top" className={styles.top} />
      <Area name="dashboard-bottom" className={styles.bottom} />
      <Area name="dashboard-aside" className={styles.aside} />
    </div>
  );
}
