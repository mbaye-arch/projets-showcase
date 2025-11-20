import { Button, Input } from '@/components/ui';

function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

export default function QuoteItemsFieldArray({
  fields,
  register,
  errors,
  lineTotals,
  onAddItem,
  onRemoveItem
}) {
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Description
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Quantite
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Prix unitaire
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total ligne
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {fields.map((field, index) => {
              const itemErrors = errors?.items?.[index] ?? {};

              return (
                <tr key={field.id}>
                  <td className="min-w-[260px] px-3 py-3 align-top">
                    <Input
                      placeholder="Ex: Installation routeur"
                      error={itemErrors.description?.message}
                      {...register(`items.${index}.description`)}
                    />
                  </td>

                  <td className="min-w-[140px] px-3 py-3 align-top">
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      error={itemErrors.quantity?.message}
                      {...register(`items.${index}.quantity`)}
                    />
                  </td>

                  <td className="min-w-[160px] px-3 py-3 align-top">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      error={itemErrors.unitPrice?.message}
                      {...register(`items.${index}.unitPrice`)}
                    />
                  </td>

                  <td className="min-w-[140px] px-3 py-3 align-top text-sm font-medium text-slate-800">
                    {formatCurrency(lineTotals[index])}
                  </td>

                  <td className="min-w-[110px] px-3 py-3 text-right align-top">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(index)}
                      disabled={fields.length === 1}
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Button type="button" variant="outline" onClick={onAddItem}>
        Ajouter une ligne
      </Button>

      {errors?.items?.message ? (
        <p className="text-xs text-rose-600">{errors.items.message}</p>
      ) : null}
    </div>
  );
}
