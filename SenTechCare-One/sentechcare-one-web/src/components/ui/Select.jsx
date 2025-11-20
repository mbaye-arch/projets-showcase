import { forwardRef, useId } from 'react';
import { cn } from '@/lib/cn';

const Select = forwardRef(function Select(
  {
    id,
    name,
    label,
    options = [],
    placeholder = 'Selectionner une option',
    required = false,
    error,
    helperText,
    containerClassName,
    selectClassName,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const selectId = id ?? `${name ?? 'select'}-${generatedId}`;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label ? (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required ? <span className="text-rose-600"> *</span> : null}
        </label>
      ) : null}

      <select
        ref={ref}
        id={selectId}
        name={name}
        aria-invalid={Boolean(error)}
        className={cn(
          'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition',
          'focus:outline-none focus:ring-2',
          error
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
            : 'border-slate-300 focus:border-slate-400 focus:ring-slate-200',
          'disabled:cursor-not-allowed disabled:bg-slate-100',
          selectClassName
        )}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => {
          const value = typeof option === 'object' ? option.value : option;
          const labelValue = typeof option === 'object' ? option.label : option;
          const isDisabled = typeof option === 'object' ? option.disabled : false;

          return (
            <option key={String(value)} value={value} disabled={isDisabled}>
              {labelValue}
            </option>
          );
        })}
      </select>

      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
      {!error && helperText ? <p className="mt-1 text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
});

export default Select;
