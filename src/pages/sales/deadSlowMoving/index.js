import React, { useState, useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box, Card, Chip, Grid, IconButton, Stack, Tooltip, Typography,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BlockIcon from '@mui/icons-material/Block';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import SellIcon from '@mui/icons-material/SellOutlined';
import CommonSearch from 'utils/commonSearch';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import ReportsService from '../../../services/reports_services';
import { titleURL } from 'http-common';
import { ExportCsv } from '@material-table/exporters';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

function KpiCard({ label, value, icon, color }) {
  return (
    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 80 }}>
      <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}

export default function DeadSlowMovingReport() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { menuAccess = {} } = useSelector(state => state.rbacReducer);
  const storage = getsessionStorage();
  const selectedRole = storage?.role_name;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [rowCount, setRowCount] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const [kpis, setKpis] = useState({ totalQty: 0, totalValue: 0, neverSoldQty: 0, over90Qty: 0, days61to90Qty: 0, days31to60Qty: 0 });
  const [selectedChip, setSelectedChip] = useState(30);
  const [locationUpdate, setLocationUpdate] = useState(null);

  const fetchData = async (daysThreshold = 30, pageNum = 0, pageSz = 20) => {
    if (!headerLocationId) return;
    setLoading(true);
    try {
      const res = await ReportsService.getDeadSlowMoving({
        location_id: headerLocationId,
        pageCount: pageNum,
        numPerPage: pageSz,
        daysThreshold,
      });
      setData(res.data?.data || []);
      setRowCount(res.data?.numRows || 0);
      setKpis({
        totalQty: res.data?.totalQty || 0,
        totalValue: res.data?.totalValue || 0,
        neverSoldQty: res.data?.neverSoldQty || 0,
        over90Qty: res.data?.over90Qty || 0,
        days61to90Qty: res.data?.days61to90Qty || 0,
        days31to60Qty: res.data?.days31to60Qty || 0,
      });
    } catch (err) {
      console.error('Dead/Slow Moving report error:', err);
      setData([]);
      setRowCount(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    dispatch(getMenuAccessAction(selectedRole));
  }, []);

  useEffect(() => {
    if (headerLocationId) {
      fetchData(selectedChip, page, pageSize);
    }
  }, [selectedChip, page, pageSize, headerLocationId]);

  const handleExport = async () => {
    try {
      const res = await ReportsService.getDeadSlowMoving({
        location_id: headerLocationId,
        pageCount: 0,
        numPerPage: rowCount,
        daysThreshold: selectedChip,
      });
      const exportData = res.data?.data || [];
      const cols = columns.map(c => ({ title: c.headerName, field: c.field }));
      ExportCsv(cols, exportData, 'Dead_Slow_Moving_Stock');
    } catch (err) {}
  };

  const columns = [
    { field: 'product_name', headerName: 'Product Name', flex: 1, minWidth: 150 },
    { field: 'category', headerName: 'Category', flex: 0.6, minWidth: 90, sortable: false },
    { field: 'brand', headerName: 'Brand', flex: 0.6, minWidth: 90 },
    { field: 'model', headerName: 'Model', flex: 0.5, minWidth: 80 },
    { field: 'location', headerName: 'Location', flex: 0.6, minWidth: 90, sortable: false },
    { field: 'available_qty', headerName: 'Qty', flex: 0.4, minWidth: 60, align: 'right', headerAlign: 'right' },
    { field: 'stock_value', headerName: 'Value', flex: 0.5, minWidth: 80, align: 'right', headerAlign: 'right',
      renderCell: (p) => p.row?.stock_value ? `\u20B9${Number(p.row.stock_value).toLocaleString('en-IN')}` : '-' },
    { field: 'last_sale_date', headerName: 'Last Sale', flex: 0.5, minWidth: 90,
      renderCell: (p) => p.row?.last_sale_date ? moment(p.row.last_sale_date).format('DD MMM YY') : 'Never' },
    { field: 'days_since_last_sale', headerName: 'Days Idle', flex: 0.4, minWidth: 70, align: 'right', headerAlign: 'right',
      renderCell: (p) => p.row?.days_since_last_sale ?? p.row?.stock_age_days ?? '-' },
    { field: 'movement_status', headerName: 'Status', flex: 0.5, minWidth: 90,
      renderCell: (p) => {
        const s = p.row?.movement_status;
        const color = s === 'Never Sold' ? '#d32f2f' : s === '90+ days' ? '#E65100' : s === '61-90 days' ? '#FF8B3E' : '#7C4DFF';
        return <Chip label={s} size="small" sx={{ fontSize: 9, height: 20, bgcolor: `${color}15`, color, fontWeight: 600 }} />;
      }
    },
    { field: 'stock_age_days', headerName: 'Age', flex: 0.4, minWidth: 60,
      renderCell: (p) => {
        const d = p.row?.stock_age_days;
        if (!d) return '-';
        if (d < 31) return `${d}d`;
        if (d < 365) return `${Math.floor(d/30)}m ${d%30}d`;
        return `${Math.floor(d/365)}y ${Math.floor((d%365)/30)}m`;
      }
    },
  ];

  const isExportRights = UserRightsAuthorization(menuAccess[selectedRole], 'reports__inventory__dead_slow_moving', 'can_export');

  return (
    <>
      <Helmet><title>{titleURL} | Dead/Slow Moving Stock</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, minHeight: 48 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 1 }}>Dead / Slow Moving Stock</Typography>

          {/* Chips */}
          <Stack direction="row" spacing={0.5}>
            {[
              { days: 30, label: '30+ days' },
              { days: 60, label: '60+ days' },
              { days: 90, label: '90+ days' },
            ].map(c => (
              <Chip key={c.days} label={c.label} clickable size="small"
                color={selectedChip === c.days ? 'primary' : 'default'}
                variant={selectedChip === c.days ? 'filled' : 'outlined'}
                onClick={() => { setSelectedChip(c.days); setPage(0); }}
                sx={{ borderRadius: '6px', fontSize: 12, height: 28 }}
              />
            ))}
          </Stack>

          <Box sx={{ flex: 1 }} />

          {/* KPI cards */}
          <KpiCard label="Total Items" value={rowCount} color="#2E3A59" />
          <KpiCard label="Total Qty" value={Number(kpis.totalQty).toLocaleString('en-IN')} color="#E65100" />
          <KpiCard label="Locked Value" value={`\u20B9${Number(kpis.totalValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="#d32f2f" />
          <KpiCard label="Never Sold" value={Number(kpis.neverSoldQty).toLocaleString('en-IN')} color="#7C4DFF" />

          {/* Actions */}
          <CommonSearch searchVal={searchVal} cancelSearch={() => { setSearchVal(''); setPage(0); fetchData(selectedChip, 0, pageSize); }}
            requestSearch={(e) => setSearchVal(e.target.value)} />
          {isExportRights && (
            <Tooltip title="Export CSV"><IconButton onClick={handleExport}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          )}
        </Box>

        {/* DataGrid */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DataGrid
            rows={data}
            columns={columns}
            rowCount={rowCount}
            getRowId={(row) => `${row.item_id}_${row.location}`}
            paginationMode="server"
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(m) => { if (m.page !== page) setPage(m.page); if (m.pageSize !== pageSize) setPageSize(m.pageSize); }}
            pageSizeOptions={[20, 50, 100]}
            density="compact"
            disableRowSelectionOnClick
            loading={loading}
            sx={{
              border: 'none', height: '100%',
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 },
              '& .MuiDataGrid-cell': { fontSize: 12, fontWeight: 400 },
              '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' },
              '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' },
            }}
          />
        </Box>
      </Card>
    </>
  );
}
