import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../shared/components/Icon.jsx";
import { Button, CategoryLegend, InfoTip } from "../shared/components/controls.jsx";
import styles from "../shared/components/components.module.css";
import { useActiveLocation } from "../shared/state/LocationContext.jsx";
import { useSourceInfo } from "../shared/data/hooks.js";
import { storage } from "../shared/storage.js";
import { formatDate, formatTime } from "../shared/format.js";

/**
 * Bar konteks di atas setiap halaman (Nielsen N1, visibilitas status sistem):
 * pengguna selalu tahu lokasi mana yang sedang dilihat dan dari mana datanya.
 *   mock     → "Data simulasi"
 *   dataset  → "Data Open-Meteo per 26 Okt 2026, 12.00 WIB" (bukan data real-time)
 */
export function ContextBar() {
  const { location, locationId } = useActiveLocation();
  const source = useSourceInfo();
  const info = source.status === "success" ? source.data : null;
  const label =
    info?.kind === "dataset" ? `Data Open-Meteo per ${formatDate(info.updatedAt)}, ${formatTime(info.updatedAt)} WIB` : info?.label;

  return (
    <div className={styles.contextBar}>
      <span className={styles.contextLocation}>
        <Icon name="pin" size={18} />
        <span>
          <span className="visually-hidden">Lokasi yang dilihat: </span>
          {location ? `${location.name}, ${location.region}` : locationId}
        </span>
      </span>
      {info && (
        <span className={styles.sourceBadge}>
          {label}
          <InfoTip label="Sumber data" text={info.description} term={info.kind === "mock" ? "data-simulasi" : "sumber-data"} />
        </span>
      )}
    </div>
  );
}

const WELCOME_KEY = "welcome-dismissed";

/**
 * Kartu sambutan untuk pengunjung pertama (Nielsen N10 bantuan, Shneiderman S8 beban memori).
 * Menjelaskan arti ISPU dan warnanya sekali saja; bisa ditutup dan tidak muncul lagi.
 */
export function WelcomeCard() {
  const [hidden, setHidden] = useState(() => storage.get(WELCOME_KEY, false));
  if (hidden) return null;

  const close = () => {
    storage.set(WELCOME_KEY, true);
    setHidden(true);
  };

  return (
    <section className={styles.welcome} aria-labelledby="welcome-title">
      <div className={styles.welcomeHead}>
        <h2 id="welcome-title" className={styles.welcomeTitle}>
          Selamat datang! Begini cara membaca halaman ini
        </h2>
        <Button variant="ghost" size="sm" onClick={close} aria-label="Tutup panduan">
          <Icon name="close" size={18} />
        </Button>
      </div>
      <ul className={styles.welcomeList}>
        <li>
          <strong>ISPU</strong> adalah angka 0–500 yang merangkum kualitas udara. Makin tinggi, makin buruk.
        </li>
        <li>Warna menunjukkan kategorinya:</li>
      </ul>
      <CategoryLegend />
      <ul className={styles.welcomeList}>
        <li>Ganti lokasi lewat kolom pencarian. Tombol Kembali di browser membatalkan pergantian lokasi.</li>
        <li>
          Ikon <Icon name="info" size={14} className="inline-icon" /> menjelaskan istilah. Penjelasan lengkap ada di{" "}
          <Link to="/tips">Tips</Link>.
        </li>
      </ul>
      <div className={styles.welcomeActions}>
        <Button variant="primary" size="sm" onClick={close}>
          Mengerti
        </Button>
      </div>
    </section>
  );
}
