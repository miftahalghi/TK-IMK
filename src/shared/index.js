/**
 * API publik lapisan bersama. Fitur HANYA boleh mengimpor dari sini:
 *
 *   import { useActiveLocation, useCurrent, CategoryPill, assess } from "@shared";
 *
 * Isi folder src/shared/ milik koordinator. Perubahan diusulkan lewat PR (CONTRACT.md §2).
 */

// Aturan ISPU & UV
export {
  assess,
  subIndex,
  categoryOf,
  uvLevelOf,
  categoryInfo,
  uvLevelInfo,
  CATEGORIES,
  CATEGORY_KEYS,
  UV_LEVELS,
  UV_LEVEL_KEYS,
  POLLUTANTS,
  POLLUTANT_KEYS,
  BREAKPOINTS,
  ISPU_BREAKS,
} from "./aqi.js";

// Format
export {
  formatNumber,
  formatTime,
  formatDate,
  formatShortDate,
  formatDay,
  formatDateTime,
  formatConcentration,
  wibParts,
  wibDateKey,
} from "./format.js";

// Konten bersama
export {
  getSummary,
  getRecommendations,
  ISPU_ADVICE,
  UV_ADVICE,
  PARAMETER_INFO,
  SOURCES,
  GLOSSARY,
  tipsAnchor,
} from "./content/advice.js";

// Data
export * as dataService from "./data/dataService.js";
export { useLocations, useCurrent, useCurrentAll, useHourly, useDaily, useSourceInfo } from "./data/hooks.js";

// State global
export { useActiveLocation, FALLBACK_LOCATION_ID, LOCATION_PARAM } from "./state/LocationContext.jsx";
export { useAuth } from "./state/AuthContext.jsx";
export { useSettings, DEFAULT_SETTINGS, MAX_SAVED_LOCATIONS } from "./state/SettingsContext.jsx";
export { useToast } from "./state/ToastContext.jsx";

// Utilitas
export { storage } from "./storage.js";
export { defineFeature, SLOT_AREAS } from "./feature.js";

// Komponen tampilan
export { Icon, ICON_NAMES } from "./components/Icon.jsx";
export {
  Card,
  CategoryPill,
  UvPill,
  Skeleton,
  ErrorState,
  EmptyState,
  AsyncBoundary,
  FeaturePlaceholder,
} from "./components/index.jsx";

// Komponen interaktif (wajib dipakai, CONTRACT.md §8)
export {
  Button,
  ButtonLink,
  TextField,
  SegmentedControl,
  InfoTip,
  ConfirmDialog,
  PageHeader,
  CategoryLegend,
} from "./components/controls.jsx";
