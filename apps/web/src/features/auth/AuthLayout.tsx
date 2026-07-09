import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Link to="/">
            <img src="/logo-azul.png" alt="Felix Technology" className="h-10 w-10" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-center text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
