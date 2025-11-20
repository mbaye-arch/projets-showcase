import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getRoles } from '@/api/roleApi';
import { getUsers } from '@/api/userApi';
import { Button, Card, Input, Select } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { getRoleLabel } from '@/features/users/userConstants';
import {
  buildUserFormSchema,
  defaultUserFormValues,
  toUserFormValues,
  toUserPayload
} from '@/features/users/userFormSchema';
import { applyApiFieldErrors, extractApiErrorMessage } from '@/utils/apiError';

function upsertRoleOption(rolesMap, roleId, roleName) {
  if (!roleId) {
    return;
  }

  const nextName = roleName ? String(roleName).toUpperCase() : null;
  const existing = rolesMap.get(String(roleId));
  if (!existing) {
    rolesMap.set(String(roleId), nextName);
    return;
  }

  if (!existing && nextName) {
    rolesMap.set(String(roleId), nextName);
  }
}

export default function UserForm({
  initialUser,
  onSubmit,
  submitLabel = 'Enregistrer',
  cancelPath = '/users'
}) {
  const { currentUser } = useAuth();
  const isEdit = Boolean(initialUser);

  const [submitError, setSubmitError] = useState(null);
  const [rolesOptions, setRolesOptions] = useState([]);
  const [rolesError, setRolesError] = useState(null);
  const [isRolesLoading, setIsRolesLoading] = useState(true);

  const schema = useMemo(() => buildUserFormSchema({ requirePassword: !isEdit }), [isEdit]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: toUserFormValues(initialUser ?? defaultUserFormValues)
  });

  useEffect(() => {
    reset(toUserFormValues(initialUser ?? defaultUserFormValues));
  }, [initialUser, reset]);

  useEffect(() => {
    let isMounted = true;

    const loadRoleOptions = async () => {
      setIsRolesLoading(true);
      setRolesError(null);

      let endpointOptions = [];
      let fallbackOptions = [];

      try {
        const rolesResponse = await getRoles();

        if (!isMounted) {
          return;
        }

        endpointOptions = (rolesResponse ?? [])
          .map((role) => ({
            value: String(role.id),
            label: getRoleLabel(role.name)
          }))
          .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
      } catch {
        endpointOptions = [];
      }

      try {
        const usersResponse = await getUsers({
          page: 0,
          size: 500,
          sort: 'createdAt,desc'
        });

        if (!isMounted) {
          return;
        }

        const rolesMap = new Map();
        (usersResponse?.content ?? []).forEach((user) => {
          upsertRoleOption(rolesMap, user.roleId, user.roleName);
        });

        upsertRoleOption(rolesMap, currentUser?.roleId, currentUser?.roleName);
        upsertRoleOption(rolesMap, initialUser?.roleId, initialUser?.roleName);

        const options = Array.from(rolesMap.entries())
          .map(([roleId, roleName]) => ({
            value: roleId,
            label: roleName ? getRoleLabel(roleName) : `Role #${roleId}`
          }))
          .sort((a, b) => a.label.localeCompare(b.label, 'fr'));

        fallbackOptions = options;
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (endpointOptions.length === 0) {
          setRolesError(extractApiErrorMessage(error, 'Impossible de charger la liste des roles.'));
        }
      }

      if (!isMounted) {
        return;
      }

      const mergedMap = new Map();
      endpointOptions.forEach((option) => {
        mergedMap.set(String(option.value), option);
      });
      fallbackOptions.forEach((option) => {
        if (!mergedMap.has(String(option.value))) {
          mergedMap.set(String(option.value), option);
        }
      });

      const contextMap = new Map();
      upsertRoleOption(contextMap, currentUser?.roleId, currentUser?.roleName);
      upsertRoleOption(contextMap, initialUser?.roleId, initialUser?.roleName);
      Array.from(contextMap.entries()).forEach(([roleId, roleName]) => {
        if (!mergedMap.has(String(roleId))) {
          mergedMap.set(String(roleId), {
            value: String(roleId),
            label: roleName ? getRoleLabel(roleName) : `Role #${roleId}`
          });
        }
      });

      const mergedOptions = Array.from(mergedMap.values())
        .sort((a, b) => a.label.localeCompare(b.label, 'fr'));

      setRolesOptions(mergedOptions);
      setIsRolesLoading(false);
    };

    loadRoleOptions();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.roleId, currentUser?.roleName, initialUser?.roleId, initialUser?.roleName]);

  const submitForm = async (values) => {
    setSubmitError(null);

    try {
      await onSubmit(toUserPayload(values, { isEdit }));
    } catch (error) {
      const hasFieldErrors = applyApiFieldErrors(error, setError);
      setSubmitError(
        extractApiErrorMessage(
          error,
          hasFieldErrors
            ? 'Veuillez corriger les champs en erreur.'
            : "Une erreur est survenue lors de l'enregistrement de l'utilisateur."
        )
      );
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submitForm)} noValidate>
      <Card
        title={isEdit ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
        subtitle="Renseignez les informations du compte et le role."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Prenom"
            required
            placeholder="Ex: Aissatou"
            error={errors.firstName?.message}
            {...register('firstName')}
          />

          <Input
            label="Nom"
            required
            placeholder="Ex: Diallo"
            error={errors.lastName?.message}
            {...register('lastName')}
          />

          <Input
            label="Email"
            required
            type="email"
            placeholder="Ex: support@sentechcare.one"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Telephone"
            placeholder="Ex: +221 77 000 00 00"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label={isEdit ? 'Mot de passe (optionnel)' : 'Mot de passe'}
            required={!isEdit}
            type="password"
            placeholder={isEdit ? 'Laisser vide pour conserver le mot de passe actuel' : 'Minimum 8 caracteres'}
            error={errors.password?.message}
            {...register('password')}
          />

          {rolesOptions.length > 0 ? (
            <Select
              label="Role"
              required
              options={rolesOptions}
              placeholder={isRolesLoading ? 'Chargement des roles...' : 'Selectionner un role'}
              helperText={rolesError || undefined}
              error={errors.roleId?.message}
              disabled={isRolesLoading}
              {...register('roleId')}
            />
          ) : (
            <Input
              label="Role (ID)"
              required
              type="number"
              min="1"
              placeholder="Ex: 1"
              helperText={rolesError || "Aucun role detecte automatiquement. Saisir l'identifiant du role."}
              error={errors.roleId?.message}
              {...register('roleId')}
            />
          )}
        </div>

        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
              {...register('active')}
            />
            Compte actif
          </label>
        </div>

        {submitError ? (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {submitError}
          </div>
        ) : null}
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Link
          to={cancelPath}
          className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Annuler
        </Link>
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
