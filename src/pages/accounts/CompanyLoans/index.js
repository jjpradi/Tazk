import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Card, Typography, Button, Chip, IconButton, Tooltip, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  LinearProgress, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import moment from 'moment';
import { titleURL } from 'http-common';
import CompanyLoansService from '../../../services/companyLoans_services';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import CloseIcon from '@mui/icons-material/Close';
import LoanForm from './LoanForm';
import LoanDetail from './LoanDetail';
import LoanImportField from './LoanImportField';
import CommonSearch from 'utils/commonSearch';

const fmtAmt = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '₹0';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'default' },
  active: { label: 'Active', color: 'success' },
  overdue: { label: 'Overdue', color: 'error' },
  closed: { label: 'Closed', color: 'info' },
  foreclosed: { label: 'Foreclosed', color: 'warning' },
  written_off: { label: 'Written Off', color: 'error' },
};

export default function CompanyLoans() {
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [loans, setLoans] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchString, setSearchString] = useState('');
  const [dashboard, setDashboard] = useState({ summary: {}, upcomingEmis: [], overdueCount: 0 });
  const [view, setView] = useState('list'); // 'list' | 'form' | 'detail'
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [importOpen, setImportOpen] = useState(false);
  const [importFiles, setImportFiles] = useState([]);

  useEffect(() => { loadLoans(); loadDashboard(); }, [page, pageSize, statusFilter, searchString]);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, pageSize, status: statusFilter || undefined, searchString: searchString || undefined };
      const res = await CompanyLoansService.getAll(params);
      const data = res.data?.data || res.data || {};
      setLoans(data.data || []);
      setTotalCount(data.numRows || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadDashboard = async () => {
    try {
      const res = await CompanyLoansService.getDashboard();
      setDashboard(res.data?.data || {});
    } catch (err) { /* ignore */ }
  };

  const handleSearch = (e) => { setPage(0); setSearchString(e.target.value); };

  const handleRowClick = (loan) => { setSelectedLoan(loan); setView('detail'); };

  const handleCreate = () => { setFormMode('create'); setSelectedLoan(null); setImportFiles([]); setView('form'); };

  const handleImportUpload = () => {
    setImportOpen(false);
    setFormMode('create');
    setSelectedLoan(null);
    setView('form');
  };

  const handleFormClose = (refresh) => {
    setView('list');
    setImportFiles([]);
    if (refresh) { loadLoans(); loadDashboard(); }
  };

  const handleDetailClose = (refresh) => {
    setView('list');
    setSelectedLoan(null);
    if (refresh) { loadLoans(); loadDashboard(); }
  };

  const summary = dashboard.summary || {};

  // Full-screen form view
  if (view === 'form') {
    return <LoanForm mode={formMode} loan={selectedLoan} onClose={handleFormClose} importFiles={importFiles} />;
  }

  // Full-screen detail view
  if (view === 'detail' && selectedLoan) {
    return <LoanDetail loanId={selectedLoan.id} onClose={handleDetailClose} />;
  }

  return (
    <>
      <Helmet><title>{titleURL} | Company Loans</title></Helmet>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', gap: 1.5, minHeight: 0, overflow: 'hidden' }}>

        {/* Summary Cards */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', flexShrink: 0 }}>
          <Card sx={{ flex: 1, minWidth: 180, p: 2 }} elevation={0}>
            <Typography sx={{ fontSize: 11, color: '#999', textTransform: 'uppercase' }}>Total Outstanding</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#d32f2f' }}>{fmtAmt(summary.total_outstanding)}</Typography>
            <Typography sx={{ fontSize: 11, color: '#999' }}>{summary.active_loans || 0} active loans</Typography>
          </Card>
          <Card sx={{ flex: 1, minWidth: 180, p: 2 }} elevation={0}>
            <Typography sx={{ fontSize: 11, color: '#999', textTransform: 'uppercase' }}>Monthly EMI</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1976d2' }}>{fmtAmt(summary.total_monthly_emi)}</Typography>
            <Typography sx={{ fontSize: 11, color: '#999' }}>Total EMI burden</Typography>
          </Card>
          <Card sx={{ flex: 1, minWidth: 180, p: 2 }} elevation={0}>
            <Typography sx={{ fontSize: 11, color: '#999', textTransform: 'uppercase' }}>Principal Paid</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#2e7d32' }}>{fmtAmt(summary.total_principal_paid)}</Typography>
          </Card>
          <Card sx={{ flex: 1, minWidth: 180, p: 2 }} elevation={0}>
            <Typography sx={{ fontSize: 11, color: '#999', textTransform: 'uppercase' }}>Interest Paid</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#ed6c02' }}>{fmtAmt(summary.total_interest_paid)}</Typography>
          </Card>
          {(dashboard.overdueCount > 0) && (
            <Card sx={{ flex: 1, minWidth: 180, p: 2, bgcolor: '#FFEBEE' }} elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WarningAmberIcon sx={{ fontSize: 16, color: '#d32f2f' }} />
                <Typography sx={{ fontSize: 11, color: '#d32f2f', textTransform: 'uppercase' }}>Overdue</Typography>
              </Box>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#d32f2f' }}>{dashboard.overdueCount} EMIs</Typography>
            </Card>
          )}
        </Box>

        {/* Toolbar */}
        <Card sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, flexShrink: 0 }} elevation={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AccountBalanceIcon sx={{ color: '#1976d2' }} />
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#2E3A59' }}>Company Loans</Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} displayEmpty sx={{ fontSize: 13 }}>
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="foreclosed">Foreclosed</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* <TextField size="small" placeholder="Search..." value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              sx={{ width: 200, '& input': { fontSize: 13 } }} /> */}
              <CommonSearch
                searchVal={searchString}
                requestSearch={handleSearch}
              />
            <Tooltip title="Upload">
              <IconButton size="small" onClick={() => setImportOpen(true)}><UploadFileIcon sx={{ fontSize: 25 }} /></IconButton>
            </Tooltip>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleCreate}
              sx={{ textTransform: 'none' }}>New Loan</Button>
          </Box>
        </Card>

        {/* Table */}
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }} elevation={0}>
          {loading && <LinearProgress />}
          <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: 'auto', bgcolor: '#fff' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Loan #</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Bank/NBFC</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Loan Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', textAlign: 'right' }}>Loan Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', textAlign: 'right' }}>EMI</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', textAlign: 'right' }}>Outstanding</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>ROI %</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Next EMI</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loans.map((loan) => {
                  const cfg = STATUS_CONFIG[loan.status] || STATUS_CONFIG.draft;
                  return (
                    <TableRow key={loan.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleRowClick(loan)}>
                      <TableCell sx={{ fontSize: 12, fontWeight: 600, color: '#1976d2' }}>{loan.loan_number}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{loan.typeName || (loan.type === 0 ? 'NBFC' : 'Bank')}</TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{loan.bank_name}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{loan.loan_types || '-'}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{fmtAmt(loan.total_loan_amount)}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: 'right', fontWeight: 600 }}>{fmtAmt(loan.EMI_amount)}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: 'right', color: '#d32f2f', fontWeight: 600 }}>{fmtAmt(loan.outstanding_principal)}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{loan.ROI_amount}%</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{loan.next_emi_date ? moment(loan.next_emi_date).format('DD/MM/YYYY') : '-'}</TableCell>
                      <TableCell>
                        <Chip label={cfg.label} color={cfg.color} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {loans.length === 0 && !loading && (
              <Box
                sx={{
                  minHeight: 220,
                  height: 'calc(100% - 44px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  px: 2,
                  textAlign: 'center',
                  color: '#98A2B3',
                  borderTop: '1px solid #EAECF0',
                  backgroundColor: '#F8FBFF',
                }}
              >
                <CloudOffOutlinedIcon sx={{ fontSize: 52, color: '#B8C0CC' }} />
                <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#667085' }}>
                  No loans found
                </Typography>
                <Typography sx={{ fontSize: 13, color: '#98A2B3' }}>
                  Click "New Loan" to add one.
                </Typography>
              </Box>
            )}
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0, borderTop: '1px solid #EAECF0', bgcolor: '#fff' }}>
            <TablePagination
              count={totalCount} page={page} rowsPerPage={pageSize}
              rowsPerPageOptions={[20, 50, 100]}
              onPageChange={(e, p) => setPage(p)}
              onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(0); }}
              sx={{ borderBottom: 'none' }}
            />
          </Box>
        </Card>
      </Box>

      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 16, fontWeight: 600 }}>
          Import Loans
          <IconButton size="small" onClick={() => { setImportOpen(false); setImportFiles([]); }}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <LoanImportField files={importFiles} setFiles={setImportFiles} />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button size="small" onClick={() => { setImportOpen(false); setImportFiles([]); }}
            sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" size="small" disabled={importFiles.length === 0}
            onClick={handleImportUpload} sx={{ textTransform: 'none' }}>Upload</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
