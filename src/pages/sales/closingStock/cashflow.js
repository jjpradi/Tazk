import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, TextField, IconButton } from '@mui/material';
import { FilterAlt } from '@mui/icons-material';

const columns = [
  { field: 'brandName', headerName: 'Brand Name', width: 150 },
  { field: 'itemName', headerName: 'Item Name', width: 200 },
  { field: 'unitPrice', headerName: 'Unit Price', type: 'number', width: 120 },
  { field: 'purchaseDate', headerName: 'Purchase Date', width: 150 },
  { field: 'lotNumber', headerName: 'Lot Number', width: 150 },
  { field: 'ageing', headerName: 'Ageing', type: 'number', width: 120 },
];

const initialRows = [
  { id: 1, brandName: 'VIVO', itemName: 'Model X', unitPrice: 6999, purchaseDate: '17/01/2025', lotNumber: '00000203', ageing: 24 },
  { id: 2, brandName: 'Samsung', itemName: 'Galaxy S22', unitPrice: 4999, purchaseDate: '10/12/2024', lotNumber: '00000215', ageing: 45 },
  { id: 3, brandName: 'Apple', itemName: 'iPhone 14', unitPrice: 11999, purchaseDate: '15/08/2024', lotNumber: '00000345', ageing: 60 },
];

const CashFlow = () => {
  const [rows, setRows] = useState(initialRows);
  const [filterText, setFilterText] = useState('');

  const handleFilterChange = (event) => {
    const searchText = event.target.value.toLowerCase();
    setFilterText(searchText);

    const filteredRows = initialRows.filter((row) =>
      Object.values(row).some((value) =>
        value.toString().toLowerCase().includes(searchText)
      )
    );
    setRows(filteredRows);
  };

  return (
    <Box sx={{ height: 500, width: '100%', padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={filterText}
          onChange={handleFilterChange}
        />
        <IconButton>
          <FilterAlt />
        </IconButton>
      </Box>

      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection
        disableColumnFilter={false}
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default CashFlow;
