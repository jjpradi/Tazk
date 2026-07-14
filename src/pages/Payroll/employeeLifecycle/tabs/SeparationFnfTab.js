import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Chip, Button, TextField, Grid, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {
  getAllPendingFnfAction,
  getFnfByIdAction,
  updateFnfSettlementAction,
  approveFnfAction,
  markFnfPaidAction,
  getDashboardStatsAction,
} from 'redux/actions/employeeLifecycle.actions';

const statusColors = {
  draft: 'default', pending_approval: 'warning', approved: 'info', paid: 'success', cancelled: 'error',
};

const AmountRow = ({ label, value, bold, color }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{label}</Typography>
    <Typography sx={{ fontSize: 12, fontWeight: bold ? 700 : 400, color: color || 'text.primary' }}>
      {value !== undefined && value !== null ? `₹ ${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
    </Typography>
  </Box>
);

export default function SeparationFnfTab() {
  const [detailDialog, setDetailDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [payDialog, setPayDialog] = useState(false);
  const [payForm, setPayForm] = useState({ payment_date: new Date(), payment_ref: '' });

  const dispatch = useDispatch();
  const { EmployeeLifecycleReducer: { pendingFnf, fnfDetail } } = useSelector((s) => s);
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const handleViewDetail = async (fnf) => {
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(getFnfByIdAction(fnf.id, setModalTypeHandler, setLoaderStatusHandler)));
    setEditMode(false);
    setDetailDialog(true);
  };

  const handleEdit = () => {
    setEditForm({ ...fnfDetail });
    setEditMode(true);
  };

  const handleEditChange = (field, value) => {
    setEditForm((p) => ({ ...p, [field]: value }));
  };

  const handleSaveEdit = async () => {
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(updateFnfSettlementAction(editForm, setModalTypeHandler, setLoaderStatusHandler)));
    // Refresh
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(getFnfByIdAction(editForm.id, setModalTypeHandler, setLoaderStatusHandler)));
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(getAllPendingFnfAction(setModalTypeHandler, setLoaderStatusHandler)));
    setEditMode(false);
  };

  const handleApprove = async (id) => {
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(approveFnfAction({ id }, setModalTypeHandler, setLoaderStatusHandler)));
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(getAllPendingFnfAction(setModalTypeHandler, setLoaderStatusHandler)));
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(getDashboardStatsAction(setModalTypeHandler, setLoaderStatusHandler)));
    setDetailDialog(false);
  };

  const handlePayClick = (fnf) => {
    setPayForm({ id: fnf.id, payment_date: new Date(), payment_ref: '' });
    setPayDialog(true);
  };

  const handleMarkPaid = async () => {
    const data = {
      id: payForm.id,
      payment_date: payForm.payment_date ? payForm.payment_date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      payment_ref: payForm.payment_ref,
    };
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(markFnfPaidAction(data, setModalTypeHandler, setLoaderStatusHandler)));
    setPayDialog(false);
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(getAllPendingFnfAction(setModalTypeHandler, setLoaderStatusHandler)));
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(getDashboardStatsAction(setModalTypeHandler, setLoaderStatusHandler)));
  };

  const list = pendingFnf || [];
  const detail = fnfDetail;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
          Pending Settlements ({list.length})
        </Typography>
      </Box>

      {list.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
          <Typography variant='body2'>No pending Full & Final settlements</Typography>
          <Typography sx={{ fontSize: 11, mt: 0.5 }}>
            FnF settlements are created from separation events in the Lifecycle Events tab
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {list.map((fnf) => (
            <Grid key={fnf.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                  borderLeft: '3px solid',
                  borderLeftColor: fnf.status === 'approved' ? 'success.main' : fnf.status === 'pending_approval' ? 'warning.main' : 'grey.400',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Avatar src={fnf.image} sx={{ width: 36, height: 36, fontSize: 13, bgcolor: 'error.main' }}>
                    {(fnf.employee_name || '?')[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                      {fnf.employee_name}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                      {fnf.employee_code} &bull; {fnf.designation}
                    </Typography>
                  </Box>
                  <Chip
                    label={fnf.status?.replace('_', ' ')}
                    size='small'
                    color={statusColors[fnf.status]}
                    sx={{ fontSize: 9, textTransform: 'capitalize' }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, mb: 1.5 }}>
                  <AmountRow label='Earnings' value={fnf.total_earnings} color='success.main' />
                  <AmountRow label='Deductions' value={fnf.total_deductions} color='error.main' />
                  <Divider sx={{ my: 0.5 }} />
                  <AmountRow label='Net Payable' value={fnf.net_payable} bold color='primary.main' />
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                  {fnf.separation_type && <Chip label={fnf.separation_type} size='small' variant='outlined' sx={{ fontSize: 9, textTransform: 'capitalize' }} />}
                  <Chip label={`LWD: ${fnf.lwd_formatted}`} size='small' variant='outlined' sx={{ fontSize: 9 }} />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size='small' variant='outlined' startIcon={<VisibilityIcon />}
                    sx={{ fontSize: 10, textTransform: 'none', flex: 1 }}
                    onClick={() => handleViewDetail(fnf)}>
                    View
                  </Button>
                  {fnf.status === 'approved' && (
                    <Button size='small' variant='contained' color='success' startIcon={<PaymentIcon />}
                      sx={{ fontSize: 10, textTransform: 'none', flex: 1 }}
                      onClick={() => handlePayClick(fnf)}>
                      Mark Paid
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* FnF Detail Dialog */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>
          FnF Settlement Detail
        </DialogTitle>
        <DialogContent>
          {detail && (
            <Box sx={{ mt: 1 }}>
              {!editMode ? (
                <>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1, color: 'success.main' }}>
                    Earnings
                  </Typography>
                  <AmountRow label='Pending Salary' value={detail.pending_salary} />
                  <AmountRow label={`Leave Encashment (${detail.leave_encashment_days} days)`} value={detail.leave_encashment_amount} />
                  <AmountRow label='Bonus' value={detail.bonus_amount} />
                  <AmountRow label='Gratuity' value={detail.gratuity_amount} />
                  <AmountRow label='Other Earnings' value={detail.other_earnings} />
                  <Divider sx={{ my: 1 }} />
                  <AmountRow label='Total Earnings' value={detail.total_earnings} bold color='success.main' />

                  <Typography sx={{ fontSize: 13, fontWeight: 600, mt: 2, mb: 1, color: 'error.main' }}>
                    Deductions
                  </Typography>
                  <AmountRow label='Notice Period Recovery' value={detail.notice_period_recovery} />
                  <AmountRow label='Loan Recovery' value={detail.loan_recovery} />
                  <AmountRow label='Advance Recovery' value={detail.advance_recovery} />
                  <AmountRow label='Asset Recovery' value={detail.asset_recovery} />
                  <AmountRow label='Other Deductions' value={detail.other_deductions} />
                  <Divider sx={{ my: 1 }} />
                  <AmountRow label='Total Deductions' value={detail.total_deductions} bold color='error.main' />

                  <Divider sx={{ my: 1.5, borderWidth: 2 }} />
                  <AmountRow label='Net Payable' value={detail.net_payable} bold color='primary.main' />
                </>
              ) : (
                <Grid container spacing={1.5}>
                  <Grid size={12}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'success.main' }}>Earnings</Typography>
                  </Grid>
                  {[
                    { field: 'pending_salary', label: 'Pending Salary' },
                    { field: 'leave_encashment_days', label: 'Leave Encashment Days', type: 'number' },
                    { field: 'leave_encashment_amount', label: 'Leave Encashment Amount' },
                    { field: 'bonus_amount', label: 'Bonus' },
                    { field: 'gratuity_amount', label: 'Gratuity' },
                    { field: 'other_earnings', label: 'Other Earnings' },
                  ].map((f) => (
                    <Grid key={f.field} size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label={f.label} size='small' fullWidth type='number'
                        value={editForm[f.field] || ''} onChange={(e) => handleEditChange(f.field, e.target.value)}
                      />
                    </Grid>
                  ))}
                  <Grid size={12}>
                    <TextField label='Earnings Remarks' size='small' fullWidth multiline rows={1}
                      value={editForm.earnings_remarks || ''} onChange={(e) => handleEditChange('earnings_remarks', e.target.value)} />
                  </Grid>
                  <Grid size={12}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'error.main', mt: 1 }}>Deductions</Typography>
                  </Grid>
                  {[
                    { field: 'notice_period_recovery', label: 'Notice Period Recovery' },
                    { field: 'loan_recovery', label: 'Loan Recovery' },
                    { field: 'advance_recovery', label: 'Advance Recovery' },
                    { field: 'asset_recovery', label: 'Asset Recovery' },
                    { field: 'other_deductions', label: 'Other Deductions' },
                  ].map((f) => (
                    <Grid key={f.field} size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label={f.label} size='small' fullWidth type='number'
                        value={editForm[f.field] || ''} onChange={(e) => handleEditChange(f.field, e.target.value)}
                      />
                    </Grid>
                  ))}
                  <Grid size={12}>
                    <TextField label='Deductions Remarks' size='small' fullWidth multiline rows={1}
                      value={editForm.deductions_remarks || ''} onChange={(e) => handleEditChange('deductions_remarks', e.target.value)} />
                  </Grid>
                  <Grid size={12}>
                    <TextField label='General Remarks' size='small' fullWidth multiline rows={1}
                      value={editForm.remarks || ''} onChange={(e) => handleEditChange('remarks', e.target.value)} />
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {detail && !editMode && (detail.status === 'draft' || detail.status === 'pending_approval') && (
            <Button onClick={handleEdit} variant='outlined' sx={{ fontSize: 11, textTransform: 'none' }}>
              Edit Amounts
            </Button>
          )}
          {editMode && (
            <Button onClick={handleSaveEdit} variant='contained' sx={{ fontSize: 11, textTransform: 'none' }}>
              Save Changes
            </Button>
          )}
          {detail && detail.status === 'pending_approval' && !editMode && (
            <Button onClick={() => handleApprove(detail.id)} variant='contained' color='success'
              startIcon={<CheckCircleIcon />} sx={{ fontSize: 11, textTransform: 'none' }}>
              Approve
            </Button>
          )}
          <Button onClick={() => setDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Mark Paid Dialog */}
      <Dialog open={payDialog} onClose={() => setPayDialog(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 600 }}>Mark FnF as Paid</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <DatePicker
                label='Payment Date'
                value={payForm.payment_date}
                onChange={(v) => setPayForm((p) => ({ ...p, payment_date: v }))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label='Payment Reference' size='small' fullWidth
                value={payForm.payment_ref}
                onChange={(e) => setPayForm((p) => ({ ...p, payment_ref: e.target.value }))}
                placeholder='e.g. NEFT/UTR number'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPayDialog(false)} color='error'>Cancel</Button>
          <Button onClick={handleMarkPaid} variant='contained'>Confirm Payment</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
