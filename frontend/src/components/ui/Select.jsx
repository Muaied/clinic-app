import React from 'react';
import { cn } from '../../utils/cn';

export const Select = React.forwardRef(({ className, options = [], error, ...props }, ref) => {
  return (
    <div className="w-full">
      <select
        className={cn(
          "input-neon flex h-11 w-full px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
          error && "border-red-500 focus:border-red-500 focus:shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]",
          className
        )}
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'left 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingLeft: '2.5rem' }}
        ref={ref}
        {...props}
      >
        <option value="" disabled className="bg-[#131B2F] text-slate-400">اختر...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#131B2F] text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
