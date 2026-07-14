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

function KpiCard({ label, value, color }) {
  return (<Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 70 }}>
    <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
    <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
  </Box>);
}

const fmt = (v) => '\u20B9' + Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const rfmt = (v) => v != null && v !== '' && Number(v) !== 0 ? '\u20B9' + Number(v).toLocaleString('en-IN') : '-';
const rc = (f) => ({ renderCell: (p) => rfmt(p.row?.[f]) });

const SEVERITY_COLORS = { critical: '#C62828', warning: '#E65100', info: '#1565C0' };
const ISSUE_COLORS = { 'Zero Cost Sale': '#C62828', 'Zero Cost Stock': '#E65100', 'Cost > MRP': '#7B1FA2' };

const COLUMNS = [
  { field: 'issue_type', headerName: 'Issue', flex: 0.3, minWidth: 100,
    renderCell: (p) => { const t = p.row?.issue_type; const c = ISSUE_COLORS[t] || '#555';
      return <Chip label={t || '-'} size="small" sx={{ fontSize: 9, height: 20, bgcolor: c + '15', color: c, fontWeight: 600 }} />; }
  },
  { field: 'severity', headerName: 'Severity', flex: 0.2, minWidth: 65,
    renderCell: (p) => { const s = p.row?.severity; const c = SEVERITY_COLORS[s] || '#555';
      return <Chip label={s || '-'} size="small" sx={{ fontSize: 8, height: 18, bgcolor: c + '15', color: c, fontWeight: 600 }} />; }
  },
  { field: 'product_name', headerName: 'Product', flex: 0.5, minWidth: 150 },
  { field: 'brand', headerName: 'Brand', flex: 0.25, minWidth: 70 },
  { field: 'category', headerName: 'Category', flex: 0.25, minWidth: 75 },
  { field: 'location_name', headerName: 'Location', flex: 0.25, minWidth: 75 },
  { field: 'lot_number', headerName: 'Lot #', flex: 0.3, minWidth: 90 },
  { field: 'qty', headerName: 'Qty', flex: 0.15, minWidth: 45, align: 'right', headerAlign: 'right' },
  { field: 'cost_price', headerName: 'Cost', flex: 0.25, minWidth: 75, align: 'right', headerAlign: 'right', ...rc('cost_price') },
  { field: 'selling_price', headerName: 'Sell Price', flex: 0.25, minWidth: 75, align: 'right', headerAlign: 'right', ...rc('selling_price') },
  { field: 'impact_amount', headerName: 'Impact', flex: 0.3, minWidth: 85, align: 'right', headerAlign: 'right',
    renderCell: (p) => { const v = p.row?.impact_amount; if (!v) return '-';
      return <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#C62828' }}>{rfmt(v)}</Typography>; }
  },
  { field: 'source', headerName: 'Source', flex: 0.3, minWidth: 90 },
];

const CHIPS = [
  { key: 'all', label: 'All Issues' },
  { key: 'Zero Cost Stock', label: 'Zero Cost Stock', color: '#E65100' },
  { key: 'Zero Cost Sale', label: 'Zero Cost Sales', color: '#C62828' },
  { key: 'Cost > MRP', label: 'Cost > MRP', color: '#7B1FA2' },
  { key: 'Inconsistent Cost', label: 'Inconsistent Cost', color: '#1565C0' },
];

export default function DataQualityNew() {
  const navigate = useNavigate();
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [data, setData] = useState([]); const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); const [pageSize, setPageSize] = useState(50);
  const [rowCount, setRowCount] = useState(0); const [kpis, setKpis] = useState({});
  const [searchVal, setSearchVal] = useState('');
  const [issueFilter, setIssueFilter] = useState('all');
  const [allData, setAllData] = useState([]);

  const fetchData = async (p = 0, ps = 500) => {
    if (!headerLocationId) return; setLoading(true);
    try { const res = await ReportsService.getDataQuality({ pageCount: p, numPerPage: ps });
      const d = res.data?.data || [];
      setAllData(d);
      setData(d);
      setIssueFilter('all');
      setRowCount(d.length); setKpis(res.data || {}); } catch (err) { setData([]); setRowCount(0); } setLoading(false);
  };

  const handleChipChange = (key) => {
    setIssueFilter(key);
    const filtered = key === 'all' ? allData : allData.filter(r => r.issue_type === key);
    setData(filtered);
    setRowCount(filtered.length);
  };

  useEffect(() => { if (headerLocationId) fetchData(page, pageSize); }, [headerLocationId]);

  const filteredData = searchVal ? data.filter(row => Object.values(row).some(v => v != null && String(v).toLowerCase().includes(searchVal.toLowerCase()))) : data;
  return (<><Helmet><title>{titleURL} | Data Quality</title></Helmet>
    <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, minHeight: 42, flexWrap: 'nowrap' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5, whiteSpace: 'nowrap' }}>Data Quality Dashboard</Typography>
        {CHIPS.map((c) => (
          <Chip key={c.key} label={c.label} size="small"
            variant={issueFilter === c.key ? 'filled' : 'outlined'}
            color={issueFilter === c.key ? 'primary' : 'default'}
            onClick={() => handleChipChange(c.key)}
            sx={{ fontSize: 10, height: 22 }} />
        ))}
        <Box sx={{ flex: 1 }} />
        <KpiCard label="Zero Cost Stock" value={kpis.zeroCostStockCount || 0} color="#E65100" />
        <KpiCard label="Zero Cost Sales" value={kpis.zeroCostSalesCount || 0} color="#C62828" />
        <KpiCard label="False Profit" value={fmt(kpis.falseProfitAmount)} color="#C62828" />
        <KpiCard label="Cost > MRP" value={kpis.costAboveMrpCount || 0} color="#7B1FA2" />
        <KpiCard label="Inconsistent Cost" value={kpis.inconsistentCostCount || 0} color="#E65100" />
        <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => setSearchVal(e.target.value)} />
        <Tooltip title="Export CSV"><IconButton onClick={async () => { try { const res = await ReportsService.getDataQuality({ pageCount: 0, numPerPage: 10000 }); ExportCsv(COLUMNS.map(c => ({ title: c.headerName, field: c.field })), res.data?.data || [], 'Data_Quality_Report'); } catch(e) {} }}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
      </Box>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <DataGrid rows={filteredData} columns={COLUMNS} getRowId={(row) => `${row.issue_type}_${row.product_name}_${row.lot_number}_${Math.random()}`}
          initialState={{ pagination: { paginationModel: { pageSize: 100 } } }}
          pageSizeOptions={[50, 100, 200]} density="compact" disableRowSelectionOnClick slotProps={{ pagination: { showFirstButton: true, showLastButton: true } }} loading={loading}
          sx={{ border: 'none', height: '100%', '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 }, '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' }, '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' } }} />
      </Box>
    </Card></>);
}
