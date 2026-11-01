/**
 * Hooks data untuk komponen React. Semua mengembalikan:
 *   { status: "loading" | "success" | "error", data, error, reload }
 * Pakai ini di fitur, jangan memanggil dataService di dalam useEffect sendiri.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import * as dataService from "./dataService.js";
import { assess } from "../aqi.js";

function useAsync(fn, deps) {
  const [state, setState] = useState({ status: "loading", data: undefined, error: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    setState((s) => ({ status: "loading", data: s.data, error: null }));
    fn().then(
      (data) => alive && setState({ status: "success", data, error: null }),
      (error) => alive && setState({ status: "error", data: undefined, error }),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, reload };
}

/** Daftar semua lokasi. */
export function useLocations() {
  return useAsync(() => dataService.getLocations(), []);
}

/** Pembacaan jam ini untuk satu lokasi, plus `assessment` (hasil assess()). */
export function useCurrent(locationId) {
  const result = useAsync(() => dataService.getCurrent(locationId), [locationId]);
  const assessment = useMemo(() => (result.data ? assess(result.data) : null), [result.data]);
  return { ...result, assessment };
}

/** Pembacaan jam ini untuk semua lokasi. */
export function useCurrentAll() {
  return useAsync(() => dataService.getCurrentAll(), []);
}

/** Pembacaan per jam mulai jam sekarang. */
export function useHourly(locationId, { hours = 24 } = {}) {
  return useAsync(() => dataService.getHourly(locationId, { hours }), [locationId, hours]);
}

/** Pembacaan per hari mulai hari ini. */
export function useDaily(locationId, { days = 7 } = {}) {
  return useAsync(() => dataService.getDaily(locationId, { days }), [locationId, days]);
}

/** Info sumber data: { kind, label, hasForecast, updatedAt }. */
export function useSourceInfo() {
  return useAsync(() => dataService.getSourceInfo(), []);
}
