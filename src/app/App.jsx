import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LocationProvider } from "../shared/state/LocationContext.jsx";
import { AuthProvider } from "../shared/state/AuthContext.jsx";
import { SettingsProvider } from "../shared/state/SettingsContext.jsx";
import { ToastProvider } from "../shared/state/ToastContext.jsx";
import { features } from "../features/registry.js";
import { AppShell } from "./AppShell.jsx";
import { DashboardPage } from "./DashboardPage.jsx";
import { FeatureBoundary } from "./FeatureBoundary.jsx";
import { RequireAuth } from "./RequireAuth.jsx";
import { NotFound } from "./NotFound.jsx";

/** Perilaku React Router v7 sejak sekarang (juga menghilangkan peringatan di console). */
const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };

export function App() {
  const routed = features.filter((f) => f.route);

  return (
    <BrowserRouter future={ROUTER_FUTURE}>
      <AuthProvider>
        <SettingsProvider>
          {/* LocationProvider di dalam router karena lokasi aktif disimpan di URL (?lokasi=). */}
          <LocationProvider>
            <ToastProvider>
              <Routes>
                <Route element={<AppShell />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="dashboard" element={<Navigate to="/" replace />} />
                  {routed.map((f) => {
                    const Page = f.route.component;
                    const page = (
                      <FeatureBoundary feature={f}>
                        <Page />
                      </FeatureBoundary>
                    );
                    return (
                      <Route
                        key={f.id}
                        path={f.route.path.replace(/^\//, "")}
                        element={f.route.requiresAuth ? <RequireAuth>{page}</RequireAuth> : page}
                      />
                    );
                  })}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </ToastProvider>
          </LocationProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
