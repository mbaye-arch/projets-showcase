import { useNavigate } from 'react-router-dom';
import { createUser } from '@/api/userApi';
import { EmptyState, PageHeader } from '@/components/ui';
import UserForm from '@/features/users/UserForm';
import { useAuth } from '@/hooks/useAuth';
import { canManageUsers } from '@/lib/authorization';

export default function UserCreatePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const hasManageAccess = canManageUsers(currentUser);

  const handleCreate = async (payload) => {
    await createUser(payload);
    navigate('/users');
  };

  if (!hasManageAccess) {
    return (
      <EmptyState
        title="Acces non autorise"
        description="Seuls les roles Admin et Manager peuvent creer des utilisateurs."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvel utilisateur"
        subtitle="Creer un compte utilisateur et attribuer son role."
        breadcrumbs={[
          { label: 'Utilisateurs', to: '/users' },
          { label: 'Creation' }
        ]}
      />

      <UserForm onSubmit={handleCreate} submitLabel="Creer l'utilisateur" cancelPath="/users" />
    </div>
  );
}
