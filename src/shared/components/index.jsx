import styles from "./components.module.css";
import { Icon } from "./Icon.jsx";
import { categoryInfo, uvLevelInfo } from "../aqi.js";

/**
 * Kartu dasar (latar abu, radius 15 seperti di Figma).
 * <Card title="Rekomendasi Sehat" subtitle="..." icon="idea" action={<button/>}>...</Card>
 */
export function Card({ title, subtitle, icon, action, children, className = "", as: Tag = "section", ...rest }) {
  const headingId = rest.id ? `${rest.id}-title` : undefined;
  return (
    <Tag className={`${styles.card} ${className}`} aria-labelledby={title ? headingId : undefined} {...rest}>
      {(title || action) && (
        <header className={styles.header}>
          {icon && <Icon name={icon} className={styles.headerIcon} />}
          <div className={styles.headings}>
            {title && (
              <h2 className={styles.title} id={headingId}>
                {title}
              </h2>
            )}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {action && <div className={styles.action}>{action}</div>}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </Tag>
  );
}

/**
 * Label kategori ISPU berwarna. Selalu menampilkan teks (bukan hanya warna).
 * <CategoryPill category="tidak-sehat" value={156} />
 */
export function CategoryPill({ category, value, size = "md", showLabel = true, className = "" }) {
  const info = categoryInfo(category);
  return (
    <span
      className={`${styles.pill} ${styles[`pill-${size}`]} ${className}`}
      style={{ background: `var(${info.colorVar})`, color: `var(${info.onColorVar})` }}
      title={info.meaning}
    >
      {value !== undefined && value !== null && <span className={styles.pillValue}>{value}</span>}
      {showLabel && <span>{info.label}</span>}
      {!showLabel && <span className="visually-hidden">{info.label}</span>}
    </span>
  );
}

/** Label level UV berwarna. <UvPill level="tinggi" value={7} /> */
export function UvPill({ level, value, size = "md", showLabel = true, className = "" }) {
  const info = uvLevelInfo(level);
  return (
    <span
      className={`${styles.pill} ${styles[`pill-${size}`]} ${className}`}
      style={{ background: `var(${info.colorVar})`, color: `var(${info.onColorVar})` }}
    >
      <span className={styles.pillValue}>UV {value ?? "–"}</span>
      {showLabel && <span>{info.label}</span>}
      {!showLabel && <span className="visually-hidden">{info.label}</span>}
    </span>
  );
}

/** Kotak abu berkilau untuk state memuat. */
export function Skeleton({ width = "100%", height = 16, radius, className = "" }) {
  return (
    <span
      className={`${styles.skeleton} ${className}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

/** State gagal dengan tombol coba lagi. */
export function ErrorState({ message = "Gagal memuat data.", onRetry }) {
  return (
    <div className={`${styles.state} ${styles.stateError}`} role="alert">
      <div className={styles.stateRow}>
        <Icon name="alert" size={20} />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button type="button" className={styles.button} onClick={onRetry}>
          <Icon name="refresh" size={16} />
          Coba lagi
        </button>
      )}
    </div>
  );
}

/** State kosong / data tidak tersedia. */
export function EmptyState({ message = "Data tidak tersedia." }) {
  return (
    <div className={`${styles.state} ${styles.stateEmpty}`}>
      <div className={styles.stateRow}>
        <Icon name="info" size={20} />
        <span>{message}</span>
      </div>
    </div>
  );
}

/**
 * Pembungkus status hook data: memilih tampilan memuat / gagal / isi.
 * <AsyncBoundary result={useCurrent(id)} loading={<Skeleton/>}>{(data) => ...}</AsyncBoundary>
 */
export function AsyncBoundary({ result, loading, children }) {
  if (result.status === "error") {
    return <ErrorState message={result.error?.message} onRetry={result.reload} />;
  }
  if (result.status === "loading" && result.data === undefined) {
    return loading ?? <Skeleton height={80} />;
  }
  return children(result.data);
}

/**
 * Placeholder fitur yang belum dikerjakan. Dipakai di setiap features/<id>/
 * sampai pemiliknya menggantinya dengan komponen sungguhan.
 */
export function FeaturePlaceholder({ feature, title, owner, items = [] }) {
  return (
    <div className={styles.placeholder} role="note">
      <span className={styles.placeholderTag}>
        {owner} · belum dikerjakan
      </span>
      <p className={styles.placeholderTitle}>{title}</p>
      {items.length > 0 && (
        <ul className={styles.placeholderList}>
          {items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      )}
      <span className={styles.placeholderPath}>src/features/{feature}/ · lihat SPEC.md</span>
    </div>
  );
}
