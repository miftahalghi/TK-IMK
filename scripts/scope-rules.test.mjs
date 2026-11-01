import { describe, expect, it } from "vitest";
import { isAllowed } from "./scope-rules.mjs";

describe("isAllowed", () => {
  it("mengizinkan file di folder fitur sendiri", () => {
    expect(isAllowed("maps", "src/features/maps/MapsPage.jsx")).toBe(true);
    expect(isAllowed("maps", "src/features/maps/components/Marker.jsx")).toBe(true);
    expect(isAllowed("maps", "src\\features\\maps\\maps.module.css")).toBe(true);
  });

  it("menolak file di luar folder fitur", () => {
    expect(isAllowed("maps", "src/features/tips/TipsPage.jsx")).toBe(false);
    expect(isAllowed("maps", "src/features/registry.js")).toBe(false);
    expect(isAllowed("maps", "src/shared/aqi.js")).toBe(false);
    expect(isAllowed("maps", "src/app/AppShell.jsx")).toBe(false);
    expect(isAllowed("maps", "package.json")).toBe(false);
    expect(isAllowed("maps", "CONTRACT.md")).toBe(false);
  });

  it("tidak tertipu nama folder yang mirip", () => {
    expect(isAllowed("maps", "src/features/maps-old/x.js")).toBe(false);
  });
});
