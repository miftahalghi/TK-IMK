/**
 * Komponen interaktif bersama. Dibuat supaya tujuh fitur punya tombol, input,
 * pilihan, tooltip, dan dialog yang sama (Nielsen N4 konsistensi, Shneiderman S1).
 * Fitur WAJIB memakai komponen ini; jangan membuat versi sendiri.
 */
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./components.module.css";
import { Icon } from "./Icon.jsx";
import { CATEGORIES, CATEGORY_KEYS } from "../aqi.js";
import { GLOSSARY, tipsAnchor } from "../content/advice.js";

/**
 * Tombol. variant: "primary" | "secondary" | "ghost" | "danger". size: "sm" | "md".
 * Selalu <button>; untuk navigasi pakai <ButtonLink>.
 */
export function Button({ variant = "secondary", size = "md", icon, iconAfter, loading = false, children, className = "", type = "button", disabled, ...rest }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[`btn-${variant}`]} ${styles[`btn-${size}`]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === "sm" ? 16 : 20} />}
      {children}
      {iconAfter && <Icon name={iconAfter} size={size === "sm" ? 16 : 20} />}
    </button>
  );
}

/** Tautan internal dengan tampilan tombol. */
export function ButtonLink({ to, variant = "secondary", size = "md", icon, children, className = "", ...rest }) {
  return (
    <Link to={to} className={`${styles.btn} ${styles[`btn-${variant}`]} ${styles[`btn-${size}`]} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={size === "sm" ? 16 : 20} />}
      {children}
    </Link>
  );
}

/**
 * Input teks berlabel, dengan petunjuk dan pesan error yang terhubung (aria-describedby).
 * <TextField label="Email" type="email" value={v} onChange={...} error="Format email belum benar." />
 */
export function TextField({ label, hint, error, id, className = "", hideLabel = false, ...inputProps }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className={`${styles.field} ${className}`}>
      <label htmlFor={inputId} className={hideLabel ? "visually-hidden" : styles.fieldLabel}>
        {label}
      </label>
      <input
        id={inputId}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        {...inputProps}
      />
      {hint && (
        <span id={hintId} className={styles.fieldHint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className={styles.fieldError} role="alert">
          <Icon name="alert" size={16} />
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * Pilihan segmen (2–4 opsi), misalnya "Hari Ini / 7 Hari" atau "Terang / Gelap / Sistem".
 * <SegmentedControl label="Rentang waktu" value={v} onChange={setV}
 *   options={[{ value: "today", label: "Hari Ini" }, { value: "week", label: "7 Hari" }]} />
 */
export function SegmentedControl({ label, options, value, onChange, size = "md", className = "" }) {
  return (
    <div className={`${styles.segmented} ${styles[`segmented-${size}`]} ${className}`} role="group" aria-label={label}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={styles.segment}
          aria-pressed={opt.value === value}
          onClick={() => onChange(opt.value)}
        >
          {opt.icon && <Icon name={opt.icon} size={16} />}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Tombol ⓘ kecil yang menjelaskan istilah (Nielsen N2, N6, N10).
 * <InfoTip term="ispu" />   → mengambil teks dari GLOSSARY + tautan "Pelajari di Tips".
 * <InfoTip label="..." text="..." /> → teks bebas.
 * Dibuka dengan klik/Enter (bukan hover saja), ditutup dengan Esc atau klik di luar.
 */
export function InfoTip({ term, label, text, learnMore = true, className = "" }) {
  const entry = term ? GLOSSARY[term] : null;
  const title = label ?? entry?.term ?? "Info";
  const body = text ?? entry?.short ?? "";
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const popId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span className={`${styles.infotip} ${className}`} ref={ref}>
      <button
        type="button"
        className={styles.infotipButton}
        aria-label={`Apa itu ${title}?`}
        aria-expanded={open}
        aria-controls={popId}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="info" size={16} />
      </button>
      {open && (
        <span id={popId} role="note" className={styles.infotipPopover}>
          <strong className={styles.infotipTitle}>{title}</strong>
          <span>{body}</span>
          {term && learnMore && (
            <Link to={`/tips#${tipsAnchor(term)}`} className={styles.infotipLink} onClick={() => setOpen(false)}>
              Pelajari di Tips
            </Link>
          )}
        </span>
      )}
    </span>
  );
}

/**
 * Dialog konfirmasi untuk aksi yang tidak bisa dibatalkan (Nielsen N5, Shneiderman S5).
 * Memakai <dialog> bawaan browser: fokus terkunci, Esc menutup, fokus kembali ke pemicu.
 * Untuk aksi yang BISA dibatalkan, lebih baik pakai Toast + "Urungkan" (tanpa dialog).
 *
 * <ConfirmDialog open={open} title="Kembalikan pengaturan?" confirmLabel="Kembalikan"
 *   tone="danger" onConfirm={reset} onCancel={() => setOpen(false)}>Semua lokasi tersimpan akan dihapus.</ConfirmDialog>
 */
export function ConfirmDialog({ open, title, children, confirmLabel = "Ya, lanjutkan", cancelLabel = "Batal", tone = "primary", onConfirm, onCancel }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      if (typeof dlg.showModal === "function") dlg.showModal();
      else dlg.setAttribute("open", "");
    } else if (!open && dlg.open) {
      if (typeof dlg.close === "function") dlg.close();
      else dlg.removeAttribute("open");
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onCancel?.();
      }}
      onClick={(e) => e.target === ref.current && onCancel?.()}
    >
      <div className={styles.dialogBody}>
        <h2 id={titleId} className={styles.dialogTitle}>
          {title}
        </h2>
        {children && <div className={styles.dialogText}>{children}</div>}
        <div className={styles.dialogActions}>
          <Button variant="secondary" onClick={onCancel} autoFocus>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

/**
 * Judul halaman yang seragam untuk halaman fitur (Peta, Tips, Pengaturan, Masuk).
 * <PageHeader title="Peta Kualitas Udara" description="..." actions={<Button/>} />
 */
export function PageHeader({ title, description, actions }) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.pageHeaderText}>
        <h1 className={styles.pageTitle}>{title}</h1>
        {description && <p className={styles.pageDescription}>{description}</p>}
      </div>
      {actions && <div className={styles.pageActions}>{actions}</div>}
    </header>
  );
}

/**
 * Legenda kelima kategori ISPU (Nielsen N6, Shneiderman S8: tidak perlu mengingat arti warna).
 * Tampilkan di setiap tempat yang memakai warna kategori.
 * <CategoryLegend />  · <CategoryLegend compact />  · <CategoryLegend highlight="sedang" />
 */
export function CategoryLegend({ compact = false, highlight, className = "" }) {
  return (
    <ul className={`${styles.legend} ${compact ? styles.legendCompact : ""} ${className}`} aria-label="Arti warna kategori ISPU">
      {CATEGORY_KEYS.map((key) => {
        const c = CATEGORIES[key];
        const active = key === highlight;
        return (
          <li key={key} className={`${styles.legendItem} ${active ? styles.legendItemActive : ""}`} aria-current={active || undefined}>
            <span className={styles.legendSwatch} style={{ background: `var(${c.colorVar})` }} aria-hidden="true" />
            <span className={styles.legendLabel}>{c.label}</span>
            <span className={styles.legendRange}>
              {c.min}–{key === "berbahaya" ? "500" : c.max}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
