
import { useEffect, useState } from "react";
import {
  PageHeader,
  Card,
  CategoryPill,
  UvPill,
  CategoryLegend,
  Skeleton,
  ErrorState,
  GLOSSARY,
  PARAMETER_INFO,
  ISPU_ADVICE,
  UV_ADVICE,
  CATEGORIES,
  CATEGORY_KEYS,
  UV_LEVELS,
  UV_LEVEL_KEYS,
  SOURCES,
  tipsAnchor,
  useActiveLocation,
  useCurrent,
} from "@shared";

import styles from "./tips.module.css";

const GLOSSARY_KEYS = [
  "kategori",
  "polutan-dominan",
  "sub-indeks",
  "satuan",
  "indikatif",
  "data-simulasi",
];

const CONTENTS = [
  { id: "tips-hari-ini", label: "Untuk hari ini" },
  { id: "tips-ispu", label: "Apa itu ISPU?" },
  { id: "tips-istilah", label: "Istilah penting" },
  { id: "tips-polutan", label: "Kenali polutan" },
  { id: "tips-kategori", label: "Panduan kategori ISPU" },
  { id: "tips-uv", label: "Panduan UV" },
  { id: "tips-sumber", label: "Sumber informasi" },
  { id: "tips-faq", label: "Pertanyaan umum" },
];


