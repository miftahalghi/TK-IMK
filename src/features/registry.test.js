import { describe, expect, it } from "vitest";
import { readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { features, navItems, slotsFor } from "./registry.js";
import { SLOT_AREAS } from "../shared/feature.js";

const here = dirname(fileURLToPath(import.meta.url));

describe("registry fitur", () => {
  it("berisi tujuh fitur dengan id unik yang sama dengan nama folder", () => {
    const ids = features.map((f) => f.id);
    expect(ids).toHaveLength(7);
    expect(new Set(ids).size).toBe(7);
    const folders = readdirSync(here).filter((n) => statSync(join(here, n)).isDirectory());
    expect(folders.sort()).toEqual([...ids].sort());
  });

  it("setiap fitur punya title, owner, dan minimal satu route atau slot", () => {
    for (const f of features) {
      expect(f.title, f.id).toBeTruthy();
      expect(f.owner, f.id).toMatch(/^Anggota \d$/);
      expect(Boolean(f.route) || (f.slots ?? []).length > 0, f.id).toBe(true);
    }
  });

  it("path route unik dan diawali '/'", () => {
    const paths = features.filter((f) => f.route).map((f) => f.route.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const p of paths) expect(p).toMatch(/^\/[a-z-]+$/);
  });

  it("semua slot memakai area yang dikenal dan punya komponen", () => {
    for (const f of features) {
      for (const s of f.slots ?? []) {
        expect(SLOT_AREAS, `${f.id}: ${s.area}`).toContain(s.area);
        expect(s.component, f.id).toBeTruthy();
      }
    }
  });

  it("dashboard dan sidebar terisi sesuai pembagian", () => {
    expect(slotsFor("dashboard-top").map((s) => s.feature.id)).toEqual(["hero"]);
    expect(slotsFor("dashboard-bottom").map((s) => s.feature.id)).toEqual(["insights"]);
    expect(slotsFor("dashboard-aside").map((s) => s.feature.id)).toEqual(["outlook"]);
    expect(slotsFor("sidebar-account").map((s) => s.feature.id)).toEqual(["auth"]);
    expect(navItems().map((n) => n.path)).toEqual(["/maps", "/tips", "/settings"]);
  });
});
