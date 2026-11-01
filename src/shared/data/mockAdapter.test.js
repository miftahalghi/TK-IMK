import { describe, expect, it } from "vitest";
import { createMockAdapter } from "./mockAdapter.js";
import { assess, CATEGORY_KEYS, UV_LEVEL_KEYS, POLLUTANT_KEYS } from "../aqi.js";

// Kamis, 22 Okt 2026 12.30 WIB
const NOW = Date.parse("2026-10-22T05:30:00Z");
const adapter = createMockAdapter({ now: () => NOW, latency: [0, 0] });

describe("mockAdapter", () => {
  it("mengembalikan 12 lokasi tanpa field internal", async () => {
    const locations = await adapter.getLocations();
    expect(locations).toHaveLength(12);
    for (const loc of locations) {
      expect(Object.keys(loc).sort()).toEqual(["id", "lat", "lon", "name", "region"]);
    }
  });

  it("menghasilkan Reading sesuai kontrak", async () => {
    const r = await adapter.getCurrent("jakarta");
    expect(r.locationId).toBe("jakarta");
    expect(r.time).toBe("2026-10-22T12:00:00+07:00");
    for (const key of [...POLLUTANT_KEYS, "uv"]) {
      expect(typeof r[key]).toBe("number");
    }
  });

  it("deterministik: current sama dengan jam pertama hourly", async () => {
    const current = await adapter.getCurrent("bandung");
    const hourly = await adapter.getHourly("bandung", { hours: 24 });
    expect(hourly).toHaveLength(24);
    expect(hourly[0]).toEqual(current);
    expect(hourly[1].time).toBe("2026-10-22T13:00:00+07:00");
  });

  it("daily mulai hari ini dan berisi 7 hari", async () => {
    const daily = await adapter.getDaily("jakarta", { days: 7 });
    expect(daily).toHaveLength(7);
    expect(daily[0].time).toBe("2026-10-22T00:00:00+07:00");
    expect(daily[6].time).toBe("2026-10-28T00:00:00+07:00");
  });

  it("Medan punya data bolong (PM2.5 dan CO null) tapi ISPU tetap terhitung", async () => {
    const r = await adapter.getCurrent("medan");
    expect(r.pm25).toBeNull();
    expect(r.co).toBeNull();
    expect(assess(r).ispu).not.toBeNull();
  });

  it("mencakup kelima kategori ISPU dan kelima level UV", async () => {
    const locations = await adapter.getLocations();
    const categories = new Set();
    const uvLevels = new Set();
    for (const loc of locations) {
      const hourly = await adapter.getHourly(loc.id, { hours: 24 });
      const daily = await adapter.getDaily(loc.id, { days: 7 });
      for (const r of [...hourly, ...daily]) {
        const a = assess(r);
        categories.add(a.category);
        uvLevels.add(a.uv.level);
      }
    }
    for (const key of CATEGORY_KEYS) expect(categories).toContain(key);
    for (const key of UV_LEVEL_KEYS) expect(uvLevels).toContain(key);
  });

  it("melempar error untuk lokasi tidak dikenal", async () => {
    await expect(adapter.getCurrent("atlantis")).rejects.toThrow(/tidak ditemukan/);
  });
});
