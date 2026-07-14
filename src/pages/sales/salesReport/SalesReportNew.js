import React, { useState, useEffect, useContext } from 'react';
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
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import FilterCreditNotes from '../returnCreditNotesReport/FilterCreditNotes';

function KpiCard({ label, value, color }) {
  return (
    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 70 }}>
      <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}

const r = (v) => v != null && v !== '' && Number(v) !== 0 ? `\u20B9${Number(v).toLocaleString('en-IN')}` : '-';
const rc = (f) => ({ renderCell: (p) => r(p.row?.[f]) });

const STATUS_COLORS = { 'Invoiced': '#2E7D32', 'Delivered': '#2E7D32', 'Paid': '#2E7D32', 'On Hold': '#E65100', 'In Transit': '#1565C0', 'Partial': '#E65100', 'Due': '#C62828', 'Pending': '#C62828', 'Cancelled': '#777', 'Returned': '#E65100', 'Fully Returned': '#C62828', 'DC': '#1565C0', 'Ready': '#2E7D32' };
const statusCell = (f) => ({
  renderCell: (p) => { const s = p.row?.[f]; if (!s) return '-'; const c = STATUS_COLORS[s] || '#555';
    return <Chip label={s} size="small" sx={{ fontSize: 9, height: 20, bgcolor: c + '15', color: c, fontWeight: 600 }} />; }
});

const CHIPS = [
  { key: 'sale', label: 'Sale Wise' },
  { key: 'lot', label: 'Lot Wise' },
];

// Sale-wise columns
const SALE_COLUMNS = [
  { field: 'invoice_number', headerName: 'Invoice #', flex: 0.4, minWidth: 100 },
  { field: 'sale_date', headerName: 'Date', flex: 0.25, minWidth: 80 },
  { field: 'customer_name', headerName: 'Customer', flex: 0.5, minWidth: 130 },
  { field: 'location_name', headerName: 'Location', flex: 0.3, minWidth: 80 },
  { field: 'qty', headerName: 'Qty', flex: 0.15, minWidth: 45, align: 'right', headerAlign: 'right' },
  { field: 'taxable', headerName: 'Taxable', flex: 0.3, minWidth: 80, align: 'right', headerAlign: 'right', ...rc('taxable') },
  { field: 'discount', headerName: 'Discount', flex: 0.25, minWidth: 65, align: 'right', headerAlign: 'right', ...rc('discount') },
  { field: 'tax', headerName: 'Tax', flex: 0.25, minWidth: 65, align: 'right', headerAlign: 'right', ...rc('tax') },
  { field: 'total', headerName: 'Total', flex: 0.3, minWidth: 85, align: 'right', headerAlign: 'right', ...rc('total') },
  { field: 'received_amount', headerName: 'Received', flex: 0.3, minWidth: 75, align: 'right', headerAlign: 'right', ...rc('received_amount') },
  { field: 'due_amount', headerName: 'Due', flex: 0.25, minWidth: 65, align: 'right', headerAlign: 'right', ...rc('due_amount') },
  { field: 'status', headerName: 'Status', flex: 0.25, minWidth: 75, ...statusCell('status') },
  { field: 'delivery', headerName: 'Delivery', flex: 0.25, minWidth: 75, ...statusCell('delivery') },
  { field: 'payment', headerName: 'Payment', flex: 0.25, minWidth: 70, ...statusCell('payment') },
  { field: 'payment_mode', headerName: 'Mode', flex: 0.35, minWidth: 90 },
  { field: 'reference', headerName: 'Reference', flex: 0.3, minWidth: 75 },
];

// Lot-wise columns
const LOT_COLUMNS = [
  { field: 'invoice_number', headerName: 'Invoice #', flex: 0.35, minWidth: 95 },
  { field: 'sale_date', headerName: 'Date', flex: 0.25, minWidth: 75 },
  { field: 'customer_name', headerName: 'Customer', flex: 0.45, minWidth: 115 },
  { field: 'location_name', headerName: 'Location', flex: 0.25, minWidth: 70 },
  { field: 'product_name', headerName: 'Product', flex: 0.5, minWidth: 130 },
  { field: 'category', headerName: 'Category', flex: 0.25, minWidth: 70 },
  { field: 'brand', headerName: 'Brand', flex: 0.25, minWidth: 65 },
  { field: 'hsn_code', headerName: 'HSN', flex: 0.25, minWidth: 65 },
  { field: 'lot_number', headerName: 'Lot #', flex: 0.3, minWidth: 135 },
  { field: 'qty', headerName: 'Qty', flex: 0.12, minWidth: 40, align: 'right', headerAlign: 'right' },
  { field: 'cost_price', headerName: 'Cost', flex: 0.25, minWidth: 65, align: 'right', headerAlign: 'right', ...rc('cost_price') },
  { field: 'sale_price', headerName: 'Price', flex: 0.25, minWidth: 65, align: 'right', headerAlign: 'right', ...rc('sale_price') },
  { field: 'margin', headerName: 'Margin', flex: 0.25, minWidth: 65, align: 'right', headerAlign: 'right',
    renderCell: (p) => { const v = p.row?.margin; if (v == null) return '-'; const c = Number(v) >= 0 ? '#2E7D32' : '#C62828'; return <Typography sx={{ fontSize: 12, color: c }}>{r(v)}</Typography>; }
  },
  { field: 'discount', headerName: 'Disc', flex: 0.2, minWidth: 50, align: 'right', headerAlign: 'right' },
  { field: 'gst_pct', headerName: 'GST%', flex: 0.15, minWidth: 45, align: 'right', headerAlign: 'right',
    renderCell: (p) => p.row?.gst_pct != null ? `${p.row.gst_pct}%` : '-'
  },
  { field: 'tax_amount', headerName: 'Tax', flex: 0.25, minWidth: 60, align: 'right', headerAlign: 'right', ...rc('tax_amount') },
  { field: 'line_total', headerName: 'Total', flex: 0.3, minWidth: 75, align: 'right', headerAlign: 'right', ...rc('line_total') },
  { field: 'status', headerName: 'Status', flex: 0.22, minWidth: 70, ...statusCell('status') },
  { field: 'delivery', headerName: 'Delivery', flex: 0.22, minWidth: 70, ...statusCell('delivery') },
  { field: 'payment', headerName: 'Payment', flex: 0.22, minWidth: 65, ...statusCell('payment') },
];

