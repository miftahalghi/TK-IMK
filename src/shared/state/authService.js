/**
 * Layanan autentikasi MOCK (PRD D5). Disimpan di localStorage, tanpa server.
 * Kata sandi TIDAK PERNAH disimpan, hanya { name, email }.
 *
 * Untuk mengganti ke backend sungguhan (Firebase/Supabase), ganti isi tiga fungsi
 * ini saja. Bentuk masukan/keluaran harus tetap sama. Halaman login (fitur auth)
 * dan komponen lain tidak perlu berubah.
 */
import { storage } from "../storage.js";

const KEY = "session";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function nameFromEmail(email) {
  const local = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  return local ? local.replace(/\b\w/g, (c) => c.toUpperCase()) : "Pengguna";
}

/** @returns {{ name: string, email: string } | null} */
export function getSession() {
  const s = storage.get(KEY);
  return s && typeof s.email === "string" ? s : null;
}

/**
 * @returns {Promise<{ name: string, email: string }>}
 * @throws {Error} pesan error siap tampil (Bahasa Indonesia)
 */
export async function login(email, password) {
  await new Promise((r) => setTimeout(r, 300));
  const cleanEmail = String(email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(cleanEmail)) throw new Error("Format email belum benar.");
  if (String(password ?? "").length < 6) throw new Error("Kata sandi minimal 6 karakter.");
  const user = { name: nameFromEmail(cleanEmail), email: cleanEmail };
  storage.set(KEY, user);
  return user;
}

export async function logout() {
  storage.remove(KEY);
}
