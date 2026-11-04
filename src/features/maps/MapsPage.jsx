import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import {
  assess,
  Button,
  Card,
  CategoryLegend,
  CategoryPill,
  categoryInfo,
  EmptyState,
  ErrorState,
  formatConcentration,
  formatDateTime,
  formatNumber,
  getSummary,
  InfoTip,
  PageHeader,
  POLLUTANT_KEYS,
  POLLUTANTS,
  SegmentedControl,
  Skeleton,
  useActiveLocation,
  useCurrentAll,
  useLocations,
  useToast,
  UV_LEVEL_KEYS,
  UV_LEVELS,
  uvLevelInfo,
  UvPill,
} from "@shared";
import styles from "./maps.module.css";

const INDONESIA_CENTER = [-2.5, 118];
const DEFAULT_ZOOM = 5;

const METRIC_OPTIONS = [
  { value: "ispu", label: "ISPU" },
  { value: "pm25", label: "PM2.5" },
  { value: "uv", label: "UV" },
];

function getCoverageText(location) {
  if (!location) return null;
  if (location.id === "jakarta") {
    return "Mencakup Jakarta, Bogor, Depok, Bekasi, dan Tangerang";
  }
  if (location.aliases?.length) {
    return `Mencakup ${location.aliases.join(", ")}`;
  }
  return null;
}

function getMetricDisplay(item, metric) {
  const { assessment } = item;
  if (metric === "pm25") {
    const pm = assessment.pollutants.pm25;
    const info = categoryInfo(pm.category);
    return {
      numericValue: pm.ispu,
      displayValue: pm.ispu !== null ? formatNumber(pm.ispu, 0) : "–",
      info,
      category: pm.category,
      uvLevel: null,
      metricLabel: "Indeks PM2.5",
    };
  }
  if (metric === "uv") {
    const { uv } = assessment;
    const rounded = typeof uv.value === "number" ? Math.round(uv.value) : null;
    const info = uvLevelInfo(uv.level);
    return {
      numericValue: uv.value,
      displayValue: rounded !== null ? formatNumber(rounded, 0) : "–",
      info,
      category: null,
      uvLevel: uv.level,
      metricLabel: "UV Index",
    };
  }
  const info = categoryInfo(assessment.category);
  return {
    numericValue: assessment.ispu,
    displayValue: assessment.ispu !== null ? formatNumber(assessment.ispu, 0) : "–",
    info,
    category: assessment.category,
    uvLevel: null,
    metricLabel: "ISPU",
  };
}

const iconCache = new Map();

function getMarkerIcon({ displayValue, colorVar, onColorVar, isSelected, isActive }) {
  const key = `${displayValue}|${colorVar}|${onColorVar}|${isSelected ? 1 : 0}|${isActive ? 1 : 0}`;
  let cached = iconCache.get(key);
  if (!cached) {
    const size = isSelected ? 46 : 40;
    const anchor = size / 2;
    const badgeClass = [
      styles.markerBadge,
      isActive ? styles.markerBadgeActive : "",
      isSelected ? styles.markerBadgeSelected : "",
    ]
      .filter(Boolean)
      .join(" ");

    cached = L.divIcon({
      className: styles.leafletMarkerWrapper,
      iconSize: [size, size],
      iconAnchor: [anchor, anchor],
      tooltipAnchor: [0, -anchor],
      html: `<span class="${badgeClass}" style="background: var(${colorVar}); color: var(${onColorVar});"><span class="${styles.markerNumber}">${displayValue}</span></span>`,
    });
    iconCache.set(key, cached);
  }
  return cached;
}

function friendlyErrorMessage(error) {
  const raw = error?.message ?? "";
  if (raw.includes("simulasi")) return raw;
  return "Data peta kualitas udara belum dapat dimuat saat ini. Silakan coba lagi.";
}

function uvRangeLabel(key) {
  const info = UV_LEVELS[key];
  if (key === "ekstrem") return `${info.min}+`;
  return `${info.min}–${info.max}`;
}

function MapsLoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat peta kualitas udara">
      <p className="visually-hidden" role="status">
        Memuat data kualitas udara untuk semua lokasi…
      </p>
      <div className={styles.legendBar}>
        <Skeleton width="220px" height={20} />
        <Skeleton width="100%" height={28} />
      </div>
      <div className={styles.workspace} style={{ marginTop: "var(--space-5)" }}>
        <div className={styles.listColumn}>
          <Card title="Daftar Lokasi" subtitle="Memuat urutan lokasi…">
            <div className={styles.skeletonList}>
              {Array.from({ length: 9 }, (_, idx) => (
                <Skeleton key={idx} height={52} />
              ))}
            </div>
          </Card>
        </div>
        <div className={styles.mapColumn}>
          <div className={styles.mapCard}>
            <Skeleton width="180px" height={24} />
            <Skeleton className={styles.skeletonMap} height="min(70vh, 540px)" />
          </div>
          <Card title="Detail Lokasi">
            <Skeleton height={160} />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function MapsPage() {
  const { locationId, setLocationId } = useActiveLocation();
  const toast = useToast();
  const locationsResult = useLocations();
  const readingsResult = useCurrentAll();

  const [selectedId, setSelectedId] = useState(locationId);
  const [panelOpen, setPanelOpen] = useState(true);
  const [metric, setMetric] = useState("ispu");

  // Sinkronkan lokasi terpilih saat lokasi aktif berubah (misalnya lewat tombol Back browser).
  useEffect(() => {
    setSelectedId(locationId);
    setPanelOpen(true);
  }, [locationId]);

  // Tombol Esc menutup panel detail, kecuali jika ada popover/menu lain yang sedang terbuka.
  useEffect(() => {
    if (!panelOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (document.querySelector('[aria-expanded="true"]')) return;
      setPanelOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panelOpen]);

  const items = useMemo(() => {
    if (!locationsResult.data || !readingsResult.data) return [];
    const readingById = new Map(readingsResult.data.map((r) => [r.locationId, r]));
    return locationsResult.data.map((location) => {
      const reading = readingById.get(location.id) ?? null;
      const assessment = assess(reading);
      return { location, reading, assessment };
    });
  }, [locationsResult.data, readingsResult.data]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const valA = getMetricDisplay(a, metric).numericValue;
      const valB = getMetricDisplay(b, metric).numericValue;
      if (valA === null && valB === null) return a.location.name.localeCompare(b.location.name, "id");
      if (valA === null) return 1;
      if (valB === null) return -1;
      if (valB !== valA) return valB - valA;
      return a.location.name.localeCompare(b.location.name, "id");
    });
  }, [items, metric]);

  const selectedItem = useMemo(() => {
    if (items.length === 0) return null;
    return items.find((it) => it.location.id === selectedId) ?? items.find((it) => it.location.id === locationId) ?? items[0];
  }, [items, selectedId, locationId]);

  const allReadingsEmpty = useMemo(() => {
    if (items.length === 0) return false;
    return items.every((it) => it.assessment.ispu === null && it.assessment.uv.value === null);
  }, [items]);

  const isLoading =
    (locationsResult.status === "loading" && !locationsResult.data) ||
    (readingsResult.status === "loading" && !readingsResult.data);

  const errorObj =
    locationsResult.status === "error"
      ? locationsResult.error
      : readingsResult.status === "error"
        ? readingsResult.error
        : null;

  const handleRetry = () => {
    locationsResult.reload();
    readingsResult.reload();
  };

  const handleSelectLocation = (id) => {
    setSelectedId(id);
    setPanelOpen(true);
  };

  const handleViewOnDashboard = (location) => {
    setLocationId(location.id, { to: "/" });
    toast.show(`Menampilkan ${location.name} di Beranda.`);
  };

  const selectedMetric = selectedItem ? getMetricDisplay(selectedItem, metric) : null;
  const highlightedCategory =
    panelOpen && selectedMetric && metric !== "uv" ? selectedMetric.category : undefined;
  const highlightedUvLevel =
    panelOpen && selectedMetric && metric === "uv" ? selectedMetric.uvLevel : undefined;

  const latestTime = selectedItem?.reading?.time ?? items[0]?.reading?.time ?? null;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Peta Kualitas Udara"
        description="Pilih lokasi di peta atau di daftar untuk melihat detailnya."
        actions={
          <SegmentedControl
            label="Parameter warna di peta"
            value={metric}
            onChange={setMetric}
            options={METRIC_OPTIONS}
          />
        }
      />

      {errorObj ? (
        <ErrorState message={friendlyErrorMessage(errorObj)} onRetry={handleRetry} />
      ) : isLoading ? (
        <MapsLoadingSkeleton />
      ) : items.length === 0 ? (
        <EmptyState message="Daftar lokasi belum tersedia saat ini." />
      ) : (
        <>
          {allReadingsEmpty && (
            <EmptyState message="Data pengukuran kualitas udara sedang tidak tersedia untuk semua lokasi." />
          )}

          {/* Legenda selalu terlihat di atas area peta & daftar (N6, S8) */}
          <section className={styles.legendBar} aria-label="Panduan kategori warna peta">
            <div className={styles.legendHeader}>
              <span className={styles.legendTitleGroup}>
                <span>Kategori ISPU</span>
                <InfoTip term="kategori" />
              </span>
              <span className={styles.legendHint}>
                Angka di dalam marker menunjukkan nilai {metric === "uv" ? "UV Index" : metric === "pm25" ? "indeks PM2.5" : "ISPU"} saat ini
              </span>
            </div>
            <CategoryLegend highlight={highlightedCategory} />

            {metric === "uv" && (
              <ul className={styles.uvLegend} aria-label="Arti warna level UV Index">
                {UV_LEVEL_KEYS.map((key) => {
                  const info = UV_LEVELS[key];
                  const active = key === highlightedUvLevel;
                  return (
                    <li
                      key={key}
                      className={`${styles.uvLegendItem} ${active ? styles.uvLegendItemActive : ""}`}
                      aria-current={active || undefined}
                    >
                      <span
                        className={styles.uvSwatch}
                        style={{ background: `var(${info.colorVar})` }}
                        aria-hidden="true"
                      />
                      <span>UV {info.label}</span>
                      <span className={styles.uvRange}>{uvRangeLabel(key)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div className={styles.workspace}>
            {/* Daftar lokasi ditempatkan lebih dulu di DOM agar di layar sempit tampil di atas peta
                dan pengguna keyboard langsung menjangkau daftar lokasi (SPEC.md #8, S2). */}
            <div className={styles.listColumn}>
              <Card
                id="daftar-lokasi-peta"
                title="Daftar Lokasi"
                subtitle={
                  metric === "uv"
                    ? "Diurutkan dari UV Index tertinggi"
                    : metric === "pm25"
                      ? "Diurutkan dari indeks PM2.5 tertinggi"
                      : "Diurutkan dari ISPU tertinggi"
                }
                icon="pin"
              >
                <ol className={styles.locationList} aria-label="Daftar lokasi kualitas udara">
                  {sortedItems.map((item) => {
                    const { location, assessment } = item;
                    const isSelected = panelOpen && selectedItem?.location.id === location.id;
                    const isActive = location.id === locationId;
                    const coverage = getCoverageText(location);
                    const dominantInfo = assessment.dominant ? POLLUTANTS[assessment.dominant] : null;

                    return (
                      <li key={location.id} className={styles.locationItem}>
                        <button
                          type="button"
                          className={`${styles.locationButton} ${isSelected ? styles.locationButtonSelected : ""}`}
                          aria-pressed={isSelected}
                          onClick={() => handleSelectLocation(location.id)}
                        >
                          <span className={styles.locationInfo}>
                            <span className={styles.locationNameRow}>
                              <span className={styles.locationName}>{location.name}</span>
                              {isActive && <span className={styles.activeTag}>Lokasi aktif</span>}
                            </span>
                            <span className={styles.locationSub}>
                              {coverage
                                ? coverage
                                : dominantInfo
                                  ? `${location.region} · Dominan ${dominantInfo.label}`
                                  : location.region}
                            </span>
                          </span>
                          <span className={styles.locationPillWrap}>
                            {metric === "uv" ? (
                              <UvPill level={assessment.uv.level} value={assessment.uv.value} size="sm" />
                            ) : metric === "pm25" ? (
                              <CategoryPill
                                category={assessment.pollutants.pm25.category}
                                value={assessment.pollutants.pm25.ispu}
                                size="sm"
                              />
                            ) : (
                              <CategoryPill category={assessment.category} value={assessment.ispu} size="sm" />
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </Card>
            </div>

            <div className={styles.mapColumn}>
              <section className={styles.mapCard} aria-labelledby="peta-sebaran-judul">
                <div className={styles.mapCardHeader}>
                  <h2 id="peta-sebaran-judul" className={styles.mapCardTitle}>
                    Peta Sebaran ({items.length} lokasi)
                  </h2>
                  {latestTime && (
                    <span className={styles.mapCardMeta}>Diperbarui {formatDateTime(latestTime)} WIB</span>
                  )}
                </div>

                <div className={styles.mapContainerWrap}>
                  <MapContainer
                    center={INDONESIA_CENTER}
                    zoom={DEFAULT_ZOOM}
                    scrollWheelZoom={true}
                    className={styles.map}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {items.map((item) => {
                      const { location } = item;
                      const m = getMetricDisplay(item, metric);
                      const isSelected = panelOpen && selectedItem?.location.id === location.id;
                      const isActive = location.id === locationId;
                      const markerLabel = `${location.name}: ${m.metricLabel} ${m.displayValue} (${m.info.label})`;

                      const icon = getMarkerIcon({
                        displayValue: m.displayValue,
                        colorVar: m.info.colorVar,
                        onColorVar: m.info.onColorVar,
                        isSelected,
                        isActive,
                      });

                      return (
                        <Marker
                          key={location.id}
                          position={[location.lat, location.lon]}
                          icon={icon}
                          title={markerLabel}
                          alt={markerLabel}
                          zIndexOffset={isSelected ? 1000 : isActive ? 500 : Math.round(m.numericValue ?? 0)}
                          eventHandlers={{
                            click: () => handleSelectLocation(location.id),
                            keydown: (e) => {
                              const key = e.originalEvent?.key;
                              if (key === "Enter" || key === " ") {
                                e.originalEvent.preventDefault();
                                handleSelectLocation(location.id);
                              }
                            },
                          }}
                        >
                          <Tooltip direction="top" offset={[0, -18]}>
                            <strong>{location.name}</strong> · {m.metricLabel} {m.displayValue} ({m.info.label})
                          </Tooltip>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>

                <div className={styles.mapFooter}>
                  <span>Garis tepi tebal menandai lokasi yang sedang dibuka.</span>
                  <span>Klik lingkaran lokasi untuk melihat rincian polutan.</span>
                </div>
              </section>

              {/* Panel Detail Lokasi (SPEC.md #4, #5, #6) */}
              {selectedItem &&
                (panelOpen ? (
                  <DetailPanel
                    item={selectedItem}
                    isActiveLocation={selectedItem.location.id === locationId}
                    onClose={() => setPanelOpen(false)}
                    onViewDashboard={() => handleViewOnDashboard(selectedItem.location)}
                  />
                ) : (
                  <div className={styles.closedPanelBar}>
                    <span>Detail lokasi disembunyikan. Pilih lokasi di peta atau daftar untuk membuka kembali.</span>
                    <Button variant="secondary" size="sm" onClick={() => setPanelOpen(true)}>
                      Buka detail {selectedItem.location.name}
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DetailPanel({ item, isActiveLocation, onClose, onViewDashboard }) {
  const { location, reading, assessment } = item;
  const coverage = getCoverageText(location);
  const dominant = assessment.dominant ? POLLUTANTS[assessment.dominant] : null;
  const subtitleParts = [location.region, coverage].filter(Boolean).join(" · ");

  return (
    <Card
      id="panel-detail-lokasi"
      title={location.name}
      subtitle={subtitleParts}
      icon="pin"
      action={
        <Button
          variant="ghost"
          size="sm"
          icon="close"
          onClick={onClose}
          aria-label={`Tutup panel detail ${location.name}`}
        >
          Tutup
        </Button>
      }
    >
      <div className={styles.detailBody}>
        <div className={styles.detailTopRow}>
          <div className={styles.detailPrimary}>
            <div className={styles.detailMetricRow}>
              <span className={styles.detailLabelWithTip}>
                <span>ISPU</span>
                <InfoTip term="ispu" />
              </span>
              <CategoryPill category={assessment.category} value={assessment.ispu} size="lg" />
              {isActiveLocation && <span className={styles.activeTag}>Lokasi aktif di Beranda</span>}
            </div>
            <p className={styles.detailSummary}>{getSummary(assessment)}</p>
            {coverage && <p className={styles.detailCoverage}>{coverage}.</p>}
          </div>
        </div>

        <div className={styles.detailMetaGrid}>
          <div className={styles.detailMetaItem}>
            <span className={styles.detailLabelWithTip}>
              <span>Polutan dominan</span>
              <InfoTip term="polutan-dominan" />
            </span>
            <span className={styles.detailMetaValue}>
              {dominant ? `${dominant.label} · ${dominant.name}` : "Tidak ada data"}
            </span>
          </div>

          <div className={styles.detailMetaItem}>
            <span className={styles.detailLabelWithTip}>
              <span>Waktu pembaruan</span>
            </span>
            <span className={styles.detailMetaValue}>
              {reading?.time ? `${formatDateTime(reading.time)} WIB` : "Tidak tersedia"}
            </span>
          </div>
        </div>

        <div className={styles.pollutantSection}>
          <div className={styles.pollutantHeader}>
            <h3 className={styles.pollutantHeading}>
              <span>Rincian Polutan &amp; UV</span>
              <InfoTip term="sub-indeks" />
            </h3>
            <span className={styles.pollutantUnitHint}>
              <span>Satuan konsentrasi: µg/m³</span>
              <InfoTip term="satuan" />
            </span>
          </div>

          <ul className={styles.pollutantGrid} aria-label={`Nilai polutan dan UV di ${location.name}`}>
            {POLLUTANT_KEYS.map((key) => {
              const meta = POLLUTANTS[key];
              const p = assessment.pollutants[key];
              const isDom = assessment.dominant === key;
              const rawVal = reading ? reading[key] : null;
              const concText = formatConcentration(rawVal, meta.unit, key === "co" ? 0 : 1);

              return (
                <li
                  key={key}
                  className={`${styles.pollutantCard} ${isDom ? styles.pollutantCardDominant : ""}`}
                >
                  <div className={styles.pollutantCardTop}>
                    <div className={styles.pollutantTitleWrap}>
                      <span className={styles.pollutantCode}>
                        <span>{meta.label}</span>
                        <InfoTip term={key} />
                      </span>
                      <span className={styles.pollutantFullName}>{meta.name}</span>
                    </div>
                  </div>
                  <div className={styles.pollutantValues}>
                    <span className={styles.pollutantConc}>
                      {concText === "–" ? "Tidak tersedia" : concText}
                    </span>
                    <CategoryPill category={p.category} value={p.ispu} size="sm" />
                  </div>
                </li>
              );
            })}

            <li className={styles.pollutantCard}>
              <div className={styles.pollutantCardTop}>
                <div className={styles.pollutantTitleWrap}>
                  <span className={styles.pollutantCode}>
                    <span>UV Index</span>
                    <InfoTip term="uv" />
                  </span>
                  <span className={styles.pollutantFullName}>Indeks sinar ultraviolet</span>
                </div>
              </div>
              <div className={styles.pollutantValues}>
                <span className={styles.pollutantConc}>
                  {assessment.uv.value !== null ? `Indeks ${formatNumber(assessment.uv.value, 1)}` : "Tidak tersedia"}
                </span>
                <UvPill level={assessment.uv.level} value={assessment.uv.value} size="sm" />
              </div>
            </li>
          </ul>
        </div>

        <div className={styles.detailActions}>
          <span className={styles.detailActionHint}>
            Tombol Kembali (Back) browser akan mengembalikan Anda ke halaman Peta.
          </span>
          <Button variant="primary" icon="dashboard" onClick={onViewDashboard}>
            Lihat di Beranda
          </Button>
        </div>
      </div>
    </Card>
  );
}
