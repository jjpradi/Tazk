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

const rupee = (v) => v != null && v !== '' && v !== 0 ? `\u20B9${Number(v).toLocaleString('en-IN')}` : '-';
const rupeeCell = (field) => ({ renderCell: (p) => rupee(p.row?.[field]) });
const gstPct = (p) => p.row?.gst_rate != null ? `${p.row.gst_rate}%` : '-';

const CHIPS = [
  { key: 'purchase', label: 'Purchase Wise' },
  { key: 'lot', label: 'Lot Wise' },
];

const statusChip = (p) => {
  const s = p.row?.payment_status;
  const paid = s === 'Paid';
  return <Chip label={s || '-'} size="small" sx={{ fontSize: 9, height: 20, bgcolor: paid ? '#E8F5E9' : '#FFF3E0', color: paid ? '#2E7D32' : '#E65100', fontWeight: 600 }} />;
};

const PURCHASE_COLUMNS = [
  { field: 'bill_number', headerName: 'Bill #', flex: 0.35, minWidth: 90 },
  { field: 'invoice_number', headerName: 'Invoice #', flex: 0.35, minWidth: 95 },
  { field: 'invoice_date', headerName: 'Invoice Date', flex: 0.3, minWidth: 85 },
  { field: 'supplier_name', headerName: 'Supplier', flex: 0.5, minWidth: 130 },
  { field: 'supplier_gstin', headerName: 'GSTIN', flex: 0.4, minWidth: 130 },
  { field: 'location_name', headerName: 'Location', flex: 0.3, minWidth: 85 },
  { field: 'taxable_amount', headerName: 'Taxable Amt', flex: 0.35, minWidth: 90, align: 'right', headerAlign: 'right', ...rupeeCell('taxable_amount') },
  { field: 'gst_type', headerName: 'GST Type', flex: 0.3, minWidth: 80 },
  { field: 'tax_amount', headerName: 'Tax Amt', flex: 0.3, minWidth: 80, align: 'right', headerAlign: 'right', ...rupeeCell('tax_amount') },
  { field: 'total', headerName: 'Total', flex: 0.35, minWidth: 90, align: 'right', headerAlign: 'right', ...rupeeCell('total') },
  { field: 'paid_amount', headerName: 'Paid', flex: 0.3, minWidth: 80, align: 'right', headerAlign: 'right', ...rupeeCell('paid_amount') },
  { field: 'due_amount', headerName: 'Due', flex: 0.3, minWidth: 75, align: 'right', headerAlign: 'right', ...rupeeCell('due_amount') },
  { field: 'payment_status', headerName: 'Payment', flex: 0.25, minWidth: 80, renderCell: statusChip },
  { field: 'bill_status', headerName: 'Status', flex: 0.3, minWidth: 100, renderCell: (p) => {
    const s = p.value;
    const color = s === 'Fully Returned' ? { bg: '#FFEBEE', c: '#C62828' } : s === 'Partially Returned' ? { bg: '#FFF3E0', c: '#E65100' } : { bg: '#E8F5E9', c: '#2E7D32' };
    return <Chip label={s || '-'} size="small" sx={{ fontSize: 9, height: 20, bgcolor: color.bg, color: color.c, fontWeight: 600 }} />;
  }},
  { field: 'due_days', headerName: 'Due Days', flex: 0.2, minWidth: 65, align: 'right', headerAlign: 'right' },
  { field: 'tds_rate', headerName: 'TDS %', flex: 0.2, minWidth: 55, align: 'right', headerAlign: 'right' },
  { field: 'tds_amount', headerName: 'TDS Amt', flex: 0.3, minWidth: 75, align: 'right', headerAlign: 'right', ...rupeeCell('tds_amount') },
  { field: 'tcs_rate', headerName: 'TCS %', flex: 0.2, minWidth: 55, align: 'right', headerAlign: 'right' },
  { field: 'tcs_amount', headerName: 'TCS Amt', flex: 0.3, minWidth: 75, align: 'right', headerAlign: 'right', ...rupeeCell('tcs_amount') },
  { field: 'rounded_off', headerName: 'Rounded', flex: 0.2, minWidth: 55, align: 'right', headerAlign: 'right' },
  { field: 'po_number', headerName: 'PO #', flex: 0.3, minWidth: 80 },
  { field: 'reference', headerName: 'Reference', flex: 0.3, minWidth: 80 },
  { field: 'comment', headerName: 'Comment', flex: 0.3, minWidth: 80 },
];

const LOT_COLUMNS = [
  { field: 'bill_number', headerName: 'Bill #', flex: 0.3, minWidth: 85 },
  { field: 'invoice_number', headerName: 'Invoice #', flex: 0.3, minWidth: 90 },
  { field: 'invoice_date', headerName: 'Date', flex: 0.25, minWidth: 80 },
  { field: 'supplier_name', headerName: 'Supplier', flex: 0.45, minWidth: 120 },
  { field: 'supplier_gstin', headerName: 'GSTIN', flex: 0.4, minWidth: 130 },
  { field: 'location_name', headerName: 'Location', flex: 0.3, minWidth: 80 },
  { field: 'product_name', headerName: 'Product', flex: 0.5, minWidth: 140 },
  { field: 'sku', headerName: 'SKU', flex: 0.3, minWidth: 75 },
  { field: 'hsn_code', headerName: 'HSN', flex: 0.25, minWidth: 70 },
  { field: 'category', headerName: 'Category', flex: 0.3, minWidth: 75 },
  { field: 'brand', headerName: 'Brand', flex: 0.3, minWidth: 75 },
  { field: 'lot_number', headerName: 'Lot #', flex: 0.3, minWidth: 80 },
  { field: 'qty', headerName: 'Qty', flex: 0.15, minWidth: 45, align: 'right', headerAlign: 'right' },
  { field: 'cost_price', headerName: 'Cost Price', flex: 0.3, minWidth: 80, align: 'right', headerAlign: 'right', ...rupeeCell('cost_price') },
  { field: 'discount', headerName: 'Discount', flex: 0.25, minWidth: 60, align: 'right', headerAlign: 'right' },
  { field: 'gst_rate', headerName: 'GST %', flex: 0.2, minWidth: 55, align: 'right', headerAlign: 'right', renderCell: gstPct },
  { field: 'gst_type', headerName: 'GST Type', flex: 0.25, minWidth: 75 },
  { field: 'tax_amount', headerName: 'Tax Amt', flex: 0.3, minWidth: 75, align: 'right', headerAlign: 'right', ...rupeeCell('tax_amount') },
  { field: 'item_total', headerName: 'Item Total', flex: 0.3, minWidth: 80, align: 'right', headerAlign: 'right', ...rupeeCell('item_total') },
];

