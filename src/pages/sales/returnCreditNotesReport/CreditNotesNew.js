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
import FilterCreditNotes from './FilterCreditNotes';

function KpiCard({ label, value, color }) {
  return (
    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 70 }}>
      <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}

const rupee = (v) => v != null && v !== '' ? `\u20B9${Number(v).toLocaleString('en-IN')}` : '-';
const rupeeCell = (field) => ({ renderCell: (p) => rupee(p.row?.[field]) });

const CHIPS = [
  { key: 'return', label: 'Sales Return' },
  { key: 'manual', label: 'Manual' },
];

const statusChip = (p) => {
  const s = p.row?.adjustment_status;
  const adj = s === 'Adjusted';
  return <Chip label={s || '-'} size="small" sx={{ fontSize: 9, height: 20, bgcolor: adj ? '#E8F5E9' : '#FFF3E0', color: adj ? '#2E7D32' : '#E65100', fontWeight: 600 }} />;
};
const gstPct = (p) => p.row?.gst_rate != null ? `${p.row.gst_rate}%` : '-';

// All / Manual view — CN-wise summary
const CN_COLUMNS = [
  { field: 'cn_number', headerName: 'CN #', flex: 0.35, minWidth: 100 },
  { field: 'cn_type', headerName: 'Type', flex: 0.3, minWidth: 85,
    renderCell: (p) => {
      const t = p.row?.cn_type;
      const isReturn = t === 'Sales Return';
      return <Chip label={t || '-'} size="small" sx={{ fontSize: 9, height: 20, bgcolor: isReturn ? '#E3F2FD' : '#FFF3E0', color: isReturn ? '#1565C0' : '#E65100', fontWeight: 600 }} />;
    }
  },
  { field: 'cn_date', headerName: 'Date', flex: 0.3, minWidth: 85 },
  { field: 'customer_name', headerName: 'Customer', flex: 0.5, minWidth: 130 },
  { field: 'customer_gstin', headerName: 'GSTIN', flex: 0.45, minWidth: 130 },
  { field: 'invoice_numbers', headerName: 'Invoice #', flex: 0.35, minWidth: 100 },
  { field: 'items', headerName: 'Items', flex: 0.5, minWidth: 130 },
  { field: 'hsn_code', headerName: 'HSN', flex: 0.3, minWidth: 75 },
  { field: 'taxable_amount', headerName: 'Taxable Amt', flex: 0.35, minWidth: 95, align: 'right', headerAlign: 'right', ...rupeeCell('taxable_amount') },
  { field: 'gst_rate', headerName: 'GST %', flex: 0.2, minWidth: 55, align: 'right', headerAlign: 'right', renderCell: gstPct },
  { field: 'gst_type', headerName: 'GST Type', flex: 0.3, minWidth: 85 },
  { field: 'gst_amount', headerName: 'GST Amt', flex: 0.3, minWidth: 80, align: 'right', headerAlign: 'right', ...rupeeCell('gst_amount') },
  { field: 'tds_rate', headerName: 'TDS %', flex: 0.2, minWidth: 55, align: 'right', headerAlign: 'right', renderCell: (p) => p.row?.tds_rate != null ? `${p.row.tds_rate}%` : '' },
  { field: 'tds_section', headerName: 'TDS Section', flex: 0.25, minWidth: 70 },
  { field: 'tds_amount', headerName: 'TDS Amt', flex: 0.3, minWidth: 80, align: 'right', headerAlign: 'right', ...rupeeCell('tds_amount') },
  { field: 'tcs_rate', headerName: 'TCS %', flex: 0.2, minWidth: 55, align: 'right', headerAlign: 'right' },
  { field: 'tcs_amount', headerName: 'TCS Amt', flex: 0.3, minWidth: 80, align: 'right', headerAlign: 'right', ...rupeeCell('tcs_amount') },
  { field: 'rounded_off', headerName: 'Rounded', flex: 0.2, minWidth: 60, align: 'right', headerAlign: 'right' },
  { field: 'cn_amount', headerName: 'CN Amount', flex: 0.35, minWidth: 95, align: 'right', headerAlign: 'right', ...rupeeCell('cn_amount') },
  { field: 'adjustment_status', headerName: 'Status', flex: 0.3, minWidth: 85, renderCell: statusChip },
  { field: 'reference', headerName: 'Reference', flex: 0.3, minWidth: 80 },
  { field: 'comments', headerName: 'Comments', flex: 0.35, minWidth: 90 },
  { field: 'note', headerName: 'Note', flex: 0.3, minWidth: 80 },
  { field: 'location_name', headerName: 'Location', flex: 0.3, minWidth: 85 },
  { field: 'created_at', headerName: 'Created', flex: 0.4, minWidth: 110 },
];

