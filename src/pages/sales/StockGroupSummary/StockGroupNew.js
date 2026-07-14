import React, { useState, useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box, Button, Card, Chip, Drawer, IconButton, Stack, TextField, Tooltip, Typography,
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
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';

function KpiCard({ label, value, color }) {
  return (
    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 70 }}>
      <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}

export default function StockGroupNew() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { headerLocationId ,setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext);

  const storage = getsessionStorage();
  const selectedRole = storage?.role_name;
  const {
         rbacReducer: { menuAccess } 
      } = useSelector((state) => state);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [rowCount, setRowCount] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const [kpis, setKpis] = useState({});
  const [selectedChip, setSelectedChip] = useState('lastFy');
  const [filterOpen, setFilterOpen] = useState(false);
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Date range presets
  const getDateRange = (chip) => {
    const now = moment();
    const curFyYear = now.month() >= 3 ? now.year() : now.year() - 1;
    const lastFyYear = curFyYear - 1;
    switch (chip) {
      case 'fy': return { from: `${curFyYear}-04-01`, to: now.format('YYYY-MM-DD') };
      case 'lastFy': return { from: `${lastFyYear}-04-01`, to: `${lastFyYear + 1}-03-31` };
      case 'month': return { from: now.clone().startOf('month').format('YYYY-MM-DD'), to: now.format('YYYY-MM-DD') };
      case 'lastMonth': return { from: moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'), to: moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD') };
      case 'q1': return { from: `${curFyYear}-04-01`, to: `${curFyYear}-06-30` };
      case 'q2': return { from: `${curFyYear}-07-01`, to: `${curFyYear}-09-30` };
      case 'q3': return { from: `${curFyYear}-10-01`, to: `${curFyYear}-12-31` };
      case 'q4': return { from: `${curFyYear + 1}-01-01`, to: `${curFyYear + 1}-03-31` };
      default: return { from: '2020-01-01', to: now.format('YYYY-MM-DD') };
    }
  };

  const fetchData = async (pageNum = 0, pageSz = 50) => {
    if (!headerLocationId) return;
    setLoading(true);
    const { from, to } = getDateRange(selectedChip);
    try {
      const res = await ReportsService.getStockGroup({
        location_id: 'null',
        pageCount: pageNum,
        numPerPage: pageSz,
        fromDate: from,
        toDate: to,
        brand: brandFilter,
        category: categoryFilter,
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

  const stockGroupExport =UserRightsAuthorization(menuAccess[selectedRole], 'reports__inventory__stock_group_summary', 'can_export') 

  useEffect(() => { if (headerLocationId) fetchData(page, pageSize); }, [page, pageSize, headerLocationId, selectedChip, brandFilter, categoryFilter]);

  const handleExport = async () => {
    const { from, to } = getDateRange(selectedChip);
    try {
      const res = await ReportsService.getStockGroup({
        location_id: 'null', pageCount: 0, numPerPage: 10000,
        fromDate: from, toDate: to, brand: brandFilter, category: categoryFilter,
      });
      ExportCsv(columns.map(c => ({ title: c.headerName, field: c.field })), res.data?.data || [], 'Stock_Group_Summary');
    } catch (e) {}
  };

  const chips = [
    { key: 'lastFy', label: 'Last FY' },
    { key: 'fy', label: 'Current FY' },
    { key: 'month', label: 'This Month' },
    { key: 'lastMonth', label: 'Last Month' },
    { key: 'q1', label: 'Q1' },
    { key: 'q2', label: 'Q2' },
    { key: 'q3', label: 'Q3' },
    { key: 'q4', label: 'Q4' },
  ];

  const columns = [
    { field: 'category', headerName: 'Category', flex: 0.8, minWidth: 120 },
    { field: 'brands', headerName: 'Brands', flex: 1, minWidth: 150 },
    { field: 'inward_qty', headerName: 'Inward Qty', flex: 0.4, minWidth: 80, align: 'right', headerAlign: 'right',
      renderCell: (p) => <Typography sx={{ fontSize: 12, color: '#11C15B', fontWeight: 600 }}>{Number(p.row?.inward_qty || 0).toLocaleString('en-IN')}</Typography> },
    { field: 'inward_value', headerName: 'Inward Value', flex: 0.5, minWidth: 100, align: 'right', headerAlign: 'right',
      renderCell: (p) => p.row?.inward_value ? `\u20B9${Number(p.row.inward_value).toLocaleString('en-IN')}` : '-' },
    { field: 'outward_qty', headerName: 'Outward Qty', flex: 0.4, minWidth: 80, align: 'right', headerAlign: 'right',
      renderCell: (p) => <Typography sx={{ fontSize: 12, color: '#d32f2f', fontWeight: 600 }}>{Number(p.row?.outward_qty || 0).toLocaleString('en-IN')}</Typography> },
    { field: 'outward_value', headerName: 'Outward Value', flex: 0.5, minWidth: 100, align: 'right', headerAlign: 'right',
      renderCell: (p) => p.row?.outward_value ? `\u20B9${Number(p.row.outward_value).toLocaleString('en-IN')}` : '-' },
    { field: 'net_qty', headerName: 'Net Qty', flex: 0.4, minWidth: 70, align: 'right', headerAlign: 'right',
      renderCell: (p) => {
        const n = p.row?.net_qty || 0;
        return <Typography sx={{ fontSize: 12, fontWeight: 600, color: n >= 0 ? '#11C15B' : '#d32f2f' }}>{Number(n).toLocaleString('en-IN')}</Typography>;
      }
    },
    { field: 'transactions', headerName: 'Txns', flex: 0.3, minWidth: 60, align: 'right', headerAlign: 'right' },
  ];

  const hasActiveFilter = brandFilter || categoryFilter;

  return (
    <>
      <Helmet><title>{titleURL} | Stock Group Summary</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, minHeight: 48, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5 }}>Stock Group Summary</Typography>

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

          <KpiCard label="Groups" value={rowCount} color="#2E3A59" />
          <KpiCard label="Inward" value={Number(kpis.totalInward || 0).toLocaleString('en-IN')} color="#11C15B" />
          <KpiCard label="Outward" value={Number(kpis.totalOutward || 0).toLocaleString('en-IN')} color="#d32f2f" />
          <KpiCard label="In Value" value={`\u20B9${Number(kpis.totalInwardValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="#0A8FDC" />

          <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => setSearchVal(e.target.value)} />

          <Tooltip title="Filter">
            <IconButton onClick={() => setFilterOpen(true)} sx={{ color: hasActiveFilter ? '#0A8FDC' : undefined }}>
              <FilterAltIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>
          {

            stockGroupExport && 
            <Tooltip title="Export CSV"><IconButton onClick={handleExport}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          }
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
            getRowId={(row) => `${row.category}`}
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
