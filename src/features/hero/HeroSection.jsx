import { CategoryPill, FeaturePlaceholder, useActiveLocation, useCurrent, useLocations } from "@shared";
import styles from "./hero.module.css";

/**
 * PLACEHOLDER: ganti seluruh isi file ini (SPEC.md).
 * Pemilih lokasi sementara di bawah membuktikan wiring lokasi aktif:
 * mengganti lokasi di sini ikut mengubah fitur insights dan outlook.
 */
export function HeroSection() {
  const { locationId, setLocationId } = useActiveLocation();
  const locations = useLocations();
  const current = useCurrent(locationId);

  return (
    <div className={styles.wrap}>
      <div className={styles.searchStub}>
        <label htmlFor="hero-location-stub">Lokasi (sementara):</label>
        <select
          id="hero-location-stub"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          disabled={locations.status !== "success"}
        >
          {(locations.data ?? [{ id: locationId, name: locationId }]).map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        {current.assessment && <CategoryPill category={current.assessment.category} value={current.assessment.ispu} size="sm" />}
      </div>
      <FeaturePlaceholder
        feature="hero"
        owner="Anggota 5"
        title="Pencarian lokasi + kartu utama"
        items={[
          "Kolom pencarian dengan saran otomatis (Figma node 12:39)",
          "Kartu utama: lokasi, waktu, ISPU besar + kategori, polutan dominan, ringkasan, UV (node 12:37)",
          "Chip lokasi tersimpan (jika login)",
          "Tanpa data cuaca (suhu, “Cloudy”, angin, kelembapan)",
        ]}
      />
    </div>
  );
}
