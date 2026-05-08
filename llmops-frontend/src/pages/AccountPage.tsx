import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const initials = (user?.full_name || user?.email || 'U').charAt(0).toUpperCase();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setIsSaving(true);

    try {
      await updateProfile(fullName);
      setMessage('Profile updated.');
    } catch {
      setMessage('Could not update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwitchAccount = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div className="flex justify-between items-end pb-6 border-b border-white/10">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Account</h1>
          <p className="text-sm text-gray-400">Manage your profile and workspace session.</p>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-white/10 bg-[#171717] p-5">
          <div className="flex items-center gap-4">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xl font-semibold text-white">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.full_name || 'Unnamed user'}</p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="mt-5 space-y-2 border-t border-white/5 pt-5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Provider</span>
              <span className="capitalize text-gray-300">{user?.auth_provider || 'password'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Session</span>
              <span className="text-emerald-400">Active</span>
            </div>
          </div>
        </aside>

        <div className="rounded-xl border border-white/10 bg-[#171717] p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Profile</h2>
              <p className="mt-1 text-sm text-gray-400">This name appears in your account menu.</p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-gray-300">Full name</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-white/30"
                placeholder="Your name"
              />
            </label>

            {message && <p className="text-sm text-gray-400">{message}</p>}

            <div className="flex flex-wrap gap-3 border-t border-white/5 pt-5">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200 disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save profile'}
              </button>
              <button
                type="button"
                onClick={handleSwitchAccount}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Switch account
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
                Logout
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
