import React, { useState } from 'react';
import { Sparkles, X, Send, Loader2, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';

export interface Ai3DEditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPrompt: (prompt: string) => Promise<{ appliedCount: number }>;
  isSubmitting: boolean;
  studioReady: boolean;
  onResetFrom2D: () => void;
}

const SAMPLE_PROMPTS = [
  'Furnish Flat 1 Living Room with a modern 3-seater sofa and glass coffee table',
  'Add queen-size bed and side tables to master bedroom',
  'Add 6-seater dining table and chairs in dining area',
  'Add study desk, ergonomic chair and bookshelf',
];

export const Ai3DEditDrawer: React.FC<Ai3DEditDrawerProps> = ({
  isOpen,
  onClose,
  onApplyPrompt,
  isSubmitting,
  studioReady,
  onResetFrom2D,
}) => {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSubmitting || !studioReady) return;
    setError(null);
    setSuccessCount(null);
    try {
      const res = await onApplyPrompt(prompt.trim());
      setSuccessCount(res.appliedCount);
      setPrompt('');
    } catch (err: any) {
      setError(err?.message || 'Failed to apply 3D edit.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="ai-3d-edit-drawer"
      className="ai-3d-edit-drawer fixed inset-0 z-[990] flex justify-end bg-black/40 backdrop-blur-2xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-[340px] max-w-full h-full bg-[#FFFFFF] border-l border-[#E2DDD5] shadow-2xl flex flex-col text-[#181D23] animate-slideInRight"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2DDD5] bg-[#F7F5F0]">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-sky-100 text-sky-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#181D23]">AI 3D Scene Edit</h3>
              <p className="text-[10px] text-[#5C6672]">Natural-language scene mutations</p>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-ai-3d-drawer"
            onClick={onClose}
            className="p-1 rounded text-[#5C6672] hover:text-[#181D23] hover:bg-slate-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {error && (
            <div className="rounded-lg border border-rose-300 bg-rose-50 p-2.5 text-rose-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-[11px] leading-tight">{error}</div>
            </div>
          )}

          {successCount !== null && (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-[11px] font-semibold">
                Applied {successCount} scene {successCount === 1 ? 'mutation' : 'mutations'} cleanly!
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-[#181D23] mb-1">Prompt</label>
              <textarea
                data-testid="ai-3d-prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe changes in 3D (e.g. 'Add sofa & coffee table to living room', 'Add balcony railing')..."
                rows={4}
                disabled={isSubmitting || !studioReady}
                className="w-full p-2.5 rounded-lg border border-[#E2DDD5] bg-[#F7F5F0] text-xs text-[#181D23] placeholder-[#5C6672] focus:bg-[#FFFFFF] focus:border-[#B45309] focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              data-testid="ai-3d-apply-btn"
              disabled={isSubmitting || !studioReady || !prompt.trim()}
              className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Mutating Scene...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Apply 3D Mutation</span>
                </>
              )}
            </button>
          </form>

          {/* Prompt Suggestions */}
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5C6672] mb-1.5">
              Suggested Edits
            </div>
            <div className="space-y-1.5">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(sample)}
                  className="w-full text-left p-2 rounded-lg border border-[#E2DDD5] bg-[#F7F5F0] hover:bg-[#FFFFFF] hover:border-sky-300 text-[11px] text-[#181D23] transition leading-snug"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F7F5F0] border-t border-[#E2DDD5] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onResetFrom2D}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#5C6672] hover:text-[#181D23]"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset from 2D Plan</span>
          </button>
          <span className="text-[10px] font-mono text-emerald-600 font-semibold">2D ⇄ 3D Live</span>
        </div>
      </div>
    </div>
  );
};
