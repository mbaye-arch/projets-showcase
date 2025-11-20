import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-200 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-panel">
        <p className="text-5xl font-bold text-brand-600">404</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">Page introuvable</h1>
        <p className="mt-2 text-sm text-slate-600">
          La page demandée n’existe pas ou a été déplacée.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
