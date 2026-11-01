/**
 * Pengaturan pengguna. Disimpan per akun (key berisi email); tamu memakai key "tamu".
 * Versi awal ini sudah berfungsi. Fitur settings membangun halamannya di atas
 * update() dan reset(); bentuk data di bawah adalah kontrak (CONTRACT.md §4).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { storage } from "../storage.js";
import { useAuth } from "./AuthContext.jsx";

export const MAX_SAVED_LOCATIONS = 5;

export const DEFAULT_SETTINGS = Object.freeze({
  /** Lokasi yang dipakai saat aplikasi dibuka. null = ikuti lokasi terakhir. */
  defaultLocationId: null,
  /** Lokasi berlabel, maksimal 5: [{ label: "Kantor", locationId: "jakarta" }] */
  savedLocations: [],
  /** "system" | "light" | "dark" */
  theme: "system",
  /** Tampilkan banner peringatan saat ISPU ≥ nilai ini. null = matikan. */
  alertThreshold: 101,
});

const SettingsContext = createContext(null);

const keyFor = (user) => `settings:${user?.email ?? "tamu"}`;

function load(user) {
  const saved = storage.get(keyFor(user), {});
  return { ...DEFAULT_SETTINGS, ...(saved && typeof saved === "object" ? saved : {}) };
}

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(() => load(user));

  // Ganti akun → muat pengaturan akun itu.
  useEffect(() => {
    setSettings(load(user));
  }, [user]);

  // Terapkan tema ke <html data-theme>.
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "light" || settings.theme === "dark") root.dataset.theme = settings.theme;
    else delete root.dataset.theme;
  }, [settings.theme]);

  const update = useCallback(
    (patch) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        if (Array.isArray(next.savedLocations)) next.savedLocations = next.savedLocations.slice(0, MAX_SAVED_LOCATIONS);
        storage.set(keyFor(user), next);
        return next;
      });
    },
    [user],
  );

  const reset = useCallback(() => {
    storage.remove(keyFor(user));
    setSettings({ ...DEFAULT_SETTINGS });
  }, [user]);

  const value = useMemo(() => ({ ...settings, update, reset }), [settings, update, reset]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/**
 * @returns {{
 *   defaultLocationId: string|null,
 *   savedLocations: {label: string, locationId: string}[],
 *   theme: "system"|"light"|"dark",
 *   alertThreshold: number|null,
 *   update: (patch: object) => void,
 *   reset: () => void
 * }}
 */
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings harus dipakai di dalam <SettingsProvider>.");
  return ctx;
}
