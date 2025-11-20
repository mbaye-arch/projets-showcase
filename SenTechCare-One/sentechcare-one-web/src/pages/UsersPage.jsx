import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUsers } from '@/api/userApi';
import { getRoles } from '@/api/roleApi';
import { Badge, Button, Card, EmptyState, Input, PageHeader, Pagination, Select, Table } from '@/components/ui';
import {
  ACTIVE_FILTER_OPTIONS,
  getRoleBadgeVariant,
  getRoleLabel,
  getUserStatusBadgeVariant,
  getUserStatusLabel
} from '@/features/users/userConstants';
import { useAuth } from '@/hooks/useAuth';
import { canManageUsers, canReadUsers } from '@/lib/authorization';
import { extractApiErrorMessage } from '@/utils/apiError';
import { formatApiDateTime } from '@/utils/date';

const DEFAULT_PAGE = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0
};

function parseErrorMessage(error, fallback) {
  return extractApiErrorMessage(error, fallback || 'Une erreur est survenue.');
}

function mergeRoleOptions(primary = [], secondary = []) {
  const mergedById = new Map();

  primary.forEach((option) => {
    if (!option?.value) {
      return;
    }
    mergedById.set(String(option.value), {
      value: String(option.value),
      label: option.label || `Role #${option.value}`
    });
  });

  secondary.forEach((option) => {
    if (!option?.value) {
      return;
    }
    if (!mergedById.has(String(option.value))) {
      mergedById.set(String(option.value), {
        value: String(option.value),
        label: option.label || `Role #${option.value}`
      });
    }
  });

  return Array.from(mergedById.values()).sort((a, b) => a.label.localeCompare(b.label, 'fr'));
}

