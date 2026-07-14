import React, { useState, useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import {
  Autocomplete, Box, Card, Chip, Drawer, Grid, IconButton, Stack, TextField, Tooltip, Typography, Button,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CommonSearch from 'utils/commonSearch';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import ReportsService from '../../../services/reports_services';
import { titleURL } from 'http-common';
import { ExportCsv } from '@material-table/exporters';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { useNavigate } from 'react-router-dom'
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';


function KpiCard({ label, value, color }) {
  return (
    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 70 }}>
      <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}

export default function StockAgeingNew() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
   const { headerLocationId ,setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext);
   const {
             rbacReducer: { menuAccess } 
          } = useSelector((state) => state);
  const storage = getsessionStorage();
  const selectedRole = storage?.role_name;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [rowCount, setRowCount] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const [selectedChip, setSelectedChip] = useState(0);
  const [kpis, setKpis] = useState({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchData = async (minAge = 0, pageNum = 0, pageSz = 20) => {
    if (!headerLocationId) return;
    setLoading(true);
    try {
      const res = await ReportsService.getStockAgeing({
        location_id: 'null',
        pageCount: pageNum,
        numPerPage: pageSz,
        brand: brandFilter,
        category: categoryFilter,
        minAge,
      });
      setData(res.data?.data || []);
      setRowCount(res.data?.numRows || 0);
      setKpis(res.data || {});
    } catch (err) { console.error(err); setData([]); setRowCount(0); }
    setLoading(false);
  };

        useEffect(() => {
          if (!selectedRole) return;
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
        }, [selectedRole, dispatch]);

  useEffect(() => { if (headerLocationId) fetchData(selectedChip, page, pageSize); }, [page, pageSize, headerLocationId, selectedChip, brandFilter, categoryFilter]);

  const handleExport = async () => {
    try {
      const res = await ReportsService.getStockAgeing({
        location_id: 'null', pageCount: 0, numPerPage: 100000,
        brand: brandFilter, category: categoryFilter, minAge: selectedChip,
      });
      const exportData = res.data?.data || [];
      ExportCsv(columns.map(c => ({ title: c.headerName, field: c.field })), exportData, 'Stock_Ageing_Report');
    } catch (e) {}
  };

  const chips = [
    { key: 0, label: 'All' },
    { key: 30, label: '> 30 days' },
    { key: 60, label: '> 60 days' },
    { key: 90, label: '> 90 days' },
    { key: 180, label: 'Dead Stock' },
  ];

  const columns = [
    { field: 'product_name', headerName: 'Product Name', flex: 1, minWidth: 150 },
    { field: 'category', headerName: 'Category', flex: 0.5, minWidth: 80, sortable: false },
    { field: 'brand', headerName: 'Brand', flex: 0.5, minWidth: 80 },
    { field: 'model', headerName: 'Model', flex: 0.5, minWidth: 80 },
    { field: 'location', headerName: 'Location', flex: 0.5, minWidth: 80, sortable: false },
    { field: 'lot_number', headerName: 'Lot #', flex: 0.5, minWidth: 90 },
    { field: 'available_qty', headerName: 'Qty', flex: 0.3, minWidth: 50, align: 'right', headerAlign: 'right' },
    { field: 'cost_price', headerName: 'Cost', flex: 0.4, minWidth: 70, align: 'right', headerAlign: 'right',
      renderCell: (p) => p.row?.cost_price ? `\u20B9${Number(p.row.cost_price).toLocaleString('en-IN')}` : '-' },
    { field: 'stock_value', headerName: 'Value', flex: 0.4, minWidth: 80, align: 'right', headerAlign: 'right',
      renderCell: (p) => p.row?.stock_value ? `\u20B9${Number(p.row.stock_value).toLocaleString('en-IN')}` : '-' },
    { field: 'stock_date', headerName: 'Stock Date', flex: 0.4, minWidth: 85 },
    { field: 'age_days', headerName: 'Days', flex: 0.3, minWidth: 50, align: 'right', headerAlign: 'right' },
    { field: 'age_display', headerName: 'Age', flex: 0.4, minWidth: 65,
      renderCell: (p) => {
        const d = p.row?.age_days;
        if (!d && d !== 0) return '-';
        if (d < 31) return `${d}d`;
        if (d < 365) return `${Math.floor(d / 30)}m ${d % 30}d`;
        return `${Math.floor(d / 365)}y ${Math.floor((d % 365) / 30)}m`;
      }
    },
    { field: 'status', headerName: 'Status', flex: 0.4, minWidth: 80,
      renderCell: (p) => {
        const d = p.row?.age_days || 0;
        let label, color;
        if (d > 180) { label = 'Dead'; color = '#d32f2f'; }
        else if (d > 90) { label = '90+'; color = '#E65100'; }
        else if (d > 60) { label = '61-90'; color = '#FF8B3E'; }
        else if (d > 30) { label = '31-60'; color = '#7C4DFF'; }
        else { label = 'Fresh'; color = '#11C15B'; }
        return <Chip label={label} size="small" sx={{ fontSize: 9, height: 20, bgcolor: `${color}15`, color, fontWeight: 600 }} />;
      }
    },
  ];

  const isExportRights = UserRightsAuthorization(menuAccess[selectedRole], 'reports__inventory__stock_ageing', 'can_export');
  const hasActiveFilter = brandFilter || categoryFilter;

  return (
    <>
      <Helmet><title>{titleURL} | Stock Ageing Report</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, minHeight: 48, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5 }}>Stock Ageing</Typography>

          <Stack direction="row" spacing={0.5}>
            {chips.map(c => (
              <Chip key={c.key} label={c.label} clickable size="small"
                color={selectedChip === c.key ? 'primary' : 'default'}
                variant={selectedChip === c.key ? 'filled' : 'outlined'}
                onClick={() => { setSelectedChip(c.key); setPage(0); }}
                sx={{ borderRadius: '6px', fontSize: 11, height: 26 }} />
            ))}
          </Stack>

          <Box sx={{ flex: 1 }} />

          <KpiCard label="Items" value={rowCount} color="#2E3A59" />
          <KpiCard label="Total Qty" value={Number(kpis.totalQty || 0).toLocaleString('en-IN')} color="#E65100" />
          <KpiCard label="Value" value={`\u20B9${Number(kpis.totalValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="#d32f2f" />
          <KpiCard label="Dead" value={Number(kpis.deadQty || 0).toLocaleString('en-IN')} color="#7C4DFF" />

          <CommonSearch searchVal={searchVal}
            cancelSearch={() => { setSearchVal(''); }}
            requestSearch={(e) => setSearchVal(e.target.value)} />

          <Tooltip title="Filter">
            <IconButton onClick={() => setFilterOpen(true)} sx={{ color: hasActiveFilter ? '#0A8FDC' : undefined }}>
              <FilterAltIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>

          {isExportRights && (
            <Tooltip title="Export CSV"><IconButton onClick={handleExport}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          )}
          <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        </Box>

        {hasActiveFilter && (
          <Box sx={{ display: 'flex', gap: 0.5, pb: 1 }}>
            {brandFilter && <Chip label={`Brand: ${brandFilter}`} size="small" onDelete={() => setBrandFilter('')} sx={{ fontSize: 11 }} />}
            {categoryFilter && <Chip label={`Category: ${categoryFilter}`} size="small" onDelete={() => setCategoryFilter('')} sx={{ fontSize: 11 }} />}
          </Box>
        )}

        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DataGrid rows={data} columns={columns} rowCount={rowCount}
            getRowId={(row) => `${row.lot_id}`}
            paginationMode="server" paginationModel={{ page, pageSize }}
            onPaginationModelChange={(m) => { if (m.page !== page) setPage(m.page); if (m.pageSize !== pageSize) setPageSize(m.pageSize); }}
            pageSizeOptions={[20, 50, 100]} density="compact" disableRowSelectionOnClick loading={loading}
            sx={{ border: 'none', height: '100%',
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 },
              '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' },
              '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' } }} />
        </Box>
      </Card>

      {/* Filter Drawer */}
      <Drawer anchor="right" open={filterOpen} onClose={() => setFilterOpen(false)}
        PaperProps={{ sx: { width: 320, p: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600 }}>Filters</Typography>
          <IconButton onClick={() => setFilterOpen(false)} size="small"><CloseIcon /></IconButton>
        </Box>
        <TextField label="Brand" fullWidth size="small" value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)} sx={{ mb: 2 }} />
        <TextField label="Category" fullWidth size="small" value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)} sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" fullWidth onClick={() => { setBrandFilter(''); setCategoryFilter(''); setPage(0); setFilterOpen(false); }}>Clear</Button>
          <Button variant="contained" fullWidth onClick={() => { setPage(0); setFilterOpen(false); }}>Apply</Button>
        </Box>
      </Drawer>
    </>
  );
}
