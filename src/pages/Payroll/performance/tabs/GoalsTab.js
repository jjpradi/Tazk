import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Chip, LinearProgress, Slider, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FlagIcon from '@mui/icons-material/Flag';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  createGoalAction, updateGoalAction, deleteGoalAction,
} from 'redux/actions/performance.actions';

const statusConfig = {
  not_started: { color: '#757575', bg: '#f5f5f5', label: 'Not Started' },
  in_progress: { color: '#1976d2', bg: '#e3f2fd', label: 'In Progress' },
  completed: { color: '#2e7d32', bg: '#e8f5e9', label: 'Completed' },
  deferred: { color: '#ed6c02', bg: '#fff3e0', label: 'Deferred' },
};

const emptyForm = {
  goal_title: '', goal_description: '', target_value: '',
  achieved_value: '', weightage: '', due_date: '',
  status: 'not_started', progress_percentage: 0, cycle_id: '',
};

export default function GoalsTab({ onRefresh }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { PerformanceReducer: { goals, cycles } } = useSelector((s) => s);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const goalList = goals || [];
  const cycleList = cycles || [];

  const openAdd = () => { setEditId(null); setForm({ ...emptyForm }); setOpen(true); };
  const openEdit = (g) => {
    setEditId(g.id);
    setForm({
      goal_title: g.goal_title || '', goal_description: g.goal_description || '',
      target_value: g.target_value || '', achieved_value: g.achieved_value || '',
      weightage: g.weightage || '', due_date: g.due_date ? g.due_date.substring(0, 10) : '',
      status: g.status || 'not_started', progress_percentage: g.progress_percentage || 0,
      cycle_id: g.cycle_id || '',
    });
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = { ...form };
    if (!payload.cycle_id) payload.cycle_id = null; else payload.cycle_id = Number(payload.cycle_id);
    if (!payload.weightage) payload.weightage = null; else payload.weightage = Number(payload.weightage);
    if (!payload.due_date) payload.due_date = null;
    if (editId) {
      await dispatch(updateGoalAction({ id: editId, ...payload }, setModalTypeHandler, setLoaderStatusHandler));
    } else {
      await dispatch(createGoalAction(payload, setModalTypeHandler, setLoaderStatusHandler));
    }
    setOpen(false);
    onRefresh?.();
  };

  const handleDelete = async (id) => {
    await dispatch(deleteGoalAction(id, setModalTypeHandler, setLoaderStatusHandler));
    onRefresh?.();
  };

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const summary = goalList.reduce((acc, g) => {
    acc.total += 1;
    acc[g.status] = (acc[g.status] || 0) + 1;
    return acc;
  }, { total: 0 });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FlagIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>My Goals ({goalList.length})</Typography>
          {Object.entries(statusConfig).map(([key, cfg]) => (
            summary[key] ? (
              <Chip key={key} size='small' label={`${summary[key]} ${cfg.label}`}
                sx={{ fontSize: 9, height: 20, bgcolor: cfg.bg, color: cfg.color }} />
            ) : null
          ))}
        </Box>
        <Button size='small' variant='contained' startIcon={<AddIcon />} onClick={openAdd}
          sx={{ textTransform: 'none', fontSize: 12 }}>
          Add Goal
        </Button>
      </Box>

      {goalList.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No goals set yet. Create goals to track your performance objectives.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {goalList.map((g) => {
            const sc = statusConfig[g.status] || statusConfig.not_started;
            return (
              <Grid key={g.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper elevation={0} sx={{
                  p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                  borderLeft: `4px solid ${sc.color}`,
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>{g.goal_title}</Typography>
                      <Chip size='small' label={sc.label}
                        sx={{ fontSize: 9, height: 18, fontWeight: 600, bgcolor: sc.bg, color: sc.color, mt: 0.3 }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.2, flexShrink: 0 }}>
                      <Tooltip title='Edit'>
                        <IconButton size='small' onClick={() => openEdit(g)}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton size='small' color='error' onClick={() => handleDelete(g.id)}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {g.goal_description && (
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {g.goal_description}
                    </Typography>
                  )}

                  {/* Progress */}
                  <Box sx={{ mt: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Progress</Typography>
                      <Typography sx={{ fontSize: 10, fontWeight: 600 }}>{g.progress_percentage}%</Typography>
                    </Box>
                    <LinearProgress variant='determinate' value={g.progress_percentage || 0}
                      sx={{ height: 6, borderRadius: 3, bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: g.progress_percentage === 100 ? '#2e7d32' : g.progress_percentage > 50 ? '#1976d2' : '#ed6c02',
                        },
                      }} />
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1.5 }}>
                    {g.target_value && (
                      <Chip size='small' label={`Target: ${g.target_value}`} sx={{ fontSize: 9, height: 18 }} />
                    )}
                    {g.achieved_value && (
                      <Chip size='small' label={`Achieved: ${g.achieved_value}`}
                        sx={{ fontSize: 9, height: 18, bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                    )}
                    {g.weightage && (
                      <Chip size='small' label={`Weight: ${g.weightage}%`}
                        sx={{ fontSize: 9, height: 18, bgcolor: '#e3f2fd', color: '#1565c0' }} />
                    )}
                    {g.cycle_name && (
                      <Chip size='small' label={g.cycle_name} sx={{ fontSize: 9, height: 18 }} />
                    )}
                  </Box>

                  {g.due_date && (
                    <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 1 }}>
                      Due: {g.due_date.substring(0, 10)}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>
          {editId ? 'Edit Goal' : 'Add Goal'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label='Goal Title' size='small' fullWidth required
            value={form.goal_title} onChange={(e) => set('goal_title', e.target.value)} />
          <TextField label='Description' size='small' fullWidth multiline rows={2}
            value={form.goal_description} onChange={(e) => set('goal_description', e.target.value)} />
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Target Value' size='small' fullWidth
                value={form.target_value} onChange={(e) => set('target_value', e.target.value)}
                placeholder='e.g. 100 units, 95% uptime' />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Achieved Value' size='small' fullWidth
                value={form.achieved_value} onChange={(e) => set('achieved_value', e.target.value)} />
            </Grid>
          </Grid>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label='Weightage %' size='small' fullWidth type='number'
                value={form.weightage} onChange={(e) => set('weightage', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label='Due Date' size='small' fullWidth type='date'
                value={form.due_date} onChange={(e) => set('due_date', e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label='Status' size='small' fullWidth select
                value={form.status} onChange={(e) => set('status', e.target.value)}>
                <MenuItem value='not_started'>Not Started</MenuItem>
                <MenuItem value='in_progress'>In Progress</MenuItem>
                <MenuItem value='completed'>Completed</MenuItem>
                <MenuItem value='deferred'>Deferred</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <TextField label='Appraisal Cycle (optional)' size='small' fullWidth select
            value={form.cycle_id} onChange={(e) => set('cycle_id', e.target.value)}>
            <MenuItem value=''>-- No Cycle --</MenuItem>
            {cycleList.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.cycle_name}</MenuItem>
            ))}
          </TextField>
          <Box>
            <Typography sx={{ fontSize: 12, mb: 0.5 }}>Progress: {form.progress_percentage}%</Typography>
            <Slider value={form.progress_percentage} min={0} max={100} step={5}
              onChange={(_, v) => set('progress_percentage', v)}
              sx={{ py: 1 }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' onClick={handleSave} disabled={!form.goal_title}
            sx={{ textTransform: 'none' }}>
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
