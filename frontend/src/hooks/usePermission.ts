import { useAuthStore } from '@/store/authStore';

export function usePermission() {
  const { hasPermission, hasRole } = useAuthStore();

  const can = (permission: string): boolean => hasPermission(permission);
  const is = (role: string): boolean => hasRole(role);
  const isAdmin = (): boolean => hasRole('Admin');
  const isBDM = (): boolean => hasRole('BDM');
  const isSeller = (): boolean => hasRole('Seller');
  const isServicePerson = (): boolean => hasRole('Service Person');

  return { can, is, isAdmin, isBDM, isSeller, isServicePerson };
}
