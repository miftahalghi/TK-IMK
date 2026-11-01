import { Link } from "react-router-dom";
import { Icon, useAuth } from "@shared";
import styles from "./auth.module.css";

/**
 * STARTER: area akun di bawah sidebar (Figma node 22:128, 22:130, 22:134).
 * Sudah berfungsi minimal. Anggota 1 boleh mengubah total tampilannya.
 */
export function AccountSlot() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <Link to="/login" className={styles.account}>
        <span className={styles.avatar} aria-hidden="true">
          <Icon name="user" size={22} />
        </span>
        <span className={styles.name}>Masuk</span>
        <Icon name="login" size={22} />
      </Link>
    );
  }

  return (
    <div className={styles.account}>
      <span className={styles.avatar} aria-hidden="true">
        {user.name.charAt(0).toUpperCase()}
      </span>
      <span className={styles.name} title={user.email}>
        {user.name}
      </span>
      <button type="button" className={styles.iconButton} onClick={logout} aria-label="Keluar">
        <Icon name="logout" size={22} />
      </button>
    </div>
  );
}
