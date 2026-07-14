import React, { useContext, useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Card, IconButton, Typography } from '@mui/material';
import { useCustomFetch } from 'utils/useCustomFetch';
import API_URLS from '../../../utils/customFetchApiUrls';
import { useNavigate } from 'react-router-dom';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';

const Reconciled = () => {
  const customFetch = useCustomFetch();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { headerLocationId } = useContext(CreateNewButtonContext);

  useEffect(() => {
    if (!headerLocationId) return;
    setLoading(true);
    (async () => {
      try {
        const response = await customFetch(API_URLS.LOTITEMS_RECONCILIATED_PRODUCT_LIST(headerLocationId), 'GET');
        setData(response?.data || []);
      } catch (error) { setData([]); }
      setLoading(false);
    })();
  }, [headerLocationId]);

  const columns = [
    { field: 'name', headerName: 'Product Name', flex: 1, minWidth: 150 },
    { field: 'category', headerName: 'Category', flex: 0.7, minWidth: 100 },
    { field: 'brand', headerName: 'Brand', flex: 0.7, minWidth: 100 },
    { field: 'location_name', headerName: 'Location', flex: 0.7, minWidth: 100 },
    { field: 'lotNumber', headerName: 'Lot Number', flex: 0.6, minWidth: 100, align: 'right', headerAlign: 'right' },
  ];

  return (
    <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, minHeight: 48 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59' }}>Reconciled Stocks</Typography>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 80 }}>
          <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>Total Items</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#11C15B', lineHeight: 1.3 }}>{data.length}</Typography>
        </Box>
        <IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton>
      </Box>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <DataGrid rows={data} columns={columns}
          getRowId={(row, idx) => `${row.lotNumber}_${row.name}_${idx}`}
          pageSizeOptions={[20, 50, 100]} density="compact" disableRowSelectionOnClick loading={loading}
          sx={{ border: 'none', height: '100%',
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 },
            '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' },
            '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' } }} />
      </Box>
    </Card>
  );
};

export default Reconciled;
