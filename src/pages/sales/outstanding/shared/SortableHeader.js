import React from 'react';
import { TableSortLabel } from '@mui/material';

/**
 * TableSortLabel wrapper with always-visible sort glyph (faint when inactive,
 * stronger on hover, full opacity when active). Centralizes the sx so the
 * affordance stays consistent across the OutstandingTable and the grouped
 * Customers/Vendors tables.
 */
export default function SortableHeader({ active, direction, onClick, children }) {
  return (
    <TableSortLabel
      active={active}
      direction={direction}
      onClick={onClick}
      hideSortIcon={false}
      sx={{
        '& .MuiTableSortLabel-icon': {
          opacity: active ? 1 : 0.35,
          transition: 'opacity 150ms ease',
        },
        '&:hover .MuiTableSortLabel-icon': {
          opacity: active ? 1 : 0.7,
        },
      }}
    >
      {children}
    </TableSortLabel>
  );
}
