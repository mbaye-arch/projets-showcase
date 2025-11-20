import { Link, useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '@/config/appConfig';
import { useAuth } from '@/hooks/useAuth';

export default function Topbar() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 py-3 shadow-sm backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 shadow-sm">
          <img src="/logo.png" alt="Logo SenTechCare" className="h-8 w-auto max-w-[180px] object-contain" />
        </div>
        <div className="hidden md:block">
          <p className="text-sm text-slate-500">Plateforme de gestion métier</p>
          <p className="text-base font-semibold text-slate-900">{APP_CONFIG.appName}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right md:block">
          <p className="text-sm font-medium text-slate-900">
            {currentUser?.firstName || ''} {currentUser?.lastName || ''}
          </p>
          <p className="text-xs text-slate-500">{currentUser?.email || 'Utilisateur connecté'}</p>
        </div>

        <Link
          to="/profile"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
        >
          Mon profil
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-rose-200 hover:text-rose-700"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
