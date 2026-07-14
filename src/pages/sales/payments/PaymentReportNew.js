import React, { useState, useEffect, useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Card, IconButton, Tooltip, Typography } from '@mui/material';
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

const COLUMNS = [
  { field: 'voucher_no', headerName: 'Voucher #', flex: 0.4, minWidth: 110 },
  { field: 'date', headerName: 'Date', flex: 0.3, minWidth: 85 },
  { field: 'party_name', headerName: 'Supplier', flex: 0.5, minWidth: 140 },
  { field: 'invoice_amount', headerName: 'Against Invoice', flex: 0.35, minWidth: 90, align: 'right', headerAlign: 'right', ...rc('invoice_amount') },
  { field: 'advance_amount', headerName: 'Advance', flex: 0.3, minWidth: 75, align: 'right', headerAlign: 'right', ...rc('advance_amount') },
  { field: 'total_amount', headerName: 'Total Paid', flex: 0.35, minWidth: 90, align: 'right', headerAlign: 'right', ...rc('total_amount') },
  { field: 'payment_mode', headerName: 'Mode', flex: 0.35, minWidth: 90 },
  { field: 'invoices_adjusted', headerName: 'Invoices', flex: 0.4, minWidth: 100 },
  { field: 'dn_adjusted', headerName: 'DN Adjusted', flex: 0.3, minWidth: 80 },
  { field: 'note', headerName: 'Note', flex: 0.4, minWidth: 100 },
  { field: 'location_name', headerName: 'Location', flex: 0.3, minWidth: 80 },
  { field: 'entry_date', headerName: 'Entry Date', flex: 0.4, minWidth: 110 },
];

export default function PaymentReportNew() {
  const navigate = useNavigate();
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [data, setData] = useState([]); const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); const [pageSize, setPageSize] = useState(50);
  const [rowCount, setRowCount] = useState(0); const [kpis, setKpis] = useState({});
  const [searchVal, setSearchVal] = useState('');
  const [fromDate, setFromDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState([]);

  const fetchData = async (p = 0, ps = 20) => {
    if (!headerLocationId) return; setLoading(true);
    try { const res = await ReportsService.getPaymentReport({ location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null', pageCount: p, numPerPage: ps, fromDate, toDate });
      setData(res.data?.data || []); setRowCount(res.data?.numRows || 0); setKpis(res.data || {}); } catch (err) { setData([]); setRowCount(0); } setLoading(false);
  };
  useEffect(() => { if (headerLocationId) fetchData(page, pageSize); }, [page, pageSize, headerLocationId, fromDate, toDate, locationFilter]);
  const handleFilterApply = ({ from, to, locationIds }) => { if (from) setFromDate(from); if (to) setToDate(to); setLocationFilter(locationIds ? locationIds.map(id => ({ location_id: id })) : []); setPage(0); };
  const handleFilterClear = () => { setFromDate(moment().startOf('month').format('YYYY-MM-DD')); setToDate(moment().format('YYYY-MM-DD')); setLocationFilter([]); setPage(0); };
  const fmt = (v) => `\u20B9${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const filteredData = searchVal ? data.filter(row => Object.values(row).some(v => v != null && String(v).toLowerCase().includes(searchVal.toLowerCase()))) : data;
  return (
    <><Helmet><title>{titleURL} | Payment Report</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, minHeight: 42, flexWrap: 'nowrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5, whiteSpace: 'nowrap' }}>Payment Report</Typography>
          <Box sx={{ flex: 1 }} />
          <KpiCard label="Vouchers" value={kpis.totalCount || 0} color="#2E3A59" />
          <KpiCard label="Total Paid" value={fmt(kpis.totalAmount)} color="#4527A0" />
          <KpiCard label="Advances" value={kpis.advanceCount || 0} color="#E65100" />
          <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => { setSearchVal(e.target.value); setPage(0); }} />
          <FilterCreditNotes open={filterOpen} handleClose={setFilterOpen} from={fromDate} to={toDate} locationFilter={locationFilter} onApply={handleFilterApply} onClear={handleFilterClear} count={locationFilter.length > 0 ? 1 : 0} />
          <Tooltip title="Export CSV"><IconButton onClick={async () => { try { const res = await ReportsService.getPaymentReport({ location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null', pageCount: 0, numPerPage: 100000, fromDate, toDate }); ExportCsv(COLUMNS.map(c => ({ title: c.headerName, field: c.field })), res.data?.data || [], 'Payment_Report'); } catch(e) {} }}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DataGrid rows={filteredData} columns={COLUMNS} rowCount={rowCount} getRowId={(row) => `${row.id}`}
            paginationMode="server" paginationModel={{ page, pageSize }} onPaginationModelChange={(m) => { if (m.page !== page) setPage(m.page); if (m.pageSize !== pageSize) setPageSize(m.pageSize); }}
            pageSizeOptions={[50, 100, 200, 500]} density="compact" disableRowSelectionOnClick slotProps={{ pagination: { showFirstButton: true, showLastButton: true } }} loading={loading}
            sx={{ border: 'none', height: '100%', '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 }, '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' }, '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' } }} />
        </Box>
      </Card></>
  );
}
