import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Modal = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md no-print">
      <div className={cn("bg-surface border border-theme rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] relative overflow-hidden", className)}>
        {/* Top glow accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent1 to-accent2"></div>
        <div className="flex items-center justify-between px-6 py-5 border-b border-theme relative z-10">
          <h3 className="text-xl font-bold text-primary">{title}</h3>
          <button 
            onClick={onClose}
            className="text-secondary hover:text-rose-500 transition-colors"
          >
            <X size={22} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
