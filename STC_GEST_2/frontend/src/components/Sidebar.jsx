import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/materiels', label: 'Matériels' },
  { to: '/stock', label: 'Stock' },
  { to: '/mouvements', label: 'Mouvements' },
  { to: '/inventaire', label: 'Inventaire' },
  { to: '/etiquettes', label: 'Étiquettes' },
  { to: '/parametres', label: 'Paramètres' }
];

function Sidebar() {
  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-72 overflow-hidden rounded-3xl bg-gradient-to-b from-ink to-slate-900 p-4 text-slate-100 shadow-card lg:block">
      <div className="mb-8 flex items-center gap-3 px-2 py-2">
        <img alt="Logo" className="h-12 w-12 rounded-xl bg-white/90 p-1" src="/logo.png" />
        <div>
          <p className="font-display text-lg font-bold leading-tight">SenTechCare</p>
          <p className="text-xs text-slate-300">Gestion IT locale</p>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-white text-ink' : 'text-slate-200 hover:bg-white/10'
              }`
            }
            key={item.to}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
        Local · Sans authentification
        <br />
        Version 1.0
      </div>
    </aside>
  );
}

export default Sidebar;
