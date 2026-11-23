import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="confirm-modal-overlay fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
    >
      <div className="w-full max-w-md rounded-xl border border-[#E2DDD5] bg-[#FFFFFF] p-6 shadow-2xl text-[#181D23]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                isDestructive ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 id="confirm-modal-title" className="text-base font-bold text-[#181D23]">
                {title}
              </h3>
              <p className="mt-1 text-xs text-[#5C6672] leading-relaxed">{message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-[#5C6672] hover:bg-slate-100 hover:text-[#181D23] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#E2DDD5] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold text-[#181D23] hover:bg-[#F7F5F0] transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-xs transition ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-[#B45309] hover:bg-[#92400E]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
