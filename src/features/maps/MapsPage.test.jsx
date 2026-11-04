// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import * as shared from "@shared";
import MapsPage from "./MapsPage.jsx";

const SAMPLE_LOCATIONS = [
  {
    id: "jakarta",
    name: "Jabodetabek",
    region: "DKI Jakarta, Jawa Barat, Banten",
    lat: -6.2088,
    lon: 106.8456,
    aliases: ["Jakarta", "Bogor", "Depok", "Tangerang", "Bekasi"],
  },
  { id: "serang", name: "Serang", region: "Banten", lat: -6.1201, lon: 106.1503 },
  { id: "bandung", name: "Bandung", region: "Jawa Barat", lat: -6.9175, lon: 107.6191 },
  { id: "surabaya", name: "Surabaya", region: "Jawa Timur", lat: -7.2575, lon: 112.7521 },
  { id: "yogyakarta", name: "Yogyakarta", region: "DI Yogyakarta", lat: -7.7956, lon: 110.3695 },
  { id: "denpasar", name: "Denpasar", region: "Bali", lat: -8.6705, lon: 115.2126 },
  { id: "medan", name: "Medan", region: "Sumatera Utara", lat: 3.5952, lon: 98.6722 },
  { id: "pekanbaru", name: "Pekanbaru", region: "Riau", lat: 0.5071, lon: 101.4478 },
  { id: "ambon", name: "Ambon", region: "Maluku", lat: -3.6954, lon: 128.1814 },
];

const SAMPLE_READINGS = [
  { locationId: "jakarta", time: "2026-10-26T12:00:00+07:00", pm25: 65.2, pm10: 110, co: 5200, no2: 45, so2: 20, uv: 8 },
  { locationId: "serang", time: "2026-10-26T12:00:00+07:00", pm25: 170, pm10: 210, co: 6500, no2: 60, so2: 30, uv: 9 },
  { locationId: "bandung", time: "2026-10-26T12:00:00+07:00", pm25: 48, pm10: 75, co: 3100, no2: 32, so2: 14, uv: 7 },
  { locationId: "surabaya", time: "2026-10-26T12:00:00+07:00", pm25: 38, pm10: 65, co: 2800, no2: 28, so2: 12, uv: 10 },
  { locationId: "yogyakarta", time: "2026-10-26T12:00:00+07:00", pm25: 22, pm10: 45, co: 1900, no2: 18, so2: 10, uv: 8 },
  { locationId: "denpasar", time: "2026-10-26T12:00:00+07:00", pm25: 10, pm10: 24, co: 900, no2: 12, so2: 6, uv: 11 },
  // Medan memiliki data bolong (pm25 & co null) seperti di mode mock
  { locationId: "medan", time: "2026-10-26T12:00:00+07:00", pm25: null, pm10: 85, co: null, no2: 35, so2: 15, uv: 7 },
  { locationId: "pekanbaru", time: "2026-10-26T12:00:00+07:00", pm25: 290, pm10: 360, co: 9500, no2: 80, so2: 40, uv: 5 },
  { locationId: "ambon", time: "2026-10-26T12:00:00+07:00", pm25: 12, pm10: 28, co: 1100, no2: 10, so2: 5, uv: 10 },
];

let mockActiveId = "jakarta";
const mockSetLocationId = vi.fn((id) => {
  mockActiveId = id;
});
const mockToastShow = vi.fn();
let mockLocationsState = { status: "success", data: SAMPLE_LOCATIONS, error: null, reload: vi.fn() };
let mockReadingsState = { status: "success", data: SAMPLE_READINGS, error: null, reload: vi.fn() };

vi.mock("@shared", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useActiveLocation: () => ({
      locationId: mockActiveId,
      location: SAMPLE_LOCATIONS.find((l) => l.id === mockActiveId) ?? null,
      setLocationId: mockSetLocationId,
    }),
    useToast: () => ({
      show: mockToastShow,
      dismiss: vi.fn(),
    }),
    useLocations: () => mockLocationsState,
    useCurrentAll: () => mockReadingsState,
  };
});

