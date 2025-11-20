import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmer cette action',
  description = 'Cette action est irreversible. Voulez-vous continuer ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmVariant = 'danger',
  loading = false
}) {
  const handleClose = () => {
    if (!loading) {
      onClose?.();
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
        {cancelText}
      </Button>
      <Button type="button" variant={confirmVariant} onClick={onConfirm} loading={loading}>
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      description={description}
      closeOnBackdrop={!loading}
      footer={footer}
      size="sm"
    />
  );
}
