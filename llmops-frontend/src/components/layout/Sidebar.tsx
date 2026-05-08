import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import ModelArenaLogo from './Logo';

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const initials = (user?.full_name || user?.email || 'U').charAt(0).toUpperCase();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10' },
    { name: 'Models', path: '/models', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { name: 'Datasets', path: '/datasets', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
    { name: 'Metrics', path: '/metrics', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
    { name: 'Evaluations', path: '/evaluations', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { name: 'Experiments', path: '/experiments', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSwitchAccount = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-[232px] shrink-0 border-r border-white/10 bg-[#111] flex flex-col transition-colors duration-200">
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <ModelArenaLogo />
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-[13px] font-medium rounded-2xl transition-colors ${
                isActive
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-gray-400 hover:bg-white/[0.06] hover:text-white'
              }`
            }
          >
            <svg className="w-4 h-4 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="relative p-3">
        {isAccountOpen && (
          <div className="absolute bottom-[76px] left-3 right-3 overflow-hidden rounded-2xl border border-white/10 bg-[#151515] shadow-2xl">
            <div className="border-b border-white/10 p-3">
              <p className="truncate text-[13px] font-semibold text-white">{user?.full_name || 'Unnamed user'}</p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="p-1.5">
              <Link
                to="/account"
                onClick={() => setIsAccountOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 11a3 3 0 10-6 0 3 3 0 006 0z" />
                </svg>
                Profile
              </Link>
              <button onClick={handleSwitchAccount} className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Switch account
              </button>
              <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] text-red-300 transition-colors hover:bg-red-500/10">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsAccountOpen((value) => !value)}
          className="flex w-full items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-2.5 py-2.5 text-left transition-colors hover:bg-white/10"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-white">{user?.full_name || 'Account'}</p>
            <p className="truncate text-[10px] text-gray-500">{user?.email}</p>
          </div>
          <svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
