import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Command } from 'cmdk';
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
  Plus,
  UserPlus,
  Search,
  type LucideIcon,
} from 'lucide-react';
import { PERMISSIONS } from '@felix/shared';
import { useMyTeams } from '../hooks/useTeamQueries';
import { useLogout } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';

const groupHeadingClass =
  '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-slate-400';

function Item({
  icon: Icon,
  onSelect,
  children,
}: {
  icon: LucideIcon;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm text-slate-700 data-[selected=true]:bg-brand-50 data-[selected=true]:text-brand-700"
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
      <span className="truncate">{children}</span>
    </Command.Item>
  );
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { data: teams } = useMyTeams();
  const logout = useLogout();
  const canInvite = usePermission(teamId, PERMISSIONS.TEAM_MEMBERS_INVITE);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const otherTeams = teams?.filter((t) => t.id !== teamId) ?? [];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Search className="h-4 w-4 shrink-0" strokeWidth={2} />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="rounded border border-white/10 px-1.5 py-0.5 text-xs">⌘K</kbd>
      </button>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Command palette"
        overlayClassName="fixed inset-0 z-50 bg-slate-900/50"
        contentClassName="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center border-b border-slate-100 px-3">
          <Command.Input
            autoFocus
            placeholder="Type a command or search..."
            className="w-full bg-transparent px-2 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="rounded border border-slate-200 px-1.5 py-0.5 text-xs text-slate-400">
            esc
          </kbd>
        </div>

        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-slate-400">
            No results found.
          </Command.Empty>

          <Command.Group heading="Navigation" className={groupHeadingClass}>
            <Item icon={LayoutDashboard} onSelect={() => go('/')}>
              Dashboard
            </Item>
            <Item icon={Building2} onSelect={() => go('/teams')}>
              Teams
            </Item>
            <Item icon={Settings} onSelect={() => go('/settings')}>
              Settings
            </Item>
          </Command.Group>

          {teamId && (
            <Command.Group heading="Current team" className={groupHeadingClass}>
              <Item icon={Home} onSelect={() => go(`/teams/${teamId}`)}>
                Overview
              </Item>
              <Item icon={Users2} onSelect={() => go(`/teams/${teamId}/members`)}>
                Members
              </Item>
              <Item icon={Shield} onSelect={() => go(`/teams/${teamId}/roles`)}>
                Roles
              </Item>
              <Item icon={CreditCard} onSelect={() => go(`/teams/${teamId}/billing`)}>
                Billing
              </Item>
              <Item icon={Activity} onSelect={() => go(`/teams/${teamId}/activity`)}>
                Activity
              </Item>
              {canInvite && (
                <Item icon={UserPlus} onSelect={() => go(`/teams/${teamId}/members`)}>
                  Invite a member
                </Item>
              )}
            </Command.Group>
          )}

          {otherTeams.length > 0 && (
            <Command.Group heading="Switch team" className={groupHeadingClass}>
              {otherTeams.map((team) => (
                <Item key={team.id} icon={Building2} onSelect={() => go(`/teams/${team.id}`)}>
                  {team.name}
                </Item>
              ))}
            </Command.Group>
          )}

          <Command.Group heading="Account" className={groupHeadingClass}>
            <Item icon={Plus} onSelect={() => go('/teams')}>
              Create new team
            </Item>
            <Item
              icon={LogOut}
              onSelect={() => {
                logout.mutate();
                setOpen(false);
              }}
            >
              Sign out
            </Item>
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  );
}
