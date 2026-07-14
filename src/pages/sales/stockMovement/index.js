import React, { useState, useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Card, Chip, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import CommonSearch from 'utils/commonSearch';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import ReportsService from '../../../services/reports_services';
import { titleURL } from 'http-common';
import { ExportCsv } from '@material-table/exporters';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

function KpiCard({ label, value, color }) {
  return (
    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 80 }}>
      <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}

export default function StockMovementReport() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const storage = getsessionStorage();
  const selectedRole = storage?.role_name;

  const [data, setData] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [rowCount, setRowCount] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const [kpis, setKpis] = useState({ totalIn: 0, totalOut: 0, totalValue: 0, totalTransactions: 0 });
  const [selectedType, setSelectedType] = useState('');
  const [fromDate, setFromDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));

  const fetchData = async (pageNum = 0, pageSz = 20) => {
    if (!headerLocationId) return;
    setLoading(true);
    try {
      const res = await ReportsService.getStockMovement({
        location_id: headerLocationId, pageCount: pageNum, numPerPage: pageSz,
        fromDate, toDate, movementType: selectedType,
      });
      setData(res.data?.data || []);
      setSummary(res.data?.summary || []);
      setRowCount(res.data?.totalTransactions || 0);
      setKpis({
        totalIn: res.data?.totalIn || 0,
        totalOut: res.data?.totalOut || 0,
        totalValue: res.data?.totalValue || 0,
        totalTransactions: res.data?.totalTransactions || 0,
      });
    } catch (err) { console.error(err); setData([]); setRowCount(0); }
    setLoading(false);
  };

  useEffect(() => { dispatch(getMenuAccessAction(selectedRole)); }, []);
  useEffect(() => { if (headerLocationId) fetchData(page, pageSize); }, [page, pageSize, headerLocationId, fromDate, toDate, selectedType]);

  const chipTypes = [
    { key: '', label: 'All' },
    { key: 'Purchase', label: 'Purchase' },
    { key: 'sales', label: 'Sales' },
    { key: 'sales return', label: 'Returns' },
    { key: 'transfered', label: 'Transfer' },
    { key: 'deliverychallan', label: 'DC' },
    { key: 'Stock Upload', label: 'Upload' },
  ];

  const columns = [
    { field: 'product_name', headerName: 'Product Name', flex: 1, minWidth: 150 },
    { field: 'category', headerName: 'Category', flex: 0.5, minWidth: 80, sortable: false },
    { field: 'brand', headerName: 'Brand', flex: 0.5, minWidth: 80 },
    { field: 'location', headerName: 'Location', flex: 0.5, minWidth: 80, sortable: false },
    { field: 'movement_type', headerName: 'Type', flex: 0.5, minWidth: 90,
      renderCell: (p) => {
        const t = p.row?.movement_type;
        const color = t === 'Purchase' ? '#0A8FDC' : t === 'sales' || t === 'POS' ? '#11C15B' : t === 'sales return' ? '#7C4DFF' : t === 'transfered' ? '#FF8B3E' : '#8C8C8C';
        return <Chip label={t || '-'} size="small" sx={{ fontSize: 9, height: 20, bgcolor: `${color}15`, color, fontWeight: 600 }} />;
      }
    },
    { field: 'qty', headerName: 'Qty', flex: 0.3, minWidth: 60, align: 'right', headerAlign: 'right',
      renderCell: (p) => {
        const q = p.row?.qty;
        const color = q > 0 ? '#11C15B' : q < 0 ? '#d32f2f' : '#2E3A59';
        return <Typography sx={{ fontSize: 12, fontWeight: 600, color }}>{q}</Typography>;
      }
    },
    { field: 'cost_price', headerName: 'Cost', flex: 0.4, minWidth: 70, align: 'right', headerAlign: 'right',
      renderCell: (p) => p.row?.cost_price ? `\u20B9${Number(p.row.cost_price).toLocaleString('en-IN')}` : '-' },
    { field: 'value', headerName: 'Value', flex: 0.4, minWidth: 80, align: 'right', headerAlign: 'right',
      renderCell: (p) => p.row?.value ? `\u20B9${Number(p.row.value).toLocaleString('en-IN')}` : '-' },
    { field: 'trans_date', headerName: 'Date', flex: 0.5, minWidth: 90,
      renderCell: (p) => p.row?.trans_date ? moment(p.row.trans_date).format('DD MMM YY HH:mm') : '-' },
  ];

  return (
    <>
      <Helmet><title>{titleURL} | Stock Movement</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, minHeight: 48, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5 }}>Stock Movement</Typography>

          {/* Date range */}
          <TextField type="date" size="small" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
            sx={{ width: 130, '& .MuiInputBase-input': { fontSize: 11, py: 0.5 } }} />
          <Typography sx={{ fontSize: 11, color: '#8C8C8C' }}>to</Typography>
          <TextField type="date" size="small" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(0); }}
            sx={{ width: 130, '& .MuiInputBase-input': { fontSize: 11, py: 0.5 } }} />

          {/* Type chips */}
          <Stack direction="row" spacing={0.5}>
            {chipTypes.map(c => (
              <Chip key={c.key} label={c.label} clickable size="small"
                color={selectedType === c.key ? 'primary' : 'default'}
                variant={selectedType === c.key ? 'filled' : 'outlined'}
                onClick={() => { setSelectedType(c.key); setPage(0); }}
                sx={{ borderRadius: '6px', fontSize: 11, height: 26 }} />
            ))}
          </Stack>

          <Box sx={{ flex: 1 }} />

          <KpiCard label="Transactions" value={Number(kpis.totalTransactions).toLocaleString('en-IN')} color="#2E3A59" />
          <KpiCard label="Stock In" value={Number(kpis.totalIn).toLocaleString('en-IN')} color="#11C15B" />
          <KpiCard label="Stock Out" value={Number(kpis.totalOut).toLocaleString('en-IN')} color="#d32f2f" />
          <KpiCard label="Value" value={`\u20B9${Number(kpis.totalValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="#0A8FDC" />

          <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => setSearchVal(e.target.value)} />
          <Tooltip title="Export CSV"><IconButton onClick={async () => {
            try { const res = await ReportsService.getStockMovement({ location_id: headerLocationId, pageCount: 0, numPerPage: 10000, fromDate, toDate, movementType: selectedType });
              ExportCsv(columns.map(c => ({ title: c.headerName, field: c.field })), res.data?.data || [], 'Stock_Movement');
            } catch (e) {}
          }}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        </Box>

        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DataGrid rows={data} columns={columns} rowCount={rowCount}
            getRowId={(row) => `${row.trans_id}`}
            paginationMode="server" paginationModel={{ page, pageSize }}
            onPaginationModelChange={(m) => { if (m.page !== page) setPage(m.page); if (m.pageSize !== pageSize) setPageSize(m.pageSize); }}
            pageSizeOptions={[20, 50, 100]} density="compact" disableRowSelectionOnClick loading={loading}
            sx={{ border: 'none', height: '100%',
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 },
              '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' },
              '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' } }} />
        </Box>
      </Card>
    </>
  );
}
