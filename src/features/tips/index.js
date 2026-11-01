import { lazy } from "react";
import { defineFeature } from "@shared";

/** Fitur 3: Tips dan edukasi polutan. Pemilik: Anggota 3. Lihat SPEC.md. */
export default defineFeature({
  id: "tips",
  title: "Tips",
  owner: "Anggota 3",
  route: {
    path: "/tips",
    component: lazy(() => import("./TipsPage.jsx")),
    nav: { label: "Tips", icon: "idea", order: 3 },
  },
});
