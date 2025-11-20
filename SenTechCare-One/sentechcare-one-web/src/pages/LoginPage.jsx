import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().min(1, 'L’email est requis').email('Format email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const redirectTo = location.state?.from || '/dashboard';

  const onSubmit = async (values) => {
    setServerError('');

    try {
      await login(values);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <div className="inline-flex rounded-xl border border-brand-100 bg-brand-50 px-3 py-2">
          <img src="/logo.png" alt="Logo SenTechCare" className="h-10 w-auto max-w-full object-contain" />
        </div>
        <p className="mt-3 text-sm font-medium uppercase tracking-wide text-slate-500">Connexion</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Bienvenue sur SenTechCare One</h1>
      </div>

      <p className="mt-2 text-sm text-slate-600">Accédez à votre espace de gestion sécurisé.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            placeholder="vous@entreprise.com"
            {...register('email')}
          />
          {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password ? <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p> : null}
        </div>

        {serverError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {serverError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
