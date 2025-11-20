import { Navigate, Outlet } from 'react-router-dom';
import AuthLoadingScreen from '@/components/auth/AuthLoadingScreen';
import { useAuth } from '@/hooks/useAuth';

export default function PublicOnlyRoute() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
