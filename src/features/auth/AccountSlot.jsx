import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Icon, useAuth, useToast } from "@shared";
import profileImage from "./assets/Three_finger_salute_-removebg-preview.png";
import styles from "./auth.module.css";

/**
 * STARTER: area akun di bawah sidebar (Figma node 22:128, 22:130, 22:134).
 * Sudah berfungsi minimal. Anggota 1 boleh mengubah total tampilannya.
 */
export function AccountSlot() {
  const { user, logout } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    show("Anda telah keluar.");
    navigate("/", { replace: true });
  };

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
      <img className={styles.avatarImage} src={profileImage} alt={`Foto profil ${user.name}`} />
      <span className={styles.name} title={user.name}>
        {user.name}
      </span>
      <button type="button" className={styles.iconButton} onClick={handleLogout} aria-label="Keluar">
        <Icon name="logout" size={22} />
      </button>
    </div>
  );
}
