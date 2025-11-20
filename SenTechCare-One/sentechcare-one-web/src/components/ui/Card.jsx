import { cn } from '@/lib/cn';

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6'
};

export default function Card({
  title,
  subtitle,
  actions,
  children,
  className,
  contentClassName,
  padding = 'md'
}) {
  const resolvedPadding = paddingClasses[padding] ?? paddingClasses.md;

  return (
    <section className={cn('overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-soft', className)}>
      {title || subtitle || actions ? (
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <div>
            {title ? <h2 className="text-base font-semibold text-slate-900">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
      ) : null}

      <div className={cn(resolvedPadding, contentClassName)}>{children}</div>
    </section>
  );
}
