import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAdmin({ children }) {
  const location = useLocation();
  let admin = null;
  try { admin = JSON.parse(localStorage.getItem('admin') || 'null'); } catch {}
  return admin?.token ? children : <Navigate to="/login" replace state={{ from: location }} />;
}
