import { useState } from 'react';

/**
 * Tri-state column sort: clicking the same column toggles asc <-> desc;
 * clicking a new column starts at asc.
 */
export default function useTableSort(initial = { key: '', order: 'asc' }) {
  const [sortConfig, setSortConfig] = useState(initial);

  const handleSort = (columnKey) => {
    setSortConfig((prev) => ({
      key: columnKey,
      order: prev.key === columnKey && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  return { sortConfig, setSortConfig, handleSort };
}
