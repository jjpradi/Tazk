import React, { useState, useEffect, useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Card, Chip, IconButton, TextField, Tooltip, Typography } from '@mui/material';
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

function KpiCard({ label, value, color }) {
  return (
    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 70 }}>
      <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}

export default function ChequesNew() {
  const navigate = useNavigate();
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [rowCount, setRowCount] = useState(0);
  const [kpis, setKpis] = useState({});
  const [searchVal, setSearchVal] = useState('');
  const [fromDate, setFromDate] = useState(moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));

  const fetchData = async (p = 0, ps = 20) => {
    setLoading(true);
    try {
      const res = await ReportsService.getCheques({ pageCount: p, numPerPage: ps, fromDate, toDate });
      setData(res.data?.data || []);
      setRowCount(res.data?.numRows || 0);
      setKpis(res.data || {});
    } catch (err) { setData([]); setRowCount(0); }
    setLoading(false);
  };

  useEffect(() => { fetchData(page, pageSize); }, [page, pageSize, fromDate, toDate]);

  const columns = [{ field: 'company_name', headerName: 'Party', flex: 0.8, minWidth: 120 }, { field: 'type', headerName: 'Type', flex: 0.3, minWidth: 50 }, { field: 'cheque_number', headerName: 'Cheque #', flex: 0.5, minWidth: 90 }, { field: 'amount', headerName: 'Amount', flex: 0.4, minWidth: 70, align: 'right', headerAlign: 'right', renderCell: (p) => p.row?.amount ? `\u20B9${Number(p.row.amount).toLocaleString('en-IN')}` : '-' }, { field: 'invoice_number', headerName: 'Invoice #', flex: 0.5, minWidth: 90 }, { field: 'status', headerName: 'Status', flex: 0.4, minWidth: 80, renderCell: (p) => { const s = p.row?.status; const color = s === 'cleared' ? '#11C15B' : s === 'bounced' ? '#d32f2f' : '#E65100'; return React.createElement(Chip, { label: s || '-', size: 'small', sx: { fontSize: 9, height: 20, bgcolor: color + '15', color, fontWeight: 600 } }); } }, { field: 'date', headerName: 'Date', flex: 0.4, minWidth: 85, renderCell: (p) => p.row?.date ? moment(p.row.date).format('DD MMM YY') : '-' }, { field: 'description', headerName: 'Description', flex: 0.5, minWidth: 80 }];

  return (
    <>
      <Helmet><title>{titleURL} | Cheques Report</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, minHeight: 48, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5 }}>Cheques Report</Typography>
          <TextField type="date" size="small" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
            sx={{ width: 130, '& .MuiInputBase-input': { fontSize: 11, py: 0.5 } }} />
          <Typography sx={{ fontSize: 11, color: '#8C8C8C' }}>to</Typography>
          <TextField type="date" size="small" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(0); }}
            sx={{ width: 130, '& .MuiInputBase-input': { fontSize: 11, py: 0.5 } }} />
          <Box sx={{ flex: 1 }} />
          <KpiCard {{ label: 'Total', value: rowCount, color: '#2E3A59' }} />
          <KpiCard {{ label: 'Value', value: `\u20B9${Number(kpis.totalValue || 0).toLocaleString('en-IN'} /> <KpiCard {{ maximumFractionDigits: 0 })}`, color: '#0A8FDC' }} /> <KpiCard {{ label: 'Pending', value: kpis.pendingCount || 0, color: '#E65100' }} /> <KpiCard {{ label: 'Cleared', value: kpis.clearedCount || 0, color: '#11C15B' }} /> <KpiCard {{ label: 'Bounced', value: kpis.bouncedCount || 0, color: '#d32f2f' }} />
          <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => setSearchVal(e.target.value)} />
          <Tooltip title="Export CSV"><IconButton onClick={async () => {
            try { const r2 = await ReportsService.getCheques({ pageCount: 0, numPerPage: 100000, fromDate, toDate });
              ExportCsv(columns.map(c => ({ title: c.headerName, field: c.field })), r2.data?.data || [], 'Cheques_Report'); } catch(e) {}
          }}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DataGrid rows={data} columns={columns} rowCount={rowCount} getRowId={(row) => `${row.id}`}
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
