import { forwardRef, useId } from 'react';
import { cn } from '@/lib/cn';

const Textarea = forwardRef(function Textarea(
  {
    id,
    name,
    label,
    required = false,
    error,
    helperText,
    rows = 4,
    containerClassName,
    textareaClassName,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const textareaId = id ?? `${name ?? 'textarea'}-${generatedId}`;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label ? (
        <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required ? <span className="text-rose-600"> *</span> : null}
        </label>
      ) : null}

      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cn(
          'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition',
          'placeholder:text-slate-400 focus:outline-none focus:ring-2',
          error
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
            : 'border-slate-300 focus:border-slate-400 focus:ring-slate-200',
          'disabled:cursor-not-allowed disabled:bg-slate-100',
          textareaClassName
        )}
        {...props}
      />

      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
      {!error && helperText ? <p className="mt-1 text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
});

export default Textarea;
