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
import FilterCreditNotes from '../returnCreditNotesReport/FilterCreditNotes';

function KpiCard({ label, value, color }) {
  return (
    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 80 }}>
      <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}

const r = (v) => v != null && v !== '' ? `\u20B9${Number(v).toLocaleString('en-IN')}` : '-';
const rc = (f) => ({ renderCell: (p) => r(p.row?.[f]) });

const AGE_COLORS = { '0-30': '#2E7D32', '31-60': '#E65100', '61-90': '#C62828', '90+': '#7B1FA2' };

const COLUMNS = [
  { field: 'invoice_number', headerName: 'Invoice #', flex: 0.4, minWidth: 110 },
  { field: 'invoice_date', headerName: 'Invoice Date', flex: 0.3, minWidth: 90 },
  { field: 'party_name', headerName: 'Customer', flex: 0.5, minWidth: 140 },
  { field: 'invoice_amount', headerName: 'Invoice Amt', flex: 0.35, minWidth: 95, align: 'right', headerAlign: 'right', ...rc('invoice_amount') },
  { field: 'received_amount', headerName: 'Received', flex: 0.35, minWidth: 85, align: 'right', headerAlign: 'right', ...rc('received_amount') },
  { field: 'outstanding', headerName: 'Outstanding', flex: 0.35, minWidth: 95, align: 'right', headerAlign: 'right',
    renderCell: (p) => { const v = p.row?.outstanding; return v ? <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#C62828' }}>{r(v)}</Typography> : '-'; }
  },
  { field: 'overdue_days', headerName: 'Overdue Days', flex: 0.25, minWidth: 75, align: 'right', headerAlign: 'right' },
  { field: 'ageing', headerName: 'Ageing', flex: 0.2, minWidth: 65,
    renderCell: (p) => { const a = p.row?.ageing; const c = AGE_COLORS[a] || '#555';
      return <Chip label={a || '-'} size="small" sx={{ fontSize: 9, height: 20, bgcolor: c + '15', color: c, fontWeight: 600 }} />;
    }
  },
  { field: 'due_date', headerName: 'Due Date', flex: 0.3, minWidth: 85 },
  { field: 'reference', headerName: 'Reference', flex: 0.3, minWidth: 80 },
  { field: 'location_name', headerName: 'Location', flex: 0.3, minWidth: 85 },
  { field: 'salesman_name', headerName: 'Salesman', flex: 0.35, minWidth: 100 },
];

const CHIPS = [
  { key: 'all', label: 'All' },
  { key: '0-30', label: '0-30 Days', color: '#2E7D32' },
  { key: '31-60', label: '31-60 Days', color: '#E65100' },
  { key: '61-90', label: '61-90 Days', color: '#C62828' },
  { key: '90+', label: '90+ Days', color: '#7B1FA2' },
];

export default function ReceivableNew() {
  const navigate = useNavigate();
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [rowCount, setRowCount] = useState(0);
  const [kpis, setKpis] = useState({});
  const [searchVal, setSearchVal] = useState('');
  const [ageFilter, setAgeFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState([]);
  const filterCount = (locationFilter.length > 0 ? 1 : 0);

  const fetchData = async (p = 0, ps = 20, af = ageFilter) => {
    if (!headerLocationId) return;
    setLoading(true);
    try {
      const payload = { location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null', pageCount: p, numPerPage: ps, ageFilter: af };
      const res = await ReportsService.getReceivable(payload);
      setData(res.data?.data || []); setRowCount(res.data?.numRows || 0); setKpis(res.data || {});
    } catch (err) { setData([]); setRowCount(0); }
    setLoading(false);
  };

  useEffect(() => { if (headerLocationId) fetchData(page, pageSize, ageFilter); }, [page, pageSize, headerLocationId, locationFilter, ageFilter]);

  const handleChipChange = (key) => { setData([]); setPage(0); setAgeFilter(key); };

  const handleFilterApply = ({ locations }) => {
    setLocationFilter(locations || []);
    setPage(0);
  };
  const handleFilterClear = () => { setLocationFilter([]); setPage(0); };

  const handleExport = async () => {
    try { const res = await ReportsService.getReceivable({ location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : 'null', pageCount: 0, numPerPage: 100000, ageFilter: ageFilter });
      ExportCsv(COLUMNS.map(c => ({ title: c.headerName, field: c.field })), res.data?.data || [], 'Receivable_Report'); } catch (e) {}
  };

  const fmt = (v) => `\u20B9${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const filteredData = searchVal
    ? data.filter(row => {
      const search = searchVal.toLowerCase();

      return Object.values(row).some(value => {
        if (value === null || value === undefined) return false;

        let valStr = '';

        if (typeof value === 'object') {
          valStr = JSON.stringify(value);
        } else {
          valStr = String(value);
        }

        return valStr.toLowerCase().includes(search);
      });
    })
    : data;
  return (
    <>
      <Helmet><title>{titleURL} | Receivable Report</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, minHeight: 42, flexWrap: 'nowrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5, whiteSpace: 'nowrap' }}>Receivable Report</Typography>
          {CHIPS.map((c) => (
            <Chip key={c.key} label={c.label} size="small"
              variant={ageFilter === c.key ? 'filled' : 'outlined'}
              color={ageFilter === c.key ? 'primary' : 'default'}
              onClick={() => handleChipChange(c.key)}
              sx={{ fontSize: 10, height: 22 }} />
          ))}
          <Box sx={{ flex: 1 }} />
          <KpiCard label="Invoices" value={kpis.totalCount || 0} color="#2E3A59" />
          <KpiCard label="Outstanding" value={fmt(kpis.totalOutstanding)} color="#C62828" />
          <KpiCard label="0-30 Days" value={fmt(kpis.age0_30)} color="#2E7D32" />
          <KpiCard label="31-60 Days" value={fmt(kpis.age31_60)} color="#E65100" />
          <KpiCard label="61-90 Days" value={fmt(kpis.age61_90)} color="#C62828" />
          <KpiCard label="90+ Days" value={fmt(kpis.age90plus)} color="#7B1FA2" />
          <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => { setSearchVal(e.target.value); setPage(0); }} />
          <FilterCreditNotes open={filterOpen} handleClose={setFilterOpen} from={null} to={null} locationFilter={locationFilter} onApply={handleFilterApply} onClear={handleFilterClear} count={filterCount} />
          <Tooltip title="Export CSV"><IconButton onClick={handleExport}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DataGrid rows={filteredData} columns={COLUMNS} rowCount={rowCount} getRowId={(row) => `${row.id}`}
            paginationMode="server" paginationModel={{ page, pageSize }}
            onPaginationModelChange={(m) => { if (m.page !== page) setPage(m.page); if (m.pageSize !== pageSize) setPageSize(m.pageSize); }}
            pageSizeOptions={[50, 100, 200, 500]} density="compact" disableRowSelectionOnClick slotProps={{ pagination: { showFirstButton: true, showLastButton: true } }} loading={loading}
            sx={{ border: 'none', height: '100%', '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 }, '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' }, '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' } }} />
        </Box>
      </Card>
    </>
  );
}
