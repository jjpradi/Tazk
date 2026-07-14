import React, { useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Chip, Switch,
  FormControlLabel, MenuItem, Alert, LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import GetAppIcon from '@mui/icons-material/GetApp';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  createExpensePolicyAction,
  updateExpensePolicyAction,
  deleteExpensePolicyAction,
} from 'redux/actions/expenseManagement.actions';

const emptyForm = {
  policy_name: '', version: '1.0', category_id: '', grade_id: '', department_id: '', department_name: '',
  max_amount: '', max_monthly: '', max_yearly: '',
  requires_receipt: true, requires_approval: true,
  auto_approve_below: '', effective_from: '', effective_to: '', is_active: true,
  policy_document: null, policy_document_name: '',
};

const formatINR = (v) => {
  if (!v && v !== 0) return '-';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
};

export default function PoliciesConfigTab({ onRefresh }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { ExpenseManagementReducer: { policies } } = useSelector((s) => s);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const policyList = policies || [];

  const openAdd = () => { setEditId(null); setForm({ ...emptyForm }); setOpen(true); };

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({
      policy_name: p.policy_name || '',
      version: p.version || '1.0',
      category_id: p.category_id || '',
      grade_id: p.grade_id || '',
      department_id: p.department_id || '',
      department_name: p.department_name || '',
      max_amount: p.max_amount || '',
      max_monthly: p.max_monthly || '',
      max_yearly: p.max_yearly || '',
      requires_receipt: !!p.requires_receipt,
      requires_approval: !!p.requires_approval,
      auto_approve_below: p.auto_approve_below || '',
      effective_from: p.effective_from ? p.effective_from.substring(0, 10) : '',
      effective_to: p.effective_to ? p.effective_to.substring(0, 10) : '',
      is_active: p.is_active !== undefined ? !!p.is_active : true,
      policy_document: null,
      policy_document_name: p.policy_document_name || '',
    });
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = { ...form };
    ['category_id', 'grade_id', 'department_id', 'max_amount', 'max_monthly', 'max_yearly', 'auto_approve_below']
      .forEach((k) => { if (payload[k] === '') payload[k] = null; else payload[k] = Number(payload[k]); });
    if (editId) {
      await dispatch(updateExpensePolicyAction({ id: editId, ...payload }, setModalTypeHandler, setLoaderStatusHandler));
    } else {
      await dispatch(createExpensePolicyAction(payload, setModalTypeHandler, setLoaderStatusHandler));
    }
    setOpen(false);
    onRefresh?.();
  };

  const handleDelete = async (id) => {
    await dispatch(deleteExpensePolicyAction(id, setModalTypeHandler, setLoaderStatusHandler));
    onRefresh?.();
  };

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Expense Policies</Typography>
        <Button size='small' variant='contained' startIcon={<AddIcon />} onClick={openAdd}
          sx={{ textTransform: 'none', fontSize: 12 }}>
          Add Policy
        </Button>
      </Box>

      {policyList.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No expense policies configured. Create policies to set spending limits per category, grade, and department.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {policyList.map((p) => (
            <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                borderLeft: `4px solid ${p.is_active ? '#2e7d32' : '#bdbdbd'}`,
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>{p.policy_name}</Typography>
                      {p.version && (
                        <Chip size='small' label={`v${p.version}`}
                          sx={{ fontSize: 9, height: 18, fontWeight: 600,
                            bgcolor: '#f3e5f5', color: '#6a1b9a',
                          }} />
                      )}
                      <Chip size='small' label={p.is_active ? 'Active' : 'Inactive'}
                        sx={{ fontSize: 9, height: 18, fontWeight: 600,
                          bgcolor: p.is_active ? '#e8f5e9' : '#f5f5f5',
                          color: p.is_active ? '#2e7d32' : '#9e9e9e',
                        }} />
                    </Box>
                    {p.department_name && (
                      <Typography sx={{ fontSize: 12, color: 'primary.main', fontWeight: 500, mb: 0.5 }}>
                        📋 {p.department_name}
                      </Typography>
                    )}
                    {p.category_name && (
                      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Category: {p.category_name}</Typography>
                    )}
                    {p.policy_document_name && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <AttachFileIcon sx={{ fontSize: 12, color: 'action.active' }} />
                        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>{p.policy_document_name}</Typography>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.3 }}>
                    <Tooltip title='Edit'>
                      <IconButton size='small' onClick={() => openEdit(p)}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                    </Tooltip>
                    <Tooltip title='Delete'>
                      <IconButton size='small' color='error' onClick={() => handleDelete(p.id)}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {p.max_amount && (
                    <Chip size='small' label={`Per Claim: ${formatINR(p.max_amount)}`}
                      sx={{ fontSize: 9, height: 20, bgcolor: '#e3f2fd', color: '#1565c0' }} />
                  )}
                  {p.max_monthly && (
                    <Chip size='small' label={`Monthly: ${formatINR(p.max_monthly)}`}
                      sx={{ fontSize: 9, height: 20, bgcolor: '#fff3e0', color: '#e65100' }} />
                  )}
                  {p.max_yearly && (
                    <Chip size='small' label={`Yearly: ${formatINR(p.max_yearly)}`}
                      sx={{ fontSize: 9, height: 20, bgcolor: '#fce4ec', color: '#c62828' }} />
                  )}
                  {p.requires_receipt ? (
                    <Chip size='small' label='Receipt Required' sx={{ fontSize: 9, height: 20 }} />
                  ) : null}
                  {p.auto_approve_below ? (
                    <Chip size='small' label={`Auto-approve < ${formatINR(p.auto_approve_below)}`}
                      sx={{ fontSize: 9, height: 20, bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                  ) : null}
                </Box>

                {(p.effective_from || p.effective_to) && (
                  <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 1 }}>
                    {p.effective_from ? `From: ${p.effective_from.substring(0, 10)}` : ''}
                    {p.effective_to ? ` To: ${p.effective_to.substring(0, 10)}` : ''}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>
          {editId ? 'Edit Expense Policy' : 'Add Expense Policy'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField label='Policy Name' size='small' fullWidth required
              value={form.policy_name} onChange={(e) => set('policy_name', e.target.value)} />
            <TextField label='Version' size='small' placeholder='e.g., 1.0' sx={{ maxWidth: 120 }}
              value={form.version} onChange={(e) => set('version', e.target.value)} />
          </Box>
          <TextField label='Department Name' size='small' fullWidth placeholder='e.g., Sales, HR, Engineering'
            value={form.department_name} onChange={(e) => set('department_name', e.target.value)}
            helperText='Optional: Department this policy applies to' />
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Category ID' size='small' fullWidth type='number'
                value={form.category_id} onChange={(e) => set('category_id', e.target.value)}
                helperText='Claims category' />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Grade ID' size='small' fullWidth type='number'
                value={form.grade_id} onChange={(e) => set('grade_id', e.target.value)} />
            </Grid>
          </Grid>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label='Max Per Claim' size='small' fullWidth type='number'
                value={form.max_amount} onChange={(e) => set('max_amount', e.target.value)}
                InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, fontSize: 12 }}>&#8377;</Typography> }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label='Max Monthly' size='small' fullWidth type='number'
                value={form.max_monthly} onChange={(e) => set('max_monthly', e.target.value)}
                InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, fontSize: 12 }}>&#8377;</Typography> }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label='Max Yearly' size='small' fullWidth type='number'
                value={form.max_yearly} onChange={(e) => set('max_yearly', e.target.value)}
                InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, fontSize: 12 }}>&#8377;</Typography> }} />
            </Grid>
          </Grid>
          <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px dashed #ccc' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1 }}>Auto-Approval Settings</Typography>
            <TextField label='Auto-Approve Below Amount' size='small' fullWidth type='number'
              value={form.auto_approve_below} onChange={(e) => set('auto_approve_below', e.target.value)}
              helperText='Claims below this amount are automatically approved without manual review'
              InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, fontSize: 12 }}>&#8377;</Typography> }} />
          </Box>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Effective From' size='small' fullWidth type='date'
                value={form.effective_from} onChange={(e) => set('effective_from', e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Effective To' size='small' fullWidth type='date'
                value={form.effective_to} onChange={(e) => set('effective_to', e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>

          {/* Policy Document Upload */}
          <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1, border: '1px solid #90caf9' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FileUploadIcon sx={{ fontSize: 16 }} /> Policy Document (Optional)
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 1 }}>
              Upload policy draft as PDF or document file (Max 5MB)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button variant='outlined' size='small' component='label'
                sx={{ textTransform: 'none', fontSize: 12 }}>
                Choose File
                <input type='file' hidden accept='.pdf,.doc,.docx' onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      alert('File size exceeds 5MB limit');
                      return;
                    }
                    set('policy_document', file);
                    set('policy_document_name', file.name);
                  }
                }} />
              </Button>
              {form.policy_document_name && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
                  <AttachFileIcon sx={{ fontSize: 14, color: 'success.main' }} />
                  <Typography sx={{ fontSize: 11, color: 'success.main' }}>
                    {form.policy_document_name}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Policy Settings</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={<Switch checked={form.requires_receipt} onChange={(e) => set('requires_receipt', e.target.checked)} />}
                label={<Typography sx={{ fontSize: 13 }}>Receipt Required</Typography>} />
              <FormControlLabel
                control={<Switch checked={form.requires_approval} onChange={(e) => set('requires_approval', e.target.checked)} />}
                label={<Typography sx={{ fontSize: 13 }}>Requires Approval</Typography>} />
              <FormControlLabel
                control={<Switch checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />}
                label={<Typography sx={{ fontSize: 13 }}>Active</Typography>} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' onClick={handleSave} disabled={!form.policy_name}
            sx={{ textTransform: 'none' }}>
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
