import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Card, IconButton, Tooltip, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import ReportsService from '../../../services/reports_services';
import { titleURL } from 'http-common';
import { ExportCsv } from '@material-table/exporters';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useNavigate } from 'react-router-dom';

function KpiCard({ label, value, color }) {
  return (
    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 70 }}>
      <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}

export default function StockValuation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const storage = getsessionStorage();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({});

  useEffect(() => {
    dispatch(getMenuAccessAction(storage?.role_name));
    (async () => {
      setLoading(true);
      try {
        const res = await ReportsService.getStockValuation({});
        setData(res.data?.data || []);
        setKpis(res.data || {});
      } catch (err) { setData([]); }
      setLoading(false);
    })();
  }, []);

  const columns = [
    { field: 'location', headerName: 'Location', flex: 1, minWidth: 200 },
    { field: 'product_count', headerName: 'Products', flex: 0.5, minWidth: 90, align: 'right', headerAlign: 'right' },
    { field: 'total_qty', headerName: 'Total Qty', flex: 0.5, minWidth: 90, align: 'right', headerAlign: 'right',
      renderCell: (p) => Number(p.row?.total_qty || 0).toLocaleString('en-IN') },
    { field: 'total_value', headerName: 'Stock Value', flex: 0.7, minWidth: 120, align: 'right', headerAlign: 'right',
      renderCell: (p) => p.row?.total_value ? `\u20B9${Number(p.row.total_value).toLocaleString('en-IN')}` : '-' },
  ];

  return (
    <>
      <Helmet><title>{titleURL} | Stock Valuation</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, minHeight: 48 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 1 }}>Stock Valuation by Location</Typography>
          <Box sx={{ flex: 1 }} />
          <KpiCard label="Locations" value={kpis.totalLocations || 0} color="#2E3A59" />
          <KpiCard label="Total Qty" value={Number(kpis.totalQty || 0).toLocaleString('en-IN')} color="#11C15B" />
          <KpiCard label="Total Value" value={`\u20B9${Number(kpis.totalValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="#0A8FDC" />
          <Tooltip title="Export CSV"><IconButton onClick={() => {
            ExportCsv(columns.map(c => ({ title: c.headerName, field: c.field })), data, 'Stock_Valuation');
          }}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DataGrid rows={data} columns={columns} getRowId={(row) => `${row.location_id}`}
            pageSizeOptions={[20, 50, 100]} density="compact" disableRowSelectionOnClick loading={loading}
            sx={{ border: 'none', height: '100%',
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 },
              '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' },
              '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' } }} />
        </Box>
      </Card>
    </>
  );
}
