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

const CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'payin', label: 'Pay In', color: '#2E7D32' },
  { key: 'payout', label: 'Pay Out', color: '#C62828' },
  { key: 'contra', label: 'Contra', color: '#7B1FA2' },
];

const TYPE_COLORS = { 'Pay In': '#2E7D32', 'Pay Out': '#C62828', 'Contra': '#7B1FA2' };

const COLUMNS = [
  { field: 'date', headerName: 'Date', flex: 0.25, minWidth: 80 },
  { field: 'entry_type', headerName: 'Type', flex: 0.25, minWidth: 75,
    renderCell: (p) => { const t = p.row?.entry_type; const c = TYPE_COLORS[t] || '#555';
      return <Chip label={t || '-'} size="small" sx={{ fontSize: 9, height: 20, bgcolor: c + '15', color: c, fontWeight: 600 }} />; }
  },
  { field: 'description', headerName: 'Description', flex: 0.5, minWidth: 140 },
  { field: 'amount', headerName: 'Amount', flex: 0.35, minWidth: 90, align: 'right', headerAlign: 'right', ...rc('amount') },
  { field: 'mode', headerName: 'Mode', flex: 0.3, minWidth: 80 },
  { field: 'bank', headerName: 'Bank', flex: 0.3, minWidth: 80 },
  { field: 'reference', headerName: 'Reference', flex: 0.35, minWidth: 90 },
  { field: 'contra_to', headerName: 'Contra To', flex: 0.35, minWidth: 90 },
  { field: 'cheque_no', headerName: 'Cheque #', flex: 0.3, minWidth: 80 },
  { field: 'cheque_date', headerName: 'Cheque Date', flex: 0.3, minWidth: 85 },
  { field: 'location_name', headerName: 'Location', flex: 0.3, minWidth: 80 },
  { field: 'entry_date', headerName: 'Entry Date', flex: 0.4, minWidth: 110 },
];

export default function PayInOutContraNew() {
  const navigate = useNavigate();
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [data, setData] = useState([]); const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); const [pageSize, setPageSize] = useState(50);
  const [rowCount, setRowCount] = useState(0); const [kpis, setKpis] = useState({});
  const [searchVal, setSearchVal] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const [fromDate, setFromDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState([]);

  const fetchData = async (p = 0, ps = 20, vm = viewMode) => {
    if (!headerLocationId) return; setLoading(true);
    try { const res = await ReportsService.getPayInOutContra({ location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null', pageCount: p, numPerPage: ps, fromDate, toDate, viewMode: vm });
      setData(res.data?.data || []); setRowCount(res.data?.numRows || 0); setKpis(res.data || {}); } catch (err) { setData([]); setRowCount(0); } setLoading(false);
  };
  useEffect(() => { if (headerLocationId) fetchData(page, pageSize, viewMode); }, [page, pageSize, headerLocationId, fromDate, toDate, viewMode, locationFilter]);
  const handleChipChange = (key) => { setData([]); setPage(0); setViewMode(key); };
  const handleFilterApply = ({ from, to, locationIds }) => { if (from) setFromDate(from); if (to) setToDate(to); setLocationFilter(locationIds ? locationIds.map(id => ({ location_id: id })) : []); setPage(0); };
  const handleFilterClear = () => { setFromDate(moment().startOf('month').format('YYYY-MM-DD')); setToDate(moment().format('YYYY-MM-DD')); setLocationFilter([]); setPage(0); };
  const fmt = (v) => `\u20B9${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const filteredData = searchVal ? data.filter(row => Object.values(row).some(v => v != null && String(v).toLowerCase().includes(searchVal.toLowerCase()))) : data;
  return (
    <><Helmet><title>{titleURL} | Pay In/Out & Contra</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, minHeight: 42, flexWrap: 'nowrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5, whiteSpace: 'nowrap' }}>Pay In/Out & Contra</Typography>
          {CHIPS.map((c) => (
            <Chip key={c.key} label={c.label} size="small" variant={viewMode === c.key ? 'filled' : 'outlined'} color={viewMode === c.key ? 'primary' : 'default'} onClick={() => handleChipChange(c.key)} sx={{ fontSize: 10, height: 22 }} />
          ))}
          <Box sx={{ flex: 1 }} />
          <KpiCard label="Pay In" value={`${kpis.payInCount || 0} | ${fmt(kpis.payInTotal)}`} color="#2E7D32" />
          <KpiCard label="Pay Out" value={`${kpis.payOutCount || 0} | ${fmt(kpis.payOutTotal)}`} color="#C62828" />
          <KpiCard label="Contra" value={`${kpis.contraCount || 0} | ${fmt(kpis.contraTotal)}`} color="#7B1FA2" />
          <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => { setSearchVal(e.target.value); setPage(0); }} />
          <FilterCreditNotes open={filterOpen} handleClose={setFilterOpen} from={fromDate} to={toDate} locationFilter={locationFilter} onApply={handleFilterApply} onClear={handleFilterClear} count={locationFilter.length > 0 ? 1 : 0} />
          <Tooltip title="Export CSV"><IconButton onClick={async () => { try { const res = await ReportsService.getPayInOutContra({ location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null', pageCount: 0, numPerPage: 100000, fromDate, toDate, viewMode }); ExportCsv(COLUMNS.map(c => ({ title: c.headerName, field: c.field })), res.data?.data || [], `PayInOutContra_${viewMode}`); } catch(e) {} }}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
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