export default function UsersPage() {
  const { currentUser } = useAuth();
  const hasManageAccess = canManageUsers(currentUser);
  const hasReadAccess = canReadUsers(currentUser);

  const [usersPage, setUsersPage] = useState(DEFAULT_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);

  const [rolesOptions, setRolesOptions] = useState([]);

  const [pendingFilters, setPendingFilters] = useState({
    search: '',
    roleId: '',
    active: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    roleId: '',
    active: ''
  });

  const loadRoleOptions = useCallback(async () => {
    if (!hasReadAccess) {
      setRolesOptions([]);
      return;
    }

    let rolesFromRoleApi = [];
    let rolesFromUsersApi = [];

    try {
      const rolesResponse = await getRoles();
      rolesFromRoleApi = (rolesResponse ?? [])
        .map((role) => ({
          value: String(role.id),
          label: getRoleLabel(role.name)
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
    } catch {
      rolesFromRoleApi = [];
    }

    if (rolesFromRoleApi.length === 0) {
      try {
        const usersResponse = await getUsers({
          page: 0,
          size: 500,
          sort: 'createdAt,desc'
        });

        const uniqueRoles = new Map();
        (usersResponse?.content ?? []).forEach((user) => {
          if (!user?.roleId) {
            return;
          }
          if (!uniqueRoles.has(String(user.roleId))) {
            uniqueRoles.set(String(user.roleId), user.roleName || null);
          }
        });

        rolesFromUsersApi = Array.from(uniqueRoles.entries())
          .map(([roleId, roleName]) => ({
            value: roleId,
            label: roleName ? getRoleLabel(roleName) : `Role #${roleId}`
          }))
          .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
      } catch {
        rolesFromUsersApi = [];
      }
    }

    setRolesOptions(mergeRoleOptions(rolesFromRoleApi, rolesFromUsersApi));
  }, [hasReadAccess]);

  const loadUsers = useCallback(async () => {
    if (!hasReadAccess) {
      setUsersPage(DEFAULT_PAGE);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const activeValue =
        appliedFilters.active === '' ? undefined : appliedFilters.active === 'true';

      const response = await getUsers({
        page: pageIndex,
        size: 10,
        sort: 'createdAt,desc',
        search: appliedFilters.search || undefined,
        roleId: appliedFilters.roleId || undefined,
        active: activeValue
      });

      setUsersPage({ ...DEFAULT_PAGE, ...response });
    } catch (error) {
      setErrorMessage(parseErrorMessage(error, 'Impossible de recuperer la liste des utilisateurs.'));
    } finally {
      setIsLoading(false);
    }
  }, [hasReadAccess, pageIndex, appliedFilters]);

  useEffect(() => {
    if (!hasReadAccess) {
      return;
    }
    loadRoleOptions();
  }, [hasReadAccess, loadRoleOptions]);

  useEffect(() => {
    if (!hasReadAccess) {
      return;
    }
    loadUsers();
  }, [hasReadAccess, loadUsers]);

  const columns = useMemo(
    () => [
      {
        key: 'fullName',
        header: 'Nom complet',
        render: (_, row) => [row.firstName, row.lastName].filter(Boolean).join(' ').trim() || '-'
      },
      {
        key: 'email',
        header: 'Email'
      },
      {
        key: 'phone',
        header: 'Telephone',
        render: (value) => value || '-'
      },
      {
        key: 'roleName',
        header: 'Role',
        render: (value) => (
          <Badge variant={getRoleBadgeVariant(value)}>{getRoleLabel(value)}</Badge>
        )
      },
      {
        key: 'active',
        header: 'Statut',
        render: (value) => (
          <Badge variant={getUserStatusBadgeVariant(value)}>{getUserStatusLabel(value)}</Badge>
        )
      },
      {
        key: 'updatedAt',
        header: 'Mise a jour',
        render: (value) => formatApiDateTime(value)
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (_, row) =>
          hasManageAccess ? (
            <Link
              to={`/users/${row.id}/edit`}
              className="rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
            >
              Modifier
            </Link>
          ) : (
            <span className="text-xs text-slate-400">Lecture seule</span>
          )
      }
    ],
    [hasManageAccess]
  );

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setPageIndex(0);
    setAppliedFilters({ ...pendingFilters });
  };

  const clearFilters = () => {
    const empty = { search: '', roleId: '', active: '' };
    setPendingFilters(empty);
    setAppliedFilters(empty);
    setPageIndex(0);
  };

  if (!currentUser) {
    return (
      <EmptyState
        title="Utilisateur non charge"
        description="Impossible de determiner les permissions de la session."
      />
    );
  }

  if (!hasReadAccess) {
    return (
      <EmptyState
        title="Acces non autorise"
        description="Vous ne disposez pas des droits necessaires pour consulter les utilisateurs."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs"
        subtitle="Gestion des comptes, roles et activations."
        actions={
          hasManageAccess ? (
            <Link to="/users/new">
              <Button>Ajouter un utilisateur</Button>
            </Link>
          ) : null
        }
      />

      <Card title="Filtres" subtitle="Filtrer par role, statut actif et recherche." padding="md">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-4" onSubmit={handleFilterSubmit}>
          <Input
            label="Recherche"
            placeholder="Nom, email, telephone..."
            value={pendingFilters.search}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, search: event.target.value }))}
          />

          <Select
            label="Role"
            options={[{ value: '', label: 'Tous les roles' }, ...rolesOptions]}
            value={pendingFilters.roleId}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, roleId: event.target.value }))}
          />

          <Select
            label="Statut"
            options={ACTIVE_FILTER_OPTIONS}
            value={pendingFilters.active}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, active: event.target.value }))}
          />

          <div className="flex items-end gap-2">
            <Button type="submit">Filtrer</Button>
            <Button type="button" variant="ghost" onClick={clearFilters}>
              Reinitialiser
            </Button>
          </div>
        </form>
      </Card>

      {errorMessage ? (
        <Card padding="md">
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </p>
        </Card>
      ) : null}

      <Table
        columns={columns}
        data={usersPage.content}
        rowKey="id"
        isLoading={isLoading}
        emptyTitle="Aucun utilisateur trouve"
        emptyDescription="Aucun utilisateur ne correspond aux filtres selectionnes."
      />

      <Card padding="sm">
        <Pagination
          page={usersPage.number}
          totalPages={usersPage.totalPages}
          totalElements={usersPage.totalElements}
          pageSize={usersPage.size || 10}
          onPageChange={(nextPage) => setPageIndex(nextPage)}
        />
      </Card>
    </div>
  );
}
