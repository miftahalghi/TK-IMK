import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, FeaturePlaceholder, PageHeader, useAuth } from "@shared";
import styles from "./auth.module.css";

/**
 * PLACEHOLDER: ganti seluruh isi file ini dengan halaman login sungguhan (SPEC.md).
 * Tombol "Masuk sebagai demo" disediakan supaya anggota lain (misalnya Pengaturan)
 * bisa menguji halaman yang butuh login sebelum fitur ini selesai.
 */
export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";

  const demoLogin = async () => {
    await login("demo@kampus.ac.id", "demo123");
    navigate(next, { replace: true });
  };

  return (
    <div className={styles.page}>
      <PageHeader title="Masuk" description="Akun dipakai untuk menyimpan lokasi dan pengaturan Anda." />
      <FeaturePlaceholder
        feature="auth"
        owner="Anggota 1"
        title="Halaman Login"
        items={[
          "Form email + kata sandi memakai TextField dan Button dari @shared",
          "Pesan error yang jelas di bawah field",
          "Pilihan “Lanjut sebagai tamu” yang terlihat jelas",
          "Setelah masuk, kembali ke halaman asal (?next=)",
        ]}
      />
      {user ? (
        <p>Anda sudah masuk sebagai {user.email}.</p>
      ) : (
        <Button variant="primary" onClick={demoLogin} className="self-start">
          Masuk sebagai demo
        </Button>
      )}
    </div>
  );
}
