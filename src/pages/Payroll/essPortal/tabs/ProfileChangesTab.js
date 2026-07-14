import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Chip, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  createChangeRequestAction,
  deleteChangeRequestAction,
} from 'redux/actions/essPortal.actions';

const STATUS_COLORS = {
  pending: { bg: '#fff3e0', color: '#ed6c02', label: 'Pending' },
  approved: { bg: '#e8f5e9', color: '#2e7d32', label: 'Approved' },
  rejected: { bg: '#ffebee', color: '#d32f2f', label: 'Rejected' },
};

const EDITABLE_FIELDS = [
  { name: 'phone_number', label: 'Phone Number' },
  { name: 'aadhar_name_change', label: 'Aadhar Name' },
  { name: 'aadhar_phnumber_change', label: 'Aadhar Mobile Number' },
  { name: 'email', label: 'Email Address' },
  { name: 'address', label: 'Residential Address' },
  { name: 'emergency_contact_name', label: 'Emergency Contact Name' },
  { name: 'emergency_contact_phone', label: 'Emergency Contact Phone' },
  { name: 'bank_account_number', label: 'Bank Account Number' },
  { name: 'bank_ifsc', label: 'Bank IFSC Code' },
  { name: 'pan_number', label: 'PAN Number' },
  { name: 'blood_group', label: 'Blood Group' },
  { name: 'marital_status', label: 'Marital Status' },
];

export default function ProfileChangesTab({ onRefresh }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { EssPortalReducer: { myChangeRequests } } = useSelector((s) => s);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState({ field_name: '', old_value: '', new_value: '', proof_url: '' });

  const handleCreate = async () => {
    const selectedField = EDITABLE_FIELDS.find((f) => f.name === form.field_name);
    await dispatch(createChangeRequestAction(
      { ...form, field_label: selectedField?.label || form.field_name },
      setModalTypeHandler, setLoaderStatusHandler,
    ));
    setOpen(false);
    setForm({ field_name: '', old_value: '', new_value: '', proof_url: '' });
    onRefresh?.();
  };

  const handleDelete = async (id) => {
    await dispatch(deleteChangeRequestAction(id, setModalTypeHandler, setLoaderStatusHandler));
    onRefresh?.();
  };

  const requests = myChangeRequests || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>My Profile Change Requests</Typography>
        <Button size='small' variant='contained' startIcon={<AddIcon />} onClick={() => setOpen(true)}
          sx={{ textTransform: 'none', fontSize: 12 }}>
          Request Change
        </Button>
      </Box>

      {requests.length === 0 && (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No change requests yet. Click "Request Change" to update your profile details.
          </Typography>
        </Paper>
      )}

      <Grid container spacing={1.5}>
        {requests.map((r) => {
          const st = STATUS_COLORS[r.status] || STATUS_COLORS.pending;
          return (
            <Grid key={r.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                  borderLeft: `3px solid ${st.color}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{r.field_label || r.field_name}</Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
                      {r.created_date}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <Chip size='small' label={st.label}
                      sx={{ bgcolor: st.bg, color: st.color, fontSize: 10, height: 22, fontWeight: 600 }} />
                    <Tooltip title='View Details'>
                      <IconButton size='small' onClick={() => { setViewItem(r); setViewOpen(true); }}>
                        <VisibilityIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    {r.status === 'pending' && (
                      <Tooltip title='Delete'>
                        <IconButton size='small' color='error' onClick={() => handleDelete(r.id)}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
                <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>Old Value</Typography>
                    <Typography sx={{ fontSize: 11 }}>{r.old_value || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>New Value</Typography>
                    <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{r.new_value || '-'}</Typography>
                  </Box>
                </Box>
                {r.remarks && (
                  <Typography sx={{ fontSize: 10, color: 'text.secondary', mt: 1, fontStyle: 'italic' }}>
                    HR: {r.remarks}
                  </Typography>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Create Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Request Profile Change</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField
            select label='Field to Change' size='small' fullWidth
            value={form.field_name}
            onChange={(e) => setForm({ ...form, field_name: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value=''>Select field...</option>
            {EDITABLE_FIELDS.map((f) => (
              <option key={f.name} value={f.name}>{f.label}</option>
            ))}
          </TextField>
          <TextField
            label='Current Value' size='small' fullWidth
            value={form.old_value}
            onChange={(e) => setForm({ ...form, old_value: e.target.value })}
          />
          <TextField
            label='New Value' size='small' fullWidth required
            value={form.new_value}
            onChange={(e) => setForm({ ...form, new_value: e.target.value })}
          />
          <TextField
            label='Proof Document URL (optional)' size='small' fullWidth
            value={form.proof_url}
            onChange={(e) => setForm({ ...form, proof_url: e.target.value })}
            placeholder='Link to supporting document'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' onClick={handleCreate}
            disabled={!form.field_name || !form.new_value}
            sx={{ textTransform: 'none' }}>
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Change Request Details</DialogTitle>
        <DialogContent>
          {viewItem && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
              {[
                ['Field', viewItem.field_label || viewItem.field_name],
                ['Old Value', viewItem.old_value || '-'],
                ['New Value', viewItem.new_value || '-'],
                ['Status', viewItem.status],
                ['Requested On', viewItem.created_date],
                ['Proof URL', viewItem.proof_url || '-'],
                ['Approved By', viewItem.approved_by_name || '-'],
                ['Approved Date', viewItem.approved_date_formatted || '-'],
                ['HR Remarks', viewItem.remarks || '-'],
              ].map(([label, value]) => (
                <Box key={label} sx={{ display: 'flex', gap: 1 }}>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', minWidth: 120 }}>{label}:</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{value}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
