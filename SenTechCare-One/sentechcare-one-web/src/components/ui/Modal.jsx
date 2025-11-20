import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl'
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  className
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onClose?.();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/50" onClick={handleBackdropClick} />

      <div className="relative z-10 flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl',
            sizeClasses[size] ?? sizeClasses.md,
            className
          )}
          onClick={(event) => event.stopPropagation()}
        >
          {title || description ? (
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                {title ? <h2 className="text-base font-semibold text-slate-900">{title}</h2> : null}
                {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
              </div>

              <button
                type="button"
                onClick={() => onClose?.()}
                className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Fermer la fenetre"
              >
                X
              </button>
            </div>
          ) : null}

          <div className="px-5 py-4">{children}</div>
          {footer ? <div className="border-t border-slate-100 px-5 py-4">{footer}</div> : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
