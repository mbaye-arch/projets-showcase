import { NavLink, Outlet } from 'react-router-dom';
import brandIcon from '../assets/favicon_io/apple-touch-icon.png';

const links = [
  { to: '/dashboard', label: 'Dashboard', code: 'DB' },
  { to: '/suppliers', label: 'Fournisseurs', code: 'FR' },
  { to: '/categories', label: 'Catégories', code: 'CT' },
  { to: '/hardware', label: 'Matériels', code: 'HW' },
  { to: '/software', label: 'Logiciels', code: 'SW' },
  { to: '/catalog', label: 'Catalogue interne', code: 'INT' },
  { to: '/catalogues', label: 'Catalogues clients', code: 'CLI' },
  { to: '/selection', label: 'Sélection', code: 'SL' }
];

const getDesktopLinkClass = ({ isActive }) =>
  [
    'group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition',
    isActive
      ? 'border-brand-500/30 bg-brand-500 text-slate-950 shadow-glow'
      : 'border-transparent text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
  ].join(' ');

const getMobileLinkClass = ({ isActive }) =>
  [
    'rounded-lg border px-3 py-1.5 text-xs font-semibold transition',
    isActive
      ? 'border-brand-500/30 bg-brand-500 text-slate-950'
      : 'border-white/15 bg-white/5 text-slate-100'
  ].join(' ');

const AppLayout = () => (
  <div className="min-h-screen">
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-32 -top-24 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
    </div>

    <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-white/10 bg-slate-950/95 p-6 text-slate-100 shadow-2xl backdrop-blur md:flex md:flex-col">
      <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-white/70">
            <img
              alt="SenTechCare logo"
              className="h-16 w-16 rounded-xl object-cover"
              src={brandIcon}
            />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-brand-200">
              SenTechCare
            </p>
            <h1 className="mt-1 font-display text-[1.65rem] font-extrabold leading-[1.02] text-white">
              Internal
              <br />
              Manager
            </h1>
          </div>
        </div>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {links.map((link) => (
          <NavLink className={getDesktopLinkClass} key={link.to} to={link.to}>
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg border border-white/25 bg-white/10 px-2 text-[10px] font-bold tracking-wide">
              {link.code}
            </span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 rounded-xl border border-white/15 bg-white/5 p-3 text-xs text-slate-300">
        <p className="font-semibold text-white">Workspace SenTechCare</p>
        <p className="mt-1">Gestion centralisée produits, fournisseurs et catalogues clients.</p>
      </div>
    </aside>

    <div className="md:pl-72">
      <header className="sticky top-0 z-10 border-b border-white/15 bg-slate-950/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-white p-1 ring-1 ring-white/50">
            <img alt="SenTechCare logo" className="h-9 w-9 rounded object-cover" src={brandIcon} />
          </div>
          <p className="font-display text-sm font-bold text-white">SenTechCare Internal Manager</p>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {links.map((link) => (
            <NavLink className={getMobileLinkClass} key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <Outlet />
      </main>
    </div>
  </div>
);

export default AppLayout;
