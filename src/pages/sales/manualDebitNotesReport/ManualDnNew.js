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

export default function ManualDnNew() {
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
      const res = await ReportsService.getManualDn({ pageCount: p, numPerPage: ps, fromDate, toDate });
      setData(res.data?.data || []);
      setRowCount(res.data?.numRows || 0);
      setKpis(res.data || {});
    } catch (err) { setData([]); setRowCount(0); }
    setLoading(false);
  };

  useEffect(() => { fetchData(page, pageSize); }, [page, pageSize, fromDate, toDate]);

  const columns = [{ field: 'sequence_number', headerName: 'DN #', flex: 0.5, minWidth: 100 }, { field: 'customer_name', headerName: 'Customer', flex: 0.7, minWidth: 100 }, { field: 'supplier_name', headerName: 'Supplier', flex: 0.7, minWidth: 100 }, { field: 'amount', headerName: 'Amount', flex: 0.5, minWidth: 80, align: 'right', headerAlign: 'right', renderCell: (p) => p.row?.amount ? `\u20B9${Number(p.row.amount).toLocaleString('en-IN')}` : '-' }, { field: 'gst_amount', headerName: 'GST', flex: 0.4, minWidth: 60, align: 'right', headerAlign: 'right' }, { field: 'reference', headerName: 'Ref', flex: 0.4, minWidth: 70 }, { field: 'date', headerName: 'Date', flex: 0.4, minWidth: 85, renderCell: (p) => p.row?.date ? moment(p.row.date).format('DD MMM YY') : '-' }];

  return (
    <>
      <Helmet><title>{titleURL} | Manual Debit Notes</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, minHeight: 48, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5 }}>Manual Debit Notes</Typography>
          <TextField type="date" size="small" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
            sx={{ width: 130, '& .MuiInputBase-input': { fontSize: 11, py: 0.5 } }} />
          <Typography sx={{ fontSize: 11, color: '#8C8C8C' }}>to</Typography>
          <TextField type="date" size="small" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(0); }}
            sx={{ width: 130, '& .MuiInputBase-input': { fontSize: 11, py: 0.5 } }} />
          <Box sx={{ flex: 1 }} />
          <KpiCard label='Total Notes' value={rowCount} color='#2E3A59' />
          <KpiCard label='Total Value' value={`\u20B9${Number(kpis.totalValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color='#E65100' />
          <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => setSearchVal(e.target.value)} />
          <Tooltip title="Export CSV"><IconButton onClick={async () => {
            try { const r2 = await ReportsService.getManualDn({ pageCount: 0, numPerPage: 100000, fromDate, toDate });
              ExportCsv(columns.map(c => ({ title: c.headerName, field: c.field })), r2.data?.data || [], 'Manual_Debit_Notes'); } catch(e) {}
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
