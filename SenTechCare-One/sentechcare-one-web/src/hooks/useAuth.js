import { useAuthContext } from '@/app/AuthContext';

export function useAuth() {
  return useAuthContext();
}
