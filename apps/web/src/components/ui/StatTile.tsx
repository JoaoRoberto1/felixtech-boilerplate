import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

interface StatTileProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
}

export function StatTile({ label, value, icon: Icon, className }: StatTileProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm',
        className,
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold tabular-nums text-slate-900">{value}</p>
        <p className="truncate text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
