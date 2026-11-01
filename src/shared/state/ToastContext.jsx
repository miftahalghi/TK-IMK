/**
 * Notifikasi singkat (toast), untuk umpan balik setelah aksi
 * (Shneiderman S3 umpan balik, S4 penutupan yang jelas, S6 pembalikan aksi).
 *
 *   const toast = useToast();
 *   toast.show("Lokasi diganti ke Bandung.");
 *   toast.show("Lokasi “Kantor” dihapus.", { action: { label: "Urungkan", onClick: undo } });
 *
 * Toast tidak mencuri fokus dan diumumkan ke pembaca layar (role="status").
 * Toast dengan tombol aksi tampil lebih lama (8 detik) supaya sempat diklik.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import styles from "../components/components.module.css";

const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const show = useCallback(
    (message, { action, tone = "info", duration } = {}) => {
      const id = nextId++;
      const ms = duration ?? (action ? 8000 : 4000);
      // Maksimal 3 toast sekaligus; yang lama hilang lebih dulu.
      setToasts((list) => [...list.slice(-2), { id, message, action, tone }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), ms),
      );
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((t) => clearTimeout(t));
  }, []);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.toastRegion} role="status" aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${t.tone === "error" ? styles.toastError : ""}`}>
            <span className={styles.toastMessage}>{t.message}</span>
            {t.action && (
              <button
                type="button"
                className={styles.toastAction}
                onClick={() => {
                  t.action.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
            <button type="button" className={styles.toastClose} onClick={() => dismiss(t.id)} aria-label="Tutup notifikasi">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * @returns {{
 *   show: (message: string, options?: { action?: { label: string, onClick: () => void }, tone?: "info"|"error", duration?: number }) => number,
 *   dismiss: (id: number) => void
 * }}
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam <ToastProvider>.");
  return ctx;
}
