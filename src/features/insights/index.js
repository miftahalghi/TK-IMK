import { defineFeature } from "@shared";
import { InsightsSection } from "./InsightsSection.jsx";

/**
 * Fitur 6: Rekomendasi Sehat + Rincian Polutan + Kualitas Udara Daerah
 * (dashboard tengah bawah). Pemilik: Anggota 6. Lihat SPEC.md.
 */
export default defineFeature({
  id: "insights",
  title: "Rekomendasi dan Daerah",
  owner: "Anggota 6",
  slots: [{ area: "dashboard-bottom", component: InsightsSection }],
});