// Sales Return view — lot-wise item detail
const RETURN_COLUMNS = [
  { field: 'cn_number', headerName: 'CN #', flex: 0.3, minWidth: 90 },
  { field: 'cn_date', headerName: 'Date', flex: 0.25, minWidth: 80 },
  { field: 'customer_name', headerName: 'Customer', flex: 0.45, minWidth: 120 },
  { field: 'customer_gstin', headerName: 'GSTIN', flex: 0.4, minWidth: 130 },
  { field: 'invoice_number', headerName: 'Invoice #', flex: 0.35, minWidth: 95 },
  { field: 'product_name', headerName: 'Product', flex: 0.5, minWidth: 140 },
  { field: 'sku', headerName: 'SKU', flex: 0.3, minWidth: 80 },
  { field: 'hsn_code', headerName: 'HSN', flex: 0.3, minWidth: 75 },
  { field: 'category', headerName: 'Category', flex: 0.3, minWidth: 80 },
  { field: 'brand', headerName: 'Brand', flex: 0.3, minWidth: 75 },
  { field: 'lot_number', headerName: 'Lot #', flex: 0.3, minWidth: 80 },
  { field: 'return_qty', headerName: 'Qty', flex: 0.15, minWidth: 45, align: 'right', headerAlign: 'right' },
  { field: 'unit_price', headerName: 'Sale Price', flex: 0.3, minWidth: 80, align: 'right', headerAlign: 'right', ...rupeeCell('unit_price') },
  { field: 'discount_amount', headerName: 'Discount', flex: 0.25, minWidth: 65, align: 'right', headerAlign: 'right' },
  { field: 'item_total', headerName: 'Item Total', flex: 0.3, minWidth: 85, align: 'right', headerAlign: 'right', ...rupeeCell('item_total') },
  { field: 'gst_rate', headerName: 'GST %', flex: 0.2, minWidth: 55, align: 'right', headerAlign: 'right', renderCell: gstPct },
  { field: 'gst_type', headerName: 'GST Type', flex: 0.3, minWidth: 80 },
  { field: 'item_gst_amount', headerName: 'Item GST', flex: 0.3, minWidth: 75, align: 'right', headerAlign: 'right', ...rupeeCell('item_gst_amount') },
  { field: 'cn_gst_amount', headerName: 'CN GST', flex: 0.3, minWidth: 75, align: 'right', headerAlign: 'right', ...rupeeCell('cn_gst_amount') },
  { field: 'tds_rate', headerName: 'TDS %', flex: 0.2, minWidth: 55, align: 'right', headerAlign: 'right', renderCell: (p) => p.row?.tds_rate != null ? `${p.row.tds_rate}%` : '' },
  { field: 'tds_section', headerName: 'TDS Section', flex: 0.25, minWidth: 70 },
  { field: 'tds_amount', headerName: 'TDS Amt', flex: 0.3, minWidth: 75, align: 'right', headerAlign: 'right', ...rupeeCell('tds_amount') },
  { field: 'cn_amount', headerName: 'CN Amount', flex: 0.3, minWidth: 85, align: 'right', headerAlign: 'right', ...rupeeCell('cn_amount') },
  { field: 'adjustment_status', headerName: 'Status', flex: 0.25, minWidth: 80, renderCell: statusChip },
  { field: 'reference', headerName: 'Reference', flex: 0.3, minWidth: 80 },
  { field: 'comments', headerName: 'Comments', flex: 0.3, minWidth: 80 },
  { field: 'location_name', headerName: 'Location', flex: 0.3, minWidth: 80 },
  { field: 'created_at', headerName: 'Created', flex: 0.35, minWidth: 100 },
];

