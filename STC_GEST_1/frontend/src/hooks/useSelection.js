import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'stc_selection_items_v1';
const NOTE_KEY = 'stc_selection_note_v1';

const safeParse = (value, fallback) => {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const normalizeItem = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const type = raw.type === 'software' ? 'software' : raw.type === 'hardware' ? 'hardware' : null;
  const id = Number(raw.id);
  if (!type || !Number.isFinite(id) || id <= 0) return null;

  const quantity = Number(raw.quantity);
  const price = Number(raw.price);

  return {
    key: typeof raw.key === 'string' && raw.key ? raw.key : `${type}-${id}`,
    type,
    id,
    name: String(raw.name || 'Produit'),
    price: Number.isFinite(price) ? price : 0,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    category: String(raw.category || '-'),
    supplier: String(raw.supplier || '-'),
    condition_state: raw.condition_state || null,
    image: raw.image || null
  };
};

const normalizeItems = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeItem).filter(Boolean);
};

export const useSelection = () => {
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') return [];
    return normalizeItems(safeParse(localStorage.getItem(STORAGE_KEY), []));
  });

  const [internalNote, setInternalNote] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(NOTE_KEY) || '';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeItems(items)));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(NOTE_KEY, internalNote);
  }, [internalNote]);

  const addItem = (item) => {
    const key = `${item.type}-${item.id}`;

    setItems((prev) => {
      const safePrev = normalizeItems(prev);
      const existing = safePrev.find((entry) => entry.key === key);
      if (existing) {
        return safePrev.map((entry) =>
          entry.key === key
            ? {
                ...entry,
                quantity: entry.quantity + 1
              }
            : entry
        );
      }

      return [
        ...safePrev,
        {
          key,
          type: item.type,
          id: item.id,
          name: item.name,
          price: Number(item.price || 0),
          quantity: 1,
          category: item.category || '-',
          supplier: item.supplier || '-',
          condition_state: item.condition_state || null,
          image: item.image || null
        }
      ];
    });
  };

  const removeItem = (key) => {
    setItems((prev) => normalizeItems(prev).filter((item) => item.key !== key));
  };

  const updateQuantity = (key, quantity) => {
    const nextQty = Number(quantity);

    if (nextQty <= 0 || Number.isNaN(nextQty)) {
      removeItem(key);
      return;
    }

    setItems((prev) =>
      normalizeItems(prev).map((item) =>
        item.key === key
          ? {
              ...item,
              quantity: nextQty
            }
          : item
      )
    );
  };

  const clearSelection = () => {
    setItems([]);
    setInternalNote('');
  };

  const totals = useMemo(() => {
    const safeItems = normalizeItems(items);

    const lineTotals = safeItems.map((item) => ({
      key: item.key,
      total: Number(item.price || 0) * Number(item.quantity || 0)
    }));

    const grandTotal = lineTotals.reduce((sum, line) => sum + line.total, 0);

    return {
      lineTotals,
      grandTotal
    };
  }, [items]);

  return {
    items: normalizeItems(items),
    internalNote,
    setInternalNote,
    addItem,
    removeItem,
    updateQuantity,
    clearSelection,
    totals
  };
};
