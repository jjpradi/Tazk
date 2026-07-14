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

const COLUMNS = [{ field: 'month', headerName: 'Month', flex: 0.3, minWidth: 100 },
  { field: 'orders', headerName: 'Orders', flex: 0.3, minWidth: 60, align: 'right', headerAlign: 'right' },
  { field: 'qty', headerName: 'Qty', flex: 0.3, minWidth: 55, align: 'right', headerAlign: 'right' },
  { field: 'revenue', headerName: 'Revenue', flex: 0.3, minWidth: 100, align: 'right', headerAlign: 'right', ...rc('revenue') },
  { field: 'cost', headerName: 'Cost', flex: 0.3, minWidth: 90, align: 'right', headerAlign: 'right', ...rc('cost') },
  { field: 'margin', headerName: 'Margin', flex: 0.3, minWidth: 90, align: 'right', headerAlign: 'right', renderCell: (p) => { const v = p.row?.margin; if (v == null) return '-'; const c2 = Number(v) >= 0 ? '#2E7D32' : '#C62828'; return <Typography sx={{ fontSize: 12, fontWeight: 600, color: c2 }}>{fmt(v)}</Typography>; } },
  { field: 'margin_pct', headerName: 'Margin %', flex: 0.3, minWidth: 65, align: 'right', headerAlign: 'right', renderCell: (p) => p.row?.margin_pct != null ? p.row.margin_pct + '%' : '-' },
  { field: 'purchases', headerName: 'Purchases', flex: 0.3, minWidth: 95, align: 'right', headerAlign: 'right', ...rc('purchases') },
  { field: 'expenses', headerName: 'Expenses', flex: 0.3, minWidth: 85, align: 'right', headerAlign: 'right', ...rc('expenses') },
  { field: 'growth_pct', headerName: 'Growth %', flex: 0.3, minWidth: 70, align: 'right', headerAlign: 'right', renderCell: (p) => p.row?.growth_pct != null ? p.row.growth_pct + '%' : '-' }];

export default function MonthlyComparisonNew() {
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
    try { const res = await ReportsService.getMonthlyComparison({ location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null', pageCount: p, numPerPage: ps2, fromDate, toDate });
      setData(res.data?.data || []); setRowCount(res.data?.numRows || 0); setKpis(res.data || {}); } catch (err) { setData([]); setRowCount(0); } setLoading(false);
  };
  useEffect(() => { if (headerLocationId) fetchData(page, pageSize); }, [page, pageSize, headerLocationId, fromDate, toDate, locationFilter]);
  const handleFilterApply = ({ from, to, locationIds }) => { if (from) setFromDate(from); if (to) setToDate(to); setLocationFilter(locationIds ? locationIds.map(id => ({ location_id: id })) : []); setPage(0); };
  const handleFilterClear = () => { setFromDate(moment().subtract(1, 'year').startOf('month').format('YYYY-MM-DD')); setToDate(moment().format('YYYY-MM-DD')); setLocationFilter([]); setPage(0); };
  const handleDayChip = (days) => { setDayRange(days); setFromDate(moment().subtract(days, 'days').format('YYYY-MM-DD')); setToDate(moment().format('YYYY-MM-DD')); setPage(0); };

  const filteredData = searchVal ? data.filter(row => Object.values(row).some(v => v != null && String(v).toLowerCase().includes(searchVal.toLowerCase()))) : data;
  return (<><Helmet><title>{titleURL} | Monthly Comparison</title></Helmet>
    <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, minHeight: 42, flexWrap: 'nowrap' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5, whiteSpace: 'nowrap' }}>Monthly Comparison</Typography>
        {DAY_CHIPS.map((c) => (<Chip key={c.key} label={c.label} size="small" variant={dayRange === c.key ? 'filled' : 'outlined'} color={dayRange === c.key ? 'primary' : 'default'} onClick={() => handleDayChip(c.key)} sx={{ fontSize: 10, height: 22 }} />))}<Box sx={{ flex: 1 }} />
        
        <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => setSearchVal(e.target.value)} />
        <FilterCreditNotes open={filterOpen} handleClose={setFilterOpen} from={fromDate} to={toDate} locationFilter={locationFilter} onApply={handleFilterApply} onClear={handleFilterClear} count={locationFilter.length > 0 ? 1 : 0} />
        <Tooltip title="Export CSV"><IconButton onClick={async () => { try { const res = await ReportsService.getMonthlyComparison({ location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null', pageCount: 0, numPerPage: 10000, fromDate, toDate }); ExportCsv(COLUMNS.map(c => ({ title: c.headerName, field: c.field })), res.data?.data || [], 'Monthly_Comparison'); } catch(e) {} }}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
      </Box>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <DataGrid rows={filteredData} columns={COLUMNS} rowCount={rowCount} getRowId={(row) => row.sort_key || Math.random()}
          
          pageSizeOptions={[50, 100, 200, 500]} density="compact" disableRowSelectionOnClick slotProps={{ pagination: { showFirstButton: true, showLastButton: true } }} loading={loading}
          sx={{ border: 'none', height: '100%', '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 }, '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' }, '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' } }} />
      </Box>
    </Card></>);
}
