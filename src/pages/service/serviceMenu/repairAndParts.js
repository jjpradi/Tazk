import React, { useEffect } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';

const RepairAndParts = ({ Selectedproduct, editdata, handleProdDelete }) => {
  const selectedProductArray = Array.isArray(Selectedproduct) ? Selectedproduct : [];

  const transformedEditData = editdata?.product_details?.map((detail) => ({
    id: detail.item_id,  // Use a unique field from your data as the id
    name: detail.product_name,
    quantity: detail.quantity,
    hsn_code: detail.hsn_code, 
    tax_category: detail.tax_category, 
    unit_price: detail.unit_price 
  })) || [];

  const mergedData = [...selectedProductArray, ...transformedEditData].reduce((acc, current) => {
    const exists = acc.find(item => item.name === current.name);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  // Ensure every row has a unique id
  const dataWithUniqueIds = mergedData.map((row, index) => ({
    ...row,
    id: row.id || index  // Assign an id if it doesn't exist, using the index as a fallback
  }));

  useEffect(() => {
    // console.log('Data With Unique IDs:', selectedProductArray, transformedEditData, dataWithUniqueIds);
  }, [selectedProductArray, transformedEditData]);

  const columns = [
    {
      field: 'name', headerName: 'Product', width: 200,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <div style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%'
          }}>
            {params.value}
          </div>
        </Tooltip>
      )
    },
    {
      field: 'hsn_code', headerName: 'Code', width: 130,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <div style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%'
          }}>
            {params.value}
          </div>
        </Tooltip>
      )
    },
    {
      field: 'tax_category', headerName: 'GST', width: 130,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <div style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%'
          }}>
            {params.value}
          </div>
        </Tooltip>
      )
    },
    {
      field: 'quantity', headerName: 'Quantity', width: 100,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <div style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%'
          }}>
            {params.value}
          </div>
        </Tooltip>
      )
    },
    {
      field: 'unit_price', headerName: 'Unit Price', width: 140,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <div style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%'
          }}>
            {params.value}
          </div>
        </Tooltip>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <div>
          <IconButton
            color="secondary"
            aria-label="delete"
            onClick={() => handleProdDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div style={{ margin: ' 0px 30px 0px 0px' }}>
      <Box sx={{ height: 200, width: '100%' }}>
        <DataGrid
          rows={dataWithUniqueIds}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              '& .MuiDataGrid-columnHeader:last-of-type .MuiDataGrid-columnSeparator': {
                display: 'none'
              }
            }
          }}
          columns={columns}
          hideFooter={true}
        />
      </Box>
    </div>
  );
};

export default RepairAndParts;
