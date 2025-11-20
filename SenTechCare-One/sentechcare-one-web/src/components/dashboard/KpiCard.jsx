import { cn } from '@/lib/cn';

const toneStyles = {
  neutral: {
    border: 'border-slate-200',
    dot: 'bg-slate-500',
    glow: 'from-slate-500/12'
  },
  success: {
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    glow: 'from-emerald-500/12'
  },
  warning: {
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    glow: 'from-amber-500/16'
  },
  danger: {
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    glow: 'from-rose-500/12'
  },
  info: {
    border: 'border-sky-200',
    dot: 'bg-sky-500',
    glow: 'from-sky-500/12'
  }
};

export default function KpiCard({ label, value, description, tone = 'neutral', className }) {
  const resolvedTone = toneStyles[tone] ?? toneStyles.neutral;

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-panel',
        resolvedTone.border,
        className
      )}
    >
      <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b to-transparent', resolvedTone.glow)} />
      <div className="flex items-center gap-2">
        <span className={cn('relative h-2.5 w-2.5 rounded-full shadow-sm', resolvedTone.dot)} />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      </div>

      <p className="relative mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </article>
  );
}
