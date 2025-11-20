import { cn } from '@/lib/cn';

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-9 w-9 border-[3px]'
};

export default function LoadingSpinner({ size = 'md', label = 'Chargement...', className }) {
  const resolvedSize = sizeClasses[size] ?? sizeClasses.md;

  return (
    <span className={cn('inline-flex items-center justify-center', className)} role="status" aria-live="polite">
      <span
        className={cn(
          'inline-block animate-spin rounded-full border-slate-300 border-t-slate-700',
          resolvedSize
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
