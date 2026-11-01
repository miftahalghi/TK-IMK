import { Component, Suspense } from "react";
import { ErrorState, Skeleton } from "../shared/components/index.jsx";

/**
 * Mengisolasi setiap fitur: kalau satu fitur error, fitur lain tetap tampil.
 * Pesan untuk pengguna memakai bahasa sehari-hari (Nielsen N9). Detail teknis
 * (nama fitur, pemilik, pesan JavaScript) hanya ditulis ke console untuk developer.
 */
class Boundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    const { feature } = this.props;
    console.error(`[fitur "${feature.id}" · ${feature.owner}] ${error.message}`, error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    const { feature, children } = this.props;
    if (error) {
      return (
        <ErrorState
          message={`Bagian “${feature.title}” tidak dapat ditampilkan saat ini. Bagian lain tetap bisa dipakai. Coba muat ulang bagian ini.`}
          onRetry={() => this.setState({ error: null })}
        />
      );
    }
    return children;
  }
}

export function FeatureBoundary({ feature, children }) {
  return (
    <Boundary feature={feature}>
      <Suspense fallback={<Skeleton height={160} radius="var(--radius-card)" />}>{children}</Suspense>
    </Boundary>
  );
}
