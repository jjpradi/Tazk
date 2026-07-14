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
import FilterCreditNotes from '../../sales/returnCreditNotesReport/FilterCreditNotes';

function KpiCard({ label, value, color }) {
  return (
    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 70 }}>
      <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}

const r = (v) => v != null && v !== '' ? `\u20B9${Number(v).toLocaleString('en-IN')}` : '';
const rc = (f) => ({ renderCell: (p) => r(p.row?.[f]) });

const TYPE_COLORS = {
  'Sale': '#2E7D32', 'Purchase': '#1565C0', 'Receipt': '#00695C', 'Payment': '#4527A0',
  'Credit Note': '#E65100', 'Debit Note': '#C62828',
  'Pay In': '#2E7D32', 'Pay Out': '#C62828', 'Contra': '#7B1FA2', 'Expense': '#F57F17',
};

const COLUMNS = [
  { field: 'date', headerName: 'Date', flex: 0.25, minWidth: 80 },
  { field: 'txn_type', headerName: 'Type', flex: 0.3, minWidth: 90,
    renderCell: (p) => {
      const t = p.row?.txn_type;
      const c = TYPE_COLORS[t] || '#555';
      return <Chip label={t || '-'} size="small" sx={{ fontSize: 9, height: 20, bgcolor: c + '15', color: c, fontWeight: 600 }} />;
    }
  },
  { field: 'voucher_no', headerName: 'Voucher #', flex: 0.4, minWidth: 110 },
  { field: 'party_name', headerName: 'Party', flex: 0.5, minWidth: 130 },
  { field: 'ledger', headerName: 'Ledger', flex: 0.35, minWidth: 90 },
  { field: 'debit', headerName: 'Debit', flex: 0.35, minWidth: 85, align: 'right', headerAlign: 'right', ...rc('debit') },
  { field: 'credit', headerName: 'Credit', flex: 0.35, minWidth: 85, align: 'right', headerAlign: 'right', ...rc('credit') },
  { field: 'total', headerName: 'Amount', flex: 0.35, minWidth: 85, align: 'right', headerAlign: 'right', ...rc('total') },
  { field: 'status', headerName: 'Status', flex: 0.25, minWidth: 75,
    renderCell: (p) => {
      const s = p.row?.status; if (!s) return '';
      const g = ['completed','Paid','Adjusted','paid','active'].includes(s);
      return <Chip label={s} size="small" sx={{ fontSize: 9, height: 20, bgcolor: g ? '#E8F5E9' : '#FFF3E0', color: g ? '#2E7D32' : '#E65100', fontWeight: 600 }} />;
    }
  },
  { field: 'location_name', headerName: 'Location', flex: 0.3, minWidth: 80 },
];

export default function AllTransactionsNew() {
  const navigate = useNavigate();
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [rowCount, setRowCount] = useState(0);
  const [kpis, setKpis] = useState({});
  const [searchVal, setSearchVal] = useState('');
  const [fromDate, setFromDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState([]);
  const filterCount = (locationFilter.length > 0 ? 1 : 0);

  const fetchData = async (p = 0, ps = 20) => {
    if (!headerLocationId) return;
    setLoading(true);
    try {
      const payload = { location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null', pageCount: p, numPerPage: ps, fromDate, toDate };
      const res = await ReportsService.getAllTransactions(payload);
      setData(res.data?.data || []); setRowCount(res.data?.numRows || 0); setKpis(res.data || {});
    } catch (err) { setData([]); setRowCount(0); }
    setLoading(false);
  };

  useEffect(() => { if (headerLocationId) fetchData(page, pageSize); }, [page, pageSize, headerLocationId, fromDate, toDate, locationFilter]);

  const handleFilterApply = ({ from, to, locationIds }) => { if (from) setFromDate(from); if (to) setToDate(to); setLocationFilter(locationIds ? locationIds.map(id => ({ location_id: id })) : []); setPage(0); };
  const handleFilterClear = () => { setFromDate(moment().startOf('month').format('YYYY-MM-DD')); setToDate(moment().format('YYYY-MM-DD')); setLocationFilter([]); setPage(0); };
  const getRowId = (row) => `${row.txn_type}_${row.id}`;

  const handleExport = async () => {
    try { const res = await ReportsService.getAllTransactions({ location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null', pageCount: 0, numPerPage: 100000, fromDate, toDate });
      ExportCsv(COLUMNS.map(c => ({ title: c.headerName, field: c.field })), res.data?.data || [], 'All_Transactions'); } catch (e) {}
  };

  const filteredData = searchVal ? data.filter(row => Object.values(row).some(v => v != null && String(v).toLowerCase().includes(searchVal.toLowerCase()))) : data;
  return (
    <>
      <Helmet><title>{titleURL} | All Transactions</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pb: 1, minHeight: 42, flexWrap: 'nowrap', overflow: 'auto' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5, whiteSpace: 'nowrap' }}>All Transactions</Typography>
          <Box sx={{ flex: 1 }} />
          <KpiCard label="Sales" value={kpis.salesCount || 0} color="#2E7D32" />
          <KpiCard label="Purchase" value={kpis.purchaseCount || 0} color="#1565C0" />
          <KpiCard label="Receipt" value={kpis.receiptCount || 0} color="#00695C" />
          <KpiCard label="Payment" value={kpis.paymentCount || 0} color="#4527A0" />
          <KpiCard label="CN" value={kpis.cnCount || 0} color="#E65100" />
          <KpiCard label="DN" value={kpis.dnCount || 0} color="#C62828" />
          <KpiCard label="Pay In" value={kpis.payInCount || 0} color="#2E7D32" />
          <KpiCard label="Pay Out" value={kpis.payOutCount || 0} color="#C62828" />
          <KpiCard label="Contra" value={kpis.contraCount || 0} color="#7B1FA2" />
          <KpiCard label="Expense" value={kpis.expenseCount || 0} color="#F57F17" />
          <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => { setSearchVal(e.target.value); setPage(0); }} />
          <FilterCreditNotes open={filterOpen} handleClose={setFilterOpen} from={fromDate} to={toDate} locationFilter={locationFilter} onApply={handleFilterApply} onClear={handleFilterClear} count={filterCount} />
          <Tooltip title="Export CSV"><IconButton onClick={handleExport}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DataGrid rows={filteredData} columns={COLUMNS} rowCount={rowCount} getRowId={getRowId}
            paginationMode="server" paginationModel={{ page, pageSize }}
            onPaginationModelChange={(m) => { if (m.page !== page) setPage(m.page); if (m.pageSize !== pageSize) setPageSize(m.pageSize); }}
            pageSizeOptions={[50, 100, 200, 500]} density="compact" disableRowSelectionOnClick slotProps={{ pagination: { showFirstButton: true, showLastButton: true } }} loading={loading}
            sx={{ border: 'none', height: '100%', '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 }, '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' }, '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' } }} />
        </Box>
      </Card>
    </>
  );
}
