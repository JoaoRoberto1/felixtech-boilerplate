import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Home,
  Users2,
  Shield,
  CreditCard,
  Activity,
  Settings,
  LogOut,
  ChevronsUpDown,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { getInitials } from '../../lib/initials';
import { useAuthStore } from '../../stores/auth-store';
import { useLogout } from '../../hooks/useAuth';
import { useMyTeams } from '../../hooks/useTeamQueries';
import { CommandPalette } from '../CommandPalette';

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white',
  );

const sectionLabelClass =
  'mb-1 mt-5 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500';

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { teamId } = useParams();
  const { data: teams } = useMyTeams();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 shrink-0 flex-col bg-brand-950 px-4 py-6">
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <img src="/logo-branca.png" alt="Felix Technology" className="h-7 w-7" />
          <span className="text-base font-bold text-white">Felix Technology</span>
        </div>

        <div className="mb-4">
          <CommandPalette />
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          <NavLink to="/" end className={navItemClass}>
            <LayoutDashboard className="h-4 w-4" strokeWidth={2} />
            Dashboard
          </NavLink>
          <NavLink to="/teams" className={navItemClass}>
            <Building2 className="h-4 w-4" strokeWidth={2} />
            Teams
          </NavLink>

          {teamId && (
            <>
              <div className={sectionLabelClass}>Current team</div>

              {teams && teams.length > 1 && (
                <div className="relative mb-1">
                  <select
                    value={teamId}
                    onChange={(e) => navigate(`/teams/${e.target.value}`)}
                    className="w-full appearance-none rounded-md border border-white/10 bg-white/5 px-3 py-1.5 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id} className="text-slate-900">
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <ChevronsUpDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              )}

              <NavLink to={`/teams/${teamId}`} end className={navItemClass}>
                <Home className="h-4 w-4" strokeWidth={2} />
                Overview
              </NavLink>
              <NavLink to={`/teams/${teamId}/members`} className={navItemClass}>
                <Users2 className="h-4 w-4" strokeWidth={2} />
                Members
              </NavLink>
              <NavLink to={`/teams/${teamId}/roles`} className={navItemClass}>
                <Shield className="h-4 w-4" strokeWidth={2} />
                Roles
              </NavLink>
              <NavLink to={`/teams/${teamId}/billing`} className={navItemClass}>
                <CreditCard className="h-4 w-4" strokeWidth={2} />
                Billing
              </NavLink>
              <NavLink to={`/teams/${teamId}/activity`} className={navItemClass}>
                <Activity className="h-4 w-4" strokeWidth={2} />
                Activity
              </NavLink>
            </>
          )}

          <div className={sectionLabelClass}>Account</div>
          <NavLink to="/settings" className={navItemClass}>
            <Settings className="h-4 w-4" strokeWidth={2} />
            Settings
          </NavLink>
        </nav>

        <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 p-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={() => logout.mutate()}
            title="Sign out"
            aria-label="Sign out"
            className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
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
