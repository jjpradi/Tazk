import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Chip, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  createCycleAction,
  updateCycleAction,
  updateCycleStatusAction,
  deleteCycleAction,
} from 'redux/actions/performance.actions';

const statusColors = {
  draft: { color: '#757575', bg: '#f5f5f5' },
  active: { color: '#1976d2', bg: '#e3f2fd' },
  self_review: { color: '#ed6c02', bg: '#fff3e0' },
  manager_review: { color: '#9c27b0', bg: '#f3e5f5' },
  hr_review: { color: '#0097a7', bg: '#e0f7fa' },
  completed: { color: '#2e7d32', bg: '#e8f5e9' },
};

const statusFlow = ['draft', 'active', 'self_review', 'manager_review', 'hr_review', 'completed'];

const emptyForm = {
  cycle_name: '', cycle_type: 'annual', start_date: '', end_date: '',
  self_review_deadline: '', manager_review_deadline: '', hr_review_deadline: '',
  rating_scale: 5,
};

export default function AppraisalCyclesTab({ onRefresh }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { PerformanceReducer: { cycles } } = useSelector((s) => s);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const cycleList = cycles || [];

  const openAdd = () => { setEditId(null); setForm({ ...emptyForm }); setOpen(true); };

  const openEdit = (c) => {
    setEditId(c.id);
    setForm({
      cycle_name: c.cycle_name || '',
      cycle_type: c.cycle_type || 'annual',
      start_date: c.start_date ? c.start_date.substring(0, 10) : '',
      end_date: c.end_date ? c.end_date.substring(0, 10) : '',
      self_review_deadline: c.self_review_deadline ? c.self_review_deadline.substring(0, 10) : '',
      manager_review_deadline: c.manager_review_deadline ? c.manager_review_deadline.substring(0, 10) : '',
      hr_review_deadline: c.hr_review_deadline ? c.hr_review_deadline.substring(0, 10) : '',
      rating_scale: c.rating_scale || 5,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = { ...form };
    ['self_review_deadline', 'manager_review_deadline', 'hr_review_deadline'].forEach((k) => {
      if (!payload[k]) payload[k] = null;
    });
    if (editId) {
      await dispatch(updateCycleAction({ id: editId, ...payload }, setModalTypeHandler, setLoaderStatusHandler));
    } else {
      await dispatch(createCycleAction(payload, setModalTypeHandler, setLoaderStatusHandler));
    }
    setOpen(false);
    onRefresh?.();
  };

  const advanceStatus = async (c) => {
    const idx = statusFlow.indexOf(c.status);
    if (idx < statusFlow.length - 1) {
      await dispatch(updateCycleStatusAction(
        { id: c.id, status: statusFlow[idx + 1] },
        setModalTypeHandler, setLoaderStatusHandler,
      ));
      onRefresh?.();
    }
  };

  const handleDelete = async (id) => {
    await dispatch(deleteCycleAction(id, setModalTypeHandler, setLoaderStatusHandler));
    onRefresh?.();
  };

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Appraisal Cycles</Typography>
        <Button size='small' variant='contained' startIcon={<AddIcon />} onClick={openAdd}
          sx={{ textTransform: 'none', fontSize: 12 }}>
          New Cycle
        </Button>
      </Box>

      {cycleList.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No appraisal cycles created. Start by creating a new cycle (e.g., FY 2026-27 Annual Review).
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {cycleList.map((c) => {
            const sc = statusColors[c.status] || statusColors.draft;
            const canAdvance = statusFlow.indexOf(c.status) < statusFlow.length - 1;
            return (
              <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper elevation={0} sx={{
                  p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                  borderLeft: `4px solid ${sc.color}`,
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>{c.cycle_name}</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3 }}>
                        <Chip size='small' label={c.status.replace(/_/g, ' ')}
                          sx={{ fontSize: 9, height: 18, fontWeight: 600, bgcolor: sc.bg, color: sc.color, textTransform: 'capitalize' }} />
                        <Chip size='small' label={c.cycle_type}
                          sx={{ fontSize: 9, height: 18, textTransform: 'capitalize' }} />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.2, flexShrink: 0 }}>
                      {canAdvance && (
                        <Tooltip title={`Advance to ${statusFlow[statusFlow.indexOf(c.status) + 1].replace(/_/g, ' ')}`}>
                          <IconButton size='small' color='primary' onClick={() => advanceStatus(c)}>
                            <PlayArrowIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title='Edit'>
                        <IconButton size='small' onClick={() => openEdit(c)}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton size='small' color='error' onClick={() => handleDelete(c.id)}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                    <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                      Period: {c.start_date?.substring(0, 10)} to {c.end_date?.substring(0, 10)}
                    </Typography>
                    {c.self_review_deadline && (
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                        Self Review: by {c.self_review_deadline.substring(0, 10)}
                      </Typography>
                    )}
                    {c.manager_review_deadline && (
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                        Manager Review: by {c.manager_review_deadline.substring(0, 10)}
                      </Typography>
                    )}
                  </Box>

                  <Chip size='small' label={`Rating Scale: 1-${c.rating_scale}`}
                    sx={{ fontSize: 9, height: 18, mt: 1 }} />
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>
          {editId ? 'Edit Cycle' : 'Create Appraisal Cycle'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label='Cycle Name' size='small' fullWidth required
            value={form.cycle_name} onChange={(e) => set('cycle_name', e.target.value)}
            placeholder='e.g. FY 2026-27 Annual Review' />
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Cycle Type' size='small' fullWidth select
                value={form.cycle_type} onChange={(e) => set('cycle_type', e.target.value)}>
                <MenuItem value='annual'>Annual</MenuItem>
                <MenuItem value='half_yearly'>Half Yearly</MenuItem>
                <MenuItem value='quarterly'>Quarterly</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Rating Scale (Max)' size='small' fullWidth type='number'
                value={form.rating_scale} onChange={(e) => set('rating_scale', parseInt(e.target.value) || 5)} />
            </Grid>
          </Grid>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Start Date' size='small' fullWidth type='date' required
                value={form.start_date} onChange={(e) => set('start_date', e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='End Date' size='small' fullWidth type='date' required
                value={form.end_date} onChange={(e) => set('end_date', e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label='Self Review Deadline' size='small' fullWidth type='date'
                value={form.self_review_deadline} onChange={(e) => set('self_review_deadline', e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label='Manager Review Deadline' size='small' fullWidth type='date'
                value={form.manager_review_deadline} onChange={(e) => set('manager_review_deadline', e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label='HR Review Deadline' size='small' fullWidth type='date'
                value={form.hr_review_deadline} onChange={(e) => set('hr_review_deadline', e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' onClick={handleSave}
            disabled={!form.cycle_name || !form.start_date || !form.end_date}
            sx={{ textTransform: 'none' }}>
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
