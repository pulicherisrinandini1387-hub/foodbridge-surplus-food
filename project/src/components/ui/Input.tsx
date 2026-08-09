import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, hint, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full h-11 ${icon ? 'pl-11' : 'pl-4'} pr-4 rounded-xl border bg-white text-ink-800 placeholder:text-ink-400 transition-all duration-200 focus-ring ${
              error ? 'border-red-400 focus:border-red-500' : 'border-ink-200 focus:border-brand-500'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-ink-400">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full h-11 px-4 rounded-xl border bg-white text-ink-800 transition-all duration-200 focus-ring cursor-pointer ${
            error ? 'border-red-400' : 'border-ink-200 focus:border-brand-500'
          } ${className}`}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-white text-ink-800">
              {o.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-4 py-3 rounded-xl border bg-white text-ink-800 placeholder:text-ink-400 transition-all duration-200 focus-ring resize-none ${
            error ? 'border-red-400' : 'border-ink-200 focus:border-brand-500'
          } ${className}`}
          rows={3}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
