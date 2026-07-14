import React, { useState, useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, MenuItem, Switch,
  FormControlLabel, InputAdornment, Menu,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import WorkIcon from '@mui/icons-material/Work';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { format } from 'date-fns';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  getJobPositionsAction,
  createJobPositionAction,
  updateJobPositionAction,
  updateJobPositionStatusAction,
  deleteJobPositionAction,
} from 'redux/actions/recruitment.actions';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'filled', label: 'Filled' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusChipColor = {
  draft: 'default',
  open: 'success',
  on_hold: 'warning',
  filled: 'info',
  cancelled: 'error',
};

const statusLabel = {
  draft: 'Draft',
  open: 'Open',
  on_hold: 'On Hold',
  filled: 'Filled',
  cancelled: 'Cancelled',
};

const emptyForm = {
  job_title: '',
  department_id: '',
  designation: '',
  grade_id: '',
  location_id: '',
  reporting_to: '',
  job_description: '',
  requirements: '',
  experience_min: '',
  experience_max: '',
  salary_min: '',
  salary_max: '',
  no_of_positions: '',
  status: 'draft',
  posted_date: '',
  target_date: '',
  internal_posting: false,
  external_posting: false,
};

const formatINR = (val) => {
  if (!val && val !== 0) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

const formatDate = (date) => {
  if (!date) return '-';
  try {
    return format(new Date(date), 'dd MMM yyyy');
  } catch {
    return '-';
  }
};

export default function JobPositionsTab({ jobPositions, stages, refreshJobs }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, title: '' });
  const [statusAnchor, setStatusAnchor] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);

  const list = jobPositions || [];

  const filteredList = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (jp) =>
        (jp.job_title || '').toLowerCase().includes(q) ||
        (jp.department_name || jp.department_id || '').toString().toLowerCase().includes(q) ||
        (jp.designation || '').toLowerCase().includes(q) ||
        (jp.status || '').toLowerCase().includes(q),
    );
  }, [list, search]);

  // Summary calculations
  const summary = useMemo(() => {
    const s = { open: 0, totalOpenings: 0, filled: 0, onHold: 0 };
    list.forEach((jp) => {
      const positions = Number(jp.no_of_positions) || 0;
      s.totalOpenings += positions;
      if (jp.status === 'open') s.open += 1;
      if (jp.status === 'filled') s.filled += 1;
      if (jp.status === 'on_hold') s.onHold += 1;
    });
    return s;
  }, [list]);

  const refresh = () => {
    if (refreshJobs) {
      refreshJobs();
    } else {
      dispatch(getJobPositionsAction(setModalTypeHandler, setLoaderStatusHandler));
    }
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (jp) => {
    setEditId(jp.id);
    setForm({
      job_title: jp.job_title || '',
      department_id: jp.department_id || '',
      designation: jp.designation || '',
      grade_id: jp.grade_id || '',
      location_id: jp.location_id || '',
      reporting_to: jp.reporting_to || '',
      job_description: jp.job_description || '',
      requirements: jp.requirements || '',
      experience_min: jp.experience_min ?? '',
      experience_max: jp.experience_max ?? '',
      salary_min: jp.salary_min ?? '',
      salary_max: jp.salary_max ?? '',
      no_of_positions: jp.no_of_positions ?? '',
      status: jp.status || 'draft',
      posted_date: jp.posted_date ? jp.posted_date.substring(0, 10) : '',
      target_date: jp.target_date ? jp.target_date.substring(0, 10) : '',
      internal_posting: !!jp.internal_posting,
      external_posting: !!jp.external_posting,
    });
    setOpen(true);
  };

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.job_title.trim()) return;
    const payload = { ...form };
    // Convert numeric fields
    ['experience_min', 'experience_max', 'salary_min', 'salary_max', 'no_of_positions'].forEach((k) => {
      if (payload[k] === '' || payload[k] === null) payload[k] = null;
      else payload[k] = Number(payload[k]);
    });
    if (!payload.posted_date) payload.posted_date = null;
    if (!payload.target_date) payload.target_date = null;
    if (!payload.department_id) payload.department_id = null;
    if (!payload.grade_id) payload.grade_id = null;
    if (!payload.location_id) payload.location_id = null;

    if (editId) {
      await dispatch(
        updateJobPositionAction({ id: editId, ...payload }, setModalTypeHandler, setLoaderStatusHandler),
      );
    } else {
      await dispatch(
        createJobPositionAction(payload, setModalTypeHandler, setLoaderStatusHandler),
      );
    }
    setOpen(false);
    refresh();
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    await dispatch(
      deleteJobPositionAction(deleteDialog.id, setModalTypeHandler, setLoaderStatusHandler),
    );
    setDeleteDialog({ open: false, id: null, title: '' });
    refresh();
  };

  const handleStatusChange = async (newStatus) => {
    if (!statusTarget) return;
    await dispatch(
      updateJobPositionStatusAction(
        { id: statusTarget.id, status: newStatus },
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
    setStatusAnchor(null);
    setStatusTarget(null);
    refresh();
  };

  const summaryCards = [
    { label: 'Open Positions', value: summary.open, icon: <WorkIcon />, color: '#2e7d32' },
    { label: 'Total Openings', value: summary.totalOpenings, icon: <GroupIcon />, color: '#1976d2' },
    { label: 'Filled', value: summary.filled, icon: <CheckCircleIcon />, color: '#0288d1' },
    { label: 'On Hold', value: summary.onHold, icon: <PauseCircleIcon />, color: '#ed6c02' },
  ];

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card) => (
          <Grid key={card.label} size={{ xs: 6, sm: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: `${card.color}14`,
                  color: card.color,
                }}
              >
                {card.icon}
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>{card.value}</Typography>
                <Typography variant="body2" color="text.secondary">{card.label}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search job positions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 320 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Add Job Position
        </Button>
      </Box>

      {/* Data Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 600 }}>Job Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Positions</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Applications</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Hired</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Posted Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    {search ? 'No matching job positions found.' : 'No job positions yet. Click "Add Job Position" to create one.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((jp) => (
                <TableRow key={jp.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{jp.job_title}</Typography>
                    {jp.designation && (
                      <Typography variant="caption" color="text.secondary">{jp.designation}</Typography>
                    )}
                  </TableCell>
                  <TableCell>{jp.department_name || jp.department_id || '-'}</TableCell>
                  <TableCell>{jp.grade_name || jp.grade_id || '-'}</TableCell>
                  <TableCell align="center">{jp.no_of_positions ?? '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabel[jp.status] || jp.status}
                      color={statusChipColor[jp.status] || 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">{jp.applications_count ?? 0}</TableCell>
                  <TableCell align="center">{jp.hired_count ?? 0}</TableCell>
                  <TableCell>{formatDate(jp.posted_date)}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(jp)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Change Status">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setStatusAnchor(e.currentTarget);
                            setStatusTarget(jp);
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setDeleteDialog({ open: true, id: jp.id, title: jp.job_title })
                          }
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Status Change Menu */}
      <Menu
        anchorEl={statusAnchor}
        open={Boolean(statusAnchor)}
        onClose={() => { setStatusAnchor(null); setStatusTarget(null); }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <MenuItem
            key={opt.value}
            selected={statusTarget?.status === opt.value}
            onClick={() => handleStatusChange(opt.value)}
          >
            <Chip
              label={opt.label}
              color={statusChipColor[opt.value]}
              size="small"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            {opt.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ pb: 1 }}>
          {editId ? 'Edit Job Position' : 'Add Job Position'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Job Title"
                value={form.job_title}
                onChange={(e) => set('job_title', e.target.value)}
                fullWidth
                required
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Department"
                value={form.department_id}
                onChange={(e) => set('department_id', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Designation"
                value={form.designation}
                onChange={(e) => set('designation', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Grade"
                value={form.grade_id}
                onChange={(e) => set('grade_id', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Location"
                value={form.location_id}
                onChange={(e) => set('location_id', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Reporting To"
                value={form.reporting_to}
                onChange={(e) => set('reporting_to', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Job Description"
                value={form.job_description}
                onChange={(e) => set('job_description', e.target.value)}
                fullWidth
                multiline
                rows={4}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Requirements"
                value={form.requirements}
                onChange={(e) => set('requirements', e.target.value)}
                fullWidth
                multiline
                rows={3}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Min Experience (years)"
                value={form.experience_min}
                onChange={(e) => set('experience_min', e.target.value)}
                fullWidth
                type="number"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Max Experience (years)"
                value={form.experience_max}
                onChange={(e) => set('experience_max', e.target.value)}
                fullWidth
                type="number"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Min Salary"
                value={form.salary_min}
                onChange={(e) => set('salary_min', e.target.value)}
                fullWidth
                type="number"
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">&#8377;</InputAdornment>,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Max Salary"
                value={form.salary_max}
                onChange={(e) => set('salary_max', e.target.value)}
                fullWidth
                type="number"
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">&#8377;</InputAdornment>,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="No. of Positions"
                value={form.no_of_positions}
                onChange={(e) => set('no_of_positions', e.target.value)}
                fullWidth
                type="number"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Status"
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                fullWidth
                select
                size="small"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Posted Date"
                value={form.posted_date}
                onChange={(e) => set('posted_date', e.target.value)}
                fullWidth
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Target Date"
                value={form.target_date}
                onChange={(e) => set('target_date', e.target.value)}
                fullWidth
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.internal_posting}
                    onChange={(e) => set('internal_posting', e.target.checked)}
                  />
                }
                label="Internal Posting"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.external_posting}
                    onChange={(e) => set('external_posting', e.target.checked)}
                  />
                }
                label="External Posting"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.job_title.trim()}>
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, title: '' })}>
        <DialogTitle>Delete Job Position</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteDialog.title}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, title: '' })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
