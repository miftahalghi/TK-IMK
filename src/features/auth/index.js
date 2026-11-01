import { lazy } from "react";
import { defineFeature } from "@shared";
import { AccountSlot } from "./AccountSlot.jsx";

/** Fitur 1: Login/Logout dan area akun di sidebar. Pemilik: Anggota 1. Lihat SPEC.md. */
export default defineFeature({
  id: "auth",
  title: "Login dan Akun",
  owner: "Anggota 1",
  route: {
    path: "/login",
    component: lazy(() => import("./LoginPage.jsx")),
    // Tidak tampil di menu sidebar; dibuka dari tombol "Masuk" di area akun.
  },
  slots: [{ area: "sidebar-account", component: AccountSlot }],
});
