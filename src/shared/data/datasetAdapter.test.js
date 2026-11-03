import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createDatasetAdapter, defaultNow } from "./datasetAdapter.js";
import { createMockAdapter } from "./mockAdapter.js";
import { LOCATIONS } from "./locations.js";
import { assess, POLLUTANT_KEYS } from "../aqi.js";

const here = dirname(fileURLToPath(import.meta.url));
const dataset = JSON.parse(readFileSync(join(here, "dataset", "open-meteo.json"), "utf8"));
const load = async () => dataset;

describe("file dataset Open-Meteo", () => {
  it("mencakup 1 Okt–1 Nov 2026, per jam, untuk semua lokasi", () => {
    expect(dataset.start).toBe("2026-10-01T00:00:00+07:00");
    expect(dataset.end).toBe("2026-11-01T23:00:00+07:00");
    expect(dataset.hours).toBe(32 * 24);
    expect(Object.keys(dataset.series).sort()).toEqual(LOCATIONS.map((l) => l.id).sort());
    for (const s of Object.values(dataset.series)) {
      for (const k of [...POLLUTANT_KEYS, "uv"]) expect(s[k]).toHaveLength(dataset.hours);
    }
  });

  it("mencantumkan sumber dan lisensi", () => {
    expect(dataset.source).toMatch(/Open-Meteo/);
    expect(dataset.license).toBe("CC BY 4.0");
  });
});

describe("datasetAdapter", () => {
  const adapter = createDatasetAdapter({ load });

  it("'sekarang' default = 7 hari sebelum akhir rekaman, pukul 12.00 WIB", async () => {
    expect(new Date(defaultNow(dataset)).toISOString()).toBe("2026-10-26T05:00:00.000Z");
    const r = await adapter.getCurrent("jakarta");
    expect(r.time).toBe("2026-10-26T12:00:00+07:00");
  });

  it("menghasilkan Reading sesuai kontrak (sama dengan mock)", async () => {
    const mock = await createMockAdapter({ latency: [0, 0] }).getCurrent("jakarta");
    const real = await adapter.getCurrent("jakarta");
    expect(Object.keys(real).sort()).toEqual(Object.keys(mock).sort());
    for (const k of [...POLLUTANT_KEYS, "uv"]) expect(typeof real[k]).toBe("number");
    expect(assess(real).ispu).not.toBeNull();
  });

  it("nilai sesuai file dataset pada jam yang sama", async () => {
    const r = await adapter.getCurrent("bandung");
    const i = (Date.parse(r.time) - Date.parse(dataset.start)) / 3600000;
    expect(r.pm25).toBe(dataset.series.bandung.pm25[i]);
    expect(r.uv).toBe(dataset.series.bandung.uv[i]);
  });

  it("daftar lokasi = 9 lokasi dengan Jabodetabek ber-id jakarta", async () => {
    const locs = await adapter.getLocations();
    expect(locs).toHaveLength(9);
    expect(locs[0]).toMatchObject({ id: "jakarta", name: "Jabodetabek" });
    expect(locs.map((l) => l.id)).not.toContain("bogor");
  });

  it("per jam mulai 'sekarang', 24 jam, dan current = jam pertama", async () => {
    const hourly = await adapter.getHourly("surabaya", { hours: 24 });
    expect(hourly).toHaveLength(24);
    expect(hourly[0]).toEqual(await adapter.getCurrent("surabaya"));
    expect(hourly[1].time).toBe("2026-10-26T13:00:00+07:00");
  });

  it("per hari: 7 hari mulai hari ini, rata-rata 24 jam, UV maksimum", async () => {
    const daily = await adapter.getDaily("jakarta", { days: 7 });
    expect(daily).toHaveLength(7);
    expect(daily[0].time).toBe("2026-10-26T00:00:00+07:00");
    expect(daily[6].time).toBe("2026-11-01T00:00:00+07:00");
    const i0 = (Date.parse(daily[0].time) - Date.parse(dataset.start)) / 3600000;
    const pm = dataset.series.jakarta.pm25.slice(i0, i0 + 24);
    expect(daily[0].pm25).toBeCloseTo(pm.reduce((a, b) => a + b, 0) / 24, 1);
    expect(daily[0].uv).toBe(Math.max(...dataset.series.jakarta.uv.slice(i0, i0 + 24)));
  });

  it("berhenti di akhir rekaman tanpa error", async () => {
    const late = createDatasetAdapter({ load, now: "2026-11-01T20:00" });
    expect(await late.getHourly("jakarta", { hours: 24 })).toHaveLength(4);
    expect(await late.getDaily("jakarta", { days: 7 })).toHaveLength(1);
  });

  it("VITE_DATASET_NOW di luar rekaman → kembali ke default", async () => {
    const bad = createDatasetAdapter({ load, now: "2026-12-25T12:00" });
    expect((await bad.getCurrent("jakarta")).time).toBe("2026-10-26T12:00:00+07:00");
  });

  it("info sumber menjelaskan rekaman dan waktunya", async () => {
    const info = await adapter.getSourceInfo();
    expect(info).toMatchObject({ kind: "dataset", hasForecast: true, updatedAt: "2026-10-26T12:00:00+07:00" });
    expect(info.description).toMatch(/Open-Meteo/);
    expect(info.description).toMatch(/26 Okt 2026/);
  });

  it("melempar error untuk lokasi tidak dikenal (termasuk bogor yang sudah digabung)", async () => {
    await expect(adapter.getCurrent("bogor")).rejects.toThrow(/tidak ditemukan/);
  });
});
