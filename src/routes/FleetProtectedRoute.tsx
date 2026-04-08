/**
 * ProtectedRoute for fleet management — guards by role.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectFleetIsAuthenticated, selectFleetRole } from '@/features/fleet/fleetAuthSlice';
import type { Role } from '@/types/fleet';

interface Props {
  allowedRoles: Role[];
}

export default function FleetProtectedRoute({ allowedRoles }: Props) {
  const isAuthenticated = useSelector(selectFleetIsAuthenticated);
  const role = useSelector(selectFleetRole);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'car') return <Navigate to="/car/dashboard" replace />;
    if (role === 'driver') return <Navigate to="/driver/dashboard" replace />;
  }
  return <Outlet />;
}
