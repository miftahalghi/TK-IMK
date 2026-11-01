import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Icon } from "../shared/components/Icon.jsx";
import { navItems, slotsFor } from "../features/registry.js";
import { APP_NAME } from "./config.js";
import { FeatureBoundary } from "./FeatureBoundary.jsx";
import { ContextBar } from "./ShellParts.jsx";
import styles from "./AppShell.module.css";

/**
 * Kerangka semua halaman: sidebar + bar konteks + area konten.
 * Menu Beranda selalu ada; menu lain dibaca dari registry (route.nav).
 * Di layar < 900 px sidebar menjadi laci yang dibuka lewat tombol menu.
 * Tautan menu membawa ?lokasi= supaya lokasi aktif tidak hilang saat berpindah halaman.
 */
export function AppShell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const items = [{ path: "/", label: "Beranda", icon: "dashboard", featureId: "beranda" }, ...navItems()];
  const account = slotsFor("sidebar-account");
  const lokasi = new URLSearchParams(location.search).get("lokasi");
  const keep = lokasi ? `?lokasi=${encodeURIComponent(lokasi)}` : "";

  // Tutup laci setiap pindah halaman.
  useEffect(() => setOpen(false), [location.pathname]);

  // Esc menutup laci.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Gulir ke atas saat berpindah halaman (bukan saat ganti lokasi), kecuali menuju #jangkar.
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return (
    <div className={styles.shell}>
      <a href="#konten" className={styles.skip}>
        Langsung ke konten
      </a>

      <header className={styles.topbar}>
        <button
          type="button"
          className={styles.menuButton}
          aria-label="Buka menu"
          aria-expanded={open}
          aria-controls="sidebar"
          onClick={() => setOpen(true)}
        >
          <Icon name="menu" />
        </button>
        <span className={styles.topbarBrand}>{APP_NAME}</span>
      </header>

      {open && <div className={styles.scrim} onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside id="sidebar" className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`} aria-label="Navigasi utama">
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            <Icon name="air" size={36} strokeWidth={2} />
          </span>
          <span className={styles.brandName}>{APP_NAME}</span>
          <button type="button" className={styles.closeButton} aria-label="Tutup menu" onClick={() => setOpen(false)}>
            <Icon name="close" />
          </button>
        </div>

        <nav className={styles.nav}>
          <ul>
            {items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={`${item.path}${keep}`}
                  end={item.path === "/"}
                  className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                >
                  <Icon name={item.icon} size={30} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.account}>
          {account.map(({ feature, component: Slot }) => (
            <FeatureBoundary key={feature.id} feature={feature}>
              <Slot />
            </FeatureBoundary>
          ))}
        </div>
      </aside>

      <main id="konten" className={styles.main} tabIndex={-1}>
        <div className={styles.context}>
          <ContextBar />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
