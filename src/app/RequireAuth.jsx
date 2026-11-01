import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../shared/state/AuthContext.jsx";

/** Halaman yang butuh login: tamu diarahkan ke /login?next=<halaman asal>. */
export function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}
