import { useForm } from 'react-hook-form';

const movementTypes = [
  { value: 'ENTREE', label: 'ENTREE' },
  { value: 'SORTIE', label: 'SORTIE' },
  { value: 'RETOUR', label: 'RETOUR' },
  { value: 'AJUSTEMENT', label: 'AJUSTEMENT' }
];

function MovementForm({ stocks, onSubmit, loading = false }) {
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      materielId: '',
      typeMouvement: 'ENTREE',
      quantite: 1,
      quantiteReelle: '',
      ecart: '',
      prixUnitaire: '',
      dateMouvement: '',
      dateAchat: '',
      dateReception: '',
      motif: '',
      referenceDocument: '',
      commentaire: ''
    }
  });

  const type = watch('typeMouvement');

  const submitForm = async (values) => {
    const payload = {
      ...values,
      materielId: Number(values.materielId),
      quantite: values.quantite !== '' ? Number(values.quantite) : undefined,
      quantiteReelle: values.quantiteReelle !== '' ? Number(values.quantiteReelle) : undefined,
      ecart: values.ecart !== '' ? Number(values.ecart) : undefined,
      prixUnitaire: values.prixUnitaire !== '' ? Number(values.prixUnitaire) : undefined,
      dateMouvement: values.dateMouvement || undefined,
      dateAchat: values.dateAchat || undefined,
      dateReception: values.dateReception || undefined
    };

    await onSubmit(payload);
    reset({
      ...values,
      quantite: 1,
      quantiteReelle: '',
      ecart: '',
      prixUnitaire: '',
      motif: '',
      referenceDocument: '',
      commentaire: ''
    });
  };

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit(submitForm)}>
      <div>
        <label className="label">Matériel</label>
        <select className="input" required {...register('materielId')}>
          <option value="">Sélectionner</option>
          {stocks.map((stock) => (
            <option key={stock.id} value={stock.materielId}>
              {stock.numeroInventaire} - {stock.materiel.nom}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Type de mouvement</label>
        <select className="input" {...register('typeMouvement')}>
          {movementTypes.map((typeItem) => (
            <option key={typeItem.value} value={typeItem.value}>
              {typeItem.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Quantité</label>
        <input className="input" min="0" type="number" {...register('quantite')} />
      </div>

      {type === 'AJUSTEMENT' ? (
        <>
          <div>
            <label className="label">Quantité réelle (option)</label>
            <input className="input" min="0" type="number" {...register('quantiteReelle')} />
          </div>
          <div>
            <label className="label">Écart (option)</label>
            <input className="input" type="number" {...register('ecart')} />
          </div>
        </>
      ) : (
        <div>
          <label className="label">Prix unitaire (option)</label>
          <input className="input" min="0" step="0.01" type="number" {...register('prixUnitaire')} />
        </div>
      )}

      <div>
        <label className="label">Date mouvement</label>
        <input className="input" type="datetime-local" {...register('dateMouvement')} />
      </div>

      <div>
        <label className="label">Date achat</label>
        <input className="input" type="date" {...register('dateAchat')} />
      </div>

      <div>
        <label className="label">Date réception</label>
        <input className="input" type="date" {...register('dateReception')} />
      </div>

      <div>
        <label className="label">Motif</label>
        <input className="input" {...register('motif')} />
      </div>

      <div>
        <label className="label">Référence document</label>
        <input className="input" {...register('referenceDocument')} />
      </div>

      <div className="md:col-span-2">
        <label className="label">Commentaire</label>
        <textarea className="input" {...register('commentaire')} />
      </div>

      <div className="md:col-span-2 flex justify-end">
        <button className="btn-primary" disabled={loading} type="submit">
          Enregistrer le mouvement
        </button>
      </div>
    </form>
  );
}

export default MovementForm;
