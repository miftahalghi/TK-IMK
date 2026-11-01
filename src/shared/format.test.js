import { describe, expect, it } from "vitest";
import { formatConcentration, formatDate, formatDay, formatNumber, formatTime, wibDateKey } from "./format.js";

describe("format", () => {
  const iso = "2026-10-22T05:00:00Z"; // 12.00 WIB, Kamis

  it("memformat jam dan tanggal dalam WIB", () => {
    expect(formatTime(iso)).toBe("12.00");
    expect(formatDate(iso)).toBe("22 Okt 2026");
    expect(formatDay(iso)).toBe("Kamis");
    expect(wibDateKey("2026-10-22T18:30:00Z")).toBe("2026-10-23");
  });

  it("memformat angka dengan koma desimal", () => {
    expect(formatNumber(65.24, 1)).toBe("65,2");
    expect(formatNumber(5200)).toBe("5.200");
    expect(formatNumber(null)).toBe("–");
    expect(formatConcentration(65.2)).toBe("65,2 µg/m³");
    expect(formatConcentration(null)).toBe("–");
  });
});
