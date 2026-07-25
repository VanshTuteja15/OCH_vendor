import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, Users } from 'lucide-react';
import { useSignIn } from '@clerk/clerk-react';
import { useAppStore } from '../store/useAppStore';

export function Login() {
  const navigate = useNavigate();
  const { isLoaded, signIn, setActive } = useSignIn();
  const showToast = useAppStore((s) => s.showToast);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!isLoaded || !signIn) return;

    setSubmitting(true);
    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        showToast('Signed in successfully.', 'success');
        navigate('/dashboard');
        return;
      }

      // MFA / extra steps exist in Clerk but are out of scope for this pass
      setError(
        'Additional verification is required for this account. Enable password-only sign-in in Clerk for the demo, or complete verification in Clerk.'
      );
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'errors' in err
          ? String(
              (err as { errors?: Array<{ message?: string }> }).errors?.[0]?.message ??
                'Sign in failed.'
            )
          : 'Sign in failed. Check your email and password.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
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
            <div className="text-xs text-white/75">Secure sign-in via Clerk</div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white/15 rounded-md flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-xs text-white/75">Role-based access — vendor admin & team users</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 py-12 max-w-md mx-auto w-full">
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
            disabled={submitting || !isLoaded}
            className="w-full bg-och-teal hover:bg-och-teal-dark disabled:opacity-60 text-white text-[13px] font-semibold py-2.5 rounded-md transition-colors"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>

          <div className="mt-5 p-3 bg-gray-50 border border-gray-200 rounded-md text-[11px] text-gray-500 leading-relaxed">
            <strong className="text-gray-700">Demo tip</strong>
            <div className="mt-1">
              Create a Clerk user with email{' '}
              <span className="font-mono text-gray-700">accounts@acmecleaning.ca</span> to load the
              seeded ACME vendor data on first login.
            </div>
          </div>

          <div className="text-center mt-4 text-[11px] text-gray-400">
            New vendor?{' '}
            <a href="#" className="text-och-teal font-semibold">
              Contact OCH Procurement
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
