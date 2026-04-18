import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from "sonner";

type AuthErrorLike = { code?: string; message?: string };

const AdminLoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter both email and password'); return; }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Authenticated successfully');
      navigate('/admin/dashboard');
    } catch (error: unknown) {
      const authError = error as AuthErrorLike;
      toast.error(`Auth Error: ${authError.code || 'unknown'}`, {
        description: authError.message || 'Check console for details',
        duration: 8000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="admin-panel min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: 'hsl(228 52% 6%)' }}
    >
      {/* Ambient glows */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(196,168,106,0.07) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(107,142,214,0.05) 0%, transparent 70%)' }}
      />

      {/* Dot grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(237,233,227,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Login card ── */}
      <div className="relative z-10 w-full max-w-[380px] mx-6">

        {/* Brand header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
            style={{
              background: 'rgba(196,168,106,0.09)',
              border: '1px solid rgba(196,168,106,0.22)',
              boxShadow: '0 0 30px rgba(196,168,106,0.10)',
            }}
          >
            <ShieldCheck className="w-6 h-6" style={{ color: '#C4A86A' }} />
          </div>
          <h1
            className="admin-editorial text-[28px] mb-2"
            style={{ color: 'rgba(237,233,227,0.92)' }}
          >
            Admin Portal
          </h1>
          <p className="text-[13px]" style={{ color: 'rgba(237,233,227,0.36)' }}>
            Sign in to manage your portfolio content
          </p>
        </div>

        {/* Form surface */}
        <div
          className="rounded-2xl p-7"
          style={{
            background: 'hsl(222 45% 12%)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
                style={{ color: 'rgba(237,233,227,0.38)' }}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(237,233,227,0.88)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(196,168,106,0.40)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196,168,106,0.08)'; }}
                onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
                style={{ color: 'rgba(237,233,227,0.38)' }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                  style={{ color: 'rgba(237,233,227,0.28)' }}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-[13px] outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(237,233,227,0.88)',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(196,168,106,0.40)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196,168,106,0.08)'; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: '#C4A86A',
                color: '#1C1308',
                boxShadow: '0 0 24px rgba(196,168,106,0.30), 0 4px 12px rgba(0,0,0,0.30)',
              }}
              onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#D4BA80'; }}
              onMouseLeave={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#C4A86A'; }}
            >
              {isLoading ? (
                <>
                  <span
                    className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
                    style={{ borderColor: 'rgba(28,19,8,0.4)', borderTopColor: 'transparent' }}
                  />
                  Verifying…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p
              className="admin-editorial text-[11px] text-center leading-relaxed"
              style={{ color: 'rgba(237,233,227,0.20)' }}
            >
              "Great things are done by a series of small things brought together."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
