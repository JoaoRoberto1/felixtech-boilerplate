import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { useAuthStore } from '../../stores/auth-store';
import { useLogout } from '../../hooks/useAuth';
import { useMyTeams } from '../../hooks/useTeamQueries';

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand-50 text-brand-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  );

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { teamId } = useParams();
  const { data: teams } = useMyTeams();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-6">
        <div className="mb-8 flex items-center gap-2 px-2">
          <img src="/logo-azul.png" alt="Felix Technology" className="h-7 w-7" />
          <span className="text-lg font-bold text-slate-900">Felix Technology</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          <NavLink to="/" end className={navItemClass}>
            Dashboard
          </NavLink>
          <NavLink to="/teams" className={navItemClass}>
            Teams
          </NavLink>
          {teamId && (
            <>
              <div className="mt-4 mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Current team
              </div>
              {teams && teams.length > 1 && (
                <select
                  value={teamId}
                  onChange={(e) => navigate(`/teams/${e.target.value}`)}
                  className="mb-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
              <NavLink to={`/teams/${teamId}`} end className={navItemClass}>
                Overview
              </NavLink>
              <NavLink to={`/teams/${teamId}/members`} className={navItemClass}>
                Members
              </NavLink>
              <NavLink to={`/teams/${teamId}/roles`} className={navItemClass}>
                Roles
              </NavLink>
              <NavLink to={`/teams/${teamId}/billing`} className={navItemClass}>
                Billing
              </NavLink>
            </>
          )}
          <div className="mt-4 mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Account
          </div>
          <NavLink to="/settings/profile" className={navItemClass}>
            Profile
          </NavLink>
          <NavLink to="/settings/security" className={navItemClass}>
            Security
          </NavLink>
        </nav>

        <div className="border-t border-slate-200 pt-4">
          <p className="truncate px-2 text-sm font-medium text-slate-900">{user?.name}</p>
          <p className="truncate px-2 text-xs text-slate-500">{user?.email}</p>
          <button
            onClick={() => logout.mutate()}
            className="mt-2 w-full rounded-md px-2 py-1.5 text-left text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
