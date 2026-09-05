import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'تأكيد', cancelText = 'إلغاء', variant = 'danger' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center justify-center text-center p-4">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border-2 ${variant === 'danger' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 shadow-[0_0_20px_rgba(225,29,72,0.3)]' : 'bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.3)]'}`}>
          <AlertTriangle size={40} />
        </div>
        <p className="text-secondary text-lg mb-8">{message}</p>
        
        <div className="flex justify-center gap-3 w-full">
          <Button variant="secondary" onClick={onClose} className="w-full">
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} className="w-full">
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
