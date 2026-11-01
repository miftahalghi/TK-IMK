import { lazy } from "react";
import { defineFeature } from "@shared";

/** Fitur 2: Peta kualitas udara. Pemilik: Anggota 2. Lihat SPEC.md. */
export default defineFeature({
  id: "maps",
  title: "Peta",
  owner: "Anggota 2",
  route: {
    path: "/maps",
    // lazy: library peta (Leaflet) hanya dimuat saat halaman ini dibuka.
    component: lazy(() => import("./MapsPage.jsx")),
    nav: { label: "Peta", icon: "map", order: 2 },
  },
});