export default function SalesReportNew() {
  const navigate = useNavigate();
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [data, setData] = useState([]); const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); const [pageSize, setPageSize] = useState(50);
  const [rowCount, setRowCount] = useState(0); const [kpis, setKpis] = useState({});
  const [searchVal, setSearchVal] = useState('');
  const [viewMode, setViewMode] = useState('sale');
  const [fromDate, setFromDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState([]);

  const getLocationPayload = () => {
    if (locationFilter.length) {
      return locationFilter.map((l) => l.location_id);
    }
    return headerLocationId ?? 'null';
  };

  const fetchData = async (p = 0, ps = 20, vm = viewMode) => {
    if (!headerLocationId) return; setLoading(true);
    try { const res = await ReportsService.getSalesReport2({ location_id: getLocationPayload(), pageCount: p, numPerPage: ps, fromDate, toDate, viewMode: vm });
      setData(res.data?.data || []); setRowCount(res.data?.numRows || 0); setKpis(res.data || {}); } catch (err) { setData([]); setRowCount(0); } setLoading(false);
  };

  useEffect(() => { if (headerLocationId) fetchData(page, pageSize, viewMode); }, [page, pageSize, headerLocationId, fromDate, toDate, viewMode, locationFilter]);
  const handleChipChange = (key) => { setData([]); setPage(0); setViewMode(key); };
  const handleFilterApply = ({ from, to, locationIds }) => { if (from) setFromDate(from); if (to) setToDate(to); setLocationFilter(locationIds ? locationIds.map(id => ({ location_id: id })) : []); setPage(0); };
  const handleFilterClear = () => { setFromDate(moment().startOf('month').format('YYYY-MM-DD')); setToDate(moment().format('YYYY-MM-DD')); setLocationFilter([]); setPage(0); };

  const columns = viewMode === 'lot' ? LOT_COLUMNS : SALE_COLUMNS;
  const getRowId = (row) => viewMode === 'lot' ? (row.row_id || `${row.invoice_number}_${row.product_name}`) : `${row.id}`;
  const fmt = (v) => `\u20B9${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const filteredData = searchVal ? data.filter(row => Object.values(row).some(v => v != null && String(v).toLowerCase().includes(searchVal.toLowerCase()))) : data;
  return (
    <><Helmet><title>{titleURL} | Sales Report</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, minHeight: 42, flexWrap: 'nowrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5, whiteSpace: 'nowrap' }}>Sales Report</Typography>
          {CHIPS.map((c) => (
            <Chip key={c.key} label={c.label} size="small" variant={viewMode === c.key ? 'filled' : 'outlined'} color={viewMode === c.key ? 'primary' : 'default'} onClick={() => handleChipChange(c.key)} sx={{ fontSize: 10, height: 22 }} />
          ))}
          <Box sx={{ flex: 1 }} />
          <KpiCard label="Invoices" value={kpis.totalInvoices || 0} color="#2E3A59" />
          <KpiCard label="Revenue" value={fmt(kpis.totalValue)} color="#2E7D32" />
          <KpiCard label="Tax" value={fmt(kpis.totalTax)} color="#E65100" />
          <KpiCard label="Paid" value={kpis.paidCount || 0} color="#2E7D32" />
          <KpiCard label="Due" value={kpis.dueCount || 0} color="#C62828" />
          <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => { setSearchVal(e.target.value); setPage(0); }} />
          <FilterCreditNotes open={filterOpen} handleClose={setFilterOpen} from={fromDate} to={toDate} locationFilter={locationFilter} onApply={handleFilterApply} onClear={handleFilterClear} count={locationFilter.length > 0 ? 1 : 0} />
          <Tooltip title="Export CSV"><IconButton onClick={async () => { try { const res = await ReportsService.getSalesReport2({ location_id: getLocationPayload(), pageCount: 0, numPerPage: 100000, fromDate, toDate, viewMode }); ExportCsv(columns.map(c => ({ title: c.headerName, field: c.field })), res.data?.data || [], `Sales_Report_${viewMode}`); } catch(e) {} }}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DataGrid rows={filteredData} columns={columns} rowCount={rowCount} getRowId={getRowId}
            paginationMode="server" paginationModel={{ page, pageSize }} onPaginationModelChange={(m) => { if (m.page !== page) setPage(m.page); if (m.pageSize !== pageSize) setPageSize(m.pageSize); }}
            pageSizeOptions={[50, 100, 200, 500]} density="compact" disableRowSelectionOnClick slotProps={{ pagination: { showFirstButton: true, showLastButton: true } }} loading={loading}
            sx={{ border: 'none', height: '100%', '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 }, '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' }, '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' } }} />
        </Box>
      </Card></>
  );
}
