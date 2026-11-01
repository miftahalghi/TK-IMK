/**
 * Daftar semua fitur. MILIK KOORDINATOR: anggota tidak mengedit file ini.
 * Ketujuh fitur sudah terdaftar sejak awal, jadi anggota cukup bekerja di
 * folder fiturnya masing-masing.
 */
import auth from "./auth/index.js";
import maps from "./maps/index.js";
import tips from "./tips/index.js";
import settings from "./settings/index.js";
import hero from "./hero/index.js";
import insights from "./insights/index.js";
import outlook from "./outlook/index.js";

export const features = [auth, maps, tips, settings, hero, insights, outlook];

/** Komponen slot untuk satu area, terurut. */
export function slotsFor(area) {
  return features
    .flatMap((f) => (f.slots ?? []).filter((s) => s.area === area).map((s) => ({ ...s, feature: f })))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** Item menu sidebar dari fitur yang punya route.nav, terurut. */
export function navItems() {
  return features
    .filter((f) => f.route?.nav)
    .map((f) => ({ ...f.route.nav, path: f.route.path, featureId: f.id }))
    .sort((a, b) => a.order - b.order);
}
