import { cn } from '@/lib/cn';

const variantClasses = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  info: 'bg-sky-100 text-sky-700'
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs'
};

export default function Badge({ children, variant = 'neutral', size = 'md', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantClasses[variant] ?? variantClasses.neutral,
        sizeClasses[size] ?? sizeClasses.md,
        className
      )}
    >
      {children}
    </span>
  );
}
