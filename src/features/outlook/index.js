import { defineFeature } from "@shared";
import { OutlookPanel } from "./OutlookPanel.jsx";

/** Fitur 7: Panel kanan per jam / 7 hari (dashboard kanan). Pemilik: Anggota 7. Lihat SPEC.md. */
export default defineFeature({
  id: "outlook",
  title: "Per Jam dan 7 Hari",
  owner: "Anggota 7",
  slots: [{ area: "dashboard-aside", component: OutlookPanel }],
});