function TipItem({ icon, title, children }) {
  return (
    <div className={styles.tipItem}>
      <span className={styles.tipIcon}>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

function formatRange(item, isUv = false) {
  if (!item) return "-";

  if (isUv && item.max === Infinity) {
    return `${item.min}+`;
  }

  return `${item.min}–${item.max}`;
}

function HighlightedSection({ id, children }) {
  return (
    <div
      id={id}
      className={styles.anchorTarget}
    >
      {children}
    </div>
  );
}

export default function TipsPage() {
  const { locationId, location } = useActiveLocation();
  const current = useCurrent(locationId);

  const [highlighted, setHighlighted] = useState("");

  const assessment = current.assessment;
  const category = assessment?.category;
  const uvLevel = assessment?.uv?.level;

  const locationName =
    location?.name ||
    location?.region ||
    locationId ||
    "Lokasi belum diketahui";

  // Sorot bagian tujuan ketika halaman dibuka melalui InfoTip.
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));

    if (!hash.startsWith("tips-")) return;

    const timer = window.setTimeout(() => {
      const target = document.getElementById(hash);

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        setHighlighted(hash);
      }
    }, 150);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!highlighted) return;

    const timer = window.setTimeout(() => {
      setHighlighted("");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [highlighted]);

  const isHighlighted = (id) =>
    highlighted === id;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Tips Kualitas Udara"
        description="Kenali arti angka kualitas udara dan pelajari cara melindungi diri dalam aktivitas sehari-hari."
      />

      {/* DAFTAR ISI */}
      <nav
        className={styles.contents}
        aria-label="Daftar isi"
      >
        <div className={styles.contentsHeading}>
          <span>☰</span>
          <strong>Jelajahi panduan</strong>
        </div>

        <div className={styles.contentsList}>
          {CONTENTS.map((item, index) => (
            <a
              key={item.id}
              href={`#${item.id}`}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* UNTUK HARI INI */}
      <HighlightedSection id="tips-hari-ini">
        <Card
          title="Untuk hari ini"
          subtitle={`Informasi kualitas udara di ${locationName}`}
          icon="activity"
          className={
            isHighlighted("tips-hari-ini")
              ? styles.highlighted
              : ""
          }
        >
          {current.status === "loading" &&
          !current.data ? (
            <div className={styles.loading}>
              <Skeleton height={65} />
              <Skeleton height={65} />
              <Skeleton height={120} />
            </div>
          ) : current.status === "error" ? (
            <ErrorState
              message="Informasi kualitas udara gagal dimuat."
              onRetry={current.reload}
            />
          ) : !assessment ? (
            <p className={styles.empty}>
              Data kualitas udara belum tersedia
              untuk lokasi ini.
            </p>
          ) : (
            <>
              <div className={styles.todayGrid}>
                <div className={styles.todayMetric}>
                  <span className={styles.metricLabel}>
                    Indeks Standar Pencemar Udara
                  </span>

                  <strong className={styles.metricValue}>
                    {assessment.ispu ?? "-"}
                  </strong>

                  <CategoryPill
                    category={category}
                    value={assessment.ispu}
                  />
                </div>

                <div className={styles.todayMetric}>
                  <span className={styles.metricLabel}>
                    Indeks UV
                  </span>

                  <strong className={styles.metricValue}>
                    {assessment.uv?.value ?? "-"}
                  </strong>

                  <UvPill
                    level={uvLevel}
                    value={assessment.uv?.value}
                  />
                </div>
              </div>

              <div className={styles.locationNote}>
                <span>📍</span>
                <div>
                  <strong>Lokasi aktif: {locationName}</strong>
                  <p>
                    Informasi ini mengikuti lokasi
                    yang sedang dipilih pada aplikasi.
                  </p>
                </div>
              </div>

              {category && (
                <>
                  <h3 className={styles.subHeading}>
                    Apa yang sebaiknya dilakukan?
                  </h3>

                  <div className={styles.tipsGrid}>
                    <TipItem
                      icon="🚶"
                      title="Saat perjalanan"
                    >
                      {ISPU_ADVICE[category].commute}
                    </TipItem>

                    <TipItem
                      icon="🏢"
                      title="Di kantor atau kampus"
                    >
                      {ISPU_ADVICE[category].indoor}
                    </TipItem>

                    <TipItem
                      icon="🏃"
                      title="Olahraga di luar"
                    >
                      {ISPU_ADVICE[category].exercise}
                    </TipItem>
                  </div>
                </>
              )}

              {uvLevel && (
                <TipItem
                  icon="☀️"
                  title={`Perlindungan UV: ${UV_LEVELS[uvLevel].label}`}
                >
                  {UV_ADVICE[uvLevel]}
                </TipItem>
              )}
            </>
          )}
        </Card>
      </HighlightedSection>

      {/* APA ITU ISPU */}
      <HighlightedSection id={tipsAnchor("ispu")}>
        <Card
          title="Apa itu ISPU?"
          subtitle="Mengenal angka yang menunjukkan kualitas udara."
          icon="info"
          className={
            isHighlighted(tipsAnchor("ispu"))
              ? styles.highlighted
              : ""
          }
        >
          <p className={styles.introText}>
            {GLOSSARY.ispu.short}
          </p>

          <div className={styles.legendWrapper}>
            <CategoryLegend />
          </div>

          <h3 className={styles.subHeading}>
            Arti setiap kategori
          </h3>

          <div className={styles.categoryMeaning}>
            {CATEGORY_KEYS.map((key) => {
              const item = CATEGORIES[key];

              return (
                <div
                  key={key}
                  className={styles.meaningItem}
                >
                  <CategoryPill category={key} />

                  <div>
                    <strong>{item.min}–{item.max}</strong>
                    <p>{item.meaning}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </HighlightedSection>

      {/* ISTILAH PENTING */}
      <HighlightedSection id="tips-istilah">
        <Card
          title="Istilah penting"
          subtitle="Beberapa istilah yang sering muncul pada informasi kualitas udara."
          icon="book-open"
        >
          <div className={styles.glossaryList}>
            {GLOSSARY_KEYS.map((key) => (
              <article
                key={key}
                id={tipsAnchor(key)}
                className={`${styles.glossaryItem} ${
                  isHighlighted(tipsAnchor(key))
                    ? styles.highlighted
                    : ""
                }`}
              >
                <h3>{GLOSSARY[key].term}</h3>
                <p>{GLOSSARY[key].short}</p>
              </article>
            ))}
          </div>
        </Card>
      </HighlightedSection>

      {/* KENALI POLUTAN */}
      <HighlightedSection id="tips-polutan">
        <Card
          title="Kenali polutan"
          subtitle="Enam parameter yang digunakan untuk memahami kondisi udara."
          icon="wind"
        >
          <div className={styles.parameterGrid}>
            {Object.entries(PARAMETER_INFO).map(
              ([key, item]) => (
                <article
                  key={key}
                  id={tipsAnchor(key)}
                  className={`${styles.parameterCard} ${
                    isHighlighted(tipsAnchor(key))
                      ? styles.highlighted
                      : ""
                  }`}
                >
                  <div className={styles.parameterHeader}>
                    <span className={styles.parameterLabel}>
                      {item.label}
                    </span>
                    <span className={styles.parameterUnit}>
                      {item.unit || "Tanpa satuan"}
                    </span>
                  </div>

                  <h3>{item.name}</h3>

                  <p className={styles.parameterWhat}>
                    {item.what}
                  </p>

                  <details>
                    <summary>
                      Lihat sumber dan dampak kesehatan
                    </summary>

                    <div className={styles.detailContent}>
                      <strong>Sumber polutan</strong>
                      <p>{item.sources}</p>

                      <strong>Dampak kesehatan</strong>
                      <p>{item.health}</p>
                    </div>
                  </details>
                </article>
              )
            )}
          </div>
        </Card>
      </HighlightedSection>

      {/* PANDUAN KATEGORI ISPU */}
      <HighlightedSection id="tips-kategori">
        <Card
          title="Panduan per kategori ISPU"
          subtitle="Tindakan yang dapat dilakukan berdasarkan tingkat pencemaran udara."
          icon="shield-check"
        >
          <div className={styles.adviceList}>
            {CATEGORY_KEYS.map((key) => {
              const item = CATEGORIES[key];
              const advice = ISPU_ADVICE[key];

              return (
                <article
                  key={key}
                  className={styles.adviceCard}
                >
                  <div className={styles.adviceHeader}>
                    <CategoryPill category={key} />

                    <strong>
                      ISPU {formatRange(item)}
                    </strong>
                  </div>

                  <p className={styles.adviceSummary}>
                    {advice.summary}
                  </p>

                  <div className={styles.adviceTips}>
                    <TipItem icon="🚶" title="Perjalanan">
                      {advice.commute}
                    </TipItem>

                    <TipItem icon="🏢" title="Kantor / kampus">
                      {advice.indoor}
                    </TipItem>

                    <TipItem icon="🏃" title="Olahraga">
                      {advice.exercise}
                    </TipItem>
                  </div>
                </article>
              );
            })}
          </div>
        </Card>
      </HighlightedSection>

      {/* PANDUAN UV */}
      <HighlightedSection id={tipsAnchor("uv")}>
        <Card
          title="Panduan UV Index"
          subtitle="Pahami tingkat paparan sinar ultraviolet dan cara melindungi kulit."
          icon="sun"
          className={
            isHighlighted(tipsAnchor("uv"))
              ? styles.highlighted
              : ""
          }
        >
          <p className={styles.introText}>
            {GLOSSARY.uv.short}
          </p>

          <div className={styles.uvList}>
            {UV_LEVEL_KEYS.map((key) => {
              const item = UV_LEVELS[key];

              return (
                <article
                  key={key}
                  className={styles.uvCard}
                >
                  <div className={styles.uvHeader}>
                    <UvPill level={key} />

                    <strong>
                      UV {formatRange(item, true)}
                    </strong>
                  </div>

                  <p>{UV_ADVICE[key]}</p>
                </article>
              );
            })}
          </div>
        </Card>
      </HighlightedSection>

      {/* SUMBER INFORMASI */}
      <HighlightedSection id="tips-sumber">
        <Card
          title="Sumber informasi"
          subtitle="Referensi yang digunakan sebagai dasar edukasi."
          icon="book"
        >
          <div className={styles.sourceList}>
            {SOURCES.map((source, index) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className={styles.sourceLink}
              >
                <span className={styles.sourceNumber}>
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span>{source.label}</span>

                <span aria-label="Membuka tautan eksternal">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </Card>
      </HighlightedSection>

      {/* FAQ */}
      <HighlightedSection id="tips-faq">
        <Card
          title="Pertanyaan umum"
          subtitle="Jawaban singkat untuk beberapa pertanyaan sehari-hari."
          icon="help-circle"
        >
          <div className={styles.faqList}>
            <details>
              <summary>
                Apakah masker kain cukup untuk melindungi dari PM2.5?
              </summary>

              <p>
                Masker kain tidak memberikan perlindungan
                optimal terhadap partikel sangat halus.
                Masker respirator seperti N95 atau KN95
                dapat menjadi pilihan ketika kualitas udara
                memburuk.
              </p>
            </details>

            <details>
              <summary>
                Apakah AC dapat menyaring PM2.5?
              </summary>

              <p>
                Tidak semua AC memiliki kemampuan menyaring
                PM2.5. Kemampuan penyaringan bergantung
                pada jenis dan kualitas filter yang digunakan.
              </p>
            </details>

            <details>
              <summary>
                Apakah olahraga tetap aman ketika ISPU tinggi?
              </summary>

              <p>
                Sebaiknya kurangi atau pindahkan aktivitas
                olahraga ke dalam ruangan ketika kualitas
                udara memburuk.
              </p>
            </details>

            <details>
              <summary>
                Kapan sebaiknya menggunakan sunscreen?
              </summary>

              <p>
                Gunakan sunscreen ketika terpapar sinar
                matahari, terutama saat indeks UV berada
                pada tingkat sedang hingga ekstrem.
              </p>
            </details>
          </div>
        </Card>
      </HighlightedSection>

      {/* CATATAN */}
      <div className={styles.disclaimer}>
        <span>ⓘ</span>
        <p>
          Informasi ini bersifat umum dan bukan pengganti
          saran medis.
        </p>
      </div>

    </div>
  );
}
