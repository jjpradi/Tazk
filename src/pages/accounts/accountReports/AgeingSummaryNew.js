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
import FilterCreditNotes from '../../sales/returnCreditNotesReport/FilterCreditNotes';

function KpiCard({ label, value, color }) {
  return (<Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 70 }}>
    <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
    <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
  </Box>);
}
const fmt = (v) => '\u20B9' + Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const rfmt = (v) => v != null && v !== '' && Number(v) !== 0 ? '\u20B9' + Number(v).toLocaleString('en-IN') : '-';
const rc = (f) => ({ renderCell: (p) => rfmt(p.row?.[f]) });

const COLUMNS = [{ field: 'type', headerName: 'Type', flex: 0.3, minWidth: 80 },
  { field: 'party_name', headerName: 'Party', flex: 0.3, minWidth: 160 },
  { field: 'invoices', headerName: 'Invoices', flex: 0.3, minWidth: 65, align: 'right', headerAlign: 'right' },
  { field: 'outstanding', headerName: 'Outstanding', flex: 0.3, minWidth: 100, align: 'right', headerAlign: 'right', renderCell: (p) => { const v = p.row?.outstanding; if (v == null) return '-'; const c2 = Number(v) >= 0 ? '#2E7D32' : '#C62828'; return <Typography sx={{ fontSize: 12, fontWeight: 600, color: c2 }}>{fmt(v)}</Typography>; } },
  { field: 'age_0_30', headerName: '0-30 Days', flex: 0.3, minWidth: 90, align: 'right', headerAlign: 'right', ...rc('age_0_30') },
  { field: 'age_31_60', headerName: '31-60 Days', flex: 0.3, minWidth: 90, align: 'right', headerAlign: 'right', ...rc('age_31_60') },
  { field: 'age_61_90', headerName: '61-90 Days', flex: 0.3, minWidth: 90, align: 'right', headerAlign: 'right', ...rc('age_61_90') },
  { field: 'age_90_plus', headerName: '90+ Days', flex: 0.3, minWidth: 90, align: 'right', headerAlign: 'right', ...rc('age_90_plus') }];

export default function AgeingSummaryNew() {
  const navigate = useNavigate();
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [data, setData] = useState([]); const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); const [pageSize, setPageSize] = useState(50);
  const [rowCount, setRowCount] = useState(0); const [kpis, setKpis] = useState({});
  const [searchVal, setSearchVal] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState([]);

  const fetchData = async (p = 0, ps2 = 50) => {
    if (!headerLocationId) return; setLoading(true);
    try { const res = await ReportsService.getAgeingSummary({ location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null', pageCount: p, numPerPage: ps2 });
      setData(res.data?.data || []); setRowCount(res.data?.numRows || 0); setKpis(res.data || {}); } catch (err) { setData([]); setRowCount(0); } setLoading(false);
  };
  useEffect(() => { if (headerLocationId) fetchData(page, pageSize); }, [page, pageSize, headerLocationId, locationFilter]);
  const handleFilterApply = ({ locationIds }) => { setLocationFilter(locationIds ? locationIds.map(id => ({ location_id: id })) : []); setPage(0); };
  const handleFilterClear = () => { setLocationFilter([]); setPage(0); };

  const filteredData = searchVal ? data.filter(row => Object.values(row).some(v => v != null && String(v).toLowerCase().includes(searchVal.toLowerCase()))) : data;
  return (<><Helmet><title>{titleURL} | Outstanding Ageing Summary</title></Helmet>
    <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, minHeight: 42, flexWrap: 'nowrap' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5, whiteSpace: 'nowrap' }}>Outstanding Ageing Summary</Typography>
        <Box sx={{ flex: 1 }} />
        <KpiCard label="Receivable" value={fmt(kpis.totalReceivable)} color="#C62828" />
        <KpiCard label="Payable" value={fmt(kpis.totalPayable)} color="#4527A0" />
        <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => { setSearchVal(e.target.value); setPage(0); }} />
        <FilterCreditNotes open={filterOpen} handleClose={setFilterOpen} from={null} to={null} locationFilter={locationFilter} onApply={handleFilterApply} onClear={handleFilterClear} count={locationFilter.length > 0 ? 1 : 0} />
        <Tooltip title="Export CSV"><IconButton onClick={async () => { try { const res = await ReportsService.getAgeingSummary({ location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null', pageCount: 0, numPerPage: 10000 }); const rows = res.data?.data || []; const exportRows = searchVal ? rows.filter(row => Object.values(row).some(v => v != null && String(v).toLowerCase().includes(searchVal.toLowerCase()))) : rows; ExportCsv(COLUMNS.map(c => ({ title: c.headerName, field: c.field })), exportRows, 'Outstanding_Ageing_Summary'); } catch(e) {} }}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
      </Box>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <DataGrid rows={filteredData} columns={COLUMNS} rowCount={rowCount} getRowId={(row) => `${row.type}-${row.party_name}`}
          paginationMode="server" paginationModel={{ page, pageSize }} onPaginationModelChange={(m) => { if (m.page !== page) setPage(m.page); if (m.pageSize !== pageSize) setPageSize(m.pageSize); }}
          pageSizeOptions={[50, 100, 200]} density="compact" disableRowSelectionOnClick loading={loading}
          slotProps={{ pagination: { showFirstButton: true, showLastButton: true } }}
          sx={{ border: 'none', height: '100%', '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 }, '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' }, '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' } }} />
      </Box>
    </Card></>);
}
