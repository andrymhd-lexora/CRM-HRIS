import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
  onClose?: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger',
  onConfirm,
  onCancel,
  onClose
}) => {
  const { language } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClose = () => {
    if (typeof onCancel === 'function') onCancel();
    if (typeof onClose === 'function') onClose();
  };

  if (!isOpen) return null;

  const handleConfirmClick = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error('Error in confirmation action:', err);
    } finally {
      setIsProcessing(false);
      handleClose();
    }
  };

  const defaultConfirmText =
    confirmText ||
    (variant === 'danger'
      ? language === 'id'
        ? 'Ya, Hapus Data'
        : 'Yes, Delete'
      : language === 'id'
      ? 'Konfirmasi'
      : 'Confirm');

  const defaultCancelText =
    cancelText || (language === 'id' ? 'Batal' : 'Cancel');

  return (
    <div
      className="fixed inset-0 z-[999] bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) handleClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header Strip */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  variant === 'danger'
                    ? 'bg-rose-50 text-rose-600 border border-rose-100'
                    : variant === 'warning'
                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                }`}
              >
                {variant === 'danger' ? (
                  <Trash2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  {title}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">
                  {variant === 'danger'
                    ? language === 'id'
                      ? 'Tindakan ini permanen di Cloud Firestore'
                      : 'This action is permanent in Cloud Firestore'
                    : language === 'id'
                    ? 'Mohon konfirmasi kelanjutan'
                    : 'Please confirm to continue'}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleClose}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
            {message}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {defaultCancelText}
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirmClick}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                : variant === 'warning'
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            }`}
          >
            {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{defaultConfirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