export default function PurchaseReportNew() {
  const navigate = useNavigate();
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [rowCount, setRowCount] = useState(0);
  const [kpis, setKpis] = useState({});
  const [searchVal, setSearchVal] = useState('');
  const [viewMode, setViewMode] = useState('purchase');
  const [fromDate, setFromDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState([]);
  const filterCount = (locationFilter.length > 0 ? 1 : 0);

  const fetchData = async (p = 0, ps = 20, vm = viewMode) => {
    if (!headerLocationId) return;
    setLoading(true);
    try {
      const payload = { location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null', pageCount: p, numPerPage: ps, fromDate, toDate, viewMode: vm };
      const res = await ReportsService.getPurchaseReport2(payload);
      setData(res.data?.data || []); setRowCount(res.data?.numRows || 0); setKpis(res.data || {});
    } catch (err) { setData([]); setRowCount(0); }
    setLoading(false);
  };

  useEffect(() => { if (headerLocationId) fetchData(page, pageSize, viewMode); }, [page, pageSize, headerLocationId, fromDate, toDate, viewMode, locationFilter]);

  const handleChipChange = (key) => { setData([]); setPage(0); setViewMode(key); };
  const handleFilterApply = ({ from, to, locationIds }) => { if (from) setFromDate(from); if (to) setToDate(to); setLocationFilter(locationIds ? locationIds.map(id => ({ location_id: id })) : []); setPage(0); };
  const handleFilterClear = () => { setFromDate(moment().startOf('month').format('YYYY-MM-DD')); setToDate(moment().format('YYYY-MM-DD')); setLocationFilter([]); setPage(0); };

  const columns = viewMode === 'lot' ? LOT_COLUMNS : PURCHASE_COLUMNS;
  const getRowId = (row) => viewMode === 'lot' ? (row.row_id || `${row.bill_number}_${row.lot_number}`) : `${row.id}`;

  const handleExport = async () => {
    try { const r = await ReportsService.getPurchaseReport2({ location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null', pageCount: 0, numPerPage: 100000, fromDate, toDate, viewMode });
      ExportCsv(columns.map(c => ({ title: c.headerName, field: c.field })), r.data?.data || [], `Purchase_Report_${viewMode}`); } catch (e) {}
  };

  const filteredData = searchVal ? data.filter(row => Object.values(row).some(v => v != null && String(v).toLowerCase().includes(searchVal.toLowerCase()))) : data;
  return (
    <>
      <Helmet><title>{titleURL} | Purchase Report</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, minHeight: 42, flexWrap: 'nowrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5, whiteSpace: 'nowrap' }}>Purchase Report</Typography>
          {CHIPS.map((c) => (
            <Chip key={c.key} label={c.label} size="small" variant={viewMode === c.key ? 'filled' : 'outlined'} color={viewMode === c.key ? 'primary' : 'default'} onClick={() => handleChipChange(c.key)} sx={{ fontSize: 11, height: 24 }} />
          ))}
          <Box sx={{ flex: 1 }} />
          <KpiCard label="Purchases" value={kpis.totalCount || 0} color="#2E3A59" />
          <KpiCard label="Total Value" value={`\u20B9${Number(kpis.totalValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="#1565C0" />
          <KpiCard label="Tax" value={`\u20B9${Number(kpis.totalTax || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="#E65100" />
          <KpiCard label="Paid" value={`\u20B9${Number(kpis.totalPaid || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="#2E7D32" />
          <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => { setSearchVal(e.target.value); setPage(0); }} />
          <FilterCreditNotes open={filterOpen} handleClose={setFilterOpen} from={fromDate} to={toDate} locationFilter={locationFilter} onApply={handleFilterApply} onClear={handleFilterClear} count={filterCount} />
          <Tooltip title="Export CSV"><IconButton onClick={handleExport}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DataGrid rows={filteredData} columns={columns} rowCount={rowCount} getRowId={getRowId}
            paginationMode="server" paginationModel={{ page, pageSize }}
            onPaginationModelChange={(m) => { if (m.page !== page) setPage(m.page); if (m.pageSize !== pageSize) setPageSize(m.pageSize); }}
            pageSizeOptions={[50, 100, 200, 500]} density="compact" disableRowSelectionOnClick slotProps={{ pagination: { showFirstButton: true, showLastButton: true } }} loading={loading}
            sx={{ border: 'none', height: '100%', '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 }, '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' }, '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' } }} />
        </Box>
      </Card>
    </>
  );
}
