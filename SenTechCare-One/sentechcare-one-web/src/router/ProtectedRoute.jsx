import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AuthLoadingScreen from '@/components/auth/AuthLoadingScreen';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute() {
  const location = useLocation();
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  return <Outlet />;
}
