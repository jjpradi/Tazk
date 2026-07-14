import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box, Card, IconButton, Tooltip, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, TextField, MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import { Helmet } from 'react-helmet-async';
import { ExportCsv } from '@material-table/exporters';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import CommonSearch from 'utils/commonSearch';
import ReportsService from '../../../services/reports_services';
import { titleURL } from 'http-common';
import FilterCreditNotes from '../../sales/returnCreditNotesReport/FilterCreditNotes';

const fmt = (v) => {
  if (v == null) return '';
  const num = Number(v);
  if (num === 0) return '-';
  const prefix = num < 0 ? '-' : '';
  return prefix + '\u20B9' + Math.abs(Math.round(num)).toLocaleString('en-IN');
};
const amtColor = (v) => Number(v) < 0 ? '#C62828' : '#2E3A59';

const DAY_CHIPS = [
  { key: 'fy', label: 'Current FY' },
  { key: 'lastfy', label: 'Last FY' },
  { key: 'q1', label: 'Q1' },
  { key: 'q2', label: 'Q2' },
  { key: 'q3', label: 'Q3' },
  { key: 'q4', label: 'Q4' },
  { key: 'month', label: 'This Month' },
];

function getFYDates(key) {
  const now = moment();
  const fyStart = now.month() >= 3 ? moment().month(3).startOf('month') : moment().subtract(1, 'year').month(3).startOf('month');
  switch (key) {
    case 'fy': return { from: fyStart.format('YYYY-MM-DD'), to: now.format('YYYY-MM-DD') };
    case 'lastfy': { const s = fyStart.clone().subtract(1, 'year'); return { from: s.format('YYYY-MM-DD'), to: s.clone().add(1, 'year').subtract(1, 'day').format('YYYY-MM-DD') }; }
    case 'q1': return { from: fyStart.format('YYYY-MM-DD'), to: fyStart.clone().add(3, 'months').subtract(1, 'day').format('YYYY-MM-DD') };
    case 'q2': return { from: fyStart.clone().add(3, 'months').format('YYYY-MM-DD'), to: fyStart.clone().add(6, 'months').subtract(1, 'day').format('YYYY-MM-DD') };
    case 'q3': return { from: fyStart.clone().add(6, 'months').format('YYYY-MM-DD'), to: fyStart.clone().add(9, 'months').subtract(1, 'day').format('YYYY-MM-DD') };
    case 'q4': return { from: fyStart.clone().add(9, 'months').format('YYYY-MM-DD'), to: fyStart.clone().add(1, 'year').subtract(1, 'day').format('YYYY-MM-DD') };
    case 'month': return { from: now.startOf('month').format('YYYY-MM-DD'), to: now.endOf('month').format('YYYY-MM-DD') };
    default: return { from: fyStart.format('YYYY-MM-DD'), to: now.format('YYYY-MM-DD') };
  }
}

