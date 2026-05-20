import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const loc = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (!user) return null; // wait for fetchMe
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  if (!user) return null;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}
