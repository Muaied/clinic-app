import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bento-card w-full max-w-md overflow-hidden flex flex-col shadow-[0_0_30px_rgba(244,63,94,0.15)] border-rose-500/30">
                <div className="flex justify-between items-center p-6 border-b border-rose-500/20 bg-rose-500/5">
                    <h3 className="text-xl font-bold text-rose-400 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6" />
                        {title || 'تأكيد الحذف'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6">
                    <p className="text-slate-300 text-lg">
                        {message || 'هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.'}
                    </p>
                </div>
                
                <div className="p-6 border-t border-theme flex justify-end gap-3 mt-auto bg-black/20">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                    >
                        إلغاء
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }} 
                        className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors font-medium shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                    >
                        نعم، احذف نهائياً
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
