import React, { useState, useEffect, useContext, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { OpenalertActions } from '../../../redux/actions/alert_actions';
import {
  Box, Card, Typography, Button, IconButton, Chip, LinearProgress, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentIcon from '@mui/icons-material/Payment';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import CompanyLoansService from '../../../services/companyLoans_services';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import moment from 'moment';
import LocationAlert from 'pages/assets/alert/LocationAlert';

const fmtAmt = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '₹0';

const STATUS_COLORS = {
  pending: 'default', paid: 'success', partial: 'warning', overdue: 'error', waived: 'info', moratorium: 'secondary',
};

// Payment form shared across dialogs - defined outside to avoid focus loss on re-render
const PaymentFields = ({ payForm, setPayForm, paymentAccounts, loan }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
    <TextField select fullWidth size="small" label="Payment Account *" value={payForm.payment_account_id}
      onChange={(e) => setPayForm(p => ({ ...p, payment_account_id: e.target.value }))}>
      {paymentAccounts.map(a => <MenuItem key={a.id} value={a.ledger_id}>{a.name} ({a.type})</MenuItem>)}
    </TextField>
    {loan.status !== 'draft' && <TextField fullWidth size="small" label="Payment Method" value={payForm.payment_method}
      onChange={(e) => setPayForm(p => ({ ...p, payment_method: e.target.value }))}
      placeholder="NEFT / Cheque / Cash" />}
    <TextField fullWidth size="small" label="Reference (UTR/Cheque #)" value={payForm.payment_reference}
      onChange={(e) => setPayForm(p => ({ ...p, payment_reference: e.target.value }))} />
    <TextField type="date" fullWidth size="small" label="Payment Date" value={payForm.paid_date}
      onChange={(e) => setPayForm(p => ({ ...p, paid_date: e.target.value }))}
      slotProps={{ inputLabel: { shrink: true } }} />
  </Box>
);

export default function LoanDetail({ loanId, onClose }) {
  const dispatch = useDispatch();
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [loan, setLoan] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payDialog, setPayDialog] = useState({ open: false, emi: null });
  const [disburseDialog, setDisburseDialog] = useState(false);
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [payForm, setPayForm] = useState({ payment_account_id: '', payment_method: '', payment_reference: '', paid_date: moment().format('YYYY-MM-DD') });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('schedule'); // 'schedule' | 'transactions' | 'documents'
  const [documents, setDocuments] = useState([]);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({ document_type: 'other', description: '', file_data: null, file_name: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, doc: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadLoan(); loadPaymentAccounts(); }, [loanId]);

  const loadLoan = async () => {
    setLoading(true);
    try {
      const res = await CompanyLoansService.getById(loanId);
      const data = res.data?.data || {};
      setLoan(data);
      setSchedule(data.schedule || []);
      setTransactions(data.transactions || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadPaymentAccounts = async () => {
    try {
      const res = await CompanyLoansService.getPaymentAccounts();
      setPaymentAccounts(res.data?.data || []);
    } catch (err) { /* ignore */ }
  };

  const loadDocuments = async () => {
    try {
      const res = await CompanyLoansService.getDocuments(loanId);
      setDocuments(res.data?.data || []);
    } catch (err) { /* ignore */ }
  };

  useEffect(() => { if (tab === 'documents') loadDocuments(); }, [tab]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setUploadForm(prev => ({ ...prev, file_data: evt.target.result, file_name: file.name }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUploadDocument = async () => {
    if (!uploadForm.file_data || !uploadForm.document_type) return;
    setUploading(true);
    try {
      await CompanyLoansService.uploadDocument(loanId, {
        document_type: uploadForm.document_type,
        description: uploadForm.description,
        file_data: uploadForm.file_data,
        file_name: uploadForm.file_name,
        content_type: uploadForm.file_data.split(':')[1]?.split(';')[0] || 'application/pdf',
      });
      setUploadDialog(false);
      setUploadForm({ document_type: 'other', description: '', file_data: null, file_name: '' });
      loadDocuments();
    } catch (err) { console.error(err); }
    finally { setUploading(false); }
  };

  const confirmDeleteDocument = async () => {
    if (!deleteConfirm.doc) return;
    setDeleting(true);
    try {
      await CompanyLoansService.deleteDocument(deleteConfirm.doc.id);
      setDeleteConfirm({ open: false, doc: null });
      loadDocuments();
    } catch (err) { console.error(err); }
    finally { setDeleting(false); }
  };

  // Disburse
  const handleDisburse = async () => {
    if (!payForm.payment_account_id) return;
    setSaving(true);
    try {
      await CompanyLoansService.disburse(loanId, {
        disbursement_account_id: payForm.payment_account_id,
        disbursement_date: payForm.paid_date,
        location_id: headerLocationId !== 'null' ? headerLocationId : null,
      });
      setPayForm({ payment_account_id: '', payment_method: '', payment_reference: '', paid_date: moment().format('YYYY-MM-DD') })
      setDisburseDialog(false);
      loadLoan();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  // Pay EMI
  const handlePayEmi = async () => {
    if (!payForm.payment_account_id || !payDialog.emi) return;
    setSaving(true);
    try {
      await CompanyLoansService.payEmi(payDialog.emi.id, {
        payment_account_id: payForm.payment_account_id,
        payment_method: payForm.payment_method,
        payment_reference: payForm.payment_reference,
        paid_date: payForm.paid_date,
        location_id: headerLocationId !== 'null' ? headerLocationId : null,
      });
      setPayForm({ payment_account_id: '', payment_method: '', payment_reference: '', paid_date: moment().format('YYYY-MM-DD') })
      setPayDialog({ open: false, emi: null });
      loadLoan();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  // Prepay
  const [prepayDialog, setPrepayDialog] = useState(false);
  const [prepayAmount, setPrepayAmount] = useState('');
  const handlePrepay = async () => {
    if (!payForm.payment_account_id || !prepayAmount) return;
    const amount = Number(prepayAmount);
    const outstanding = Number(loan.outstanding_principal);
    if (!(amount > 0)) return dispatch(OpenalertActions({ msg: 'Prepayment amount must be greater than zero', severity: 'warning' }));
    if (amount > outstanding) return dispatch(OpenalertActions({ msg: `Prepayment amount cannot exceed outstanding ${fmtAmt(outstanding)}`, severity: 'warning' }));
    if (amount === outstanding) return dispatch(OpenalertActions({ msg: 'Amount equals outstanding. Please use "Foreclose" to close the loan instead.', severity: 'info' }));
    setSaving(true);
    try {
      await CompanyLoansService.prepay(loanId, {
        amount: Number(prepayAmount),
        payment_account_id: payForm.payment_account_id,
        payment_reference: payForm.payment_reference,
        paid_date: payForm.paid_date,
        location_id: headerLocationId !== 'null' ? headerLocationId : null,
      });
      setPayForm({ payment_account_id: '', payment_method: '', payment_reference: '', paid_date: moment().format('YYYY-MM-DD') })
      setPrepayDialog(false);
      loadLoan();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  // Foreclose
  const [forecloseDialog, setForecloseDialog] = useState(false);
  const [foreclosureCharges, setForeclosureCharges] = useState('');
  const handleForeclose = async () => {
    if (!payForm.payment_account_id) return;
    setSaving(true);
    try {
      await CompanyLoansService.foreclose(loanId, {
        payment_account_id: payForm.payment_account_id,
        foreclosure_charges: Number(foreclosureCharges) || 0,
        paid_date: payForm.paid_date,
        location_id: headerLocationId !== 'null' ? headerLocationId : null,
      });
      setPayForm({ payment_account_id: '', payment_method: '', payment_reference: '', paid_date: moment().format('YYYY-MM-DD') })
      setForecloseDialog(false);
      loadLoan();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;
  if (!loan) return <Typography>Loan not found</Typography>;

  const isActive = loan.status === 'active' || loan.status === 'overdue';
  const paidEmis = schedule.filter(s => s.status === 'paid').length;
  const totalEmis = schedule.length;
  const progress = totalEmis > 0 ? (paidEmis / totalEmis) * 100 : 0;

  const paymentFieldsProps = { payForm, setPayForm, paymentAccounts, loan };

  return (
    <>
      <Helmet><title>{titleURL} | {loan.bank_name} - {loan.loan_number}</title></Helmet>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', gap: 1.5 }}>

        {/* Header */}
        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }} elevation={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton size="small" onClick={() => onClose(true)}><ArrowBackIcon /></IconButton>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{loan.bank_name} — {loan.loan_number}</Typography>
              <Typography sx={{ fontSize: 11, color: '#999' }}>{loan.loan_types || ''} | A/c: {loan.loan_account_number}</Typography>
            </Box>
            <Chip label={loan.status} color={STATUS_COLORS[loan.status] || 'default'} size="small" variant="outlined" />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {loan.status === 'draft' && (
              <Button variant="contained" size="small" color="success" onClick={() => {
                if (headerLocationId === 'null') {
                  setOpenAlert(true)
                  return
                }
                setDisburseDialog(true)
              }
              } sx={{ textTransform: 'none' }}>Disburse</Button>
            )}
            {isActive && (
              <>
                <Button variant="outlined" size="small" onClick={() => setPrepayDialog(true)} sx={{ textTransform: 'none' }}>Prepay</Button>
                <Button variant="outlined" size="small" color="warning" onClick={() => setForecloseDialog(true)} sx={{ textTransform: 'none' }}>Foreclose</Button>
              </>
            )}
          </Box>
        </Card>

        {/* Summary + Progress */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Card sx={{ flex: 1, minWidth: 150, p: 2 }} elevation={0}>
            <Typography sx={{ fontSize: 10, color: '#999', textTransform: 'uppercase' }}>Loan Amount</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{fmtAmt(loan.total_loan_amount)}</Typography>
          </Card>
          <Card sx={{ flex: 1, minWidth: 150, p: 2 }} elevation={0}>
            <Typography sx={{ fontSize: 10, color: '#999', textTransform: 'uppercase' }}>Outstanding</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#d32f2f' }}>{fmtAmt(loan.outstanding_principal)}</Typography>
          </Card>
          <Card sx={{ flex: 1, minWidth: 150, p: 2 }} elevation={0}>
            <Typography sx={{ fontSize: 10, color: '#999', textTransform: 'uppercase' }}>EMI</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1976d2' }}>{fmtAmt(loan.EMI_amount)}</Typography>
            <Typography sx={{ fontSize: 10, color: '#999' }}>ROI: {loan.ROI_amount}% | {paidEmis}/{totalEmis} paid</Typography>
          </Card>
          <Card sx={{ flex: 1, minWidth: 150, p: 2 }} elevation={0}>
            <Typography sx={{ fontSize: 10, color: '#999', textTransform: 'uppercase' }}>Principal Paid</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#2e7d32' }}>{fmtAmt(loan.total_principal_paid)}</Typography>
          </Card>
          <Card sx={{ flex: 1, minWidth: 150, p: 2 }} elevation={0}>
            <Typography sx={{ fontSize: 10, color: '#999', textTransform: 'uppercase' }}>Interest Paid</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#ed6c02' }}>{fmtAmt(loan.total_interest_paid)}</Typography>
          </Card>
        </Box>

        {/* Progress Bar */}
        <Card sx={{ px: 2, py: 1 }} elevation={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: 11, color: '#666' }}>Repayment Progress</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{progress.toFixed(0)}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress}
            sx={{ height: 8, borderRadius: 4, bgcolor: '#E8EDF5', '& .MuiLinearProgress-bar': { borderRadius: 4 } }} />
        </Card>

        {/* Tabs */}
        <Box sx={{ display: 'flex', gap: 1, px: 1 }}>
          <Chip label="EMI Schedule" variant={tab === 'schedule' ? 'filled' : 'outlined'} color="primary"
            onClick={() => setTab('schedule')} sx={{ cursor: 'pointer' }} />
          <Chip label="Transaction History" variant={tab === 'transactions' ? 'filled' : 'outlined'} color="primary"
            onClick={() => setTab('transactions')} sx={{ cursor: 'pointer' }} />
          <Chip label={`Documents${documents.length > 0 ? ` (${documents.length})` : ''}`}
            variant={tab === 'documents' ? 'filled' : 'outlined'} color="primary"
            onClick={() => setTab('documents')} sx={{ cursor: 'pointer' }} />
        </Box>

        {/* Schedule Table */}
        {tab === 'schedule' && (
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} elevation={0}>
            <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA', textAlign: 'right' }}>EMI</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA', textAlign: 'right' }}>Principal</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA', textAlign: 'right' }}>Interest</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA', textAlign: 'right' }}>Outstanding</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Paid Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA', width: 80 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedule.map((emi) => (
                    <TableRow key={emi.id} hover sx={{
                      bgcolor: emi.status === 'overdue' ? '#FFF3F3' : emi.status === 'paid' ? '#F1F8E9' : 'inherit',
                    }}>
                      <TableCell sx={{ fontSize: 12 }}>{emi.emi_number}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{moment(emi.due_date).format('DD/MM/YYYY')}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{fmtAmt(emi.emi_amount)}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{fmtAmt(emi.principal_amount)}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{fmtAmt(emi.interest_amount)}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{fmtAmt(emi.outstanding_after)}</TableCell>
                      <TableCell>
                        <Chip label={emi.status} color={STATUS_COLORS[emi.status] || 'default'} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{emi.paid_date ? moment(emi.paid_date).format('DD/MM/YYYY') : '-'}</TableCell>
                      <TableCell>
                        {(emi.status === 'pending' || emi.status === 'overdue') && isActive && (
                          <Button size="small" variant="outlined" startIcon={<PaymentIcon sx={{ fontSize: 14 }} />}
                            onClick={() => setPayDialog({ open: true, emi })} sx={{ textTransform: 'none', fontSize: 11 }}>
                            Pay
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Transactions Table */}
        {tab === 'transactions' && (
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} elevation={0}>
            <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA', textAlign: 'right' }}>Principal</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA', textAlign: 'right' }}>Interest</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA', textAlign: 'right' }}>TDS</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA', textAlign: 'right' }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA', textAlign: 'right' }}>Outstanding</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow><TableCell colSpan={8} sx={{ textAlign: 'center', py: 4, color: '#999' }}>No transactions yet</TableCell></TableRow>
                  ) : transactions.map((txn) => (
                    <TableRow key={txn.id} hover>
                      <TableCell sx={{ fontSize: 12 }}>{moment(txn.transaction_date).format('DD/MM/YYYY')}</TableCell>
                      <TableCell><Chip label={txn.transaction_type} size="small" variant="outlined" sx={{ fontSize: 10 }} /></TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{Number(txn.principal_amount) > 0 ? fmtAmt(txn.principal_amount) : '-'}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{Number(txn.interest_amount) > 0 ? fmtAmt(txn.interest_amount) : '-'}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{Number(txn.tds_amount) > 0 ? fmtAmt(txn.tds_amount) : '-'}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: 'right', fontWeight: 600 }}>{fmtAmt(txn.total_amount)}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{fmtAmt(txn.outstanding_after)}</TableCell>
                      <TableCell sx={{ fontSize: 11, color: '#666', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{txn.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
        {/* Documents Tab */}
        {tab === 'documents' && (
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} elevation={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Documents</Typography>
              <Button size="small" variant="outlined" startIcon={<UploadFileIcon />}
                onClick={() => setUploadDialog(true)} sx={{ textTransform: 'none' }}>
                Upload Document
              </Button>
            </Box>
            <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA', width: 40 }}></TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>File Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Uploaded</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA', width: 80 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#999' }}>
                        <InsertDriveFileIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                        <Typography sx={{ fontSize: 13 }}>No documents uploaded yet</Typography>
                      </TableCell>
                    </TableRow>
                  ) : documents.map((doc) => (
                    <TableRow key={doc.id} hover>
                      <TableCell>
                        <DescriptionIcon sx={{ fontSize: 18, color: doc.content_type?.includes('pdf') ? '#d32f2f' : '#1976d2' }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{doc.file_name}</TableCell>
                      <TableCell>
                        <Chip label={doc.document_type?.replace(/_/g, ' ')} size="small" variant="outlined" sx={{ fontSize: 10, textTransform: 'capitalize' }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, color: '#666' }}>{doc.description || '-'}</TableCell>
                      <TableCell sx={{ fontSize: 12, color: '#999' }}>
                        {doc.size_bytes ? `${(doc.size_bytes / 1024).toFixed(0)} KB` : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, color: '#999' }}>{moment(doc.createdAt).format('DD/MM/YYYY')}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {doc.download_url && (
                            <IconButton size="small" onClick={() => window.open(doc.download_url, '_blank')}>
                              <DownloadIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                          <IconButton size="small" color="error" onClick={() => setDeleteConfirm({ open: true, doc })}>
                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </Box>

       <LocationAlert open={openAlert} onClose={ ()=> setOpenAlert(false)}/>

      {/* Upload Document Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Upload Document
          <IconButton size="small" onClick={() => setUploadDialog(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select fullWidth size="small" label="Document Type *" value={uploadForm.document_type}
              onChange={(e) => setUploadForm(prev => ({ ...prev, document_type: e.target.value }))}>
              <MenuItem value="sanction_letter">Sanction Letter</MenuItem>
              <MenuItem value="agreement">Loan Agreement</MenuItem>
              <MenuItem value="board_resolution">Board Resolution</MenuItem>
              <MenuItem value="disbursement_advice">Disbursement Advice</MenuItem>
              <MenuItem value="security_document">Security Document</MenuItem>
              <MenuItem value="insurance_policy">Insurance Policy</MenuItem>
              <MenuItem value="guarantor_document">Guarantor Document</MenuItem>
              <MenuItem value="noc_letter">NOC Letter</MenuItem>
              <MenuItem value="closure_statement">Closure Statement</MenuItem>
              <MenuItem value="tds_certificate">TDS Certificate (16A)</MenuItem>
              <MenuItem value="payment_receipt">Payment Receipt</MenuItem>
              <MenuItem value="bank_statement">Bank Statement</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField fullWidth size="small" label="Description" value={uploadForm.description}
              onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the document" />
            <Box>
              <input ref={fileInputRef} type="file" hidden
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                onChange={handleFileSelect} />
              <Button variant="outlined" fullWidth onClick={() => fileInputRef.current?.click()}
                startIcon={<UploadFileIcon />} sx={{ textTransform: 'none', justifyContent: 'flex-start', py: 1.5 }}>
                {uploadForm.file_name || 'Choose File (PDF, Image, Doc, Excel)'}
              </Button>
              {uploadForm.file_name && (
                <Typography sx={{ fontSize: 11, color: '#2e7d32', mt: 0.5 }}>
                  Selected: {uploadForm.file_name}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUploadDocument}
            disabled={uploading || !uploadForm.file_data}
            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disburse Dialog */}
      <Dialog open={disburseDialog} onClose={() => setDisburseDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Disburse Loan
          <IconButton size="small" onClick={() => setDisburseDialog(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, mb: 1 }}>Loan amount <strong>{fmtAmt(loan.total_loan_amount)}</strong> will be credited to the selected account.</Typography>
          <PaymentFields {...paymentFieldsProps} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setDisburseDialog(false); setPayForm({ payment_account_id: '', payment_method: '', payment_reference: '', paid_date: moment().format('YYYY-MM-DD') })}}>Cancel</Button>
          <Button variant="contained" onClick={handleDisburse} disabled={saving || !payForm.payment_account_id}>
            {saving ? <CircularProgress size={16} /> : 'Disburse & Activate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pay EMI Dialog */}
      <Dialog open={payDialog.open} onClose={() => setPayDialog({ open: false, emi: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Pay EMI #{payDialog.emi?.emi_number}
          <IconButton size="small" onClick={() => setPayDialog({ open: false, emi: null })}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          {payDialog.emi && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: '#F5F7FA', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: 12 }}>Principal</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{fmtAmt(payDialog.emi.principal_amount)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: 12 }}>Interest</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#d32f2f' }}>{fmtAmt(payDialog.emi.interest_amount)}</Typography>
              </Box>
              {loan.tds_applicable && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontSize: 12, color: '#e65100' }}>TDS @ {loan.tds_rate}%</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#e65100' }}>
                    -{fmtAmt(Math.round(Number(payDialog.emi.interest_amount) * (Number(loan.tds_rate) / 100) * 100) / 100)}
                  </Typography>
                </Box>
              )}
              <Divider sx={{ my: 0.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Net Payable</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                  {fmtAmt(Number(payDialog.emi.emi_amount) - (loan.tds_applicable ? Math.round(Number(payDialog.emi.interest_amount) * (Number(loan.tds_rate) / 100) * 100) / 100 : 0))}
                </Typography>
              </Box>
            </Box>
          )}
          <PaymentFields {...paymentFieldsProps} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setPayDialog({ open: false, emi: null }); setPayForm({ payment_account_id: '', payment_method: '', payment_reference: '', paid_date: moment().format('YYYY-MM-DD') })}}>Cancel</Button>
          <Button variant="contained" onClick={handlePayEmi} disabled={saving || !payForm.payment_account_id}>
            {saving ? <CircularProgress size={16} /> : 'Pay EMI'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Prepay Dialog */}
      <Dialog open={prepayDialog} onClose={() => setPrepayDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Prepayment
          <IconButton size="small" onClick={() => setPrepayDialog(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, mb: 1 }}>Outstanding: <strong>{fmtAmt(loan.outstanding_principal)}</strong>. EMI schedule will be recalculated after prepayment.</Typography>
          <TextField type="number" fullWidth size="small" label="Prepayment Amount (₹)" value={prepayAmount}
            onChange={(e) => setPrepayAmount(e.target.value)} sx={{ mb: 2, mt: 1 }}
            inputProps={{ min: 1, max: Number(loan.outstanding_principal) || undefined }}
            error={!!prepayAmount && Number(prepayAmount) > Number(loan.outstanding_principal)}
            helperText={!!prepayAmount && Number(prepayAmount) > Number(loan.outstanding_principal)
              ? `Cannot exceed outstanding ${fmtAmt(loan.outstanding_principal)}` : ''} />
          <PaymentFields {...paymentFieldsProps} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setPrepayDialog(false); setPayForm({ payment_account_id: '', payment_method: '', payment_reference: '', paid_date: moment().format('YYYY-MM-DD') })}}>Cancel</Button>
          <Button variant="contained" onClick={handlePrepay} disabled={saving || !payForm.payment_account_id || !prepayAmount}>
            {saving ? <CircularProgress size={16} /> : 'Make Prepayment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Document Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onClose={() => !deleting && setDeleteConfirm({ open: false, doc: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Delete Document
          <IconButton size="small" onClick={() => !deleting && setDeleteConfirm({ open: false, doc: null })} disabled={deleting}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, mb: 1 }}>
            Delete <strong>{deleteConfirm.doc?.file_name}</strong>?
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#d32f2f' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, doc: null })} disabled={deleting}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDeleteDocument} disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Foreclose Dialog */}
      <Dialog open={forecloseDialog} onClose={() => setForecloseDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Loan Foreclosure
          <IconButton size="small" onClick={() => setForecloseDialog(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, mb: 1 }}>
            Outstanding: <strong>{fmtAmt(loan.outstanding_principal)}</strong> + accrued interest will be settled. All pending EMIs will be waived.
          </Typography>
          <TextField type="number" fullWidth size="small" label="Foreclosure Charges (₹)" value={foreclosureCharges}
            onChange={(e) => setForeclosureCharges(e.target.value)} sx={{ mb: 2, mt: 1 }}
            helperText="Additional charges by the bank for early closure" />
          <PaymentFields {...paymentFieldsProps} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setForecloseDialog(false); setPayForm({ payment_account_id: '', payment_method: '', payment_reference: '', paid_date: moment().format('YYYY-MM-DD') })}}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleForeclose} disabled={saving || !payForm.payment_account_id}>
            {saving ? <CircularProgress size={16} /> : 'Foreclose Loan'}
          </Button>
        </DialogActions>
      </Dialog>
    </>

     
  );
}
