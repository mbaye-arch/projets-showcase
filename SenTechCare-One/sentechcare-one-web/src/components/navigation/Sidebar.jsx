import { NavLink } from 'react-router-dom';
import { APP_CONFIG } from '@/config/appConfig';
import { useAuth } from '@/hooks/useAuth';
import { getModuleLinksByRole } from '@/utils/navigation';

function navClassName({ isActive }) {
  return [
    'block rounded-lg px-3 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-white text-brand-700 shadow-sm ring-1 ring-brand-100'
      : 'text-slate-300 hover:bg-white/10 hover:text-white'
  ].join(' ');
}

export default function Sidebar() {
  const { currentUser } = useAuth();
  const moduleLinks = getModuleLinksByRole(currentUser?.roleName);

  return (
    <aside className="hidden w-64 border-r border-slate-900 bg-slate-950 px-4 py-5 md:block">
      <div className="mb-6 rounded-xl border border-white/10 bg-white px-3 py-3 shadow-soft">
        <img src="/logo.png" alt="Logo SenTechCare" className="h-10 w-auto max-w-full object-contain" />
        <p className="mt-2 text-xs font-medium text-slate-500">{APP_CONFIG.appName}</p>
      </div>

      <nav className="space-y-1">
        {moduleLinks.map((item) => (
          <NavLink key={item.path} to={item.path} className={navClassName}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
