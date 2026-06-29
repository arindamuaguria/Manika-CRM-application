import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface RoleBasedRouteProps {
  allowedRoles: string[];
  redirectTo?: string;
}

export function RoleBasedRoute({ allowedRoles, redirectTo = '/unauthorized' }: RoleBasedRouteProps) {
  const { user } = useAuthStore();

  const hasAccess = user?.roles?.some((role) => allowedRoles.includes(role.name));

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