const LIST_COLUMNS = [
  { field: 'account_type', headerName: 'Account Type', flex: 0.3, minWidth: 100 },
  { field: 'group_name', headerName: 'Account Group', flex: 0.3, minWidth: 110 },
  { field: 'parent_account_name', headerName: 'Parent', flex: 0.3, minWidth: 120 },
  { field: 'account_name', headerName: 'Ledger Name', flex: 0.4, minWidth: 180,
    renderCell: (p) => <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography sx={{ fontSize: 12, color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>{p.value}</Typography>
      {p.row.is_linked && <Tooltip title={`Linked ${p.row.linked_type}: ${p.row.linked_name}`}><LinkIcon sx={{ fontSize: 14, color: '#9C27B0' }} /></Tooltip>}
    </Box>
  },
  { field: 'total_debit', headerName: 'Debit', flex: 0.25, minWidth: 100, align: 'right', headerAlign: 'right',
    renderCell: (p) => <Typography sx={{ fontSize: 12, fontFamily: 'monospace', color: amtColor(p.value) }}>{fmt(p.value)}</Typography> },
  { field: 'total_credit', headerName: 'Credit', flex: 0.25, minWidth: 100, align: 'right', headerAlign: 'right',
    renderCell: (p) => <Typography sx={{ fontSize: 12, fontFamily: 'monospace', color: amtColor(p.value) }}>{fmt(p.value)}</Typography> },
  { field: 'closing_balance', headerName: 'Closing Balance', flex: 0.3, minWidth: 120, align: 'right', headerAlign: 'right',
    renderCell: (p) => <Typography sx={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: amtColor(p.value) }}>{fmt(p.value)}</Typography> },
];

const cx = { py: 0.3, px: 1.5, fontSize: '0.78rem', borderBottom: '1px solid #f0f0f0' };

// Inline ledger detail view
const LedgerDetail = ({ ledger, fromDate, toDate, onBack, onContraClick }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await ReportsService.getGeneralLedgerDetail({
          accountId: ledger.account_id,
          contactId: ledger.contact_id,
          contactType: ledger.contact_type,
          fromDate, toDate,
        });
        setData(res.data);
      } catch (e) { setData(null); }
      setLoading(false);
    })();
  }, [ledger, fromDate, toDate]);

  if (loading) return <Typography sx={{ textAlign: 'center', py: 6, color: '#999' }}>Loading...</Typography>;
  if (!data) return <Typography sx={{ textAlign: 'center', py: 6, color: '#999' }}>No data</Typography>;

  const rows = data.data || [];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, borderBottom: '1px solid #E8EDF5' }}>
        <IconButton size="small" onClick={onBack}><ArrowBackIcon sx={{ fontSize: 20 }} /></IconButton>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#2E3A59' }}>{ledger.account_name}</Typography>
        {ledger.contact_type && <Chip label={ledger.contact_type} size="small" sx={{ fontSize: 9, height: 18 }} />}
        {data.linked && <Chip icon={<LinkIcon sx={{ fontSize: 12 }} />} label={`Linked ${data.linked.type}: ${data.linked.name}`} size="small" sx={{ fontSize: 9, height: 20, bgcolor: '#F3E5F5', color: '#7B1FA2' }} />}
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography sx={{ fontSize: 11, color: '#666' }}>Total Debit: <b style={{ color: '#2E3A59' }}>{fmt(data.totalDebit)}</b></Typography>
          <Typography sx={{ fontSize: 11, color: '#666' }}>Total Credit: <b style={{ color: '#2E3A59' }}>{fmt(data.totalCredit)}</b></Typography>
          <Typography sx={{ fontSize: 11, color: '#666' }}>Closing: <b style={{ color: amtColor(data.closingBalance) }}>{fmt(data.closingBalance)}</b></Typography>
        </Box>
        <Tooltip title="Export CSV"><IconButton size="small" onClick={() => {
          const csvData = [
            { date: 'Opening Balance', source: '', voucher_type: '', narration: '', debit: '', credit: '', balance: data.openingBalance },
            ...rows.map(r => ({ date: moment(r.date).format('DD/MM/YYYY'), source: r.source === 'customer' ? 'Sale' : r.source === 'vendor' ? 'Purchase' : '', voucher_type: r.voucher_type, narration: r.narration, debit: r.debit, credit: r.credit, balance: r.running_balance })),
            { date: 'Closing Balance', source: '', voucher_type: '', narration: '', debit: data.totalDebit, credit: data.totalCredit, balance: data.closingBalance },
          ];
          const csvCols = [
            { title: 'Date', field: 'date' },
            ...(data.linked ? [{ title: 'Source', field: 'source' }] : []),
            { title: 'Type', field: 'voucher_type' }, { title: 'Narration', field: 'narration' },
            { title: 'Debit', field: 'debit' }, { title: 'Credit', field: 'credit' }, { title: 'Balance', field: 'balance' },
          ];
          ExportCsv(csvCols, csvData, `Ledger_${ledger.account_name}`);
        }}><FileDownloadIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
      </Box>

      {/* Transaction table */}
      <Box sx={{ flex: 1, overflow: 'auto', mt: 0.5 }}>
        <TableContainer>
          <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.3 } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F4F7FE' }}>
                <TableCell sx={{ ...cx, fontWeight: 700, fontSize: '0.7rem', width: data.linked ? '9%' : '10%' }}>DATE</TableCell>
                {data.linked && <TableCell sx={{ ...cx, fontWeight: 700, fontSize: '0.7rem', width: '7%' }}>SOURCE</TableCell>}
                <TableCell sx={{ ...cx, fontWeight: 700, fontSize: '0.7rem', width: '12%' }}>PARTICULARS</TableCell>
                <TableCell sx={{ ...cx, fontWeight: 700, fontSize: '0.7rem', width: data.linked ? '10%' : '12%' }}>TYPE</TableCell>
                <TableCell sx={{ ...cx, fontWeight: 700, fontSize: '0.7rem', width: data.linked ? '22%' : '26%' }}>NARRATION</TableCell>
                <TableCell align="right" sx={{ ...cx, fontWeight: 700, fontSize: '0.7rem', width: '13%' }}>DEBIT</TableCell>
                <TableCell align="right" sx={{ ...cx, fontWeight: 700, fontSize: '0.7rem', width: '13%' }}>CREDIT</TableCell>
                <TableCell align="right" sx={{ ...cx, fontWeight: 700, fontSize: '0.7rem', width: '14%' }}>BALANCE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Opening Balance */}
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ ...cx, fontWeight: 600 }} colSpan={data.linked ? 5 : 4}>Opening Balance</TableCell>
                <TableCell sx={cx} />
                <TableCell sx={cx} />
                <TableCell align="right" sx={{ ...cx, fontWeight: 600, fontFamily: 'monospace', color: amtColor(data.openingBalance) }}>{fmt(data.openingBalance)}</TableCell>
              </TableRow>

              {rows.map((row, idx) => (
                <TableRow key={row.txn_id + '_' + idx} hover sx={{ '&:hover': { bgcolor: '#FAFBFF' } }}>
                  <TableCell sx={cx}>{moment(row.date).format('DD/MM/YY')}</TableCell>
                  {data.linked && <TableCell sx={{ ...cx, fontSize: '0.7rem' }}>
                    <Chip label={row.source === 'customer' ? 'Sale' : row.source === 'vendor' ? 'Purchase' : '-'} size="small"
                      sx={{ fontSize: 9, height: 16, bgcolor: row.source === 'customer' ? '#E8F5E9' : row.source === 'vendor' ? '#FFF3E0' : '#F5F5F5',
                        color: row.source === 'customer' ? '#2E7D32' : row.source === 'vendor' ? '#E65100' : '#999' }} />
                  </TableCell>}
                  <TableCell sx={{ ...cx, fontSize: '0.73rem' }}>
                    {(row.contra_account || '').split(', ').filter(Boolean).map((name, ci) => (
                      <Typography key={ci} component="span" onClick={() => onContraClick && onContraClick(name.trim())}
                        sx={{ fontSize: '0.73rem', color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, mr: 0.5 }}>
                        {name.trim()}{ci < (row.contra_account || '').split(', ').filter(Boolean).length - 1 ? ',' : ''}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell sx={{ ...cx, fontSize: '0.73rem' }}>{row.voucher_type}</TableCell>
                  <TableCell sx={{ ...cx, fontSize: '0.73rem', color: '#555' }}>{row.narration}</TableCell>
                  <TableCell align="right" sx={{ ...cx, fontFamily: 'monospace', color: row.debit > 0 ? '#2E3A59' : '#999' }}>{row.debit > 0 ? fmt(row.debit) : '-'}</TableCell>
                  <TableCell align="right" sx={{ ...cx, fontFamily: 'monospace', color: row.credit > 0 ? '#2E3A59' : '#999' }}>{row.credit > 0 ? fmt(row.credit) : '-'}</TableCell>
                  <TableCell align="right" sx={{ ...cx, fontFamily: 'monospace', fontWeight: 500, color: amtColor(row.running_balance) }}>{fmt(row.running_balance)}</TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow><TableCell colSpan={data.linked ? 8 : 7} sx={{ ...cx, textAlign: 'center', py: 3, color: '#999' }}>No transactions</TableCell></TableRow>
              )}

              {/* Closing Balance */}
              <TableRow sx={{ bgcolor: '#F4F7FE' }}>
                <TableCell sx={{ ...cx, fontWeight: 700, borderTop: '2px solid #E8EDF5' }} colSpan={data.linked ? 5 : 4}>Closing Balance</TableCell>
                <TableCell align="right" sx={{ ...cx, fontWeight: 700, fontFamily: 'monospace', borderTop: '2px solid #E8EDF5' }}>{fmt(data.totalDebit)}</TableCell>
                <TableCell align="right" sx={{ ...cx, fontWeight: 700, fontFamily: 'monospace', borderTop: '2px solid #E8EDF5' }}>{fmt(data.totalCredit)}</TableCell>
                <TableCell align="right" sx={{ ...cx, fontWeight: 700, fontFamily: 'monospace', borderTop: '2px solid #E8EDF5', color: amtColor(data.closingBalance) }}>{fmt(data.closingBalance)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default function GeneralLedgerNew() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [activeChip, setActiveChip] = useState('fy');
  const [fromDate, setFromDate] = useState(getFYDates('fy').from);
  const [toDate, setToDate] = useState(getFYDates('fy').to);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [accTypeFilter, setAccTypeFilter] = useState('');
  const [accGroupFilter, setAccGroupFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ReportsService.getGeneralLedgerList({ fromDate, toDate });
      setData(res.data?.data || []);
    } catch (err) { setData([]); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [fromDate, toDate]);

  const handleChip = (key) => { setActiveChip(key); const d = getFYDates(key); setFromDate(d.from); setToDate(d.to); };
  const handleFilterApply = ({ from, to }) => { if (from) setFromDate(from); if (to) setToDate(to); setActiveChip(null); };
  const handleFilterClear = () => { setActiveChip('fy'); const d = getFYDates('fy'); setFromDate(d.from); setToDate(d.to); };

  // KPI tiles — closing balance by account type (always show all 5)
  const ACCOUNT_TYPES = ['Assets', 'Liabilities', 'Equity', 'Revenue/Income', 'Expense/Cost'];
  const kpis = React.useMemo(() => {
    const byType = {};
    ACCOUNT_TYPES.forEach(t => { byType[t] = 0; });
    data.forEach(r => {
      const t = r.account_type || 'Other';
      byType[t] = (byType[t] || 0) + (r.closing_balance || 0);
    });
    return byType;
  }, [data]);

  // Unique account types and groups for filter dropdowns
  const accountTypes = React.useMemo(() => [...new Set(data.map(r => r.account_type).filter(Boolean))].sort(), [data]);
  const accountGroups = React.useMemo(() => {
    const filtered = accTypeFilter ? data.filter(r => r.account_type === accTypeFilter) : data;
    return [...new Set(filtered.map(r => r.group_name).filter(Boolean))].sort();
  }, [data, accTypeFilter]);

  const filteredData = React.useMemo(() => {
    let result = data;
    if (accTypeFilter) result = result.filter(r => r.account_type === accTypeFilter);
    if (accGroupFilter) result = result.filter(r => r.group_name === accGroupFilter);
    if (searchVal) result = result.filter(row => Object.values(row).some(v => v != null && String(v).toLowerCase().includes(searchVal.toLowerCase())));
    return result;
  }, [data, accTypeFilter, accGroupFilter, searchVal]);

  const handleRowClick = (params) => {
    setSelectedLedger(params.row);
  };

  // If a ledger is selected, show inline detail
  if (selectedLedger) {
    return (
      <>
        <Helmet><title>{titleURL} | Ledger - {selectedLedger.account_name}</title></Helmet>
        <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
          <LedgerDetail
            ledger={selectedLedger}
            fromDate={fromDate}
            toDate={toDate}
            onBack={() => setSelectedLedger(null)}
            onContraClick={(name) => {
              const found = data.find(r => r.account_name === name);
              if (found) setSelectedLedger(found);
            }}
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <Helmet><title>{titleURL} | General Ledger</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, flexWrap: 'nowrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5, whiteSpace: 'nowrap' }}>General Ledger</Typography>
          {DAY_CHIPS.map(c => (
            <Chip key={c.key} label={c.label} size="small"
              variant={activeChip === c.key ? 'filled' : 'outlined'}
              color={activeChip === c.key ? 'primary' : 'default'}
              onClick={() => handleChip(c.key)} sx={{ fontSize: 10, height: 22 }} />
          ))}
          <Typography sx={{ fontSize: 10, color: '#8C8C8C', whiteSpace: 'nowrap' }}>
            {moment(fromDate).format('DD MMM YY')} - {moment(toDate).format('DD MMM YY')}
          </Typography>
          <Box sx={{ flex: 1 }} />
          {Object.entries(kpis).map(([type, bal]) => (
            <Box key={type} sx={{ px: 1, py: 0.3, borderRadius: 1.5, bgcolor: accTypeFilter === type ? '#E3F2FD' : '#F8FAFC', border: accTypeFilter === type ? '1px solid #1976d2' : '1px solid #E8EDF5', textAlign: 'center', minWidth: 75, cursor: 'pointer', '&:hover': { bgcolor: '#EEF1F8' } }}
              onClick={() => { setAccTypeFilter(accTypeFilter === type ? '' : type); setAccGroupFilter(''); }}>
              <Typography sx={{ fontSize: 8, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{type}</Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: amtColor(bal), lineHeight: 1.3 }}>{fmt(bal)}</Typography>
            </Box>
          ))}
          {accTypeFilter && (
            <Chip label={`× ${accTypeFilter}`} size="small" onDelete={() => { setAccTypeFilter(''); setAccGroupFilter(''); }} sx={{ fontSize: 9, height: 18 }} />
          )}
          <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => setSearchVal(e.target.value)} />
          <FilterCreditNotes open={filterOpen} handleClose={setFilterOpen} from={fromDate} to={toDate} locationFilter={[]} onApply={handleFilterApply}
            onClear={() => { handleFilterClear(); setAccTypeFilter(''); setAccGroupFilter(''); }}
            count={(accTypeFilter ? 1 : 0) + (accGroupFilter ? 1 : 0)}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField select fullWidth size="small" label="Account Type" variant="filled" value={accTypeFilter}
                onChange={(e) => { setAccTypeFilter(e.target.value); setAccGroupFilter(''); }}>
                <MenuItem value="">All Types</MenuItem>
                {accountTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField select fullWidth size="small" label="Account Group" variant="filled" value={accGroupFilter}
                onChange={(e) => setAccGroupFilter(e.target.value)}>
                <MenuItem value="">All Groups</MenuItem>
                {accountGroups.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Box>
          </FilterCreditNotes>
          <Tooltip title="Export CSV"><IconButton onClick={() => {
            ExportCsv(LIST_COLUMNS.map(c => ({ title: c.headerName, field: c.field })), filteredData, `General_Ledger_${fromDate}_${toDate}`);
          }}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DataGrid rows={filteredData} columns={LIST_COLUMNS} getRowId={(row) => row.account_id}
            pageSizeOptions={[50, 100, 200, 500]} density="compact" disableRowSelectionOnClick loading={loading}
            onRowClick={handleRowClick}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            slotProps={{ pagination: { showFirstButton: true, showLastButton: true, SelectProps: { MenuProps: { disablePortal: false } } } }}
            sx={{
              border: 'none', height: '100%', cursor: 'pointer',
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 },
              '& .MuiDataGrid-cell': { fontSize: 12 },
              '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' },
              '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' },
            }} />
        </Box>
      </Card>
    </>
  );
}
