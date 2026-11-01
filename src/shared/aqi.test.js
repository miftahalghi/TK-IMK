import { describe, expect, it } from "vitest";
import { assess, categoryOf, subIndex, uvLevelOf, CATEGORY_KEYS, CATEGORIES } from "./aqi.js";

describe("subIndex", () => {
  it("menghitung contoh di PRD §A8", () => {
    expect(subIndex("pm25", 35.45)).toBe(75);
    expect(subIndex("pm10", 100)).toBe(75);
    expect(subIndex("pm25", 15.5)).toBe(50);
    expect(subIndex("pm25", 150.4)).toBe(200);
  });

  it("memberi 0 untuk konsentrasi 0 dan batas atas tiap rentang", () => {
    expect(subIndex("pm25", 0)).toBe(0);
    expect(subIndex("pm25", 55.4)).toBe(100);
    expect(subIndex("pm25", 250.4)).toBe(300);
    expect(subIndex("co", 4000)).toBe(50);
    expect(subIndex("no2", 200)).toBe(100);
    expect(subIndex("so2", 400)).toBe(200);
  });

  it("membatasi nilai di atas batas tertinggi ke 500", () => {
    expect(subIndex("pm25", 500)).toBe(500);
    expect(subIndex("pm25", 900)).toBe(500);
  });

  it("mengembalikan null untuk data tidak tersedia atau polutan tidak dikenal", () => {
    expect(subIndex("pm25", null)).toBeNull();
    expect(subIndex("pm25", undefined)).toBeNull();
    expect(subIndex("pm25", Number.NaN)).toBeNull();
    expect(subIndex("o3", 10)).toBeNull();
  });

  it("memperlakukan nilai negatif sebagai 0", () => {
    expect(subIndex("pm10", -5)).toBe(0);
  });
});

describe("categoryOf", () => {
  it("memetakan batas kategori", () => {
    expect(categoryOf(0)).toBe("baik");
    expect(categoryOf(50)).toBe("baik");
    expect(categoryOf(51)).toBe("sedang");
    expect(categoryOf(100)).toBe("sedang");
    expect(categoryOf(101)).toBe("tidak-sehat");
    expect(categoryOf(200)).toBe("tidak-sehat");
    expect(categoryOf(201)).toBe("sangat-tidak-sehat");
    expect(categoryOf(300)).toBe("sangat-tidak-sehat");
    expect(categoryOf(301)).toBe("berbahaya");
    expect(categoryOf(null)).toBeNull();
  });

  it("punya metadata untuk setiap kategori", () => {
    for (const key of CATEGORY_KEYS) {
      expect(CATEGORIES[key].label).toBeTruthy();
      expect(CATEGORIES[key].colorVar).toMatch(/^--cat-/);
    }
  });
});

describe("uvLevelOf", () => {
  it("memetakan level WHO dengan pembulatan", () => {
    expect(uvLevelOf(0)).toBe("rendah");
    expect(uvLevelOf(2.4)).toBe("rendah");
    expect(uvLevelOf(2.5)).toBe("sedang");
    expect(uvLevelOf(5)).toBe("sedang");
    expect(uvLevelOf(6)).toBe("tinggi");
    expect(uvLevelOf(7)).toBe("tinggi");
    expect(uvLevelOf(8)).toBe("sangat-tinggi");
    expect(uvLevelOf(10)).toBe("sangat-tinggi");
    expect(uvLevelOf(11)).toBe("ekstrem");
    expect(uvLevelOf(null)).toBeNull();
  });
});

describe("assess", () => {
  it("memakai sub-indeks tertinggi sebagai ISPU dan polutan dominan", () => {
    const result = assess({ pm25: 65.2, pm10: 110, co: 5200, no2: 45, so2: 20, uv: 8 });
    expect(result.ispu).toBe(110);
    expect(result.category).toBe("tidak-sehat");
    expect(result.dominant).toBe("pm25");
    expect(result.pollutants.pm10).toEqual({ value: 110, ispu: 80, category: "sedang" });
    expect(result.uv).toEqual({ value: 8, level: "sangat-tinggi" });
  });

  it("melewati nilai null", () => {
    const result = assess({ pm25: null, pm10: 160, co: null, no2: null, so2: null, uv: null });
    expect(result.ispu).toBe(105);
    expect(result.dominant).toBe("pm10");
    expect(result.pollutants.pm25).toEqual({ value: null, ispu: null, category: null });
    expect(result.uv).toEqual({ value: null, level: null });
  });

  it("mengembalikan ispu null jika semua data kosong", () => {
    const result = assess({ pm25: null, pm10: null, co: null, no2: null, so2: null, uv: null });
    expect(result.ispu).toBeNull();
    expect(result.category).toBeNull();
    expect(result.dominant).toBeNull();
  });

  it("memecah seri dengan urutan POLLUTANT_KEYS (PM2.5 lebih dulu)", () => {
    const result = assess({ pm25: 35.45, pm10: 100 });
    expect(result.ispu).toBe(75);
    expect(result.dominant).toBe("pm25");
  });

  it("aman untuk reading null", () => {
    expect(assess(null).ispu).toBeNull();
  });
});
