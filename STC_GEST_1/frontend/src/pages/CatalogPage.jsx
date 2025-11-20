import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import ProductCard from '../components/ProductCard';
import { useSelection } from '../hooks/useSelection';
import { getApiErrorMessage } from '../services/api';
import { categoriesService } from '../services/categoriesService';
import { hardwareService } from '../services/hardwareService';
import { softwareService } from '../services/softwareService';

const CatalogPage = () => {
  const { addItem } = useSelection();

  const [hardwareItems, setHardwareItems] = useState([]);
  const [softwareItems, setSoftwareItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  const [filters, setFilters] = useState({
    q: '',
    type: '',
    category: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hardwareData, softwareData, categoriesData] = await Promise.all([
          hardwareService.list(),
          softwareService.list(),
          categoriesService.list()
        ]);

        setHardwareItems(hardwareData);
        setSoftwareItems(softwareData);
        setCategories(categoriesData);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Impossible de charger le catalogue'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const catalogItems = useMemo(() => {
    const mappedHardware = hardwareItems.map((item) => ({
      id: item.id,
      type: 'hardware',
      name: item.name,
      itemType: item.hardware_type,
      category: item.category_name,
      supplier: item.supplier_name,
      price: item.sale_price,
      condition_state: item.condition_state,
      image: item.main_image
    }));

    const mappedSoftware = softwareItems.map((item) => ({
      id: item.id,
      type: 'software',
      name: item.name,
      itemType: item.software_type,
      category: item.category_name,
      supplier: item.vendor_name,
      price: item.price,
      condition_state: null,
      image: null
    }));

    const mixed = [...mappedHardware, ...mappedSoftware];

    return mixed
      .filter((item) => {
        const search = filters.q.trim().toLowerCase();

        const searchMatch =
          !search ||
          [item.name, item.itemType, item.category, item.supplier]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(search);

        const typeMatch = !filters.type || item.type === filters.type;
        const categoryMatch = !filters.category || item.category === filters.category;

        return searchMatch && typeMatch && categoryMatch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [hardwareItems, softwareItems, filters]);

  const handleAdd = (item) => {
    addItem(item);
    setFlash(`"${item.name}" ajouté à la sélection interne`);
    setTimeout(() => setFlash(''), 2500);
  };

  return (
    <div>
      <PageHeader
        title="Catalogue interne"
        description="Vue unifiée matériels + logiciels, avec ajout rapide à la sélection interne."
      />

      <section className="card mb-4 grid gap-3 md:grid-cols-4">
        <input
          className="input md:col-span-2"
          placeholder="Recherche globale"
          value={filters.q}
          onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
        />

        <select
          className="select"
          value={filters.type}
          onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
        >
          <option value="">Tous les produits</option>
          <option value="hardware">Matériels</option>
          <option value="software">Logiciels</option>
        </select>

        <select
          className="select"
          value={filters.category}
          onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </section>

      {flash ? <div className="mb-4 rounded-lg bg-brand-100 px-4 py-2 text-sm text-brand-700">{flash}</div> : null}
      {loading ? <LoadingState label="Chargement du catalogue..." /> : null}
      {error ? <div className="card text-sm text-rose-600">{error}</div> : null}

      {!loading && !error && !catalogItems.length ? (
        <EmptyState
          title="Catalogue vide"
          description="Aucun élément trouvé avec les filtres actuels."
        />
      ) : null}

      {!loading && !error && catalogItems.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {catalogItems.map((item) => (
            <ProductCard item={item} key={`${item.type}-${item.id}`} onAdd={handleAdd} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default CatalogPage;
