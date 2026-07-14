import React from 'react';
import { Box, TablePagination } from '@mui/material';

export default function OutstandingPagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [20, 50, 100],
}) {
  return (
    <Box
      display="flex"
      justifyContent="flex-end"
      sx={{ borderTop: '1px solid #e0e0e0', px: 2, py: 0 }}
    >
      <TablePagination
        component="div"
        rowsPerPageOptions={rowsPerPageOptions}
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        sx={{
          '& .MuiToolbar-root': { minHeight: 40, paddingLeft: 1, paddingRight: 1 },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontSize: '0.8125rem',
            margin: 0,
          },
          '& .MuiTablePagination-select': { fontSize: '0.8125rem' },
        }}
      />
    </Box>
  );
}
