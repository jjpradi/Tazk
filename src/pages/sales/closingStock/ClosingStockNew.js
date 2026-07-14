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
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';

function KpiCard({ label, value, color }) {
  return (
    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 70 }}>
      <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}

export default function ClosingStockNew() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const storage = getsessionStorage();
  const selectedRole = storage?.role_name;
  const { headerLocationId ,setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext);
   const {
         rbacReducer: { menuAccess } 
      } = useSelector((state) => state);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [rowCount, setRowCount] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const [kpis, setKpis] = useState({});
  const [selectedChip, setSelectedChip] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const getAsOnDate = (chip) => {
    switch (chip) {
      case 'today': return moment().format('YYYY-MM-DD');
      case 'month1': return moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
      case 'month2': return moment().subtract(2, 'month').endOf('month').format('YYYY-MM-DD');
      case 'month3': return moment().subtract(3, 'month').endOf('month').format('YYYY-MM-DD');
      case 'fyStart': {
        const now = moment();
        return now.month() >= 3 ? `${now.year()}-03-31` : `${now.year() - 1}-03-31`;
      }
      case 'custom': return customDate || moment().format('YYYY-MM-DD');
      default: return moment().format('YYYY-MM-DD');
    }
  };

  const getChipLabel = (chip) => {
    switch (chip) {
      case 'today': return 'As on Today';
      case 'month1': return moment().subtract(1, 'month').format('MMM YYYY');
      case 'month2': return moment().subtract(2, 'month').format('MMM YYYY');
      case 'month3': return moment().subtract(3, 'month').format('MMM YYYY');
      case 'fyStart': return 'FY Start';
      case 'custom': return 'Custom Date';
      default: return chip;
    }
  };

  const fetchData = async (pageNum = 0, pageSz = 20) => {
    if (!headerLocationId) return;
    setLoading(true);
    try {
      const res = await ReportsService.getClosingStock({
        location_id: 'null',
        pageCount: pageNum,
        numPerPage: pageSz,
        asOnDate: getAsOnDate(selectedChip),
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

  const closingStockExport =UserRightsAuthorization(menuAccess[selectedRole], 'reports__inventory__closing_stock', 'can_export') 
  useEffect(() => { if (headerLocationId) fetchData(page, pageSize); }, [page, pageSize, headerLocationId, selectedChip, customDate, brandFilter, categoryFilter]);

  const handleExport = async () => {
    try {
      const res = await ReportsService.getClosingStock({
        location_id: 'null', pageCount: 0, numPerPage: 100000,
        asOnDate: getAsOnDate(selectedChip), brand: brandFilter, category: categoryFilter,
      });
      const exportData = (res.data?.data || []).map(row => ({
        ...row,
        lot_number: row.lot_number ? `="${row.lot_number}"` : '',
        hsn_code: row.hsn_code ? `="${row.hsn_code}"` : '',
      }));
      ExportCsv(columns.map(c => ({ title: c.headerName, field: c.field })), exportData, `Closing_Stock_${getAsOnDate(selectedChip)}`);
    } catch (e) {}
  };

  const chips = [
    { key: 'today', label: 'As on Today' },
    { key: 'month1', label: moment().subtract(1, 'month').format('MMM YY') },
    { key: 'month2', label: moment().subtract(2, 'month').format('MMM YY') },
    { key: 'month3', label: moment().subtract(3, 'month').format('MMM YY') },
    { key: 'fyStart', label: 'FY Start' },
    { key: 'custom', label: 'Custom' },
  ];

  const columns = [
    { field: 'product_name', headerName: 'Product Name', flex: 1, minWidth: 150 },
    { field: 'category', headerName: 'Category', flex: 0.5, minWidth: 80, sortable: false },
    { field: 'brand', headerName: 'Brand', flex: 0.5, minWidth: 80 },
    { field: 'model', headerName: 'Model', flex: 0.5, minWidth: 80 },
    { field: 'sku', headerName: 'SKU', flex: 0.4, minWidth: 70 },
    { field: 'location', headerName: 'Location', flex: 0.5, minWidth: 80, sortable: false },
    { field: 'hsn_code', headerName: 'HSN', flex: 0.4, minWidth: 70 },
    { field: 'lot_number', headerName: 'Lot #', flex: 0.5, minWidth: 90 },
    { field: 'closing_qty', headerName: 'Qty', flex: 0.3, minWidth: 50, align: 'right', headerAlign: 'right' },
    { field: 'cost_price', headerName: 'Cost', flex: 0.4, minWidth: 70, align: 'right', headerAlign: 'right',
      renderCell: (p) => p.row?.cost_price ? `\u20B9${Number(p.row.cost_price).toLocaleString('en-IN')}` : '-' },
    { field: 'tax_rate', headerName: 'Tax %', flex: 0.3, minWidth: 55, align: 'right', headerAlign: 'right',
      renderCell: (p) => p.row?.tax_rate != null ? `${parseFloat(p.row.tax_rate)}%` : '-' },
    { field: 'price_with_tax', headerName: 'Price', flex: 0.4, minWidth: 70, align: 'right', headerAlign: 'right',
      renderCell: (p) => p.row?.price_with_tax ? `\u20B9${Number(p.row.price_with_tax).toLocaleString('en-IN')}` : '-' },
    { field: 'closing_value', headerName: 'Value', flex: 0.5, minWidth: 90, align: 'right', headerAlign: 'right',
      renderCell: (p) => p.row?.closing_value ? `\u20B9${Number(p.row.closing_value).toLocaleString('en-IN')}` : '-' },
    { field: 'selling_price', headerName: 'Unit Price', flex: 0.4, minWidth: 75, align: 'right', headerAlign: 'right',
      renderCell: (p) => p.row?.selling_price ? `\u20B9${Number(p.row.selling_price).toLocaleString('en-IN')}` : '-' },
  ];

  const hasActiveFilter = brandFilter || categoryFilter;

  return (
    <>
      <Helmet><title>{titleURL} | Closing Stock</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, minHeight: 48, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5 }}>Closing Stock</Typography>

          <Stack direction="row" spacing={0.5}>
            {chips.map(c => (
              <Chip key={c.key} label={c.label} clickable size="small"
                color={selectedChip === c.key ? 'primary' : 'default'}
                variant={selectedChip === c.key ? 'filled' : 'outlined'}
                onClick={() => { setSelectedChip(c.key); setPage(0); }}
                sx={{ borderRadius: '6px', fontSize: 11, height: 26 }} />
            ))}
          </Stack>

          {selectedChip === 'custom' && (
            <TextField type="date" size="small" value={customDate}
              onChange={(e) => { setCustomDate(e.target.value); setPage(0); }}
              sx={{ width: 140, '& .MuiInputBase-input': { fontSize: 11, py: 0.5 } }} />
          )}

          <Box sx={{ flex: 1 }} />

          <KpiCard label="Items" value={rowCount} color="#2E3A59" />
          <KpiCard label="Total Qty" value={Number(kpis.totalQty || 0).toLocaleString('en-IN')} color="#11C15B" />
          <KpiCard label="Stock Value" value={`\u20B9${Number(kpis.totalValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="#0A8FDC" />
          <KpiCard label="Categories" value={kpis.totalCategories || 0} color="#7C4DFF" />

          <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => setSearchVal(e.target.value)} />

          <Tooltip title="Filter">
            <IconButton onClick={() => setFilterOpen(true)} sx={{ color: hasActiveFilter ? '#0A8FDC' : undefined }}>
              <FilterAltIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>
          {closingStockExport &&
            <Tooltip title="Export CSV"><IconButton onClick={handleExport}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          }
          <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        </Box>

        {(hasActiveFilter || selectedChip !== 'today') && (
          <Box sx={{ display: 'flex', gap: 0.5, pb: 1 }}>
            <Chip label={`As on: ${getAsOnDate(selectedChip)}`} size="small" variant="outlined" sx={{ fontSize: 11, color: '#0A8FDC' }} />
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
