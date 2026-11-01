/**
 * Lokasi aktif: satu untuk seluruh aplikasi, disimpan di URL (?lokasi=bandung).
 *
 * Kenapa di URL (Nielsen N3 / Shneiderman S6, pembalikan aksi):
 *   - tombol Back browser membatalkan pergantian lokasi,
 *   - alamat bisa disalin dan dibagikan dengan lokasi yang sama.
 *
 * Lokasi awal saat aplikasi dibuka (Shneiderman S7, pengguna memegang kendali):
 *   ?lokasi= di alamat  →  lokasi default di Pengaturan  →  lokasi terakhir dibuka  →  Jakarta.
 * Lokasi default hanya dipakai saat aplikasi dibuka. Ia tidak menimpa pilihan
 * pengguna di tengah sesi.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { storage } from "../storage.js";
import { useLocations } from "../data/hooks.js";
import { useSettings } from "./SettingsContext.jsx";

export const FALLBACK_LOCATION_ID = "jakarta";
export const LOCATION_PARAM = "lokasi";
const KEY = "active-location";

const LocationContext = createContext(null);

function withParam(search, id) {
  const params = new URLSearchParams(search);
  params.set(LOCATION_PARAM, id);
  return `?${params.toString()}`;
}

export function LocationProvider({ children }) {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { defaultLocationId } = useSettings();
  const locations = useLocations();
  const param = new URLSearchParams(routerLocation.search).get(LOCATION_PARAM);

  // Dihitung sekali saat aplikasi dibuka.
  const [locationId, setId] = useState(
    () => param || defaultLocationId || storage.get(KEY, null) || FALLBACK_LOCATION_ID,
  );

  // Ref agar callback stabil tetapi selalu membaca alamat terbaru.
  const routeRef = useRef(routerLocation);
  routeRef.current = routerLocation;

  // URL → state: tombol Back/Forward atau tautan yang dibagikan.
  // Tanpa ?lokasi= (misalnya setelah klik menu) → tambahkan tanpa membuat riwayat baru.
  useEffect(() => {
    if (param && param !== locationId) {
      setId(param);
    } else if (!param) {
      navigate(
        { pathname: routerLocation.pathname, search: withParam(routerLocation.search, locationId), hash: routerLocation.hash },
        { replace: true },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param, routerLocation.pathname]);

  // Simpan lokasi terakhir.
  useEffect(() => {
    storage.set(KEY, locationId);
  }, [locationId]);

  // Lokasi tidak dikenal (misalnya tautan lama) → kembali ke Jakarta.
  const known = locations.status === "success" ? locations.data.find((l) => l.id === locationId) ?? null : null;
  const unknown = locations.status === "success" && !known;
  useEffect(() => {
    if (!unknown) return;
    const r = routeRef.current;
    setId(FALLBACK_LOCATION_ID);
    navigate({ pathname: r.pathname, search: withParam(r.search, FALLBACK_LOCATION_ID), hash: r.hash }, { replace: true });
  }, [unknown, navigate]);

  /**
   * Ganti lokasi aktif. Membuat entri riwayat baru, jadi Back membatalkannya.
   * @param {string} id
   * @param {{ to?: string }} [options]  `to`: pindah ke halaman lain sekaligus, misalnya "/"
   */
  const setLocationId = useCallback(
    (id, { to } = {}) => {
      const r = routeRef.current;
      setId(id);
      navigate({ pathname: to ?? r.pathname, search: withParam(r.search, id), hash: to ? "" : r.hash });
    },
    [navigate],
  );

  const value = useMemo(() => ({ locationId, location: known, setLocationId }), [locationId, known, setLocationId]);
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

/**
 * @returns {{
 *   locationId: string,
 *   location: { id: string, name: string, region: string, lat: number, lon: number } | null,
 *   setLocationId: (id: string, options?: { to?: string }) => void
 * }}
 */
export function useActiveLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useActiveLocation harus dipakai di dalam <LocationProvider>.");
  return ctx;
}