function renderMapsPage(initialEntry = "/maps?lokasi=jakarta") {
  function LocationDisplay() {
    const loc = useLocation();
    return <span data-testid="router-url">{loc.pathname + loc.search}</span>;
  }

  return render(
    <MemoryRouter initialEntries={[initialEntry]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LocationDisplay />
      <MapsPage />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockActiveId = "jakarta";
  mockLocationsState = { status: "success", data: SAMPLE_LOCATIONS, error: null, reload: vi.fn() };
  mockReadingsState = { status: "success", data: SAMPLE_READINGS, error: null, reload: vi.fn() };
});

describe("MapsPage", () => {
  it("menampilkan judul halaman, legenda kategori ISPU, atribusi OSM, dan 9 lokasi terurut dari ISPU tertinggi", () => {
    renderMapsPage();

    expect(screen.getByRole("heading", { level: 1, name: "Peta Kualitas Udara" })).toBeTruthy();
    expect(screen.getByRole("list", { name: "Arti warna kategori ISPU" })).toBeTruthy();
    expect(screen.getByText(/OpenStreetMap/i)).toBeTruthy();

    const list = screen.getByRole("list", { name: "Daftar lokasi kualitas udara" });
    const buttons = within(list).getAllByRole("button");
    expect(buttons).toHaveLength(9);

    // Pekanbaru punya PM2.5 tertinggi (290 -> ISPU Berbahaya), sehingga berada di urutan pertama
    expect(buttons[0].textContent).toContain("Pekanbaru");
    expect(buttons[1].textContent).toContain("Serang");
  });

  it("membuka panel detail lokasi aktif saat pertama dibuka dan menampilkan cakupan Jabodetabek", () => {
    renderMapsPage();

    const detailRegion = screen.getByRole("region", { name: "Jabodetabek" });
    expect(detailRegion).toBeTruthy();
    expect(within(detailRegion).getAllByText(/Mencakup Jakarta, Bogor, Depok, Bekasi/i).length).toBeGreaterThan(0);
    expect(within(detailRegion).getByText(/PM2\.5 · Partikulat halus/i)).toBeTruthy();
    expect(within(detailRegion).getByText(/26 Okt 2026/i)).toBeTruthy();
  });

  it("menangani data bolong (Medan: PM2.5 dan CO null) dengan tetap menampilkan lokasi dan polutan lain", () => {
    renderMapsPage();

    const list = screen.getByRole("list", { name: "Daftar lokasi kualitas udara" });
    const medanButton = within(list).getByRole("button", { name: /Medan/i });
    fireEvent.click(medanButton);

    const detailRegion = screen.getByRole("region", { name: "Medan" });
    const expectedMedan = shared.assess(SAMPLE_READINGS.find((r) => r.locationId === "medan"));
    expect(expectedMedan.ispu).not.toBeNull();
    expect(within(detailRegion).getByText(/PM10 · Partikulat kasar/i)).toBeTruthy();
    expect(within(detailRegion).getAllByText("Tidak tersedia").length).toBeGreaterThanOrEqual(2);
  });

  it("dapat menutup panel detail lewat tombol Tutup maupun tombol Esc", () => {
    renderMapsPage();

    expect(screen.getByRole("region", { name: "Jabodetabek" })).toBeTruthy();
    const closeBtn = screen.getByRole("button", { name: /Tutup panel detail Jabodetabek/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole("region", { name: "Jabodetabek" })).toBeNull();

    // Klik lokasi di daftar membuka kembali panel detail
    const list = screen.getByRole("list", { name: "Daftar lokasi kualitas udara" });
    fireEvent.click(within(list).getByRole("button", { name: /Bandung/i }));
    expect(screen.getByRole("region", { name: "Bandung" })).toBeTruthy();

    // Tekan Escape menutup panel detail
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("region", { name: "Bandung" })).toBeNull();
  });

  it("tombol Lihat di Beranda memanggil setLocationId(id, { to: '/' })", () => {
    renderMapsPage();

    const list = screen.getByRole("list", { name: "Daftar lokasi kualitas udara" });
    fireEvent.click(within(list).getByRole("button", { name: /Surabaya/i }));

    const detailRegion = screen.getByRole("region", { name: "Surabaya" });
    const viewBtn = within(detailRegion).getByRole("button", { name: /Lihat di Beranda/i });
    fireEvent.click(viewBtn);

    expect(mockSetLocationId).toHaveBeenCalledWith("surabaya", { to: "/" });
    expect(mockToastShow).toHaveBeenCalled();
  });

  it("mendukung pergantian parameter tampilan (ISPU / PM2.5 / UV) lewat SegmentedControl", () => {
    renderMapsPage();

    const uvButton = screen.getByRole("button", { name: "UV" });
    fireEvent.click(uvButton);

    expect(screen.getByRole("list", { name: "Arti warna level UV Index" })).toBeTruthy();
    const list = screen.getByRole("list", { name: "Daftar lokasi kualitas udara" });
    const buttons = within(list).getAllByRole("button");
    // Denpasar memiliki UV tertinggi (11) pada data sampel
    expect(buttons[0].textContent).toContain("Denpasar");
  });

  it("menampilkan skeleton saat memuat dan ErrorState beserta tombol Coba lagi saat gagal", () => {
    const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };
    mockLocationsState = { status: "loading", data: undefined, error: null, reload: vi.fn() };
    const { rerender } = render(
      <MemoryRouter future={routerFuture}>
        <MapsPage />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText("Memuat peta kualitas udara")).toBeTruthy();

    const reloadLocations = vi.fn();
    const reloadReadings = vi.fn();
    mockLocationsState = { status: "error", data: undefined, error: new Error("Gagal memuat data (simulasi)."), reload: reloadLocations };
    mockReadingsState = { status: "error", data: undefined, error: new Error("Gagal memuat data (simulasi)."), reload: reloadReadings };

    rerender(
      <MemoryRouter future={routerFuture}>
        <MapsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Coba lagi/i }));
    expect(reloadLocations).toHaveBeenCalledTimes(1);
    expect(reloadReadings).toHaveBeenCalledTimes(1);
  });

  it("menangani state data kosong (?simulasi=kosong) ketika semua nilai polutan dan UV bernilai null", () => {
    mockReadingsState = {
      status: "success",
      data: SAMPLE_READINGS.map((r) => ({
        ...r,
        pm25: null,
        pm10: null,
        co: null,
        no2: null,
        so2: null,
        uv: null,
      })),
      error: null,
      reload: vi.fn(),
    };

    renderMapsPage();
    expect(
      screen.getByText(/Data pengukuran kualitas udara sedang tidak tersedia untuk semua lokasi/i),
    ).toBeTruthy();
    const list = screen.getByRole("list", { name: "Daftar lokasi kualitas udara" });
    expect(within(list).getAllByRole("button")).toHaveLength(9);
  });
});
