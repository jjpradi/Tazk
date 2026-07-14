import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Chip, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Avatar, IconButton, Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  approveChangeRequestAction,
  rejectChangeRequestAction,
  getPendingChangeRequestsAction,
} from 'redux/actions/essPortal.actions';

export default function HRApprovalsTab({ onRefresh }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { EssPortalReducer: { pendingChangeRequests } } = useSelector((s) => s);
  const [rejectDialog, setRejectDialog] = useState({ open: false, id: null, remarks: '' });
  const [viewItem, setViewItem] = useState(null);

  const requests = pendingChangeRequests || [];

  const handleApprove = async (id) => {
    await dispatch(approveChangeRequestAction(
      { id, remarks: 'Approved' },
      setModalTypeHandler, setLoaderStatusHandler,
    ));
    refreshData();
  };

  const handleReject = async () => {
    await dispatch(rejectChangeRequestAction(
      { id: rejectDialog.id, remarks: rejectDialog.remarks },
      setModalTypeHandler, setLoaderStatusHandler,
    ));
    setRejectDialog({ open: false, id: null, remarks: '' });
    refreshData();
  };

  const refreshData = () => {
    dispatch(getPendingChangeRequestsAction(setModalTypeHandler, setLoaderStatusHandler));
    onRefresh?.();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
          Pending Profile Change Approvals
          {requests.length > 0 && (
            <Chip size='small' label={requests.length}
              sx={{ ml: 1, fontSize: 10, height: 20, bgcolor: '#fff3e0', color: '#ed6c02', fontWeight: 700 }} />
          )}
        </Typography>
      </Box>

      {requests.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No pending approvals.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {requests.map((r) => (
            <Grid key={r.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                  borderLeft: '3px solid #ed6c02',
                }}
              >
                {/* Employee Info */}
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
                  <Avatar src={r.image || undefined} sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}>
                    {(r.employee_name || '?')[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }} noWrap>
                      {r.employee_name} ({r.employee_code})
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: 'text.secondary' }} noWrap>
                      {r.designation}{r.department_name ? ` - ${r.department_name}` : ''}
                    </Typography>
                  </Box>
                </Box>

                {/* Change Details */}
                <Box sx={{ bgcolor: '#fafafa', borderRadius: 1, p: 1.5, mb: 1.5 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                    {r.field_label || r.field_name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>Current</Typography>
                      <Typography sx={{ fontSize: 11 }}>{r.old_value || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>Requested</Typography>
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#1565c0' }}>{r.new_value || '-'}</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Proof Link */}
                {r.proof_url && (
                  <Box sx={{ mb: 1 }}>
                    <Chip
                      size='small'
                      icon={<OpenInNewIcon sx={{ fontSize: 12 }} />}
                      label='View Proof'
                      onClick={() => window.open(r.proof_url, '_blank')}
                      sx={{ fontSize: 10, height: 22, cursor: 'pointer' }}
                    />
                  </Box>
                )}

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Typography sx={{ fontSize: 10, color: 'text.disabled', flex: 1, alignSelf: 'center' }}>
                    {r.created_date}
                  </Typography>
                  <Button
                    size='small' variant='outlined' color='error'
                    startIcon={<CancelIcon sx={{ fontSize: 14 }} />}
                    onClick={() => setRejectDialog({ open: true, id: r.id, remarks: '' })}
                    sx={{ textTransform: 'none', fontSize: 11, py: 0.3 }}
                  >
                    Reject
                  </Button>
                  <Button
                    size='small' variant='contained' color='success'
                    startIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                    onClick={() => handleApprove(r.id)}
                    sx={{ textTransform: 'none', fontSize: 11, py: 0.3 }}
                  >
                    Approve
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, id: null, remarks: '' })} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Reject Change Request</DialogTitle>
        <DialogContent>
          <TextField
            label='Reason for Rejection' size='small' fullWidth multiline rows={3}
            value={rejectDialog.remarks}
            onChange={(e) => setRejectDialog({ ...rejectDialog, remarks: e.target.value })}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, id: null, remarks: '' })} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button variant='contained' color='error' onClick={handleReject}
            disabled={!rejectDialog.remarks}
            sx={{ textTransform: 'none' }}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
