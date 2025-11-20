import { useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const schema = z.object({
  reference: z.string().optional(),
  nom: z.string().min(1, 'Nom obligatoire'),
  marque: z.string().optional(),
  modele: z.string().optional(),
  categorie: z.string().optional(),
  description: z.string().optional()
});

function MaterielForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Enregistrer', loading = false }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      reference: '',
      nom: '',
      marque: '',
      modele: '',
      categorie: '',
      description: '',
      ...defaultValues
    }
  });

  useEffect(() => {
    reset({
      reference: '',
      nom: '',
      marque: '',
      modele: '',
      categorie: '',
      description: '',
      ...defaultValues
    });
  }, [defaultValues, reset]);

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="label">Référence</label>
          <input className="input" {...register('reference')} />
        </div>
        <div>
          <label className="label">Nom *</label>
          <input className="input" {...register('nom')} />
          {errors.nom ? <p className="mt-1 text-xs text-danger">{errors.nom.message}</p> : null}
        </div>
        <div>
          <label className="label">Marque</label>
          <input className="input" {...register('marque')} />
        </div>
        <div>
          <label className="label">Modèle</label>
          <input className="input" {...register('modele')} />
        </div>
        <div>
          <label className="label">Catégorie</label>
          <input className="input" {...register('categorie')} />
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <textarea className="input min-h-24" {...register('description')} />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <button className="btn-secondary" onClick={onCancel} type="button">
            Annuler
          </button>
        ) : null}
        <button className="btn-primary" disabled={loading} type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default MaterielForm;
