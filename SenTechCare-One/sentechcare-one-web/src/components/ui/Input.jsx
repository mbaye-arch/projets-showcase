import { forwardRef, useId } from 'react';
import { cn } from '@/lib/cn';

const Input = forwardRef(function Input(
  {
    id,
    name,
    type = 'text',
    label,
    required = false,
    error,
    helperText,
    containerClassName,
    inputClassName,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? `${name ?? 'input'}-${generatedId}`;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required ? <span className="text-rose-600"> *</span> : null}
        </label>
      ) : null}

      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        aria-invalid={Boolean(error)}
        className={cn(
          'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition',
          'placeholder:text-slate-400 focus:outline-none focus:ring-2',
          error
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
            : 'border-slate-300 focus:border-slate-400 focus:ring-slate-200',
          'disabled:cursor-not-allowed disabled:bg-slate-100',
          inputClassName
        )}
        {...props}
      />

      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
      {!error && helperText ? <p className="mt-1 text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
});

export default Input;
