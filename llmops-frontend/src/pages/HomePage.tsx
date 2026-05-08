import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const appTarget = isAuthenticated ? '/dashboard' : '/login';
  const experimentTarget = isAuthenticated ? '/experiments' : '/login';

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(168,85,247,0.18),transparent_28%),radial-gradient(circle_at_78%_28%,rgba(16,185,129,0.12),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%)]" />
      <div className="landing-grid absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />

      <header className="relative z-10 flex h-20 items-center justify-between px-6 md:px-10">
        <Link to="/" className="text-lg font-bold tracking-tight">
          LLMOps Platform
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/account"
              className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Account
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Login
              </Link>
              <Link
                to="/login"
                state={{ mode: 'register' }}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-6 pb-16">
        <section className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <div className="landing-reveal mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-gray-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Secure LLM evaluation workspace
          </div>

          <h1 className="landing-reveal max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl" style={{ animationDelay: '120ms' }}>
            Manage the full lifecycle of your LLM systems.
          </h1>

          <p className="landing-reveal mt-6 max-w-2xl text-sm leading-6 text-gray-400 md:text-base md:leading-7" style={{ animationDelay: '220ms' }}>
            Register models, upload datasets, define judge metrics, run evaluations, and compare experiments inside one focused operational platform.
          </p>

          <div className="landing-reveal mt-10 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '320ms' }}>
            <Link
              to={appTarget}
              state={isAuthenticated ? undefined : { from: { pathname: '/dashboard' } }}
              className="inline-flex min-w-48 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-medium text-black shadow-sm transition-colors hover:bg-gray-200"
            >
              Go to application
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to={experimentTarget}
              state={isAuthenticated ? undefined : { from: { pathname: '/experiments' } }}
              className="inline-flex min-w-48 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Start an experiment
            </Link>
          </div>

          <div className="landing-reveal landing-float mt-12 hidden w-full max-w-3xl rounded-2xl border border-white/10 bg-[#111]/80 p-4 text-left shadow-2xl md:block" style={{ animationDelay: '420ms' }}>
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="landing-scan absolute inset-y-0 w-28 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="grid grid-cols-3 gap-3">
                {['Model registry', 'Dataset control', 'Evaluation runs'].map((label, index) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400">{label}</span>
                      <span className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-blue-400' : index === 1 ? 'bg-purple-400' : 'bg-emerald-400'}`} />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 rounded bg-white/10" />
                      <div className="h-2 w-2/3 rounded bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
