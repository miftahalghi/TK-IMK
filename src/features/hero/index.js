import { defineFeature } from "@shared";
import { HeroSection } from "./HeroSection.jsx";

/** Fitur 5: Search + kartu utama (dashboard tengah atas). Pemilik: Anggota 5. Lihat SPEC.md. */
export default defineFeature({
  id: "hero",
  title: "Pencarian dan Kartu Utama",
  owner: "Anggota 5",
  slots: [{ area: "dashboard-top", component: HeroSection }],
});
