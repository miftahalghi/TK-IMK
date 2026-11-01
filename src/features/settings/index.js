import { lazy } from "react";
import { defineFeature } from "@shared";
import { AlertBanner } from "./AlertBanner.jsx";

/** Fitur 4: Pengaturan + banner peringatan di dashboard. Pemilik: Anggota 4. Lihat SPEC.md. */
export default defineFeature({
  id: "settings",
  title: "Pengaturan",
  owner: "Anggota 4",
  route: {
    path: "/settings",
    component: lazy(() => import("./SettingsPage.jsx")),
    nav: { label: "Pengaturan", icon: "settings", order: 4 },
    requiresAuth: true,
  },
  slots: [{ area: "dashboard-alert", component: AlertBanner }],
});
