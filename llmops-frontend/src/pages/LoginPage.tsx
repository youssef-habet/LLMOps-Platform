import { useState, type FormEvent } from 'react';
import type { AxiosError } from 'axios';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

type LocationState = {
  mode?: 'login' | 'register';
  from?: {
    pathname?: string;
  };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const { isAuthenticated, login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(locationState?.mode || 'login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const destination = locationState?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
      navigate(destination, { replace: true });
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>;
      setError(error.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_480px]">
        <section className="relative hidden overflow-hidden border-r border-white/10 bg-[#111] p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_75%_38%,rgba(16,185,129,0.12),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%)]" />
          <Link to="/" className="relative text-xl font-bold tracking-tight">
            LLMOps Platform
          </Link>
          <div className="relative max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Secure workspace access
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold tracking-tight">Sign in to manage your LLM operations.</h1>
              <p className="max-w-xl text-sm leading-6 text-gray-400">
                Keep models, datasets, judge metrics, evaluations, and experiments isolated inside your own account.
              </p>
            </div>
          </div>
          <div className="relative grid grid-cols-3 gap-3 text-xs text-gray-400">
            {['JWT sessions', 'Private resources', 'Fast workflows'].map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-black/20 p-4">
                {item}
              </div>
            ))}
          </div>
        </section>

        <main className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-3">
              <Link to="/" className="inline-flex text-sm font-semibold text-gray-300 lg:hidden">
                LLMOps Platform
              </Link>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  {mode === 'login'
                    ? 'Log in to continue to your workspace.'
                    : 'Create an account to start managing your LLMOps assets.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 rounded-lg border border-white/10 bg-[#171717] p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === 'login' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === 'register' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-gray-300">Full name</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-white/30"
                    placeholder="Your name"
                  />
                </label>
              )}

              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-300">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-white/30"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-300">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-white/30"
                  placeholder="At least 8 characters"
                />
              </label>

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-black shadow-sm transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-black px-3 text-gray-500">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loginWithGoogle(destination)}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-[#171717] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.7 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.7 2.5 2.5 6.7 2.5 12s4.2 9.5 9.5 9.5c5.5 0 9.1-3.8 9.1-9.2 0-.6-.1-1.1-.2-1.6H12z" />
              </svg>
              Continue with Google
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
