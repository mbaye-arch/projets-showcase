import { cn } from '@/lib/cn';

export default function EmptyState({
  title = 'Aucune donnee disponible',
  description = 'Les informations apparaitront ici des que des donnees seront disponibles.',
  icon,
  action,
  className
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm',
        className
      )}
    >
      {icon ? <div className="mb-3 flex justify-center text-slate-400">{icon}</div> : null}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
