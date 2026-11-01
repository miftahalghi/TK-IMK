// @vitest-environment jsdom
/**
 * Lokasi aktif di URL (Nielsen N3, Shneiderman S6/S7):
 * pergantian lokasi tercatat di riwayat, tombol Back membatalkannya,
 * dan lokasi default tidak menimpa ?lokasi= dari alamat.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext.jsx";
import { SettingsProvider } from "./SettingsContext.jsx";
import { LocationProvider, useActiveLocation } from "./LocationContext.jsx";

vi.mock("../data/dataService.js", () => {
  const locations = ["jakarta", "bandung", "depok"].map((id) => ({ id, name: id, region: "R", lat: 0, lon: 0 }));
  return { getLocations: async () => locations };
});

let api;
function Probe() {
  const loc = useActiveLocation();
  const routerLocation = useLocation();
  api = { ...loc, navigate: useNavigate() };
  return (
    <p>
      <span data-testid="id">{loc.locationId}</span>
      <span data-testid="url">{routerLocation.pathname + routerLocation.search}</span>
    </p>
  );
}

function setup(initial = "/") {
  return render(
    <MemoryRouter initialEntries={[initial]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SettingsProvider>
          <LocationProvider>
            <Probe />
          </LocationProvider>
        </SettingsProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

const id = () => screen.getByTestId("id").textContent;
const url = () => screen.getByTestId("url").textContent;

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("LocationProvider", () => {
  it("menambahkan ?lokasi= ke alamat saat dibuka tanpa parameter", async () => {
    setup("/");
    await waitFor(() => expect(url()).toBe("/?lokasi=jakarta"));
    expect(id()).toBe("jakarta");
  });

  it("memakai ?lokasi= dari alamat (tautan yang dibagikan)", async () => {
    setup("/?lokasi=bandung");
    await waitFor(() => expect(id()).toBe("bandung"));
  });

  it("tombol Back membatalkan pergantian lokasi", async () => {
    setup("/?lokasi=jakarta");
    act(() => api.setLocationId("depok"));
    await waitFor(() => expect(url()).toBe("/?lokasi=depok"));
    act(() => api.navigate(-1));
    await waitFor(() => expect(id()).toBe("jakarta"));
    expect(url()).toBe("/?lokasi=jakarta");
  });

  it("setLocationId dengan { to } berpindah halaman sekaligus", async () => {
    setup("/maps?lokasi=jakarta");
    act(() => api.setLocationId("bandung", { to: "/" }));
    await waitFor(() => expect(url()).toBe("/?lokasi=bandung"));
  });

  it("lokasi default di pengaturan tidak menimpa ?lokasi= dari alamat", async () => {
    localStorage.setItem("ku:settings:tamu", JSON.stringify({ defaultLocationId: "depok" }));
    setup("/?lokasi=bandung");
    await waitFor(() => expect(id()).toBe("bandung"));
  });

  it("lokasi default dipakai saat alamat tidak menyebut lokasi", async () => {
    localStorage.setItem("ku:settings:tamu", JSON.stringify({ defaultLocationId: "depok" }));
    setup("/");
    await waitFor(() => expect(url()).toBe("/?lokasi=depok"));
  });

  it("lokasi tidak dikenal kembali ke Jakarta", async () => {
    setup("/?lokasi=atlantis");
    await waitFor(() => expect(id()).toBe("jakarta"));
    expect(url()).toBe("/?lokasi=jakarta");
  });
});
