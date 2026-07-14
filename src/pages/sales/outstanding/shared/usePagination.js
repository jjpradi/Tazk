import { useState } from 'react';

/**
 * Pagination state + the two MUI TablePagination handlers.
 * handleChangeRowsPerPage always resets page to 0 (the safe behavior — page-size
 * changes can otherwise leave the user on a page that no longer exists).
 */
export default function usePagination({ initialPage = 0, initialSize = 20 } = {}) {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  const handleChangePage = (_event, value) => {
    setPage(value);
  };

  const handleChangeRowsPerPage = (event) => {
    setSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  return { page, size, setPage, setSize, handleChangePage, handleChangeRowsPerPage };
}
