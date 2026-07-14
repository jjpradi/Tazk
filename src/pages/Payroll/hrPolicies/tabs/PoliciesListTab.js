import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Chip, MenuItem, Switch, FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PublishIcon from '@mui/icons-material/Publish';
import ArchiveIcon from '@mui/icons-material/Archive';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  createPolicyAction,
  updatePolicyAction,
  deletePolicyAction,
  publishPolicyAction,
  archivePolicyAction,
} from 'redux/actions/hrPolicies.actions';

const CATEGORIES = [
  'leave', 'attendance', 'code_of_conduct', 'anti_harassment',
  'data_privacy', 'travel', 'expense', 'remote_work', 'health_safety', 'general',
];

const statusColors = {
  draft: { color: '#757575', bg: '#f5f5f5' },
  active: { color: '#2e7d32', bg: '#e8f5e9' },
  archived: { color: '#ef6c00', bg: '#fff3e0' },
};

const emptyForm = {
  policy_name: '', policy_code: '', policy_category: 'general',
  description: '', content_html: '', document_url: '', version: '1.0',
  effective_date: '', expiry_date: '', requires_acknowledgment: true,
  acknowledgment_deadline: '', applicable_departments: '', applicable_grades: '',
};

export default function PoliciesListTab({ onRefresh }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { HrPoliciesReducer: { policies } } = useSelector((s) => s);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [previewPolicy, setPreviewPolicy] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const policyList = (policies || []).filter(
    (p) => filterStatus === 'all' || p.status === filterStatus
  );

  const openAdd = () => { setEditId(null); setForm({ ...emptyForm }); setOpen(true); };

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({
      policy_name: p.policy_name || '',
      policy_code: p.policy_code || '',
      policy_category: p.policy_category || 'general',
      description: p.description || '',
      content_html: p.content_html || '',
      document_url: p.document_url || '',
      version: p.version || '1.0',
      effective_date: p.effective_date ? p.effective_date.substring(0, 10) : '',
      expiry_date: p.expiry_date ? p.expiry_date.substring(0, 10) : '',
      requires_acknowledgment: !!p.requires_acknowledgment,
      acknowledgment_deadline: p.acknowledgment_deadline ? p.acknowledgment_deadline.substring(0, 10) : '',
      applicable_departments: p.applicable_departments ? (typeof p.applicable_departments === 'string' ? p.applicable_departments : JSON.stringify(p.applicable_departments)) : '',
      applicable_grades: p.applicable_grades ? (typeof p.applicable_grades === 'string' ? p.applicable_grades : JSON.stringify(p.applicable_grades)) : '',
    });
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = { ...form };
    if (payload.applicable_departments) {
      try { payload.applicable_departments = JSON.parse(payload.applicable_departments); } catch { /* keep string */ }
    } else { payload.applicable_departments = null; }
    if (payload.applicable_grades) {
      try { payload.applicable_grades = JSON.parse(payload.applicable_grades); } catch { /* keep string */ }
    } else { payload.applicable_grades = null; }
    if (!payload.effective_date) payload.effective_date = null;
    if (!payload.expiry_date) payload.expiry_date = null;
    if (!payload.acknowledgment_deadline) payload.acknowledgment_deadline = null;

    if (editId) {
      await dispatch(updatePolicyAction({ id: editId, ...payload }, setModalTypeHandler, setLoaderStatusHandler));
    } else {
      await dispatch(createPolicyAction(payload, setModalTypeHandler, setLoaderStatusHandler));
    }
    setOpen(false);
    onRefresh?.();
  };

  const handlePublish = async (p) => {
    await dispatch(publishPolicyAction({ id: p.id }, setModalTypeHandler, setLoaderStatusHandler));
    onRefresh?.();
  };

  const handleArchive = async (p) => {
    await dispatch(archivePolicyAction({ id: p.id }, setModalTypeHandler, setLoaderStatusHandler));
    onRefresh?.();
  };

  const handleDelete = async (id) => {
    await dispatch(deletePolicyAction(id, setModalTypeHandler, setLoaderStatusHandler));
    onRefresh?.();
  };

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>HR Policies</Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {['all', 'draft', 'active', 'archived'].map((s) => (
              <Chip key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} size='small'
                variant={filterStatus === s ? 'filled' : 'outlined'}
                onClick={() => setFilterStatus(s)}
                sx={{ fontSize: 10, height: 24, cursor: 'pointer',
                  ...(filterStatus === s ? { bgcolor: 'primary.main', color: 'white' } : {}),
                }} />
            ))}
          </Box>
        </Box>
        <Button size='small' variant='contained' startIcon={<AddIcon />} onClick={openAdd}
          sx={{ textTransform: 'none', fontSize: 12 }}>
          Add Policy
        </Button>
      </Box>

      {policyList.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            {filterStatus === 'all' ? 'No HR policies created yet.' : `No ${filterStatus} policies.`}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {policyList.map((p) => {
            const sc = statusColors[p.status] || statusColors.draft;
            return (
              <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper elevation={0} sx={{
                  p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                  borderLeft: `4px solid ${sc.color}`,
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', mb: 0.3 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>{p.policy_name}</Typography>
                        <Chip size='small' label={p.status}
                          sx={{ fontSize: 9, height: 18, fontWeight: 600, bgcolor: sc.bg, color: sc.color }} />
                      </Box>
                      {p.policy_code && (
                        <Typography sx={{ fontSize: 10, color: 'text.disabled', fontFamily: 'monospace' }}>
                          {p.policy_code} | v{p.version}
                        </Typography>
                      )}
                      <Chip size='small' label={p.policy_category?.replace(/_/g, ' ')}
                        sx={{ fontSize: 9, height: 16, mt: 0.5, textTransform: 'capitalize' }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.2, flexShrink: 0 }}>
                      {p.content_html && (
                        <Tooltip title='Preview'>
                          <IconButton size='small' onClick={() => setPreviewPolicy(p)}>
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {p.status === 'draft' && (
                        <Tooltip title='Publish'>
                          <IconButton size='small' color='success' onClick={() => handlePublish(p)}>
                            <PublishIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {p.status === 'active' && (
                        <Tooltip title='Archive'>
                          <IconButton size='small' color='warning' onClick={() => handleArchive(p)}>
                            <ArchiveIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title='Edit'>
                        <IconButton size='small' onClick={() => openEdit(p)}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton size='small' color='error' onClick={() => handleDelete(p.id)}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {p.description && (
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 1, display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {p.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1.5 }}>
                    {p.requires_acknowledgment ? (
                      <Chip size='small' label='Ack Required'
                        sx={{ fontSize: 9, height: 18, bgcolor: '#e3f2fd', color: '#1565c0' }} />
                    ) : null}
                    {p.acknowledgment_deadline && (
                      <Chip size='small' label={`Due: ${p.acknowledgment_deadline.substring(0, 10)}`}
                        sx={{ fontSize: 9, height: 18 }} />
                    )}
                  </Box>

                  {p.effective_date && (
                    <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 1 }}>
                      Effective: {p.effective_date.substring(0, 10)}
                      {p.expiry_date ? ` - ${p.expiry_date.substring(0, 10)}` : ''}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>
          {editId ? 'Edit Policy' : 'Create HR Policy'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Policy Name' size='small' fullWidth required
                value={form.policy_name} onChange={(e) => set('policy_name', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField label='Policy Code' size='small' fullWidth
                value={form.policy_code} onChange={(e) => set('policy_code', e.target.value)}
                placeholder='e.g. POL-LEAVE-001' />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField label='Version' size='small' fullWidth
                value={form.version} onChange={(e) => set('version', e.target.value)} />
            </Grid>
          </Grid>
          <TextField label='Category' size='small' fullWidth select
            value={form.policy_category} onChange={(e) => set('policy_category', e.target.value)}>
            {CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</MenuItem>
            ))}
          </TextField>
          <TextField label='Description' size='small' fullWidth multiline rows={2}
            value={form.description} onChange={(e) => set('description', e.target.value)} />
          <TextField label='Policy Content (HTML)' size='small' fullWidth multiline rows={6}
            value={form.content_html} onChange={(e) => set('content_html', e.target.value)}
            placeholder='Enter policy content in HTML format...' />
          <TextField label='Document URL' size='small' fullWidth
            value={form.document_url} onChange={(e) => set('document_url', e.target.value)}
            placeholder='Link to PDF or external document' />
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label='Effective Date' size='small' fullWidth type='date'
                value={form.effective_date} onChange={(e) => set('effective_date', e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label='Expiry Date' size='small' fullWidth type='date'
                value={form.expiry_date} onChange={(e) => set('expiry_date', e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label='Acknowledgment Deadline' size='small' fullWidth type='date'
                value={form.acknowledgment_deadline} onChange={(e) => set('acknowledgment_deadline', e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
          <TextField label='Applicable Departments (JSON array)' size='small' fullWidth
            value={form.applicable_departments} onChange={(e) => set('applicable_departments', e.target.value)}
            placeholder='e.g. [1, 2, 3] or leave empty for all' />
          <TextField label='Applicable Grades (JSON array)' size='small' fullWidth
            value={form.applicable_grades} onChange={(e) => set('applicable_grades', e.target.value)}
            placeholder='e.g. [1, 2] or leave empty for all' />
          <FormControlLabel
            control={<Switch checked={form.requires_acknowledgment}
              onChange={(e) => set('requires_acknowledgment', e.target.checked)} />}
            label={<Typography sx={{ fontSize: 13 }}>Requires Employee Acknowledgment</Typography>} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' onClick={handleSave} disabled={!form.policy_name}
            sx={{ textTransform: 'none' }}>
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewPolicy} onClose={() => setPreviewPolicy(null)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>
          {previewPolicy?.policy_name}
          <Chip size='small' label={`v${previewPolicy?.version}`}
            sx={{ fontSize: 9, height: 18, ml: 1 }} />
        </DialogTitle>
        <DialogContent>
          {previewPolicy?.description && (
            <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2 }}>
              {previewPolicy.description}
            </Typography>
          )}
          <Box
            sx={{ fontSize: 13, lineHeight: 1.7, '& h1,& h2,& h3': { mt: 2, mb: 1 },
              '& ul, & ol': { pl: 3 }, '& p': { mb: 1 },
            }}
            dangerouslySetInnerHTML={{ __html: previewPolicy?.content_html || '<p>No content</p>' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewPolicy(null)} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
