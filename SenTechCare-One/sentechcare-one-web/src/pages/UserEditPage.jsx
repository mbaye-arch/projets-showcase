import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserById, updateUser } from '@/api/userApi';
import { EmptyState, LoadingSpinner, PageHeader } from '@/components/ui';
import UserForm from '@/features/users/UserForm';
import { useAuth } from '@/hooks/useAuth';
import { canManageUsers } from '@/lib/authorization';
import { extractApiErrorMessage } from '@/utils/apiError';

function parseErrorMessage(error) {
  return extractApiErrorMessage(error, 'Une erreur est survenue.');
}

export default function UserEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const hasManageAccess = canManageUsers(currentUser);

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadUser = useCallback(async () => {
    if (!hasManageAccess) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getUserById(id);
      setUser(response);
    } catch (error) {
      setErrorMessage(parseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [hasManageAccess, id]);

  useEffect(() => {
    if (!hasManageAccess) {
      return;
    }
    loadUser();
  }, [hasManageAccess, loadUser]);

  const handleUpdate = async (payload) => {
    await updateUser(id, payload);
    navigate('/users');
  };

  if (!hasManageAccess) {
    return (
      <EmptyState
        title="Acces non autorise"
        description="Seuls les roles Admin et Manager peuvent modifier les utilisateurs."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <EmptyState
        title="Utilisateur introuvable"
        description={errorMessage}
        action={
          <button
            type="button"
            onClick={loadUser}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Reessayer
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modifier utilisateur"
        subtitle="Mettez a jour les informations et permissions de ce compte."
        breadcrumbs={[
          { label: 'Utilisateurs', to: '/users' },
          { label: 'Edition' }
        ]}
      />

      <UserForm
        initialUser={user}
        onSubmit={handleUpdate}
        submitLabel="Enregistrer les modifications"
        cancelPath="/users"
      />
    </div>
  );
}