export default function CreditNotesNew() {
  const navigate = useNavigate();
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [rowCount, setRowCount] = useState(0);
  const [kpis, setKpis] = useState({});
  const [searchVal, setSearchVal] = useState('');
  const [viewMode, setViewMode] = useState('return');
  const [fromDate, setFromDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState([]);

  const filterCount = (locationFilter.length > 0 ? 1 : 0);

  const fetchData = async (p = 0, ps = 20, vm = viewMode) => {
    if (!headerLocationId) return;
    setLoading(true);
    try {
      const payload = {
        location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null',
        pageCount: p, numPerPage: ps, fromDate, toDate, viewMode: vm,
      };
      const res = await ReportsService.getCreditNotes(payload);
      setData(res.data?.data || []);
      setRowCount(res.data?.numRows || 0);
      setKpis(res.data || {});
    } catch (err) { setData([]); setRowCount(0); }
    setLoading(false);
  };

  useEffect(() => {
    if (headerLocationId) { fetchData(page, pageSize, viewMode); }
  }, [page, pageSize, headerLocationId, fromDate, toDate, viewMode, locationFilter]);

  const handleChipChange = (key) => {
    setData([]);
    setPage(0);
    setViewMode(key);
  };

  const handleFilterApply = ({ from, to, locationIds }) => {
    if (from) setFromDate(from);
    if (to) setToDate(to);
    if (locationIds) {
      setLocationFilter(locationIds.map(id => ({ location_id: id })));
    } else {
      setLocationFilter([]);
    }
    setPage(0);
  };

  const handleFilterClear = () => {
    setFromDate(moment().startOf('month').format('YYYY-MM-DD'));
    setToDate(moment().format('YYYY-MM-DD'));
    setLocationFilter([]);
    setPage(0);
  };

  const columns = viewMode === 'return' ? RETURN_COLUMNS : CN_COLUMNS;

  const getRowId = (row) => {
    if (viewMode === 'return') return row.row_id || `${row.cn_number}_${row.product_name}_${row.lot_number}`;
    return `${row.id}`;
  };

  const handleExport = async () => {
    try {
      const payload = {
        location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null',
        pageCount: 0, numPerPage: 100000, fromDate, toDate, viewMode,
      };
      const r = await ReportsService.getCreditNotes(payload);
      ExportCsv(
        columns.map(c => ({ title: c.headerName, field: c.field })),
        r.data?.data || [],
        `Credit_Notes_${viewMode}`
      );
    } catch (e) {}
  };

  const filteredData = searchVal ? data.filter(row => Object.values(row).some(v => v != null && String(v).toLowerCase().includes(searchVal.toLowerCase()))) : data;
  return (
    <>
      <Helmet><title>{titleURL} | Credit Notes</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        {/* Header Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, minHeight: 42, flexWrap: 'nowrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5, whiteSpace: 'nowrap' }}>Credit Notes</Typography>
          {CHIPS.map((c) => (
            <Chip key={c.key} label={c.label} size="small"
              variant={viewMode === c.key ? 'filled' : 'outlined'}
              color={viewMode === c.key ? 'primary' : 'default'}
              onClick={() => handleChipChange(c.key)}
              sx={{ fontSize: 11, height: 24 }} />
          ))}
          <Box sx={{ flex: 1 }} />
          <KpiCard label="Total" value={kpis.totalCount || 0} color="#2E3A59" />
          <KpiCard label="Return" value={kpis.returnCount || 0} color="#1565C0" />
          <KpiCard label="Manual" value={kpis.manualCount || 0} color="#E65100" />
          <KpiCard label="Total Value" value={`\u20B9${Number(kpis.totalValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="#d32f2f" />
          <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => { setSearchVal(e.target.value); setPage(0); }} />
          <FilterCreditNotes
            open={filterOpen}
            handleClose={setFilterOpen}
            from={fromDate}
            to={toDate}
            locationFilter={locationFilter}
            onApply={handleFilterApply}
            onClear={handleFilterClear}
            count={filterCount}
          />
          <Tooltip title="Export CSV">
            <IconButton onClick={handleExport}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton>
          </Tooltip>
        </Box>

        {/* DataGrid */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            rowCount={rowCount}
            getRowId={getRowId}
            paginationMode="server"
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(m) => {
              if (m.page !== page) setPage(m.page);
              if (m.pageSize !== pageSize) setPageSize(m.pageSize);
            }}
            pageSizeOptions={[50, 100, 200, 500]}
            density="compact"
            disableRowSelectionOnClick
            loading={loading}
            sx={{
              border: 'none', height: '100%',
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 },
              '& .MuiDataGrid-cell': { fontSize: 12 },
              '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' },
              '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' },
            }}
          />
        </Box>
      </Card>
    </>
  );
}
