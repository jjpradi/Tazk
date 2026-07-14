import React, { useState, useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Card, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import CommonSearch from 'utils/commonSearch';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import ReportsService from '../../../services/reports_services';
import { titleURL } from 'http-common';
import { ExportCsv } from '@material-table/exporters';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { useNavigate } from 'react-router-dom';

function KpiCard({ label, value, color }) {
  return (
    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 80 }}>
      <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}

export default function LowStockAlertReport() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const { menuAccess = {} } = useSelector(state => state.rbacReducer);
  const storage = getsessionStorage();
  const selectedRole = storage?.role_name;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [rowCount, setRowCount] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const [kpis, setKpis] = useState({ totalQty: 0, totalValue: 0, outOfStockCount: 0, lowStockCount: 0 });

  const fetchData = async (pageNum = 0, pageSz = 20) => {
    if (!headerLocationId) return;
    setLoading(true);
    try {
      const res = await ReportsService.getLowStock({ location_id: headerLocationId, pageCount: pageNum, numPerPage: pageSz });
      setData(res.data?.data || []);
      setRowCount(res.data?.numRows || 0);
      setKpis({ totalQty: res.data?.totalQty || 0, totalValue: res.data?.totalValue || 0, outOfStockCount: res.data?.outOfStockCount || 0, lowStockCount: res.data?.lowStockCount || 0 });
    } catch (err) { console.error(err); setData([]); setRowCount(0); }
    setLoading(false);
  };

  useEffect(() => { dispatch(getMenuAccessAction(selectedRole)); }, []);
  useEffect(() => { if (headerLocationId) fetchData(page, pageSize); }, [page, pageSize, headerLocationId]);

  const columns = [
    { field: 'product_name', headerName: 'Product Name', flex: 1, minWidth: 150 },
    { field: 'category', headerName: 'Category', flex: 0.6, minWidth: 90, sortable: false },
    { field: 'brand', headerName: 'Brand', flex: 0.6, minWidth: 90 },
    { field: 'sku', headerName: 'SKU', flex: 0.5, minWidth: 80 },
    { field: 'reorder_level', headerName: 'Reorder Level', flex: 0.5, minWidth: 90, align: 'right', headerAlign: 'right' },
    { field: 'available_qty', headerName: 'Available Qty', flex: 0.5, minWidth: 90, align: 'right', headerAlign: 'right' },
    { field: 'stock_value', headerName: 'Value', flex: 0.5, minWidth: 80, align: 'right', headerAlign: 'right',
      renderCell: (p) => p.row?.stock_value ? `\u20B9${Number(p.row.stock_value).toLocaleString('en-IN')}` : '-' },
    { field: 'stock_status', headerName: 'Status', flex: 0.5, minWidth: 90,
      renderCell: (p) => {
        const s = p.row?.stock_status;
        const color = s === 'Out of Stock' ? '#d32f2f' : '#E65100';
        return <Chip label={s} size="small" sx={{ fontSize: 9, height: 20, bgcolor: `${color}15`, color, fontWeight: 600 }} />;
      }
    },
  ];

  return (
    <>
      <Helmet><title>{titleURL} | Low Stock Alert</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, minHeight: 48 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 1 }}>Low Stock Alert</Typography>
          <Box sx={{ flex: 1 }} />
          <KpiCard label="Total Items" value={rowCount} color="#2E3A59" />
          <KpiCard label="Low Stock" value={kpis.lowStockCount} color="#E65100" />
          <KpiCard label="Out of Stock" value={kpis.outOfStockCount} color="#d32f2f" />
          <KpiCard label="At Risk Value" value={`\u20B9${Number(kpis.totalValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="#7C4DFF" />
          <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => setSearchVal(e.target.value)} />
          <Tooltip title="Export CSV"><IconButton onClick={async () => {
            try { const res = await ReportsService.getLowStock({ location_id: headerLocationId, pageCount: 0, numPerPage: rowCount });
              ExportCsv(columns.map(c => ({ title: c.headerName, field: c.field })), res.data?.data || [], 'Low_Stock_Alert');
            } catch (e) {}
          }}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DataGrid rows={data} columns={columns} rowCount={rowCount} getRowId={(row) => `${row.item_id}`}
            paginationMode="server" paginationModel={{ page, pageSize }}
            onPaginationModelChange={(m) => { if (m.page !== page) setPage(m.page); if (m.pageSize !== pageSize) setPageSize(m.pageSize); }}
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
