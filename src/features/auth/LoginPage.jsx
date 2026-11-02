import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, ButtonLink, Card, Icon, PageHeader, TextField, useAuth, useToast } from "@shared";
import styles from "./auth.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOGIN_DESCRIPTION = "Masuk untuk menyimpan lokasi rumah, kantor, dan kampus serta mengatur peringatan. Data disimpan di perangkat ini.";

function getLoginDestination(next) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default function LoginPage() {
  const { user, login, logout } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const formRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const nextErrors = {
      email: EMAIL_RE.test(email.trim()) ? "" : "Format email belum benar. Contoh: nama@kampus.ac.id",
      password: password.length >= 6 ? "" : "Kata sandi minimal 6 karakter.",
    };
    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      const invalidField = nextErrors.email ? "email" : "password";
      formRef.current?.elements.namedItem(invalidField)?.focus();
      return;
    }

    setLoading(true);
    try {
      const signedInUser = await login(email.trim(), password);
      show(`Berhasil masuk sebagai ${signedInUser.name}.`);
      navigate(getLoginDestination(params.get("next")), { replace: true });
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      if (error.message.includes("email")) {
        setErrors((current) => ({ ...current, email: `${error.message} Contoh: nama@kampus.ac.id` }));
        formRef.current?.elements.namedItem("email")?.focus();
      } else if (error.message.includes("Kata sandi")) {
        setErrors((current) => ({ ...current, password: error.message }));
        formRef.current?.elements.namedItem("password")?.focus();
      } else {
        setFormError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    show("Anda telah keluar.");
    navigate("/", { replace: true });
  };

  return (
    <div className={styles.page}>
      <PageHeader title="Masuk" description="Kelola lokasi dan pengaturan akun Anda." />

      {user ? (
        <Card title="Anda sudah masuk" className={styles.signedInCard} icon="user">
          <div className={styles.signedIn}>
            <p>Anda sudah masuk sebagai {user.name}.</p>
            <div className={styles.actions}>
              <ButtonLink to="/" variant="primary">Lanjut ke Beranda</ButtonLink>
              <Button type="button" onClick={handleLogout}>Keluar</Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className={styles.loginLayout}>
          <section className={styles.welcomePanel} aria-labelledby="welcome-title">
            <span className={styles.welcomeIcon} aria-hidden="true">
              <Icon name="air" size={32} />
            </span>
            <p className={styles.eyebrow}>Akun kualitas udara</p>
            <h2 id="welcome-title">Pantau yang penting bagi Anda.</h2>
            <p className={styles.welcomeDescription}>
              Masuk untuk menyimpan lokasi rumah, kantor, dan kampus serta mengatur peringatan.
            </p>
            <ul className={styles.benefits}>
              <li>Simpan lokasi yang sering Anda cek</li>
              <li>Atur peringatan sesuai kebutuhan</li>
              <li>Data akun simulasi tersimpan di perangkat ini</li>
            </ul>
          </section>

          <Card title="Masuk ke akun" subtitle={LOGIN_DESCRIPTION} className={styles.loginCard} icon="login">
            <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
              <TextField
                id="login-email"
                name="email"
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrors((current) => ({ ...current, email: "" }));
                }}
                error={errors.email}
                required
              />
              <div className={styles.passwordField}>
                <TextField
                  id="login-password"
                  name="password"
                  label="Kata sandi"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrors((current) => ({ ...current, password: "" }));
                  }}
                  error={errors.password}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={styles.passwordToggle}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                </Button>
              </div>

              {formError && <p className={styles.formError} role="alert">{formError}</p>}

              <div className={styles.actions}>
                <Button type="submit" variant="primary" loading={loading}>
                  Masuk
                </Button>
                <ButtonLink to="/" variant="secondary">Lanjut sebagai tamu</ButtonLink>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
