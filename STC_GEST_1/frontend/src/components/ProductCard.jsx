import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import { getMediaUrl } from '../utils/media';

const ProductCard = ({ item, onAdd }) => {
  const detailPath = item.type === 'hardware' ? `/hardware/${item.id}` : `/software/${item.id}`;
  const media = getMediaUrl(item.image);

  return (
    <div className="card flex h-full flex-col gap-3">
      <div className="h-40 w-full overflow-hidden rounded-lg bg-slate-100">
        {media ? (
          <img className="h-full w-full object-cover" src={media} alt={item.name} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">Aucune image</div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="badge-blue">{item.type === 'hardware' ? 'Matériel' : 'Logiciel'}</span>
          {item.condition_state ? <span className="badge-orange">{item.condition_state}</span> : null}
        </div>

        <h3 className="text-base font-semibold text-slate-900">{item.name}</h3>

        <p className="text-xs text-slate-500">Type: {item.itemType || '-'}</p>
        <p className="text-xs text-slate-500">Catégorie: {item.category || '-'}</p>
        <p className="text-xs text-slate-500">Fournisseur: {item.supplier || '-'}</p>

        <p className="mt-2 text-lg font-bold text-brand-700">{formatCurrency(item.price)}</p>
      </div>

      <div className="mt-2 flex gap-2">
        <Link className="btn-secondary w-full" to={detailPath}>
          Détail
        </Link>
        <button className="btn-primary w-full" onClick={() => onAdd(item)} type="button">
          Ajouter
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
