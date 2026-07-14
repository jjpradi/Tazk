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
  return (<Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 70 }}>
    <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
    <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
  </Box>);
}
const fmt = (v) => '\u20B9' + Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const rfmt = (v) => v != null && v !== '' && Number(v) !== 0 ? '\u20B9' + Number(v).toLocaleString('en-IN') : '-';
const rc = (f) => ({ renderCell: (p) => rfmt(p.row?.[f]) });

const DAY_CHIPS = [
  { key: 30, label: "30 Days" },
  { key: 60, label: "60 Days" },
  { key: 90, label: "90 Days" },
  { key: 120, label: "120 Days" },
];

const COLUMNS = [{ field: 'revenue', headerName: 'Revenue', flex: 0.3, minWidth: 120, align: 'right', headerAlign: 'right', ...rc('revenue') },
  { field: 'cogs', headerName: 'COGS', flex: 0.3, minWidth: 110, align: 'right', headerAlign: 'right', ...rc('cogs') },
  { field: 'purchases', headerName: 'Purchases', flex: 0.3, minWidth: 110, align: 'right', headerAlign: 'right', ...rc('purchases') },
  { field: 'accounts_receivable', headerName: 'Receivable (AR)', flex: 0.3, minWidth: 120, align: 'right', headerAlign: 'right', ...rc('accounts_receivable') },
  { field: 'accounts_payable', headerName: 'Payable (AP)', flex: 0.3, minWidth: 120, align: 'right', headerAlign: 'right', ...rc('accounts_payable') },
  { field: 'inventory_value', headerName: 'Inventory Value', flex: 0.3, minWidth: 120, align: 'right', headerAlign: 'right', ...rc('inventory_value') },
  { field: 'dso', headerName: 'DSO (Days)', flex: 0.3, minWidth: 90, align: 'right', headerAlign: 'right' },
  { field: 'dio', headerName: 'DIO (Days)', flex: 0.3, minWidth: 90, align: 'right', headerAlign: 'right' },
  { field: 'dpo', headerName: 'DPO (Days)', flex: 0.3, minWidth: 90, align: 'right', headerAlign: 'right' },
  { field: 'ccc', headerName: 'CCC (Days)', flex: 0.3, minWidth: 90, align: 'right', headerAlign: 'right' },
  { field: 'period_days', headerName: 'Period', flex: 0.3, minWidth: 70, align: 'right', headerAlign: 'right' }];

export default function CCCDashboardNew() {
  const navigate = useNavigate();
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [data, setData] = useState([]); const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); const [pageSize, setPageSize] = useState(50);
  const [rowCount, setRowCount] = useState(0); const [kpis, setKpis] = useState({});
  const [searchVal, setSearchVal] = useState('');
  const [fromDate, setFromDate] = useState(moment().subtract(1, 'year').startOf('month').format('YYYY-MM-DD'));
  const [dayRange, setDayRange] = useState(120);
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState([]);

  const fetchData = async (p = 0, ps2 = 20) => {
    if (!headerLocationId) return; setLoading(true);
    try { const res = await ReportsService.getCccDashboard({ location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null', pageCount: p, numPerPage: ps2, fromDate, toDate });
      setData(res.data?.data || []); setRowCount(res.data?.numRows || 0); setKpis(res.data || {}); } catch (err) { setData([]); setRowCount(0); } setLoading(false);
  };
  useEffect(() => { if (headerLocationId) fetchData(page, pageSize); }, [page, pageSize, headerLocationId, fromDate, toDate, locationFilter]);
  const handleFilterApply = ({ from, to, locationIds }) => { if (from) setFromDate(from); if (to) setToDate(to); setLocationFilter(locationIds ? locationIds.map(id => ({ location_id: id })) : []); setPage(0); };
  const handleFilterClear = () => { setFromDate(moment().subtract(1, 'year').startOf('month').format('YYYY-MM-DD')); setToDate(moment().format('YYYY-MM-DD')); setLocationFilter([]); setPage(0); };
  const handleDayChip = (days) => { setDayRange(days); setFromDate(moment().subtract(days, 'days').format('YYYY-MM-DD')); setToDate(moment().format('YYYY-MM-DD')); setPage(0); };

  const filteredData = searchVal ? data.filter(row => Object.values(row).some(v => v != null && String(v).toLowerCase().includes(searchVal.toLowerCase()))) : data;
  return (<><Helmet><title>{titleURL} | Cash Conversion Cycle</title></Helmet>
    <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, minHeight: 42, flexWrap: 'nowrap' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5, whiteSpace: 'nowrap' }}>Cash Conversion Cycle</Typography>
        {DAY_CHIPS.map((c) => (<Chip key={c.key} label={c.label} size="small" variant={dayRange === c.key ? 'filled' : 'outlined'} color={dayRange === c.key ? 'primary' : 'default'} onClick={() => handleDayChip(c.key)} sx={{ fontSize: 10, height: 22 }} />))}<Box sx={{ flex: 1 }} />
        <KpiCard label="DSO" value={(kpis.dso || 0) + ' days'} color="#E65100" />
        <KpiCard label="DIO" value={(kpis.dio || 0) + ' days'} color="#1565C0" />
        <KpiCard label="DPO" value={(kpis.dpo || 0) + ' days'} color="#2E7D32" />
        <KpiCard label="CCC" value={(kpis.ccc || 0) + ' days'} color="#7B1FA2" />
        <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => setSearchVal(e.target.value)} />
        <FilterCreditNotes open={filterOpen} handleClose={setFilterOpen} from={fromDate} to={toDate} locationFilter={locationFilter} onApply={handleFilterApply} onClear={handleFilterClear} count={locationFilter.length > 0 ? 1 : 0} />
        <Tooltip title="Export CSV"><IconButton onClick={async () => { try { const res = await ReportsService.getCccDashboard({ location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null', pageCount: 0, numPerPage: 10000, fromDate, toDate }); ExportCsv(COLUMNS.map(c => ({ title: c.headerName, field: c.field })), res.data?.data || [], 'Cash_Conversion_Cycle'); } catch(e) {} }}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
      </Box>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <DataGrid rows={filteredData} columns={COLUMNS} rowCount={rowCount} getRowId={(row) => Math.random()}
          
          pageSizeOptions={[50, 100, 200, 500]} density="compact" disableRowSelectionOnClick slotProps={{ pagination: { showFirstButton: true, showLastButton: true } }} loading={loading}
          sx={{ border: 'none', height: '100%', '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 }, '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' }, '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' } }} />
      </Box>
    </Card></>);
}
