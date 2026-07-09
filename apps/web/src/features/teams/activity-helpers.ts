import {
  Building2,
  Settings,
  UserPlus,
  UserX,
  UserCheck,
  UserMinus,
  ShieldPlus,
  Shield,
  ShieldMinus,
  CreditCard,
  Activity as ActivityIcon,
  type LucideIcon,
} from 'lucide-react';
import { ACTIVITY_ACTIONS, type ActivityLogDto } from '@felix/shared';

interface ActivityDescription {
  icon: LucideIcon;
  message: string;
}

function str(value: string | number | boolean | undefined, fallback = ''): string {
  return value === undefined ? fallback : String(value);
}

export function describeActivity(entry: ActivityLogDto): ActivityDescription {
  const meta = entry.metadata ?? {};

  switch (entry.action) {
    case ACTIVITY_ACTIONS.TEAM_CREATED:
      return { icon: Building2, message: 'created the team' };
    case ACTIVITY_ACTIONS.TEAM_UPDATED:
      return { icon: Settings, message: 'updated the team settings' };
    case ACTIVITY_ACTIONS.MEMBER_INVITED:
      return {
        icon: UserPlus,
        message: `invited ${str(meta.email, 'someone')} as ${str(meta.roleName, 'a member')}`,
      };
    case ACTIVITY_ACTIONS.MEMBER_INVITE_REVOKED:
      return { icon: UserX, message: `revoked the invitation for ${str(meta.email, 'someone')}` };
    case ACTIVITY_ACTIONS.MEMBER_JOINED:
      return { icon: UserCheck, message: 'joined the team' };
    case ACTIVITY_ACTIONS.MEMBER_REMOVED:
      return {
        icon: UserMinus,
        message: `removed ${str(meta.memberName, 'a member')} from the team`,
      };
    case ACTIVITY_ACTIONS.MEMBER_ROLE_UPDATED:
      return {
        icon: Shield,
        message: `changed ${str(meta.memberName, "a member's")} role to ${str(meta.roleName, '—')}`,
      };
    case ACTIVITY_ACTIONS.ROLE_CREATED:
      return { icon: ShieldPlus, message: `created the role "${str(meta.roleName)}"` };
    case ACTIVITY_ACTIONS.ROLE_UPDATED:
      return { icon: Shield, message: `updated the role "${str(meta.roleName)}"` };
    case ACTIVITY_ACTIONS.ROLE_DELETED:
      return { icon: ShieldMinus, message: `deleted the role "${str(meta.roleName)}"` };
    case ACTIVITY_ACTIONS.SUBSCRIPTION_UPDATED:
      return { icon: CreditCard, message: `subscription status changed to ${str(meta.status)}` };
    default:
      return { icon: ActivityIcon, message: entry.action };
  }
}
