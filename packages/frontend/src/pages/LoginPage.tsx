import React, { useState } from 'react';
import {
  Building2,
  Check,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Layers,
  Box,
} from 'lucide-react';
import { authService } from '../services/auth-service';

export interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await authService.login({ email, password });
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setEmail('demo@argon4.studio');
    setPassword('ArgonDemo#2026');
    setError(null);
    setLoading(true);
    try {
      await authService.loginWithDemo();
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Demo authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="argon-login-page flex min-h-screen w-screen bg-[#F7F5F0] text-[#181D23] font-sans">
      {/* LEFT PANE — 55% WIDTH (DARK ARCHITECTURAL SHOWCASE) */}
      <div className="argon-login-left hidden lg:flex lg:w-[55%] flex-col justify-between bg-[#0F141B] p-12 text-slate-100 relative overflow-hidden select-none border-r border-[#1E293B]">
        {/* Subtle Architectural Grid Lines */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Isometric Wireframe SVG Background Accent */}
        <div className="absolute right-0 bottom-12 w-96 h-96 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 400" fill="none" stroke="currentColor" className="w-full h-full text-amber-500">
            <polygon points="200,40 360,130 360,270 200,360 40,270 40,130" strokeWidth="1.5" />
            <line x1="200" y1="40" x2="200" y2="360" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="40" y1="130" x2="360" y2="130" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="40" y1="270" x2="360" y2="270" strokeWidth="1" strokeDasharray="4 4" />
            <polygon points="200,90 310,150 310,250 200,310 90,250 90,150" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Top: Brand Mark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B45309] text-white shadow-lg">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white uppercase italic">
                ARGON<span className="text-[#B45309] font-extrabold">4</span>
              </span>
              <span className="ml-2 text-[10px] font-mono tracking-widest uppercase text-slate-400">
                Architectural AI Studio
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Headline & Value Proposition */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Dual-Engine Architectural Platform</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Precision 2D Plans. <br />
            <span className="text-[#FBBF24]">Live Editable 3D Architecture.</span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Code-compliant multi-story synthesis, ArchLang presentation sheets, and interactive Pascal 3D
            with bi-directional sync across geometry, engineering overlays, and parametric revisions.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-medium">UDCPR / NBC Geometry Validation & Instant Audit</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Box className="h-4 w-4" />
              </div>
              <span className="font-medium">Synchronized 2D CAD & Live Headless 3D Studio</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Layers className="h-4 w-4" />
              </div>
              <span className="font-medium">Instant DXF, PDF, SVG, IFC & ETABS Package Delivery</span>
            </div>
          </div>
        </div>

        {/* Bottom: Environment Badge */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Environment: Local / Cloud Ready</span>
          </div>
          <span>v4.0.0-PROD</span>
        </div>
      </div>

      {/* RIGHT PANE — 45% WIDTH (ALABASTER FORM) */}
      <div className="argon-login-right flex w-full lg:w-[45%] flex-col justify-center items-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand (visible only when left pane is hidden) */}
          <div className="flex lg:hidden items-center gap-2.5 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B45309] text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-black uppercase italic text-[#181D23]">
              ARGON<span className="text-[#B45309]">4</span>
            </span>
          </div>

          {/* Form Header */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#181D23]">Sign in to ARGON4</h2>
            <p className="mt-1 text-xs text-[#5C6672]">
              Access your building projects, CAD workspace & 3D studio.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 flex items-center justify-between animate-fadeIn"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-rose-600 hover:text-rose-900 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Main Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#181D23] mb-1.5" htmlFor="email-input">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5C6672]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email-input"
                  data-testid="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="architect@argon4.studio"
                  autoComplete="email"
                  className="w-full h-11 pl-9 pr-3 rounded-lg border border-[#E2DDD5] bg-[#FFFFFF] text-xs text-[#181D23] placeholder-[#5C6672]/60 focus:border-[#B45309] focus:ring-1 focus:ring-[#B45309] transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#181D23]" htmlFor="password-input">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert('For local evaluation, use the verified Demo Credentials provided below.')
                  }
                  className="text-[11px] font-medium text-[#B45309] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5C6672]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password-input"
                  data-testid="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full h-11 pl-9 pr-10 rounded-lg border border-[#E2DDD5] bg-[#FFFFFF] text-xs text-[#181D23] placeholder-[#5C6672]/60 focus:border-[#B45309] focus:ring-1 focus:ring-[#B45309] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5C6672] hover:text-[#181D23] transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="h-4 w-4 rounded border-[#E2DDD5] text-[#B45309] focus:ring-[#B45309]"
                />
                <span className="text-[#5C6672]">Keep me signed in</span>
              </label>
            </div>

            <button
              type="submit"
              data-testid="login-submit-btn"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold tracking-wide uppercase shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In to Studio</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Bordered Demo Credentials Box */}
          <div className="rounded-xl border border-[#E2DDD5] bg-[#FFFFFF] p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#B45309]" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#181D23]">
                  Demo Access (Local Evaluation)
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                Instant Ready
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between rounded bg-[#F7F5F0] px-2.5 py-1.5 font-mono">
                <span className="text-[#5C6672] text-[11px]">Email:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#181D23] text-[11px]">demo@argon4.studio</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('demo@argon4.studio', 'email')}
                    className="p-1 hover:text-[#B45309] text-[#5C6672] transition"
                    title="Copy email"
                  >
                    {copiedField === 'email' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded bg-[#F7F5F0] px-2.5 py-1.5 font-mono">
                <span className="text-[#5C6672] text-[11px]">Pass:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#181D23] text-[11px]">ArgonDemo#2026</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('ArgonDemo#2026', 'pass')}
                    className="p-1 hover:text-[#B45309] text-[#5C6672] transition"
                    title="Copy password"
                  >
                    {copiedField === 'pass' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              data-testid="use-demo-creds-btn"
              onClick={handleDemoSignIn}
              disabled={loading}
              className="w-full py-2.5 rounded-lg border border-[#B45309]/30 bg-amber-50 hover:bg-amber-100 text-[#B45309] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Use Demo Credentials & Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
