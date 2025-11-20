import { useState } from 'react';
import { Badge, Button, Card, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui';
import {
  getRoleBadgeVariant,
  getRoleLabel,
  getUserStatusBadgeVariant,
  getUserStatusLabel
} from '@/features/users/userConstants';
import { useAuth } from '@/hooks/useAuth';
import { extractApiErrorMessage } from '@/utils/apiError';

function parseErrorMessage(error, fallback) {
  return extractApiErrorMessage(error, fallback || 'Une erreur est survenue.');
}

export default function ProfilePage() {
  const { currentUser, isLoading, refreshCurrentUser } = useAuth();
  const [refreshError, setRefreshError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshError(null);
    setIsRefreshing(true);

    try {
      await refreshCurrentUser();
    } catch (error) {
      setRefreshError(parseErrorMessage(error, 'Impossible de rafraichir le profil.'));
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <EmptyState
        title="Profil indisponible"
        description="La session utilisateur est invalide ou expiree."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon profil"
        subtitle="Informations du compte actuellement connecte."
        actions={
          <Button type="button" variant="outline" onClick={handleRefresh} loading={isRefreshing}>
            Rafraichir
          </Button>
        }
      />

      {refreshError ? (
        <Card padding="md">
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {refreshError}
          </p>
        </Card>
      ) : null}

      <Card title="Informations personnelles" subtitle="Donnees associees a votre compte utilisateur.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Prenom</p>
            <p className="mt-1 text-sm text-slate-800">{currentUser.firstName || '-'}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Nom</p>
            <p className="mt-1 text-sm text-slate-800">{currentUser.lastName || '-'}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</p>
            <p className="mt-1 text-sm text-slate-800">{currentUser.email || '-'}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Telephone</p>
            <p className="mt-1 text-sm text-slate-800">{currentUser.phone || '-'}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Role</p>
            <div className="mt-1">
              <Badge variant={getRoleBadgeVariant(currentUser.roleName)}>
                {getRoleLabel(currentUser.roleName)}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Statut</p>
            <div className="mt-1">
              <Badge variant={getUserStatusBadgeVariant(currentUser.active)}>
                {getUserStatusLabel(currentUser.active)}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
