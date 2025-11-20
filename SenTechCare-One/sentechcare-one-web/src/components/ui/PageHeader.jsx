import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

export default function PageHeader({ title, subtitle, actions, breadcrumbs = [], className }) {
  return (
    <div
      className={cn(
        'mb-5 rounded-xl border border-brand-100 bg-white px-5 py-4 shadow-soft md:mb-6',
        className
      )}
    >
      {breadcrumbs.length > 0 ? (
        <nav aria-label="Fil d'ariane" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-slate-500">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1">
              {crumb.to ? (
                <Link to={crumb.to} className="transition hover:text-slate-700">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-slate-600">{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 ? <span>/</span> : null}
            </span>
          ))}
        </nav>
      ) : null}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>

        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
