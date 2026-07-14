import React from 'react';
import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import SortableHeader from './SortableHeader';

/**
 * Generic table for the outstanding (receivable / payable) Value views.
 *
 * columns: array of {
 *   key: string                     // unique id; also used as sort field if sortable
 *   label: ReactNode                // header text
 *   sortable?: boolean
 *   align?: 'right'                 // wraps cell content in right-aligned Box (matches existing 30px right padding)
 *   render?: (row) => ReactNode     // cell renderer; defaults to row[key]
 *   cellSx?: object                 // sx override for the body TableCell
 *   headerSx?: object               // sx override for the head TableCell
 * }
 *
 * onRowClick: (row, index) => void  // when omitted, rows are not clickable
 */
export default function OutstandingTable({
  columns,
  rows,
  sortKey,
  sortOrder,
  onSort,
  onRowClick,
  getRowKey = (_row, i) => i,
  emptyState = null,
  maxHeight = 'calc(100vh - 340px)',
  loading = false,
  skeletonRows = 6,
}) {
  const clickable = typeof onRowClick === 'function';

  const renderHeaderInner = (col) => {
    const inner = col.sortable ? (
      <SortableHeader
        active={sortKey === col.key}
        direction={sortOrder}
        onClick={() => onSort && onSort(col.key)}
      >
        {col.label}
      </SortableHeader>
    ) : (
      col.label
    );
    if (col.align === 'right') {
      return <Box sx={{ textAlign: 'right', width: '100%' }}>{inner}</Box>;
    }
    return inner;
  };

  const renderCell = (col, row) => {
    const content = col.render ? col.render(row) : row[col.key] ?? '';
    if (col.align === 'right') {
      return (
        <Box sx={{ textAlign: 'right', width: '100%', paddingRight: '30px' }}>
          {content}
        </Box>
      );
    }
    return content;
  };

  return (
    <TableContainer
      component={Paper}
      sx={{ maxHeight, overflow: 'auto', border: 'none', boxShadow: 'none', pr: 1 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key} sx={col.headerSx}>
                <b>{renderHeaderInner(col)}</b>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, ri) => (
              <TableRow key={`skel-${ri}`}>
                {columns.map((col) => (
                  <TableCell key={col.key} sx={col.cellSx}>
                    {col.align === 'right' ? (
                      <Box sx={{ textAlign: 'right', width: '100%', paddingRight: '30px' }}>
                        <Skeleton variant="text" width="60%" sx={{ display: 'inline-block' }} />
                      </Box>
                    ) : (
                      <Skeleton variant="text" width={`${50 + ((ri * 13 + col.key.length * 7) % 35)}%`} />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows && rows.length > 0 ? (
            rows.map((row, i) => (
              <TableRow
                key={getRowKey(row, i)}
                onClick={clickable ? () => onRowClick(row, i) : undefined}
                sx={{
                  '&:hover': {
                    backgroundColor: clickable ? '#f5f5f5' : 'inherit',
                    cursor: clickable ? 'pointer' : 'default',
                  },
                }}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} sx={col.cellSx}>
                    {renderCell(col, row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : emptyState ? (
            <TableRow sx={{ '& td': { borderBottom: 'none' } }}>
              <TableCell
                colSpan={columns.length}
                sx={{
                  height: '400px',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  padding: 0,
                  borderBottom: 'none',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%',
                  }}
                >
                  {emptyState}
                </Box>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
