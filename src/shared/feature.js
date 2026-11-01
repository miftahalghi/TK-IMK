/**
 * Kontrak fitur (CONTRACT.md §4). Setiap src/features/<id>/index.js
 * mengekspor `defineFeature({...})` sebagai default.
 */

/**
 * Area slot yang tersedia:
 *   dashboard-alert   banner di atas dashboard           → settings
 *   dashboard-top     search + kartu utama               → hero
 *   dashboard-bottom  rekomendasi, polutan, daerah        → insights
 *   dashboard-aside   panel kanan per jam / 7 hari        → outlook
 *   sidebar-account   area akun di bawah sidebar          → auth
 */
export const SLOT_AREAS = ["dashboard-alert", "dashboard-top", "dashboard-bottom", "dashboard-aside", "sidebar-account"];

/**
 * @typedef {object} FeatureRoute
 * @property {string} path               contoh "/maps"
 * @property {import("react").ComponentType} component  halaman (sebaiknya React.lazy)
 * @property {{label: string, icon: string, order: number}} [nav]  tampil di sidebar jika diisi
 * @property {boolean} [requiresAuth]    true = tamu diarahkan ke /login
 *
 * @typedef {object} FeatureSlot
 * @property {"dashboard-alert"|"dashboard-top"|"dashboard-bottom"|"dashboard-aside"|"sidebar-account"} area
 * @property {import("react").ComponentType} component
 * @property {number} [order]            urutan jika satu area diisi beberapa fitur
 *
 * @typedef {object} Feature
 * @property {string} id                 sama dengan nama folder
 * @property {string} title
 * @property {string} owner              contoh "Anggota 2"
 * @property {FeatureRoute} [route]
 * @property {FeatureSlot[]} [slots]
 */

/** @param {Feature} feature */
export function defineFeature(feature) {
  for (const slot of feature.slots ?? []) {
    if (!SLOT_AREAS.includes(slot.area)) {
      throw new Error(`[fitur ${feature.id}] area slot "${slot.area}" tidak dikenal. Pilihan: ${SLOT_AREAS.join(", ")}`);
    }
  }
  if (feature.route && !/^\/[a-z-]+$/.test(feature.route.path)) {
    throw new Error(`[fitur ${feature.id}] route.path "${feature.route.path}" harus berbentuk "/nama-halaman".`);
  }
  return Object.freeze(feature);
}
