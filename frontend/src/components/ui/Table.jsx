import React from 'react';
import { cn } from '../../utils/cn';

export const Table = ({ children, className }) => (
  <div className="w-full overflow-x-auto rounded-2xl border border-theme bg-surface shadow-xl">
    <table className={cn("w-full text-sm text-right", className)}>
      {children}
    </table>
  </div>
);

export const Thead = ({ children, className }) => (
  <thead className={cn("bg-black/5 dark:bg-white/5 border-b border-theme text-accent1 font-semibold", className)}>
    {children}
  </thead>
);

export const Tbody = ({ children, className }) => (
  <tbody className={cn("divide-y divide-theme", className)}>
    {children}
  </tbody>
);

export const Tr = ({ children, className }) => (
  <tr className={cn("hover:bg-black/5 dark:hover:bg-white/5 transition-colors group", className)}>
    {children}
  </tr>
);

export const Th = ({ children, className }) => (
  <th className={cn("px-4 py-4 whitespace-nowrap tracking-wide", className)}>
    {children}
  </th>
);

export const Td = ({ children, className }) => (
  <td className={cn("px-4 py-3 text-slate-500 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white transition-colors", className)}>
    {children}
  </td>
);
