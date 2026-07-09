import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/Card';
import { cn } from '../../lib/cn';

export interface OnboardingStep {
  label: string;
  done: boolean;
  href: string;
  cta: string;
}

export function OnboardingChecklist({ steps }: { steps: OnboardingStep[] }) {
  const completed = steps.filter((s) => s.done).length;
  if (completed === steps.length) return null;

  return (
    <Card className="border-brand-200 bg-brand-50/40">
      <CardHeader>
        <CardTitle>Getting started</CardTitle>
        <CardDescription>
          {completed} of {steps.length} steps complete
        </CardDescription>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${(completed / steps.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-slate-100 p-0">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-3 px-5 py-3">
            {step.done ? (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </div>
            ) : (
              <div className="h-6 w-6 shrink-0 rounded-full border-2 border-slate-300" />
            )}
            <p
              className={cn(
                'flex-1 text-sm',
                step.done ? 'text-slate-400 line-through' : 'font-medium text-slate-700',
              )}
            >
              {step.label}
            </p>
            {!step.done && (
              <Link
                to={step.href}
                className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
              >
                {step.cta}
                <ArrowRight className="h-3 w-3" strokeWidth={2} />
              </Link>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
