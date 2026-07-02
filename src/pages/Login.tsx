import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, Users } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { VENDOR_ACCOUNTS } from '../data/seed';

export function Login() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const showToast = useAppStore((s) => s.showToast);

  const [email, setEmail] = useState('accounts@acmecleaning.ca');
  const [password, setPassword] = useState('');
  const [mfa, setMfa] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [stage, setStage] = useState<'credentials' | 'mfa'>('credentials');

  function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const account = VENDOR_ACCOUNTS.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!account) {
      setError('No vendor account found for that email address.');
      return;
    }
    if (account.password !== password) {
      setError('Incorrect password. Please try again.');
      return;
    }
    setStage('mfa');
  }

  function handleMfaChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...mfa];
    next[index] = value;
    setMfa(next);
    if (value && index < 5) {
      document.getElementById(`mfa-${index + 1}`)?.focus();
    }
  }

  function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const code = mfa.join('');
    const result = login(email, password, code);
    if (!result.ok) {
      setError(result.error ?? 'Something went wrong.');
      return;
    }
    showToast('Signed in successfully.', 'success');
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel */}
      <div
        className="hidden md:flex w-[45%] p-12 flex-col justify-between"
        style={{ background: 'linear-gradient(150deg,#00756A 0%,#1a3a5c 100%)' }}
      >
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 bg-white/20 rounded-[10px] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-bold text-white/50 tracking-wide uppercase">
                Ottawa Community Housing
              </div>
              <div className="text-base font-bold text-white">Vendor Portal</div>
            </div>
          </div>
          <div className="font-display text-3xl font-bold text-white leading-tight mb-4">
            One place for everything you need.
          </div>
          <div className="text-sm text-white/70 leading-relaxed">
            Submit invoices, manage compliance documents, track work orders, and update your
            company profile — all in one secure portal.
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white/15 rounded-md flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-xs text-white/75">Canadian data residency — hosted in Canada</div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white/15 rounded-md flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-xs text-white/75">MFA required — full audit trail on every action</div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white/15 rounded-md flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-xs text-white/75">Role-based access — vendor admin & team users</div>
          </div>
        </div>
      </div>

      {/* Right panel: login form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 py-12 max-w-md mx-auto w-full">
        {stage === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit}>
            <div className="font-display text-[22px] font-bold text-och-blue mb-1.5">Welcome back</div>
            <div className="text-[13px] text-gray-700 mb-7">Sign in to your vendor account</div>

            <div className="mb-3.5">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                Vendor Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-och-teal focus:ring-2 focus:ring-och-teal/15"
                placeholder="you@company.ca"
                required
              />
            </div>
            <div className="mb-3.5">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                  Password
                </label>
                <a href="#" className="text-[11px] text-och-teal">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-och-teal focus:ring-2 focus:ring-och-teal/15"
                placeholder="••••••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-[#fdecea] border border-[#f5c6cb] text-[#7b1a13] text-xs rounded-md px-3 py-2 mb-3.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-och-teal hover:bg-och-teal-dark text-white text-[13px] font-semibold py-2.5 rounded-md transition-colors"
            >
              Continue
            </button>

            <div className="mt-5 p-3 bg-gray-50 border border-gray-200 rounded-md text-[11px] text-gray-500 leading-relaxed">
              <strong className="text-gray-700">Demo accounts</strong>
              <div className="mt-1 space-y-0.5">
                {VENDOR_ACCOUNTS.map((a) => (
                  <div key={a.vendorId}>
                    {a.email} / {a.password}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-4 text-[11px] text-gray-400">
              New vendor?{' '}
              <a href="#" className="text-och-teal font-semibold">
                Contact OCH Procurement
              </a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit}>
            <div className="font-display text-[22px] font-bold text-och-blue mb-1.5">
              Verify it's you
            </div>
            <div className="text-[13px] text-gray-700 mb-7">
              Enter the 6-digit code from your authenticator app
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-3.5 mb-4.5">
              <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">
                Multi-Factor Authentication
              </div>
              <div className="flex gap-2">
                {mfa.map((digit, i) => (
                  <input
                    key={i}
                    id={`mfa-${i}`}
                    value={digit}
                    onChange={(e) => handleMfaChange(i, e.target.value)}
                    maxLength={1}
                    className="w-10 h-10 text-center border border-gray-300 rounded-md text-base font-bold text-och-blue focus:outline-none focus:border-och-teal focus:ring-2 focus:ring-och-teal/15"
                  />
                ))}
              </div>
              <div className="text-[11px] text-gray-400 mt-2">
                Demo code: <span className="font-mono font-semibold text-gray-600">123456</span>
              </div>
            </div>

            {error && (
              <div className="bg-[#fdecea] border border-[#f5c6cb] text-[#7b1a13] text-xs rounded-md px-3 py-2 mb-3.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-och-teal hover:bg-och-teal-dark text-white text-[13px] font-semibold py-2.5 rounded-md transition-colors"
            >
              Sign In Securely
            </button>
            <button
              type="button"
              onClick={() => {
                setStage('credentials');
                setError('');
              }}
              className="w-full text-center mt-3 text-[11px] text-gray-500"
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
