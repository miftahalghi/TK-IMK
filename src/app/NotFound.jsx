import { ButtonLink, EmptyState, PageHeader } from "../shared/index.js";

export function NotFound() {
  return (
    <div style={{ display: "grid", gap: "var(--space-5)", maxWidth: 560 }}>
      <PageHeader title="Halaman tidak ditemukan" description="Alamat yang Anda buka tidak tersedia atau sudah dipindahkan." />
      <EmptyState message="Periksa kembali alamatnya, atau kembali ke Beranda." />
      <ButtonLink to="/" variant="primary" icon="dashboard" className="self-start">
        Kembali ke Beranda
      </ButtonLink>
    </div>
  );
}
